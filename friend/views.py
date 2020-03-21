import uuid
from django.shortcuts import render
from rest_framework import viewsets, status, exceptions
from .serializers import FriendSerializer
from django.utils.translation import ugettext_lazy as _
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Friend
from user.models import User
from .permissions import AdminOrF1Permissions, AdminOrF2Permissions
from rest_framework.permissions import (
    IsAuthenticated,
    AllowAny,
    IsAdminUser,
    IsAuthenticatedOrReadOnly,
)

# Create your views here.
class FriendViewSet(viewsets.ModelViewSet):
    lookup_field = "id"
    queryset = Friend.objects.all()

    def get_permissions(self):
        if self.action in [
            "list",
            "retrieve",
            "if_two_friends",
            "get_friends_of",
            "filter_friends_of",
            "get_friends_requests_of",
        ]:
            self.permission_classes = [AllowAny]
        elif self.action in ["create", "update_friendship"]:
            self.permission_classes = [IsAuthenticated]
        else:
            self.permission_classes = [IsAdminUser]

        return super(FriendViewSet, self).get_permissions()

    def create(self, request, *args, **kwargs):
        try:
            # create author if it is not in User table
            author_data = request.data["author"]
            author_data["id"] = author_data["id"].split("/")[-1]
            author = User.objects.filter(id=author_data["id"]).first()
            # to be done: check if existed user info match request info, raise exception if not
            if not author:
                # request from remote server
                author_data["displayName"] = (
                    str(uuid.UUID(author_data["id"])) + author_data["displayName"]
                )
                author_data["email"] = str(uuid.UUID(author_data["id"])) + "@email.com"
                author_data.pop("url")
                author = User.objects.create_user(
                    id=author_data["id"],
                    username=author_data["diaplayName"],
                    host=author_data["host"],
                )
            else:
                # request from local server
                if author != request.user:
                    return Response(status=status.HTTP_403_FORBIDDEN)

            # create friend if it is not in User table
            friend_data = request.data["friend"]
            friend_data["id"] = friend_data["id"].split("/")[-1]
            friend = User.objects.filter(id=friend_data["id"]).first()
            # to be done: check if existed user info match request info, raise exception if not
            if not friend:
                raise Exception("Friend does not exist")

            data = {"status": "U"}
            serializer1 = FriendSerializer(data=data)
            serializer2 = FriendSerializer(data=data)
            if serializer1.is_valid(raise_exception=True) and serializer2.is_valid(
                raise_exception=True
            ):
                serializer1.save(f1Id=author, f2Id=friend, isCopy=False)
                serializer2.save(f1Id=friend, f2Id=author, isCopy=True)
                return Response(status=status.HTTP_201_CREATED)
            else:
                raise Exception("Bad body format")
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["PATCH"])
    def update_friendship(self, request, *args, **kwargs):
        try:
            friend_data = request.data["friend"]
            friend_data["id"] = friend_data["id"].split("/")[-1]
            friend = User.objects.filter(id=friend_data["id"]).first()
            if not friend:
                raise Exception("'Friend' does not exist")

            author_data = request.data["author"]
            author_data["id"] = author_data["id"].split("/")[-1]
            author = User.objects.filter(id=author_data["id"]).first()
            if not author:
                raise Exception("'Author' does not exist")

            instance1 = Friend.objects.filter(
                f1Id=author.id, f2Id=friend.id, isCopy=False
            ).first()
            instance2 = Friend.objects.filter(
                f1Id=friend.id, f2Id=author.id, isCopy=True
            ).first()
            if not instance1 or not instance2:
                raise Exception("'Friend' does not exist")

            if request.data["status"] == "A":
                if request.user != friend:
                    return Response(status=status.HTTP_403_FORBIDDEN)
                data = {"status": "A"}
                serializer1 = FriendSerializer(instance=instance1, data=data)
                serializer2 = FriendSerializer(instance=instance2, data=data)
                if serializer1.is_valid() and serializer2.is_valid():
                    serializer1.save()
                    serializer2.save()
                    return Response(status=status.HTTP_200_OK)
                else:
                    raise Exception("Bad request")
            elif request.data["status"] == "R":
                if request.user != friend and request.user != author:
                    return Response(status=status.HTTP_403_FORBIDDEN)
                self.perform_destroy(instance1)
                self.perform_destroy(instance2)
                return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                raise Exception("Invalid opearation")
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["GET"])
    def if_two_friends(self, request, *args, **kwargs):
        """
        Ask if 2 authors are friends
        GET http://service/author/<authorid>/friends/<authorid2>
        """
        response_body = {"query": "friends"}
        try:
            author1_id = kwargs["AUTHOR1_ID"]
            author2_id = kwargs["AUTHOR2_ID"]
            author1 = User.objects.filter(id=author1_id).first()
            author2 = User.objects.filter(id=author2_id).first()
            if not author1 or not author2:
                raise Exception("One of the author does not exist")
        except Exception as e:
            response_body["authors"] = [f"{str(type(e).__name__)}:{str(e)}"]
            response_body["friends"] = "false"
            return Response(response_body, status=status.HTTP_400_BAD_REQUEST)
        else:
            response_body["authors"] = [
                f"{author1.host}author/{author1.id}",
                f"{author2.host}author/{author2.id}",
            ]
            if Friend.objects.filter(
                f1Id=author1_id, f2Id=author2_id, status="A"
            ).exists():
                response_body["friends"] = "true"
                return Response(response_body, status=status.HTTP_200_OK)
            else:
                response_body["friends"] = "false"
                return Response(response_body, status=status.HTTP_200_OK)

    @action(detail=False, methods=["POST"])
    def filter_friends_of(self, request, *args, **kwargs):
        """
        ask a service if anyone in the list is a friend
        POST to http://service/author/<authorid>/friends
        """
        response_body = {"query": "friends", "authors": []}

        try:
            author_id = kwargs["AUTHOR_ID"]
            author = User.objects.filter(id=author_id).first()
            if not author:
                response_body["author"] = ("author does not exist.",)
                return Response(response_body, status=status.HTTP_404_NOT_FOUND)

            response_body["author"] = f"{author.host}author/{author.id}"
            candidates_data = request.data["authors"]
            for item in candidates_data:
                user_id = item.split("/")[-1]
                candidate = User.objects.filter(id=user_id).first()
                if candidate:
                    if Friend.objects.filter(
                        status="A", f1Id=author.id, f2Id=candidate.id
                    ).exists():
                        response_body["authors"].append(item)
            return Response(response_body, status=status.HTTP_200_OK)
        except Exception as e:
            response_body.pop("author")
            response_body.pop("authors")
            response_body["error"] = f"{str(type(e).__name__)}:{str(e)}"
            return Response(response_body, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["GET"])
    def get_friends_of(self, request, *args, **kwargs):
        """
        a reponse if friends or not
        ask a service GET http://service/author/<authorid>/friends/
        """
        response_body = {"query": "friends", "authors": []}

        author_id = kwargs["AUTHOR_ID"]
        author = User.objects.filter(id=author_id).first()
        if not author:
            response_body["error"] = ("author does not exist.",)
            return Response(response_body, status=status.HTTP_404_NOT_FOUND)

        friend_ids = Friend.objects.filter(f1Id=author.id, status="A").values_list(
            "f2Id", flat=True
        )
        friends = User.objects.filter(id__in=list(friend_ids))
        for user in friends:
            response_body["authors"].append(f"{user.host}author/{user.id}")
        return Response(response_body, status=status.HTTP_200_OK)

    @action(detail=False, methods="GET")
    def get_friends_requests_of(self, request, *args, **kwargs):
        """
        a reponse if friends or not
        ask a service GET http://service/author/<authorid>/friendrequests/
        """
        response_body = {"query": "friend requests", "authors": []}

        author_id = kwargs["AUTHOR_ID"]
        author = User.objects.filter(id=author_id).first()
        if not author:
            response_body["error"] = ("author does not exist.",)
            return Response(response_body, status=status.HTTP_404_NOT_FOUND)

        friend_ids = Friend.objects.filter(f1Id=author.id, status="U").values_list(
            "f2Id", flat=True
        )
        friends = User.objects.filter(id__in=list(friend_ids))
        for user in friends:
            response_body["authors"].append(f"{user.host}author/{user.id}")
        return Response(response_body, status=status.HTTP_200_OK)
