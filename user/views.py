from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import (
    IsAuthenticated,
    AllowAny,
)

from mysite.settings import DEFAULT_HOST
from node.models import get_nodes_user_ids
from node.connect_node import update_db, pull_github_events
from .serializers import AuthorSerializer
from .models import User
from .permissions import OwnerOrAdminPermissions


class AuthorViewSet(viewsets.ModelViewSet):
    serializer_class = AuthorSerializer
    lookup_field = "id"

    def get_queryset(self):
        if self.action in ["retrieve"]:
            if (
                self.request.user.id in get_nodes_user_ids()
                or self.request.user.is_anonymous
            ):
                return User.objects.filter(is_superuser=0, host=DEFAULT_HOST).exclude(
                    id__in=get_nodes_user_ids()
                )
            else:
                return User.objects.filter(is_superuser=0).exclude(
                    id__in=get_nodes_user_ids()
                )
        else:
            return User.objects.filter(is_superuser=0, host=DEFAULT_HOST).exclude(
                id__in=get_nodes_user_ids()
            )

    def get_permissions(self):
        if self.action in [
            "update",
            "destroy",
            "partial_update",
            "create",
            "github_token",
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
        pull_github_events(serializer.instance)

    def perform_update(self, serializer):
        serializer.save()
        pull_github_events(serializer.instance)

    @action(detail=False, methods=["GET"])
    def current_user(self, request, *args, **kwargs):
        if request.user.is_anonymous:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        serializer = AuthorSerializer(self.request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["POST", "GET"])
    def github_token(self, request, *args, **kwargs):
        user = self.get_object()
        if request.method == "GET":
            return Response(
                {"GithubToken": user.githubToken}, status=status.HTTP_200_OK
            )
        else:
            token = request.data.pop("GithubToken", None)
            if not token:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            User.objects.filter(id=user.id).update(githubToken=token)
            return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["GET"])
    def get_all_user(self, request, *args, **kwargs):
        """
        Get local and remote users except request user.
        """
        update_db(True, False)
        queryset = User.objects.filter(is_superuser=0).exclude(
            id__in=get_nodes_user_ids()
        )
        if not request.user.is_anonymous:
            queryset = queryset.exclude(id=request.user.id)
        serializer = AuthorSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
