import json
import requests

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from mysite.settings import DEFAULT_HOST, REMOTE_HOST1
import mysite.utils as utils
from user.models import User
from post.models import Post
from post.views import is_post_visible_to
from node.models import Node
from node.connect_node import update_db
from .models import Comment
from .serializers import CommentSerializer


class OwnerOrAdminPermission(permissions.BasePermission):
    message = "You must be the owner of the comment."

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        return obj.author == request.user or request.user.is_staff


class CommentPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = "size"

    def get_paginated_response(self, data):
        return Response(
            {
                "query": "comments",
                "count": self.page.paginator.count,
                "size": self.get_page_size(self.request),
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "comments": data,
            }
        )


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    pagination_class = CommentPagination
    lookup_field = "id"

    def get_queryset(self):
        return self.request.user.comments.all()

    def get_permissions(self):
        if self.action in ["update", "destroy", "partial_update", "post_comments"]:
            self.permission_classes = [
                OwnerOrAdminPermission,
            ]
        else:
            self.permission_classes = [
                AllowAny,
            ]
        return super(CommentViewSet, self).get_permissions()

    @action(detail=False, methods=["GET"])
    def get_comments(self, request, *args, **kwargs):
        """
        # http://service/posts/{post_id}/comments access to the comments in a post
        """
        try:
            post_id = kwargs["POST_ID"]
            post = Post.objects.filter(id=post_id).first()
            if not post:
                raise Exception("Not Found")
        except:
            return Response(status=status.HTTP_404_NOT_FOUND)
        else:
            if is_post_visible_to(post, request.user):
                filtered_comments = Comment.objects.filter(post=post)
                paged_comments = self.paginate_queryset(
                    filtered_comments.order_by("-published")
                )
                serializer = CommentSerializer(paged_comments, many=True)
                return self.get_paginated_response(serializer.data)
            else:
                return Response(status=status.HTTP_403_FORBIDDEN)

    @action(detail=False, methods=["POST"])
    def post_comments(self, request, *args, **kwargs):
        """
        # POST to http://service/posts/{POST_ID}/comments
        """
        response_data = {
            "query": "addComment",
            "success": "",
            "message": "",
        }
        try:
            post_id = kwargs["POST_ID"]
            post = Post.objects.filter(id=post_id).first()
            if not post:
                raise Exception("Not Found")
        except:
            response_data["success"] = "false"
            response_data["message"] = "Post does not exist"
            return Response(response_data, status=status.HTTP_404_NOT_FOUND)
        else:
            try:
                if is_post_visible_to(post, request.user):
                    try:
                        comment = request.data["comment"].copy()
                        if Comment.objects.filter(id=comment["id"]).exists():
                            raise Exception("Comment id already exists.")
                        author_data = comment.pop("author")
                        author_data["id"] = author_data["id"].split("/")[-1]
                        update_db(True, False)
                        author = None
                        if author_data["host"] == REMOTE_HOST1:
                            author = User.objects.filter(
                                non_uuid_id=int(author_data["id"])
                            ).first()
                        else:
                            author = User.objects.filter(id=author_data["id"]).first()

                        if not author:
                            raise Exception("Author not found")
                        serializer = CommentSerializer(data=comment)
                        if serializer.is_valid():
                            if post.origin == DEFAULT_HOST:
                                serializer.save(author=author, post=post)
                                response_data["success"] = "true"
                                response_data["message"] = "Comment Added"
                                return Response(
                                    response_data, status=status.HTTP_201_CREATED
                                )
                            else:
                                # send request
                                if send_remote_comments(comment, post, author):
                                    response_data["success"] = "true"
                                    response_data["message"] = "Comment Added"
                                    return Response(
                                        response_data, status=status.HTTP_201_CREATED
                                    )
                                else:
                                    raise Exception("Remote server failed.")

                        else:
                            raise Exception("Bad request body")
                    except Exception as e:
                        response_data["success"] = "false"
                        response_data["message"] = f"{str(type(e).__name__)}:{str(e)}"
                        return Response(
                            response_data, status=status.HTTP_400_BAD_REQUEST
                        )
                else:
                    response_data["success"] = "false"
                    response_data["message"] = "Comment not allowed"
                    return Response(response_data, status=status.HTTP_403_FORBIDDEN)
            except Exception as e:
                utils.print_warning(f"{type(e).__name__} {str(e)}")


def send_remote_comments(comment, post, author) -> bool:
    try:
        if author.host == REMOTE_HOST1:
            author_id = author.non_uuid_id
        else:
            author_id = author.id
        author_dict = {
            "id": f"{author.host}author/{author_id}",
            "host": f"{author.host}",
            "displayName": f"{author.displayName}",
            "url": f"{author.host}author/{author_id}",
            "github": f"{author.github}",
        }
        comment_dict = {
            "author": author_dict,
            "comment": comment["comment"],
            "contentType": comment["contentType"],
            "published": comment["published"],
            "id": comment["id"],
        }
        request_data = {
            "query": "addComment",
            "post": f"{post.origin}posts/{post.id}",
            "comment": comment_dict,
        }
        url = f"{post.origin}posts/{str(post.id)}/comments"
        node = Node.objects.filter(host=post.origin).first()
        headers = {
            "Authorization": f"Basic {node.auth}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        response = requests.post(url, data=json.dumps(request_data), headers=headers,)

        if response.status_code not in range(200, 300):
            print(response.status_code)
            print(url)
            print(headers)
            print(json.dumps(request_data))
            raise Exception(response.text)
        return True
    except Exception as e:
        utils.print_warning(e)
        return False
