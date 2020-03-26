from django.urls import path, include
from .views import AuthorViewSet

urlpatterns = [
    path("author", AuthorViewSet.as_view({"get": "list",})),
    path("all_author/", AuthorViewSet.as_view({"get": "get_all_user"})),
    path(
        "author/<uuid:id>",
        AuthorViewSet.as_view(
            {"get": "retrieve", "patch": "partial_update", "delete": "destroy",}
        ),
    ),
    path("author/current_user", AuthorViewSet.as_view({"get": "current_user",})),
    path(
        "author/<uuid:id>/github_token",
        AuthorViewSet.as_view({"get": "github_token", "post": "github_token",}),
    ),
]
