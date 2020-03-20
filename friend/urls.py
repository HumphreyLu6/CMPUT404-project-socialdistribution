from rest_framework import routers
from django.urls import path, include
from .views import FriendViewSet,FriendRequestViewSet,IfFriendViewSet,FriendsViewSet

router = routers.SimpleRouter()

router.register("my_friends", FriendViewSet, basename="friend")
router.register("friendrequest", FriendRequestViewSet, basename="friend")
router.register("if_friend", IfFriendViewSet, basename="friend")

urlpatterns = [
    #path("",include(router.urls))

    path('friendrequest/', FriendRequestViewSet.as_view({
        "post": "create",
        "get": "list",
    })),

    path('friendrequest/<path:id>/', FriendRequestViewSet.as_view({
        "get": "retrieve",
        "patch" : "partial_update"
    })),

    path('author/<path:authorId>/friends/', FriendsViewSet.as_view({
        "get": "get_friends",
    })),

    path('unfriend/<path:id>/', FriendViewSet.as_view({
        "patch" : "partial_update"
    })),
]