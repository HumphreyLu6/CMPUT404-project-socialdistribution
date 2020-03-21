from rest_framework import serializers

from user.serializers import AuthorSerializer

# from post.serializers import PostSerializer
from .models import Comment


class CommentSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(many=False, read_only=True)

    class Meta:
        model = Comment
        fields = [
            "author",
            "comment",
            "contentType",
            "published",
            "id",
        ]
        read_only_fields = [
            "author",
        ]
