from django.db import models

from user.models import User


class Node(models.Model):

    host = models.URLField(primary_key=True)
    # Admin users for connection from other nodes
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="node")
    # Basic auth used for connectting to other nodes (base64 encoding of "email:password")
    auth = models.TextField()
    date = models.DateField(auto_now_add=True)
    shareImage = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.host}"


def get_nodes_user_ids() -> list:
    return Node.objects.all().values_list("user__id", flat=True)
