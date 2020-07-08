from .models import Friend
from rest_framework import serializers


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
