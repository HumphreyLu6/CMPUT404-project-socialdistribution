from django.urls import path
from .views import CommentViewSet

urlpatterns = [
    path(
        "posts/<slug:POST_ID>/comments",
        CommentViewSet.as_view({"get": "get_comments", "post": "post_comments",}),
    ),
]
