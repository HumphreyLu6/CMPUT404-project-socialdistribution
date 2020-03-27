import uuid
import requests
from django.db import models
from user.models import User
from post.models import Post
from mysite.settings import DEFAULT_HOST, REMOTE_HOST1
import mysite.utils as utils

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


def update_remote_comments(host: str, auth: str):
    remote_posts = Post.objects.exclude(origin=DEFAULT_HOST)
    for remote_post in remote_posts:
        url = f"{remote_post.origin}posts/{str(remote_post.id)}/comments"
        response = requests.get(url, headers={"Authorization": f"Basic {auth}"})
        data = response.json()
        if not data or response.status_code not in range(200, 300):
            utils.print_warning(
                f"{url} GET method failed with status code {response.status_code}"
            )
            continue
        try:
            raw_comments_dict_list = data["comments"]
            while data["next"] != None:
                response = requests.get(
                    data["next"], headers={"Authorization": f"Basic {auth}"}
                )
                data = response.json()
                raw_comments_dict_list += data["comments"]
            comments_dict_list = []
            for raw_comment_dict in raw_comments_dict_list:
                author_dict = raw_comment_dict.pop("author", None)
                author = None
                if author_dict["host"] == REMOTE_HOST1:
                    author_dict["non_uuid_id"] = author_dict["id"].split("/")[-1]
                    author = User.objects.filter(
                        host=author_dict["host"], non_uuid_id=author_dict["non_uuid_id"]
                    ).first()
                else:
                    author = User.objects.filter(
                        host=author_dict["host"], id=author_dict["id"]
                    ).first()
                if not author:
                    # author not cached, ignore this post
                    continue
                else:
                    valid, comment_dict = tidy_comment_data(
                        raw_comment_dict, host, author, remote_post
                    )
                    if valid:
                        comments_dict_list.append(comment_dict)
                create_or_update_remote_comments(comments_dict_list)
                delete_non_existing_remote_comments(remote_post, comments_dict_list)
        except Exception as e:
            utils.print_warning(f"{type(e).__name__} {str(e)}")


def tidy_comment_data(data: dict, host: str, author: User, post: Post) -> (bool, dict):
    """
    Tidy up the comment data received from other servers
    """
    new_data = {}
    try:
        new_data["author"] = author
        new_data["post"] = post
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
            obj, created = Comment.objects.update_or_create(
                id=comment_dict["id"], defaults=comment_dict,
            )
    except Exception as e:
        utils.print_warning(f"{type(e).__name__} {str(e)}")


def delete_non_existing_remote_comments(post: Post, comments_dict_list: list):
    try:
        existing_comments_ids = [
            comment_dict["id"] for comment_dict in comments_dict_list
        ]
        Comment.objects.filter(post=post).exclude(id__in=existing_comments_ids).delete()
    except Exception as e:
        utils.print_warning(f"{type(e).__name__} {str(e)}")
