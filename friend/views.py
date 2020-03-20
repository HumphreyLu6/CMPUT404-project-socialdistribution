from django.shortcuts import render
from rest_framework import viewsets, status, exceptions
from .serializers import FriendSerializer
from django.utils.translation import ugettext_lazy as _
from rest_framework.response import Response
from .models import Friend
from user.models import User
import uuid
from .permissions import AdminOrF1Permissions, AdminOrF2Permissions
from rest_framework.permissions import (
    IsAuthenticated,
    AllowAny,
    IsAdminUser,
    IsAuthenticatedOrReadOnly,
)

# Create your views here.
class IfFriendViewSet(viewsets.ModelViewSet):
    serializer_class = FriendSerializer
    lookup_url_kwarg = "f2Id"

    def retrieve(self, request, *args, **kwargs):
        authenticated_user = str(request.user)
        username = self.kwargs.get(self.lookup_url_kwarg)

        if Friend.objects.filter(f1Id_id=authenticated_user, f2Id_id=username).exists():
            friend = Friend.objects.get(f1Id_id=authenticated_user, f2Id_id=username)
            if friend.status == "U":
                response = Response({"status": "pending"}, status=status.HTTP_200_OK)
            elif friend.status == "A":
                response = Response({"status": "friend"}, status=status.HTTP_200_OK)
            elif friend.status == 'R':
                response = Response({"status": "unfriend"}, status=status.HTTP_200_OK)

        elif Friend.objects.filter(
            f1Id_id=username, f2Id_id=authenticated_user
        ).exists():
            friend = Friend.objects.get(f1Id_id=username, f2Id_id=authenticated_user)
            if friend.status == "U":
                response = Response({"status": "pending"}, status=status.HTTP_200_OK)
            elif friend.status == "A":
                response = Response({"status": "friend"}, status=status.HTTP_200_OK)
            elif friend.status == 'R':
                response = Response({"status": "unfriend"}, status=status.HTTP_200_OK)
        else:
            response = Response({"status": "unfriend"}, status=status.HTTP_200_OK)

        return response

class FriendsViewSet(viewsets.ViewSet):

    permission_classes = [AdminOrF1Permissions | AdminOrF2Permissions]

    def get_friends(self, request, authorId, *args, **kwargs):
        ids_list = Friend.objects.filter(f1Id_id = authorId).values_list("f2Id_id",flat=True)
        host_list = User.objects.filter(id__in=ids_list).values_list("host",flat=True)
        authors = [f"{host_list[i]}author/{ids_list[i]}/" for i in range(len(ids_list))]
        return Response({"query" : "friends","authors" : authors},status=status.HTTP_200_OK)

class FriendViewSet(viewsets.ModelViewSet):
    serializer_class = FriendSerializer
    lookup_field = "id"

    def get_queryset(self):
        return self.request.user.friends.filter(status="A")

    def get_permissions(self):
        if self.action in ["list", "retrieve", "update", "partial_update"]:
            self.permission_classes = [AdminOrF1Permissions | AdminOrF2Permissions]
        else:
            self.permission_classes = [IsAdminUser]

        return super(FriendViewSet, self).get_permissions()

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = FriendSerializer(instance=instance, data=request.data)
        serializer.is_valid(raise_exception=True)

        authorId = request.data['f1Id']
        friendId = request.data['f2Id']
        friend_status = request.data['status']

        if friend_status == "R":
            self.perform_destroy(instance)
            Friend.objects.filter(f1Id_id = friendId, f2Id_id=authorId).delete()
            return Response(status=status.HTTP_204_NO_CONTENT)


class FriendRequestViewSet(viewsets.ModelViewSet):
    serializer_class = FriendSerializer
    lookup_field = "id"

    def get_queryset(self):
        return self.request.user.f2Id.filter(status="U")

    def get_permissions(self):
        if self.action in ["list", "retrieve", "update", "partial_update"]:
            self.permission_classes = [AdminOrF2Permissions]
        elif self.action in ["create"]:
            self.permission_classes = [AdminOrF1Permissions]
        else:
            self.permission_classes = [IsAdminUser]

        return super(FriendRequestViewSet, self).get_permissions()

    def create(self, request, *args, **kwargs):
        query = request.data['query']
        author = request.data['author']
        authorId = author['id'].split("/")[-1]
        authorHost = author['host']
        authorDisplayName = author['displayName']
        authorUrl = author['url']
        friend = request.data['friend']
        friendId = friend['id'].split("/")[-1]
        friendHost = friend['host']
        friendDisplayName = friend['displayName']
        friendUrl = friend['url']
        if not User.objects.filter(id = authorId,host = authorHost).exists():
            User.objects.create_user(id=authorId,host=authorHost,email = authorId + "@email.com",username=authorId+authorDisplayName)
        if not User.objects.filter(id = friendId,host = friendHost).exists():
            User.objects.create_user(id=friendId,host=friendHost,email = friendId + "@email.com",username=friendId+friendDisplayName)

        data = {"f1Id" : authorId,
                "f2Id" : friendId,
                "status" : "U"}

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(status=status.HTTP_201_CREATED, headers=headers)

    def partial_update(self, request, *args, **kwargs):

        instance = self.get_object()
        serializer = FriendSerializer(instance=instance, data=request.data)
        serializer.is_valid(raise_exception=True)

        authorId = request.data['f1Id']
        friendId = request.data['f2Id']
        friend_status = request.data['status']

        if friend_status == 'A':
            serializer.save()
            Friend.objects.create(id = uuid.uuid4(),f1Id_id = friendId,f2Id_id = authorId, status="A")
            return Response(status=status.HTTP_200_OK)

        elif friend_status == 'R':
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)

