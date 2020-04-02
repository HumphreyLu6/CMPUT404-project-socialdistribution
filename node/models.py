import requests
import json
import time
import traceback

from typing import Optional

from django.db import models

import mysite.utils as utils
from mysite.settings import (
    DEFAULT_HOST,
    REMOTE_HOST1,
    REMOTE_HOST2,
    REMOTE_HOST3,
)
from user.models import User, update_remote_authors
from friend.models import Friend
from post.models import Post
from comment.models import Comment

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


def get_nodes_user_ids() -> list:
    return Node.objects.all().values_list("user__id", flat=True)


def update_db(
    update_user: bool,
    update_friend: bool,
    update_post: bool,
    base_user: Optional[User] = None,
):
    """
    Params:
        update_user: bool, update_friend: bool, update_post: bool, base_user: User
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
        if base_user.host == REMOTE_HOST1:
            tmp = base_user.host.split("//")[-1]
            url = f"https://{tmp}author/{tmp}author/{base_user.non_uuid_id}"
        else:
            url = f"{base_user.host}author/{str(base_user.id)}"
        auth = Node.objects.filter(host=base_user.host).first().auth
        response = requests.get(
            url,
            headers={"Authorization": f"Basic {auth}", "Accept": "application/json",},
        )

        if response.status_code not in range(200, 300):
            no_dash_uuid = str(base_user.id).replace("-", "")
            url = f"{base_user.host}author/{no_dash_uuid}"
            response = requests.get(
                url,
                headers={
                    "Authorization": f"Basic {auth}",
                    "Accept": "application/json",
                },
            )
            if response.status_code not in range(200, 300):
                utils.print_warning(
                    f"{url} GET method failed with status code {response.status_code}"
                )
                return
        try:
            data = response.json()
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
                    if not Friend.objects.filter(f1Id=base_user, f2Id=friend).exists():
                        Friend.objects.create(
                            f1Id=base_user, f2Id=friend, status="A", isCopy=False
                        )
                        Friend.objects.create(
                            f1Id=friend, f2Id=base_user, status="A", isCopy=True
                        )
                    else:
                        # already existed, update status no matter it's "U" or "A"
                        friend_relation = Friend.objects.filter(
                            f1Id=base_user, f2Id=friend, isCopy=False
                        ).first()
                        friend_relation.status = "A"
                        friend_relation.save()

                        friend_relation = Friend.objects.filter(
                            f1Id=friend, f2Id=base_user, isCopy=True
                        ).first()
                        friend_relation.status = "A"
                        friend_relation.save()

            # delete friend relations
            # Friend.objects.filter(f1Id=base_user, status="A").exclude(
            #     f2Id__in=current_friends
            # ).delete()
            # Friend.objects.filter(f2Id=base_user, status="A").exclude(
            #     f1Id__in=current_friends
            # ).delete()
        except Exception as e:
            utils.print_warning(type(e).__name__, e)
    if depth:
        # recursively updaye friends
        for friend in current_friends:
            update_remote_friends(friend, 0)


def update_remote_posts(host: str, auth: str):
    url = f"{host}author/posts"
    response = requests.get(
        url, headers={"Authorization": f"Basic {auth}", "Accept": "application/json",}
    )
    if response.status_code not in range(200, 300):
        utils.print_warning(
            f"Warning: {url} GET method failed with status code {response.status_code}"
        )
    else:
        try:
            data = response.json()
            raw_posts_dict_list = data["posts"]
            while data.pop("next", None) != None:
                response = requests.get(
                    data["next"],
                    headers={
                        "Authorization": f"Basic {auth}",
                        "Accept": "application/json",
                    },
                )
                data = response.json()
                raw_posts_dict_list += data["posts"]
            posts_dict_list = []
            all_comments_dict_list = []
            for raw_post_dict in raw_posts_dict_list:
                author_dict = raw_post_dict.pop("author", None)
                author = None
                if author_dict["host"] == REMOTE_HOST1:
                    author_dict["non_uuid_id"] = author_dict["id"].split("/")[-1]
                    author = User.objects.filter(
                        host=author_dict["host"], non_uuid_id=author_dict["non_uuid_id"]
                    ).first()
                else:
                    author_dict["id"] = author_dict["id"].split("/")[-1]
                    author = User.objects.filter(id=author_dict["id"]).first()
                if not author:
                    # author not cached, ignore this post
                    continue
                else:
                    valid, post_dict, comments_dict_list = tidy_post_data(
                        raw_post_dict, host, author
                    )
                    all_comments_dict_list += comments_dict_list
                    if valid:
                        posts_dict_list.append(post_dict)
                create_or_update_remote_posts(posts_dict_list)
                delete_non_existing_remote_posts(host, posts_dict_list)
            create_or_update_remote_comments(all_comments_dict_list)
            delete_non_existing_remote_comments(posts_dict_list, all_comments_dict_list)
        except Exception as e:
            # traceback.print_stack(e)
            utils.print_warning(f"{type(e).__name__} {str(e)}")


def create_or_update_remote_posts(posts_dict_list: list):
    try:
        for post_dict in posts_dict_list:
            obj, created = Post.objects.update_or_create(
                id=post_dict["id"], defaults=post_dict,
            )
    except Exception as e:
        # traceback.print_exc(e)
        utils.print_warning(f"{type(e).__name__} {str(e)}")


def delete_non_existing_remote_posts(node: str, posts_dict_list: list):
    try:
        existing_posts_ids = [post_dict["id"] for post_dict in posts_dict_list]
        Post.objects.filter(origin__icontains=node).exclude(
            id__in=existing_posts_ids
        ).delete()
    except Exception as e:
        utils.print_warning(f"{type(e).__name__} {str(e)}")


def tidy_post_data(data: dict, node: str, author: User) -> (bool, dict, list):
    """
    Tidy up the post data received from other servers
    """
    new_data = {}
    try:
        new_data["author"] = author
        new_data["id"] = data["id"]
        new_data["title"] = data["title"]
        new_data["source"] = node
        new_data["content"] = data["content"]
        new_data["published"] = data["published"]
        new_data["visibility"] = data["visibility"]
        new_data["unlisted"] = data["unlisted"]
        if "description" in data.keys():
            new_data["description"] = data["description"]
        if "contentType" in data.keys():
            new_data["contentType"] = data["contentType"]
        if "categories" in data.keys():
            new_data["categoriesStr"] = json.dumps(data["categories"])
        if "visibleTo" in data.keys():
            new_data["visibleToStr"] = json.dumps(data["visibleTo"])
        if "origin" in data.keys():
            new_data["origin"] = data["origin"].split("posts/")[0]
        else:
            new_data["origin"] = node

        raw_comments = data["comments"]
        valid_comments = []
        for raw_comment in raw_comments:
            valid, valid_comment = tidy_comment_data(raw_comment, new_data["id"])
            if valid:
                valid_comments.append(valid_comment)

        return True, new_data, valid_comments
    except Exception as e:
        utils.print_warning(f"{type(e).__name__} {str(e)}")
        return False, new_data, []


def tidy_comment_data(data: dict, post_id: str) -> (bool, dict):
    """
    Tidy up the comment data received from other servers
    """
    new_data = {}
    try:
        author_dict = data.pop("author", None)
        author = None
        if author_dict["host"] == REMOTE_HOST1:
            author_dict["non_uuid_id"] = author_dict["id"].split("/")[-1]
            author = User.objects.filter(
                host=author_dict["host"], non_uuid_id=author_dict["non_uuid_id"]
            ).first()
        else:
            author_dict["id"] = author_dict["id"].split("/")[-1]
            author = User.objects.filter(id=author_dict["id"]).first()
        if not author:
            return False, new_data

        new_data["author"] = author
        new_data["post"] = post_id
        new_data["id"] = data["id"]
        new_data["comment"] = data["comment"]
        new_data["published"] = data["published"]
        if "contentType" in data.keys():
            new_data["contentType"] = data["contentType"]
        return True, new_data
    except Exception as e:
        utils.print_warning(f"{type(e).__name__} {str(e)}")
        return False, new_data


def create_or_update_remote_comments(comments_dict_list: list):
    try:
        for comment_dict in comments_dict_list:
            post_id = comment_dict.pop("post", None)
            post = Post.objects.filter(id=post_id).first()
            obj, created = Comment.objects.update_or_create(
                id=comment_dict["id"], post=post, defaults=comment_dict,
            )
    except Exception as e:
        utils.print_warning(f"{type(e).__name__} {str(e)}")


def delete_non_existing_remote_comments(
    posts_dict_list: list, comments_dict_list: list
):
    try:
        existing_comments_ids = [
            comment_dict["id"] for comment_dict in comments_dict_list
        ]
        for post_dict in posts_dict_list:
            post = Post.objects.filter(id=post_dict["id"]).first()
            Comment.objects.filter(post=post).exclude(
                id__in=existing_comments_ids
            ).delete()
    except Exception as e:
        utils.print_warning(f"{type(e).__name__} {str(e)}")
