import uuid
# from mysite.settings import DEFAULT_HOST
from django.db import models
from user.models import User

DEFAULT_HOST = "http://127.0.0.1:8000"
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

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
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
    published = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
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
