from rest_framework import serializers

from user.models import User
from user.serializers import AuthorSerializer
from comment.models import Comment
from comment.serializer import CommentSerializer
from .models import Post


class PostSerializer(serializers.ModelSerializer):
    comments_count = serializers.SerializerMethodField(read_only=True)

    def get_comments_count(self, obj):
        return str(Comment.objects.filter(post=obj).count())

    class Meta:
        model = Post
        fields = "__all__"
        read_only_fields = [
            "author",
        ]
        depth = 0

