import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser

DEFAULTHOST = "https://spongebook.herokuapp.com/"

# Create your models here.
class User(AbstractUser):
    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, editable=False)
    host = models.URLField(default=DEFAULTHOST)
    github = models.URLField(null=True, blank=True)
    bio = models.TextField(max_length=2048, null=True, blank=True)
    is_approve = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.username
