from rest_framework import serializers, exceptions
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_auth.serializers import LoginSerializer
from django.utils.translation import ugettext_lazy as _
from friend.models import Friend
from .models import User
from django.http import JsonResponse
import json

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
                msg = _("Please wait the admin to approve your register request")
                raise exceptions.ValidationError(msg)
        else:
            if not User.objects.filter(email=email).exists():
                msg = _("This email has not registered yet.")
            else:
                msg = _("The email and the password are not matched.")
            raise exceptions.ValidationError(msg)

        attrs["user"] = user
        return attrs

class FriendSerializer(serializers.ModelSerializer):

    id = serializers.SerializerMethodField(read_only=True)
    host = serializers.SerializerMethodField(read_only=True)
    url = serializers.SerializerMethodField(read_only=True)
    displayName = serializers.SerializerMethodField(read_only=True)

    def get_id(self, obj):
        return f"{obj.f2Id.host}author/{obj.f2Id.id}"

    def get_host(self, obj):
        return f"{obj.f2Id.host}"

    def get_displayName(self, obj):
        return f"{obj.f2Id.username}"

    def get_url(self, obj):
        return f"{obj.f2Id.host}author/{obj.f2Id.id}"

    class Meta:
        model = Friend
        fields = ['id','host','displayName','url']


class AuthorSerializer(serializers.ModelSerializer):
    """
    This serilizer is provided for regular users (authors).
    """

    url = serializers.SerializerMethodField(read_only=True)
    id = serializers.SerializerMethodField(read_only=True)
    displayName = serializers.SerializerMethodField(read_only=True)
    friends = serializers.SerializerMethodField(read_only=True)

    def get_url(self, obj):
        return f"{obj.host}author/{obj.id}"

    def get_id(self, obj):
        return f"{obj.host}author/{obj.id}"

    def get_displayName(self, obj):
        return f"{obj.username}"

    def get_friends(self, obj):
        qs = Friend.objects.filter(status='A', f1Id_id=obj.id)
        serializer = FriendSerializer(instance=qs, many=True)
        return serializer.data

    class Meta:
        model = User
        fields = [
            "id",
            "host",
            "displayName",
            "url",
            "github",
            "email",
            "bio",
            "friends",
        ]


class UserSerializer(serializers.ModelSerializer):
    """
    This serializer is provided for admin users.
    """

    class Meta:
        model = User
        fields = "__all__"
