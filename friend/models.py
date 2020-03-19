from django.db import models
from user.models import User
import uuid

# Create your models here.
class Friend(models.Model):
    class Meta:
        unique_together = (("f1Url", "f2Url"),)

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    FRIENDSTATUS = (("U", "Unprocessed"), ("A", "Accepted"), ("R",'Rejected'))
    date = models.DateField(auto_now_add=True)
    f1Url = models.URLField()
    f2Url = models.URLField()
    status = models.CharField(max_length=1, choices=FRIENDSTATUS, default="U")

    def __str__(self):
        return f"{self.status}"
