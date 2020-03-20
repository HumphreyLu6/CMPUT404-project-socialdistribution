from django.db.models import Q
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view
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


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    lookup_field = "id"

    def get_queryset(self):
        return self.request.user.comments.all()

    def get_permissions(self):
        if self.action in ["update", "destroy", "partial_update"]:
            self.permission_classes = [
                OwnerOrAdminPermission,
            ]
        else:
            self.permission_classes = [
                AllowAny,
            ]
        return super(CommentViewSet, self).get_permissions()

    @action(detail=False, methods=["GET", "POST"])
    def post_comments(self, request, *args, **kwargs):
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
                if request.method == "GET":
                    filtered_comments = Comment.objects.filter(post=post)
                    serializer = CommentSerializer(filtered_comments, many=True)
                    return Response(serializer.data, status=status.HTTP_200_OK)
                elif request.method == "POST":
                    data = request.data
                    data["author"] = request.user.username
                    data["post"] = post.id
                    serializer = CommentSerializer(data=data)
                    if serializer.is_valid():
                        serializer.save()
                        return Response(status=status.HTTP_201_CREATED)
                    else:
                        return Response(
                            serializer.errors, status=status.HTTP_400_BAD_REQUEST
                        )
                else:
                    return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
            else:
                return Response(status=status.HTTP_403_FORBIDDEN)
