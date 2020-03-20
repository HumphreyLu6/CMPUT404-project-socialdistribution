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
from .serializers import AuthorSerializer, UserSerializer
from .models import User
from .permissions import OwnerOrAdminPermissions


class AuthorProfileViewSet(viewsets.ViewSet):
    def get_profile(self, request, authorId, *args, **kwargs):
        user = User.objects.get(id=authorId)
        serializer = AuthorSerializer(instance=user)

        return Response(serializer.data, status=200)


# helper method:
def get_FOAF_Q(user: User) -> Tuple[Q, Q]:
    user_f2_ids = user.f1Ids.filter(status="A").values_list("f2Id", flat=True)
    user_f1_ids = user.f2Ids.filter(status="A").values_list("f1Id", flat=True)
    friends = list(user_f2_ids) + list(user_f1_ids)
    f2_foaf = Friend.objects.filter(
        Q(status="A") & Q(f1Id__in=list(friends))
    ).values_list("f2Id", flat=True)
    f1_foaf = Friend.objects.filter(
        Q(status="A") & Q(f2Id__in=list(friends))
    ).values_list("f1Id", flat=True)
    foaf = list(f1_foaf) + list(f2_foaf) + list(friends)
    q2_1 = Q(visibility="FOAF")
    q2_2 = Q(author__username__in=foaf)
    return tuple(q2_1, q2_2)


# Create your views here.
class AuthorViewSet(viewsets.ModelViewSet):
    serializer_class = AuthorSerializer
    queryset = User.objects.filter(
        is_superuser=0, host="https://spongebook.herokuapp.com/"
    )
    lookup_field = "id"

    def get_permissions(self):
        if self.action in ["update", "destroy", "partial_update", "create"]:
            # user can only use this view with valid token
            self.permission_classes = [OwnerOrAdminPermissions]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(AuthorViewSet, self).get_permissions()

    @action(detail=True, methods=["GET"])
    def posts(self, request, *args, **kwargs):
        author = self.get_object()
        author_posts = Post.objects.filter(author=author)

        if self.request.user == author:
            posts = author_posts
        else:
            # q1 visibility="PUBLIC"
            q1 = Q(visibility="PUBLIC")

            # q2 visibility="FRIENDS"
            # q2_1, q2_2 = get_friends_Q(self.request.user)

            # q3 visibility="foaf"
            # q3_1, q3_2 = get_foaf_Q(self.request.user)

            # q4 visibility="PRIVATE"
            q4_1, q4_2 = get_visible_Q(self.request.user)

            # q5: post's author is the user
            q5 = Q(author=self.request.user)

            # posts = author_posts.filter(
            #     q1 | (q2_1 & q2_2) | (q3_1 & q3_2) | (q4_1 & q4_2) | q5
            # )
            posts = author_posts.filter(q1 | (q4_1 & q4_2) | q5)

        serializer = PostSerializer(posts, many=True)

        return Response(serializer.data, status=200)

    @action(detail=False, methods=["GET"])
    def posts(self, request, *args, **kwargs):

        # q1 visibility="PUBLIC"
        q1 = Q(visibility="PUBLIC")

        # q2 visibility="FRIENDS"
        # q2_1, q2_2 = get_friends_Q(self.request.user)

        # q3 visibility="foaf"
        # q3_1, q3_2 = get_foaf_Q(self.request.user)

        # q4 visibility="PRIVATE"
        q4_1, q4_2 = get_visible_Q(self.request.user)

        # q5: post's author is the user
        q5 = Q(author=self.request.user)

        # posts = author_posts.filter(
        #     q1 | (q2_1 & q2_2) | (q3_1 & q3_2) | (q4_1 & q4_2) | q5
        # )
        posts = Post.objects.filter(q1 | (q4_1 & q4_2) | q5)

        serializer = PostSerializer(posts, many=True)

        return Response(serializer.data, status=200)

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


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    queryset = User.objects.all()
    lookup_field = "username"

