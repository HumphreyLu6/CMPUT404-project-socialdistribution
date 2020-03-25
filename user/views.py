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
import requests
import json
from mysite.settings import DEFAULT_HOST
from friend.models import Friend
from post.models import Post
from post.serializers import PostSerializer
from .serializers import AuthorSerializer
from .models import User
from node.models import Node
from .permissions import OwnerOrAdminPermissions


class AuthorViewSet(viewsets.ModelViewSet):
    serializer_class = AuthorSerializer
    queryset = User.objects.filter(is_superuser=0, host=DEFAULT_HOST)
    lookup_field = "id"

    def get_permissions(self):
        if self.action in [
            "update",
            "destroy",
            "partial_update",
            "create",
            "github_token",
        ]:
            # user can only access this view with valid token
            self.permission_classes = [OwnerOrAdminPermissions]
        elif self.action in ["current_user"]:
            self.permission_classes = [IsAuthenticated]
        else:
            self.permission_classes = [AllowAny]
        return super(AuthorViewSet, self).get_permissions()

    def perform_create(self):
        serializer.save(displayName=self.get_object().username)

    @action(detail=False, methods=["GET"])
    def current_user(self, request, *args, **kwargs):
        if request.user.is_anonymous:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        serializer = AuthorSerializer(self.request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["POST", "GET"])
    def github_token(self, request, *args, **kwargs):
        user = self.get_object()
        if request.method == "GET":
            return Response(
                {"GithubToken": user.githubToken}, status=status.HTTP_200_OK
            )
        else:
            token = request.data.pop("GithubToken", None)
            if not token:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            User.objects.filter(id=user.id).update(githubToken=token)
            return Response(status=status.HTTP_204_NO_CONTENT)
    

    
    @action(detail=True, methods=["GET"])
    def get_all_user(self, request, *args, **kwargs):
        local_users = User.objects.filter(is_superuser=0)
        hosts = Node.objects.all().values_list('host',flat=True)
        serializer = AuthorSerializer(instance=local_users,many=True)
        users = json.dumps(serializer.data)
        users = json.loads(users)
        for host in hosts:
            response = requests.get(f"{host}author/")
            remote_users = response.json()
            users += remote_users
        return Response(users,status=status.HTTP_200_OK)
