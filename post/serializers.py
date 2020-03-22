import json
from rest_framework import serializers

from user.models import User
from user.serializers import AuthorSerializer, BriefAuthorSerializer
from comment.models import Comment
from comment.serializers import CommentSerializer
from .models import Post


class PostSerializer(serializers.ModelSerializer):
    author = BriefAuthorSerializer(many=False, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    categories = serializers.SerializerMethodField(read_only=True)
    visibleTo = serializers.SerializerMethodField(read_only=True)
    source = serializers.SerializerMethodField(read_only=True)
    origin = serializers.SerializerMethodField(read_only=True)

    def get_categories(self, obj):
        return json.loads(obj.categoriesStr)

    def get_visibleTo(self, obj):
        return json.loads(obj.visibleToStr)

    def get_source(self, obj):
        return f"{obj.source}posts/{obj.id}"

    def get_origin(self, obj):
        return f"{obj.origin}posts/{obj.id}"

    class Meta:
        model = Post
        fields = [
            "title",
            "source",
            "origin",
            "description",
            "contentType",
            "content",
            "author",
            "categories",
            "comments",
            "published",
            "id",
            "visibility",
            "visibleTo",
            "unlisted",
        ]
        read_only_fields = [
            "author",
        ]
        depth = 1

