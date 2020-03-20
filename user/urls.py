from django.contrib import admin
from rest_framework import routers
from django.urls import path, include
from .views import AuthorViewSet, UserViewSet, AuthorProfileViewSet

router = routers.DefaultRouter()
# Note: rest_auth.urls may clash with router.urls, name paths carefully.
router.register("author", AuthorViewSet, basename="author")
router.register("admin_users", UserViewSet, basename="user")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("signup/", include("rest_auth.registration.urls")),
    path("", include("rest_auth.urls")),
    #path("", include(router.urls)),
    path('author/', AuthorViewSet.as_view({
        "get": "list",
    })),

    path('author/profile/<path:authorId>/', AuthorProfileViewSet.as_view({
        "get": "get_profile",
    })),

]
