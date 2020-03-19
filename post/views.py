from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import (
    IsAuthenticated,
    AllowAny,
    IsAdminUser,
    IsAuthenticatedOrReadOnly,
)
from rest_framework.decorators import action

from user.models import User
from friend.models import Friend
from comment.models import Comment
from comment.serializers import CommentSerializer
from .serializers import PostSerializer
from .models import Post, VISIBILITYCHOICES
from .permissions import OwnerOrAdminPermissions


class PostsViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    lookup_field = "id"

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_queryset(self):
        return Post.objects.filter(visibility="PUBLIC")

    def get_permissions(self):
        if self.action in ["update", "destroy", "partial_update", "create"]:
            self.permission_classes = [
                OwnerOrAdminPermissions,
            ]
        else:
            self.permission_classes = [AllowAny]
        return super(PostsViewSet, self).get_permissions()

    @action(detail=True, methods=["GET"])
    def comments(self, request, *args, **kwargs):
        post = self.get_object()
        comments = Comment.objects.filter(post=post)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data, status=200)

