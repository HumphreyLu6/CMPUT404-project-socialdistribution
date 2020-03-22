from .models import Friend
from user.models import User
from django.utils.translation import ugettext_lazy as _
from rest_framework import serializers, exceptions
from django.forms.models import model_to_dict


class FriendSerializer(serializers.ModelSerializer):
    class Meta:
        model = Friend
        fields = [
            "f1Id",
            "f2Id",
            "status",
        ]
        read_only_fields = [
            "f1Id",
            "f2Id",
        ]

