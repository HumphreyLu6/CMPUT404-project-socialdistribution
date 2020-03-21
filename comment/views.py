import uuid
from django.db.models import Q
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.permissions import (
    IsAuthenticated,
    AllowAny,
    IsAdminUser,
    IsAuthenticatedOrReadOnly,
)
from rest_framework.decorators import action

from user.models import User
from post.models import Post
from post.views import is_post_visible_to
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
    lookup_field = "id"
    pagination_class = CommentPagination

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
            if is_post_visible_to(post, request.user):
                try:
                    comment = request.data["comment"].copy()
                    if Comment.objects.filter(id=comment["id"]).exists():
                        raise Exception("Comment id already exists.")
                    author_data = comment.pop("author")
                    author_data["id"] = author_data["id"].split("/")[-1]
                    author = User.objects.filter(id=author_data["id"]).first()
                    if not author:
                        author = User.objects.create_user(
                            id=author_data["id"],
                            host=author_data["host"],
                            email=str(uuid.UUID(author_data["id"])) + "@email.com",
                            username=str(uuid.UUID(author_data["id"])) + author_data["displayName"],
                        )
                    serializer = CommentSerializer(data=comment)
                    if serializer.is_valid():
                        serializer.save(author=author, post=post)
                        response_data["success"] = "true"
                        response_data["message"] = "Comment Added"
                        return Response(response_data, status=status.HTTP_201_CREATED)
                    else:
                        raise Exception("Bad request body")
                except Exception as e:
                    response_data["success"] = "false"
                    response_data["message"] = f"{str(type(e).__name__)}:{str(e)}"
                    return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
            else:
                response_data["success"] = "false"
                response_data["message"] = "Comment not allowed"
                return Response(response_data, status=status.HTTP_403_FORBIDDEN)

