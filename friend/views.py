import uuid
import json
import requests

from django.shortcuts import render

from rest_framework import viewsets, status, exceptions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import (
    IsAuthenticated,
    AllowAny,
    IsAdminUser,
    IsAuthenticatedOrReadOnly,
)

import mysite.utils as utils
from mysite.settings import DEFAULT_HOST, REMOTE_HOST1
from user.models import User
from user.serializers import BriefAuthorSerializer
from node.models import Node, update_db
from .models import Friend
from .serializers import FriendSerializer


class FriendViewSet(viewsets.ModelViewSet):
    serializer_class = FriendSerializer
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
        elif self.action in ["update", "partial_update", "destroy"]:
            self.permission_classes = [IsAdminUser]
        else:
            self.permission_classes = [AllowAny]

        return super(FriendViewSet, self).get_permissions()

    def create(self, request, *args, **kwargs):
        try:
        # update User and Friend tables.
            update_db(True, True, False, False)
            author_data = request.data["author"]
            author_data["id"] = author_data["id"].split("/")[-1]
            author = None
            if author_data["host"] == REMOTE_HOST1:
                author = User.objects.filter(non_uuid_id=author_data["id"]).first()
            else:
                author = User.objects.filter(id=author_data["id"]).first()

            if not author:
                raise Exception("Author does not exist")
            else:
                if author != request.user:
                    if not Node.objects.filter(user=request.user).exists():
                        # allow requests sent from other node
                        return Response(status=status.HTTP_403_FORBIDDEN)

            friend_data = request.data["friend"]
            friend_data["id"] = friend_data["id"].split("/")[-1]
            friend = None
            if friend_data["host"] == REMOTE_HOST1:
                friend = User.objects.filter(non_uuid_id=friend_data["id"]).first()
            else:
                friend = User.objects.filter(id=friend_data["id"]).first()
            if not friend:
                raise Exception("Friend does not exist")

            # check if author and friend are already friends
            if Friend.objects.filter(f1Id=author, f2Id=friend, isCopy=False).exists():
                return Response(status=status.HTTP_400_BAD_REQUEST)

            data = {"status": "U"}
            if Friend.objects.filter(f1Id=friend, f2Id=author, isCopy=False).exists():
                # they both sent request to each other
                data = {"status": "A"}
            else:
                if (
                    author.host == DEFAULT_HOST
                    and friend.host != DEFAULT_HOST
                    and request.user.host == DEFAULT_HOST
                ):
                    # request is sending from local user to remote user
                    if not send_friend_request(author, friend, request.user):
                        raise Exception("Bad Request")

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
            update_db(True, True, False, False)
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
        update_db(True, True, False, False)
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
        update_db(True, True, False, False)
        response_body = {"query": "friends", "authors": []}

        try:
            author_id = kwargs["AUTHOR_ID"]
            author = User.objects.filter(id=author_id).first()
            if not author:
                response_body["author"] = ("author does not exist.",)
                return Response(response_body, status=status.HTTP_404_NOT_FOUND)

            response_body["author"] = []
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
        get all friends of a user
        ask a service GET http://service/author/<authorid>/friends/
        """
        update_db(True, True, False, False)
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

        friend_ids = Friend.objects.filter(
            f2Id=author.id, status="U", isCopy=False
        ).values_list("f1Id", flat=True)
        friends = User.objects.filter(id__in=list(friend_ids))
        for user in friends:
            response_body["authors"].append(f"{user.host}author/{user.id}")
        return Response(response_body, status=status.HTTP_200_OK)


def send_friend_request(author: User, friend: User, request_user: User) -> bool:
    """
    send friend request to remote user
    Params:
        author: User, friend: User, request_user: User
    """
    try:
        node = Node.objects.filter(host=friend.host).first()
        if not node:
            raise Exception("Node does not exist")

        url = f"{node.host}friendrequest"
        author_dict = BriefAuthorSerializer(instance=author).data
        friend_dict = BriefAuthorSerializer(instance=friend).data
        request_body = {
            "query": "friendrequest",
            "author": author_dict,
            "friend": friend_dict,
        }

        response = requests.post(
            url,
            json=json.dumps(request_body),
            headers={"Authorization": f"Basic {node.auth}"},
        )
        print(response.status_code)
        if response.status_code not in range(200, 300):
            raise Exception(response.text)
        return True
    except Exception as e:
        utils.print_warning(f"{type(e).__name__} {str(e)}")
        return False
