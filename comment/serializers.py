from rest_framework import serializers

from user.serializers import AuthorSerializer

# from post.serializers import PostSerializer
from .models import Comment


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = [
            "author",
            "comment",
            "contentType",
            "published",
            "id",
        ]
        # extra_kwargs = {"created_by": {"write_only": True}}

