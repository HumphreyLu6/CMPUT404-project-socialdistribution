import uuid
from typing import Tuple, List
from django.db.models import Q
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

from user.models import User
from friend.models import Friend
from comment.models import Comment
from comment.serializers import CommentSerializer
from .serializers import PostSerializer
from .models import Post, VISIBILITYCHOICES
from .permissions import OwnerOrAdminPermissions


class PostPagination(PageNumberPagination):
    page_size = 2  # debug
    # page_size = 50
    page_size_query_param = "size"

    def get_paginated_response(self, data):
        return Response(
            {
                "query": "posts",
                "count": self.page.paginator.count,
                "size": self.get_page_size(self.request),
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "posts": data,
            }
        )


class PostsViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    lookup_field = "id"

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_queryset(self):
        if self.action in ["list", "retrieve", "comments"]:
            return Post.objects.filter(visibility="PUBLIC")
        else:
            # for update and deletion
            return Post.objects.filter(author=self.request.user)

    def get_permissions(self):
        if self.action in ["update", "destroy", "partial_update", "create"]:
            self.permission_classes = [
                OwnerOrAdminPermissions,
            ]
        else:
            self.permission_classes = [AllowAny]
        return super(PostsViewSet, self).get_permissions()

    @action(detail=False, methods="GET")
    def visible_posts(self, request, *args, **kwargs):
        """
        http://service/author/posts (posts that are visible to the currently 
        authenticated user)
        """
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
    if post.author == user:
        return True

    if post.visibility == "PUBLIC":
        return True
    # elif post.visibility=="FRIENDS"
    #     pass
    return True


def get_visible_posts(posts, user):
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
    # visibility = "FOAF"
    # user_f2_ids = user.f1Ids.filter(status="A").values_list("f2Id", flat=True)
    # user_f1_ids = user.f2Ids.filter(status="A").values_list("f1Id", flat=True)
    # friends = list(user_f2_ids) + list(user_f1_ids)
    # f2_foaf = Friend.objects.filter(
    #     Q(status="A") & Q(f1Id__in=list(friends))
    # ).values_list("f2Id", flat=True)
    # f1_foaf = Friend.objects.filter(
    #     Q(status="A") & Q(f2Id__in=list(friends))
    # ).values_list("f1Id", flat=True)
    # foaf = list(f1_foaf) + list(f2_foaf) + list(friends)
    q1 = Q(visibility="FOAF")
    # q2 = Q(author__username__in=foaf)
    q2 = Q(visibility="TOBEDONE")
    return (q1, q2)


def get_friends_Q(user: User) -> Tuple[Q, Q]:
    # visibility = "FRIENDS"
    # user_f2_ids = user.f1Ids.filter(status="A").values_list("f2Id", flat=True)
    # user_f1_ids = user.f2Ids.filter(status="A").values_list("f1Id", flat=True)
    # friends = list(user_f2_ids) + list(user_f1_ids)
    q1 = Q(visibility="FRIENDS")
    # q2 = Q(author__username__in=friends)
    q2 = Q(visibility="TOBEDONE")
    return (q1, q2)


def get_visibleTo_Q(user: User) -> Tuple[Q, Q]:
    # q4: post is private but user is in post's visiableTo list.
    q1 = Q(visibility="PRIVATE")
    q2 = Q(
        visibleToStr__icontains=f"http://{user.host}/{str(user.id)}"
    )  # check if Json string contains user's email.
    return (q1, q2)

