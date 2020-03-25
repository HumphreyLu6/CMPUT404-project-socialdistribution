import re
import json
from rest_framework import serializers, exceptions
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_auth.serializers import LoginSerializer
from django.utils.translation import ugettext_lazy as _

from mysite.settings import DEFAULT_HOST
from friend.models import Friend
from .models import User
from django.http import JsonResponse


class CustomLoginSerializer(LoginSerializer):
    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        user = None
        # Authentication through email
        user = self._validate_email(email, password)

        # Did we get back an active user?
        if user:
            if not user.is_approve:
                msg = _("Please wait for the approval of administrator")
                raise exceptions.ValidationError(msg)
        else:
            if not User.objects.filter(email=email).exists():
                msg = _("This email has not registered yet.")
            else:
                msg = _("The email and the password are not matched.")
            raise exceptions.ValidationError(msg)

        attrs["user"] = user
        return attrs


class BriefAuthorSerializer(serializers.ModelSerializer):
    """
    This serilizer serializes less fields for friends views, post views, comment views,
    and it is meant to serialize both local and remote authors.
    """

    id = serializers.SerializerMethodField(read_only=True)
    url = serializers.SerializerMethodField(read_only=True)

    def get_id(self, obj):
        return f"{obj.host}author/{obj.id}"

    def get_url(self, obj):
        return f"{obj.host}author/{obj.id}"

    class Meta:
        model = User
        fields = ["id", "host", "displayName", "url"]


class AuthorSerializer(serializers.ModelSerializer):
    """
    This serilizer serializes regular fields for profile page,
    and it is meant to only serialize local authors.
    """

    id = serializers.SerializerMethodField(read_only=True)
    url = serializers.SerializerMethodField(read_only=True)
    friends = serializers.SerializerMethodField(read_only=True)

    def get_id(self, obj):
        return f"{obj.host}author/{obj.id}"

    def get_url(self, obj):
        return f"{obj.host}author/{obj.id}"

    def get_friends(self, obj):
        friend_ids = Friend.objects.filter(status="A", f1Id=obj.id).values_list(
            "f2Id", flat=True
        )
        friends = User.objects.filter(id__in=list(friend_ids))
        serializer = BriefAuthorSerializer(instance=friends, many=True)
        return serializer.data

    class Meta:
        model = User
        fields = [
            "id",
            "host",
            "username",
            "displayName",
            "url",
            "friends",
            "github",
            "email",
            "bio",
        ]
        read_only_fields = [
            "host",
            "username",
        ]
