from .models import Friend
from user.models import User
from django.utils.translation import ugettext_lazy as _
from rest_framework import serializers, exceptions
from django.forms.models import model_to_dict


class UserSerializer(serializers.ModelSerializer):

    id = serializers.SerializerMethodField(read_only=True)
    url = serializers.SerializerMethodField(read_only=True)
    host = serializers.SerializerMethodField(read_only=True)
    displayName = serializers.SerializerMethodField(read_only=True)

    def get_host(self, obj):
        return f"{obj.host}"

    def get_url(self, obj):
        return f"{obj.host}author/{obj.id}"

    def get_id(self, obj):
        return f"{obj.host}author/{obj.id}"

    def get_displayName(self, obj):
        return f"{obj.username}"

    class Meta:
        model = User
        fields = ['id','host','displayName', 'url']
    

class FriendSerializer(serializers.ModelSerializer):

    author = serializers.SerializerMethodField(read_only=True)
    friend = serializers.SerializerMethodField(read_only=True)

    def get_author(self, obj):
        qs = User.objects.get(id=obj.f1Id_id)
        serializer = UserSerializer(instance=qs)
        return serializer.data

    def get_friend(self, obj):
        qs = User.objects.get(id=obj.f2Id_id)
        serializer = UserSerializer(instance=qs)
        return serializer.data

    class Meta:
        model = Friend
        fields = ['id', 'f2Id', 'author','friend']