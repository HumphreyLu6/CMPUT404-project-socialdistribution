from django.urls import path, include

from .views import PostsViewSet

urlpatterns = [
    path("posts", PostsViewSet.as_view({"get": "list", "post": "create",})),
    path(
        "posts/<uuid:id>",
        PostsViewSet.as_view(
            {"get": "retrieve", "patch": "partial_update", "delete": "destroy",}
        ),
    ),
    path("author/posts", PostsViewSet.as_view({"get": "visible_posts",})),
    path(
        "author/<slug:AUTHOR_ID>/posts",
        PostsViewSet.as_view({"get": "author_visible_posts",}),
    ),
]
