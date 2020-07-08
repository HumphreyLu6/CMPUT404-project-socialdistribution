import requests
import uuid
import time

from django.db import models
import mysite.utils as utils
from user.models import User


# Create your models here.
class Friend(models.Model):
    FRIENDSTATUS = (
        ("U", "Unprocessed"),
        ("A", "Accepted"),
        ("R", "Rejected"),
    )

    class Meta:
        unique_together = (("f1Id", "f2Id"),)

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    date = models.DateField(auto_now_add=True)
    f1Id = models.ForeignKey(User, on_delete=models.CASCADE, related_name="f2friends")
    f2Id = models.ForeignKey(User, on_delete=models.CASCADE, related_name="f1friends")
    status = models.CharField(max_length=1, choices=FRIENDSTATUS, default="U")
    isCopy = models.BooleanField()

    def __str__(self):
        return f"{self.status}"
