from typing import Tuple
from django.db.models import Q
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import (
    IsAuthenticated,
    AllowAny,
    IsAdminUser,
    IsAuthenticatedOrReadOnly,
)

from friend.models import Friend
from post.models import Post
from post.serializers import PostSerializer
from .serializers import AuthorSerializer
from .models import User
from .permissions import OwnerOrAdminPermissions


class AuthorViewSet(viewsets.ModelViewSet):
    serializer_class = AuthorSerializer
    queryset = User.objects.filter(is_superuser=0)
    lookup_field = "id"

    def get_permissions(self):
        if self.action in ["update", "destroy", "partial_update", "create"]:
            # user can only access this view with valid token
            self.permission_classes = [OwnerOrAdminPermissions]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(AuthorViewSet, self).get_permissions()

    @action(detail=False, methods=["GET"])
    def current_user(self, request, *args, **kwargs):
        if request.user.is_anonymous:
            return Response(status=401)
        serializer = AuthorSerializer(self.request.user)
        return Response(serializer.data, status=200)

    @action(detail=False, methods=["GET"])
    def username_list(self, request, *args, **kwargs):
        usernames = User.objects.filter(is_superuser=0).values_list(
            "username", flat=True
        )
        return Response({"usernames": usernames}, status=status.HTTP_200_OK)

