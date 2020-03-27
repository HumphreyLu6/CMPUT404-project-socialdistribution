import uuid
import requests
import json
from django.db import models
from django.utils import timezone
from user.models import User
from mysite.settings import DEFAULT_HOST, REMOTE_HOST1
import mysite.utils as utils

VISIBILITYCHOICES = (
    ("PUBLIC", "PUBLIC: visible to PUBLIC"),
    ("FOAF", "FOAF: visible to friends of a friend"),
    ("FRIENDS", "FRIENDS: visiable to friends"),
    ("PRIVATE", "PRIVATE: visiable to users listed in visiableTo field"),
    ("SERVERONLY", "SERVERONLY: visiable to a certain server"),
)
CONTENTTYPE = (
    ("text/plain", "plain text"),
    ("text/markdown", "markdown text"),
    ("image/png;base64", "png image encoding in base64"),
    ("image/jpeg;base64", "jpeg image encoding in base64"),
    ("application/base64", "application ending in base64"),
)


class Post(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    title = models.CharField(max_length=256)
    source = models.URLField(default=DEFAULT_HOST)
    origin = models.URLField(default=DEFAULT_HOST)
    description = models.CharField(max_length=256, blank=True, default="")
    content = models.TextField()
    contentType = models.CharField(
        max_length=32, choices=CONTENTTYPE, default="text/markdown"
    )
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    # A list of category dumps into str
    categoriesStr = models.TextField(default="[]")
    published = models.DateTimeField(default=timezone.now)
    visibility = models.CharField(
        max_length=16, choices=VISIBILITYCHOICES, default="PUBLIC"
    )
    # A list of authors' emails dumps into str
    visibleToStr = models.TextField(default="[]")
    unlisted = models.BooleanField(default=False)

    isImage = models.BooleanField(default=False)
    # A list of image posts' ids dumps into str
    imagePostIdsStr = models.TextField(default="[]")  # storing image post ids.
    # This field is used to store the id of the text post has this image.
    # If isImages is False, this should be null.
    textPostId = models.UUIDField(null=True, blank=True)

    def __str__(self):
        return self.title


def update_remote_posts(host: str, auth: str):
    url = f"{host}/author/posts"
    response = requests.get(url, headers={"Authorization": f"Basic {auth}"})
    data = response.json()
    if not data or response.status_code not in range(200, 300):
        utils.print_warning(
            f"Warning: {url} GET method failed with status code {response.status_code}"
        )
    else:
        try:
            raw_posts_dict_list = data["posts"]
            while data["next"] != None:
                response = requests.get(
                    data["next"], headers={"Authorization": f"Basic {auth}"}
                )
                data = response.json()
                raw_posts_dict_list += data["posts"]
            posts_dict_list = []
            for raw_post_dict in raw_posts_dict_list:
                author_dict = raw_post_dict.pop("author", None)
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
                    valid, post_dict = tidy_post_data(raw_post_dict, host, author)
                    if valid:
                        posts_dict_list.append(post_dict)
                create_or_update_remote_posts(posts_dict_list)
                delete_non_existing_remote_posts(host, posts_dict_list)
        except Exception as e:
            utils.print_warning(f"{type(e).__name__} {str(e)}")


def create_or_update_remote_posts(posts_dict_list: list):
    try:
        for post_dict in posts_dict_list:
            obj, created = Post.objects.update_or_create(
                id=post_dict["id"], defaults=post_dict,
            )
    except Exception as e:
        utils.print_warning(f"{type(e).__name__} {str(e)}")


def delete_non_existing_remote_posts(node: str, posts_dict_list: list):
    try:
        existing_posts_ids = [post_dict["id"] for post_dict in posts_dict_list]
        Post.objects.filter(origin__icontains=node).exclude(
            id__in=existing_posts_ids
        ).delete()
    except Exception as e:
        utils.print_warning(f"{type(e).__name__} {str(e)}")


def tidy_post_data(data: dict, node: str, author: User) -> (bool, dict):
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
        return True, new_data
    except Exception as e:
        utils.print_warning(f"{type(e).__name__} {str(e)}")
        return False, new_data
