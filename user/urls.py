from django.urls import path, include
from .views import AuthorViewSet

urlpatterns = [
    path("author", AuthorViewSet.as_view({"get": "list",})),
    path(
        "author/<uuid:id>",
        AuthorViewSet.as_view(
            {"get": "retrieve", "patch": "partial_update", "delete": "destroy",}
        ),
    ),
]
