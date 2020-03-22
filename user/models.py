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
    displayName = models.CharField(max_length=150)
    github = models.URLField(null=True, blank=True)
    githubToken = models.TextField(null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    is_approve = models.BooleanField(default=False)

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
        return self.username


def create_abstract_remote_user(id: uuid.UUID, host: str, displayName: str) -> User:
    """
    help function to create abstract remote user
    """

    user = User.objects.create_user(
        id=id,
        host=host,
        email=str(id) + "@email.com",
        username=str(id),
        displayName=str(id) + displayName,
    )
    return user
