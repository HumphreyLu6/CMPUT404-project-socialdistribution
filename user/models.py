import uuid
import requests
import json
import base64
import time

from django.db import models
from django.contrib.auth.models import AbstractUser

from mysite.settings import DEFAULT_HOST, REMOTE_HOST1
import mysite.utils as utils

# Create your models here.
class User(AbstractUser):
    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    email = models.EmailField(unique=True, editable=False)
    host = models.URLField(default=DEFAULT_HOST)
    displayName = models.CharField(max_length=150)
    github = models.URLField(null=True, blank=True)
    githubToken = models.TextField(null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    is_approve = models.BooleanField(default=False)
    # This field is for caching non-uuid ids of users on YuXuan's group server
    non_uuid_id = models.IntegerField(null=True, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def save(self, *args, **kwargs):
        if not self.displayName:
            self.displayName = self.username
        super().save(*args, **kwargs)
        if self._password is not None:
            password_validation.password_changed(self._password, self)
            self._password = None

    def __str__(self):
        return self.username + " " + self.displayName


def update_remote_authors(host: str, auth: str):
    url = f"{host}author"
    response = requests.get(
        url, headers={"Authorization": f"Basic {auth}", "Accept": "application/json",}
    )
    raw_author_dict_list = response.json()
    if not raw_author_dict_list or response.status_code not in range(200, 300):
        print(
            f"Warning: {url} GET method failed with status code {response.status_code}"
        )
    else:
        author_dict_list = []  # processed valid list
        for raw_author_dict in raw_author_dict_list:
            valid, author_dict = tidy_user_data(raw_author_dict, host)
            if not valid:
                continue
            author_dict_list.append(author_dict)
        create_or_update_remote_users(host, author_dict_list)
        delete_non_existing_remote_users(host, author_dict_list)


def delete_non_existing_remote_users(host: str, author_dict_list: list):
    try:
        if host == REMOTE_HOST1:
            non_uuid_ids = [
                author_dict["non_uuid_id"] for author_dict in author_dict_list
            ]
            User.objects.filter(host=host).exclude(
                non_uuid_id__in=non_uuid_ids
            ).delete()
        else:
            ids = [author_dict["id"] for author_dict in author_dict_list]
            User.objects.filter(host=host).exclude(id__in=ids).delete()
    except Exception as e:
        utils.print_warning(f"{type(e).__name__} {str(e)}")


def create_or_update_remote_users(host: str, author_dict_list: list):
    try:
        for author_dict in author_dict_list:
            if host == REMOTE_HOST1:
                if User.objects.filter(
                    non_uuid_id=int(author_dict["non_uuid_id"])
                ).exists():
                    author_dict.pop("id")
                    author_dict.pop("username")
                    author_dict.pop("email")
                    obj, created = User.objects.update_or_create(
                        non_uuid_id=int(author_dict["non_uuid_id"]),
                        defaults=author_dict,
                    )
                else:
                    obj, created = User.objects.update_or_create(
                        non_uuid_id=int(author_dict["non_uuid_id"]),
                        defaults=author_dict,
                    )
            else:
                obj, created = User.objects.update_or_create(
                    id=author_dict["id"], defaults=author_dict
                )
    except Exception as e:
        utils.print_warning(f"{type(e).__name__} {str(e)}")


def tidy_user_data(data: dict, node: str) -> (bool, dict):
    """
    Tidy up the data received from other servers
    """
    new_data = {}
    try:
        host = data.pop("host", None)
        id = data.pop("id", None)
        displayName = data.pop("displayName", None)
        if not host or not id or not displayName or host not in node:
            return False, new_data
        else:
            if host != node:
                host = node
            new_data["host"] = host
            new_data["displayName"] = displayName

            id = id.split("/")[-1]
            if host == REMOTE_HOST1:
                new_data["id"] = str(uuid.uuid4())
                new_data["non_uuid_id"] = id
            else:
                new_data["id"] = id

        github = data.pop("github", None)
        if github:
            new_data["github"] = github

        bio = data.pop("bio", None)
        if bio:
            new_data["bio"] = github

        email = data.pop("email", None)
        new_data["email"] = (
            str(new_data["id"]) + email if email else str(new_data["id"]) + "@email.com"
        )

        new_data["username"] = str(new_data["id"])
        return True, new_data
    except Exception as e:
        utils.print_warning(f"{type(e).__name__} {str(e)}")
        return False, new_data


# utils
def get_user(id: str):
    user = User.objects.filter(id=id).first()
    if not user:
        id = str(uuid.UUID(id))
        user = User.objects.filter(id=id).first()
    return user
