import uuid

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth import password_validation

from mysite.settings import DEFAULT_HOST


class User(AbstractUser):
    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    email = models.EmailField(unique=True, editable=False)
    host = models.URLField(default=DEFAULT_HOST)
    displayName = models.CharField(max_length=150)
    github = models.URLField(null=True, blank=True)
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


# utils
def get_user(id: str):
    user = User.objects.filter(id=id).first()
    if not user:
        id = str(uuid.UUID(id))
        user = User.objects.filter(id=id).first()
    return user
