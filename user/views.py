from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import (
    IsAuthenticated,
    AllowAny,
)

from .serializers import AuthorSerializer
from .models import User
from .permissions import OwnerOrAdminPermissions


class AuthorViewSet(viewsets.ModelViewSet):
    serializer_class = AuthorSerializer
    lookup_field = "id"

    def get_queryset(self):
        return User.objects.filter(is_superuser=0)

    def get_permissions(self):
        if self.action in [
            "update",
            "destroy",
            "partial_update",
            "create",
        ]:
            # user can only access this view with valid token
            self.permission_classes = [OwnerOrAdminPermissions]
        elif self.action in ["current_user"]:
            self.permission_classes = [IsAuthenticated]
        else:
            self.permission_classes = [AllowAny]
        return super(AuthorViewSet, self).get_permissions()

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()

    @action(detail=False, methods=["GET"])
    def current_user(self, request, *args, **kwargs):
        if request.user.is_anonymous:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        serializer = AuthorSerializer(self.request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["GET"])
    def get_all_user(self, request, *args, **kwargs):
        """
        Get all users except request user and admin.
        """
        queryset = User.objects.filter(is_superuser=0)
        if not request.user.is_anonymous:
            queryset = queryset.exclude(id=request.user.id)
        serializer = AuthorSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
