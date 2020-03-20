from django.urls import path, include
from .views import AuthorViewSet, UserViewSet, AuthorProfileViewSet

urlpatterns = [
    path("admin/", admin.site.urls),
    path("signup/", include("rest_auth.registration.urls")),
    path("", include("rest_auth.urls")),
    # path("", include(router.urls)),
    path("author/", AuthorViewSet.as_view({"get": "list",})),
    path(
        "author/profile/<path:authorId>/",
        AuthorProfileViewSet.as_view({"get": "get_profile",}),
    ),
    path("author", AuthorViewSet.as_view({"get": "list",})),
    path(
        "author/<uuid:id>",
        AuthorViewSet.as_view(
            {"get": "retrieve", "patch": "partial_update", "delete": "destroy",}
        ),
    ),
]
