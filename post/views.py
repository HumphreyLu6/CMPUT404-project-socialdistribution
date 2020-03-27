import uuid
import json
import requests
from typing import Tuple, List

from django.db.models import Q
from django.urls import resolve

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import (
    IsAuthenticated,
    AllowAny,
    IsAdminUser,
    IsAuthenticatedOrReadOnly,
)
from rest_framework.decorators import action

from mysite.settings import DEFAULT_HOST
import mysite.utils as utils
from node.models import Node, get_nodes_user_ids, update_db
from user.models import User
from friend.models import Friend
from comment.models import Comment
from comment.serializers import CommentSerializer
from .serializers import PostSerializer
from .models import Post, VISIBILITYCHOICES
from .permissions import OwnerOrAdminPermissions


class PostPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = "size"

    def get_paginated_response(self, data):
        return Response(
            {
                "query": "posts",
                "count": len(data),
                "size": self.get_page_size(self.request),
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "posts": data,
            }
        )


class PostsViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    pagination_class = PostPagination
    lookup_field = "id"

    def get_queryset(self):
        if self.action in ["list"]:
            return Post.objects.filter(visibility="PUBLIC")
        else:
            # filter result depends on user
            return Post.objects.all()

    def get_permissions(self):
        if self.action in ["update", "destroy", "partial_update", "create"]:
            self.permission_classes = [
                OwnerOrAdminPermissions,
            ]
        else:
            self.permission_classes = [AllowAny]
        return super(PostsViewSet, self).get_permissions()

    def customize_update(self, serializer):
        """
        help method for create or update Post object
        """
        categories = self.request.data.pop("categories", None)
        if categories:
            serializer.save(
                author=self.request.user, categoriesStr=json.dumps(categories)
            )
        visibleTo = self.request.data.pop("visibleTo", None)
        if visibleTo:
            serializer.save(
                author=self.request.user, visibleToStr=json.dumps(visibleTo)
            )
        return

    def perform_create(self, serializer):
        self.customize_update(serializer)

    def perform_update(self, serializer):
        self.customize_update(serializer)

    @action(detail=False, methods="GET")
    def visible_posts(self, request, *args, **kwargs):
        """
        http://service/author/posts (posts that are visible to the currently 
        authenticated user)
        """
        if (
            not request.user.is_anonymous
            and request.user.id not in get_nodes_user_ids()
        ):
            update_db(True, True, True, True, request.user)
        filtered_posts = get_visible_posts(Post.objects.all(), self.request.user)
        paged_posts = self.paginate_queryset(filtered_posts.order_by("-published"))
        serializer = PostSerializer(paged_posts, many=True)
        return self.get_paginated_response(serializer.data)

    @action(detail=False, methods="POST")
    def author_visible_posts(self, request, *args, **kwargs):
        """
        http://service/author/{AUTHOR_ID}/posts (all posts made by {AUTHOR_ID}
        visible to the currently authenticated user)
        """
        if (
            not request.user.is_anonymous
            and request.user.id not in get_nodes_user_ids()
        ):
            update_db(True, True, True, True, request.user)
        try:
            authot_id = kwargs["AUTHOR_ID"]
            author = User.objects.filter(id=authot_id).first()
        except:
            return Response(status=status.HTTP_404_NOT_FOUND)
        else:
            if not author:
                return Response(status=status.HTTP_404_NOT_FOUND)
            filtered_posts = get_visible_posts(
                Post.objects.filter(author=author), self.request.user
            )
            paged_posts = self.paginate_queryset(filtered_posts.order_by("-published"))
            serializer = PostSerializer(paged_posts, many=True)
            return self.get_paginated_response(serializer.data)


# helper method:
def is_post_visible_to(post: Post, user: User) -> bool:
    """
    check if a post is visible to a user
    """
    qs = Post.objects.filter(id=post.id)
    if get_visible_posts(qs, user).exists():
        return True
    else:
        return False


def get_visible_posts(posts, user):
    if user.id in get_nodes_user_ids():
        return posts.filter(origin=DEFAULT_HOST)
    else:
        # 1 visibility = "PUBLIC"
        q1 = Q(visibility="PUBLIC")

        if user.is_anonymous:
            filtered_posts = posts.filter(q1)
        else:
            # 2 visibility = "FRIENDS"
            q2_1, q2_2 = get_friends_Q(user)

            # 3 visibility = "FOAF"
            q3_1, q3_2 = get_foaf_Q(user)

            # 4 visibility = "PRIVATE"
            q4_1, q4_2 = get_visibleTo_Q(user)

            # 5 post's author is the request user
            q5 = Q(author=user)

            filtered_posts = posts.filter(
                q1 | (q2_1 & q2_2) | (q3_1 & q3_2) | (q4_1 & q4_2) | q5
            )
    return filtered_posts


def get_foaf_Q(user: User) -> Tuple[Q, Q]:
    """
    visibility = "FOAF"
    """
    friends_ids = list(user.f2friends.filter(status="A").values_list("f2Id", flat=True))
    foaf = friends_ids.copy()
    for friend_id in friends_ids:
        foaf += list(
            Friend.objects.filter(status="A", f1Id=friend_id).values_list(
                "f2Id", flat=True
            )
        )
    foaf = list(set(foaf))  # distint
    q1 = Q(visibility="FOAF")
    q2 = Q(author__id__in=foaf)
    return (q1, q2)


def get_friends_Q(user: User) -> Tuple[Q, Q]:
    """
    visibility = "FRIENDS"
    """
    friends_ids = user.f2friends.filter(status="A").values_list("f2Id", flat=True)
    q1 = Q(visibility="FRIENDS")
    q2 = Q(author__id__in=list(friends_ids))
    return (q1, q2)


def get_visibleTo_Q(user: User) -> Tuple[Q, Q]:
    """
    post is private but user is in post's visiableTo list.
    """
    q1 = Q(visibility="PRIVATE")
    q2 = Q(
        visibleToStr__icontains=f"{user.host}author/{str(user.id)}"
    )  # check if Json string contains user's id.
    return (q1, q2)
