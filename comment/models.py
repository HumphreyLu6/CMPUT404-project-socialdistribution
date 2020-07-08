import uuid
from django.db import models
from user.models import User
from post.models import Post

CONTENTTYPE = (
    ("text/plain", "plain text"),
    ("text/markdown", "markdown text"),
)


class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name="comments", blank=True
    )
    author = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="comments", blank=True,
    )
    comment = models.CharField(max_length=400)
    contentType = models.CharField(
        max_length=16, choices=CONTENTTYPE, default="text/markdown"
    )
    published = models.DateTimeField()

    def __str__(self):
        return str(self.id)
