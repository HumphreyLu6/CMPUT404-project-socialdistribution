from rest_framework import routers
from django.urls import path, include
from .views import FriendViewSet

urlpatterns = [
    path(
        "author/<slug:AUTHOR_ID>/friends/",
        FriendViewSet.as_view({"get": "get_friends_of",}),
    ),
    path(
        "author/<slug:AUTHOR_ID>/friendrequests",
        FriendViewSet.as_view({"get": "get_friends_requests_of",}),
    ),
    path(
        "author/<slug:AUTHOR_ID>/friends",
        FriendViewSet.as_view({"post": "filter_friends_of",}),
    ),
    path(
        "author/<path:AUTHOR1_ID>/friends/<path:AUTHOR2_ID>",
        FriendViewSet.as_view({"get": "if_two_friends",}),
    ),
    path(
        "friendrequest",
        FriendViewSet.as_view({"post": "create", "patch": "update_friendship",}),
    ),
]
