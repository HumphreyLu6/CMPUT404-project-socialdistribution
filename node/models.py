import requests
import json
import time

from django.db import models

from user.models import User, update_remote_authors
from friend.models import Friend, update_remote_friends
from post.models import Post, update_remote_posts
from comment.models import Comment, update_remote_comments

# Create your models here.
class Node(models.Model):

    host = models.URLField(primary_key=True)
    # Admin users for connection from other nodes
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="node")
    # Basic auth used for connectting to other nodes (base64 encoding of "email:password")
    auth = models.TextField()
    date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.host}"

    def update_user(self):
        update_remote_authors(self.host, self.auth)

    def update_friend(self):
        update_remote_friends(self.host, self.auth)

    def update_post(self):
        update_remote_posts(self.host, self.auth)

    def update_comment(self):
        update_remote_comments(self.host, self.auth)


def get_nodes_user_ids() -> list:
    return Node.objects.all().values_list("user__id", flat=True)


def update_db(
    update_user: bool, update_friend: bool, update_post: bool, update_comment: bool
):
    """
    Params:
        update_user: bool, update_friend: bool, update_post: bool, update_comment: bool
    """
    stime = time.time()
    for node in Node.objects.all():
        if update_user:
            node.update_user()
        if update_friend:
            node.update_friend()
        if update_post:
            node.update_post()
        if update_comment:
            node.update_comment()
    print("Time used for update DB:", time.time() - stime)
