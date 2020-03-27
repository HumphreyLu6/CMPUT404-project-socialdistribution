import requests
import json
import time
from typing import Optional

from django.db import models

from mysite.settings import DEFAULT_HOST, REMOTE_HOST1
from user.models import User, update_remote_authors
from friend.models import Friend
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

    def update_post(self):
        update_remote_posts(self.host, self.auth)

    def update_comment(self):
        update_remote_comments(self.host, self.auth)


def get_nodes_user_ids() -> list:
    return Node.objects.all().values_list("user__id", flat=True)


def update_db(
    update_user: bool,
    update_friend: bool,
    update_post: bool,
    update_comment: bool,
    base_user: Optional[User] = None,
):
    """
    Params:
        update_user: bool, update_friend: bool, update_post: bool, update_comment: bool, base_user: User
    """
    t_time = time.time()
    for node in Node.objects.all():
        if update_user:
            stime = time.time()
            node.update_user()
            print(f"Time used for update {node} DB user:", time.time() - stime)
        if update_post:
            stime = time.time()
            node.update_post()
            print(f"Time used for update {node} DB post:", time.time() - stime)
        # if update_comment:
        #     stime = time.time()
        #     node.update_comment()
        #     print(f"Time used for update {node} DB comment:", time.time() - stime)
    if update_friend:
        stime = time.time()
        update_remote_friends(base_user, 1)
        print(f"Time used for update {str(base_user)} DB friend:", time.time() - stime)
    print(f"Time used for update DB:", time.time() - t_time)


def update_remote_friends(base_user: User, depth: int):
    """
    Only update base_user and base_user's friends
    """
    current_friends = []
    if not base_user:
        utils.print_warning("Parameter 'base_user' is None!")

    if base_user.host == DEFAULT_HOST:
        friend_relations = base_user.f2friends.filter(status="A").values_list(
            "f2Id", flat=True
        )
        current_friends_qs = User.objects.filter(id__in=list(friend_relations))
        current_friends = [friend for friend in current_friends_qs]
    else:
        if f1_host == REMOTE_HOST1:
            tmp = base_user.host.split("//")[-1]
            url = f"https://{tmp}author/{tmp}author/{base_user.non_uuid_id}"
        else:
            url = f"{base_user.host}/author/{str(base_user.id)}"
        auth = Node.objects.filter(host=f1_host).first().auth
        response = requests.get(url, headers={"Authorization": f"Basic {auth}"})
        data = response.json()

        if not data or response.status_code not in range(200, 300):
            utils.print_warning(
                f"Warning: {url} GET method failed with status code {response.status_code}"
            )
        else:
            try:
                raw_friends_dict_list = data["friends"]
                # save all friends into list, used for delete non-existing friend relations.
                for raw_friends_dict in raw_friends_dict_list:
                    f2_id = raw_friends_dict["id"].split("/")[-1]
                    f2_host = raw_friends_dict["host"]
                    if f2_host == REMOTE_HOST1:
                        friend = User.objects.filter(
                            host=f2_host, non_uuid_id=f2_id
                        ).first()
                    else:
                        friend = User.objects.filter(host=f2_host, id=f2_id).first()
                    if not friend:
                        # Ignore if this user is not cached, it happend because either the host is not
                        # connected to us or new data created since updating users, the second one can
                        # be simply solved by refreshing webpages
                        continue
                    else:
                        current_friends.append(friend)
                        if not Friend.objects.filter(f1Id=author, f2Id=friend).exists():
                            Friend.objects.create(
                                f1Id=author, f2Id=friend, status="A", isCopy=False
                            )
                            Friend.objects.create(
                                f1Id=friend, f2Id=author, status="A", isCopy=True
                            )
                        else:
                            # already existed, update status no matter it's "U" or "A"
                            friend_relation = Friend.objects.filter(
                                f1Id=author, f2Id=friend, isCopy=False
                            ).first()
                            friend_relation.status = "A"
                            friend_relation.save()

                            friend_relation = Friend.objects.filter(
                                f1Id=friend, f2Id=author, isCopy=True
                            ).first()
                            friend_relation.status = "A"
                            friend_relation.save()

                # delete friend relations
                Friend.objects.filter(f1Id=author).exclude(
                    f2Id__in=current_friends, status="U"
                ).delete()
                Friend.objects.filter(f2Id=author).exclude(
                    f1Id__in=current_friends, status="U"
                ).delete()
            except Exception as e:
                print(type(e).__name__, e)
    if depth:
        # recursively updaye friends
        for friend in current_friends:
            update_remote_friends(friend, 0)
