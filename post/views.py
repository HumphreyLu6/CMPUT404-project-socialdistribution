import json
import base64
from typing import Tuple

from django.db.models import Q
from django.http import HttpResponse

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action

from mysite.settings import DEFAULT_HOST
from user.models import User
from friend.models import Friend
from .serializers import PostSerializer
from .models import Post
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
            return Post.objects.filter(visibility="PUBLIC", unlisted=False)
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
        serializer.save(author=self.request.user)
        categories = self.request.data.pop("categories", None)
        if categories is not None:
            serializer.save(categoriesStr=json.dumps(categories))
        visibleTo = self.request.data.pop("visibleTo", None)
        if visibleTo is not None:
            serializer.save(visibleToStr=json.dumps(visibleTo))

    def perform_create(self, serializer):
        self.customize_update(serializer)

    def perform_update(self, serializer):
        self.customize_update(serializer)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if not is_post_visible_to(instance, request.user):
            return Response(status=status.HTTP_404_NOT_FOUND)

        if instance.unlisted:
            # image
            return HttpResponse(
                base64.b64decode(instance.content), content_type=instance.contentType
            )
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods="GET")
    def visible_posts(self, request, *args, **kwargs):
        """
        http://service/author/posts (posts that are visible to the currently
        authenticated user)
        """
        filtered_posts = get_visible_posts(
            Post.objects.filter(unlisted=False), self.request.user
        )
        paged_posts = self.paginate_queryset(filtered_posts.order_by("-published"))
        serializer = PostSerializer(paged_posts, many=True)
        return self.get_paginated_response(serializer.data)

    @action(detail=False, methods="POST")
    def author_visible_posts(self, request, *args, **kwargs):
        """
        http://service/author/{AUTHOR_ID}/posts (all posts made by {AUTHOR_ID}
        visible to the currently authenticated user)
        """
        try:
            authot_id = kwargs["AUTHOR_ID"]
            author = User.objects.filter(id=authot_id).first()
        except:
            return Response(status=status.HTTP_404_NOT_FOUND)
        else:
            if not author:
                return Response(status=status.HTTP_404_NOT_FOUND)
            filtered_posts = get_visible_posts(
                Post.objects.filter(author=author, unlisted=False), self.request.user
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
    if user.is_anonymous:
        return posts.filter(visibility="PUBLIC").exclude(visibility="SERVERONLY")
    else:
        # 1 visibility = "PUBLIC"
        q1 = Q(visibility="PUBLIC")

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
