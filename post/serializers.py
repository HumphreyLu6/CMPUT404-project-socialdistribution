import json
from rest_framework import serializers

from user.models import User
from user.serializers import AuthorSerializer
from comment.models import Comment
from comment.serializers import CommentSerializer
from .models import Post


class PostSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(many=False, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    count = serializers.SerializerMethodField(read_only=True)
    categories = serializers.SerializerMethodField(read_only=True)
    visibleTo = serializers.SerializerMethodField(read_only=True)

    def get_count(self, obj):
        return str(Comment.objects.filter(post=obj).count())

    def get_categories(self, obj):
        return json.loads(obj.categoriesStr)

    def get_visibleTo(self, obj):
        return json.loads(obj.visibleToStr)

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
            "count",
            # "size",
            # "next",
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

