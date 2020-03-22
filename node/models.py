from django.db import models
# Create your models here.
class Node(models.Model):

    host = models.URLField(primary_key=True)
    date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.host}"
