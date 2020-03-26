import requests
import uuid
from django.db import models
from user.models import User
from mysite.settings import REMOTE_HOST1


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


def update_remote_friends(host: str, auth: str):
    host_authors = User.objects.filter(host=host)  # assume remote users are updated
    for author in host_authors:
        # visit detail view
        f1_id = None
        if host == REMOTE_HOST1:
            tmp = host.split("//")[-1]
            url = f"https://{tmp}author/{tmp}author/{author.non_uuid_id}"
            f1_id = author.non_uuid_id
        else:
            url = f"{host}/author/{str(author.id)}"
            f1_id = author.id
        response = requests.get(url, headers={"Authorization": f"Basic {auth}"})
        data = response.json()

        if not data or response.status_code not in range(200, 300):
            print(
                f"Warning: {url} GET method failed with status code {response.status_code}"
            )
        else:
            try:
                raw_friends_dict_list = data["friends"]
                # save all friends into list, used for delete non-existing friend relations.
                current_friends = []
                for raw_friends_dict in raw_friends_dict_list:
                    f2_id = raw_friends_dict["id"].split("/")[-1]
                    f2_host = raw_friends_dict["host"]
                    if host == REMOTE_HOST1:
                        friend = User.objects.filter(
                            host=f2_host, non_uuid_id=f2_id
                        ).first()
                    else:
                        friend = User.objects.filter(host=f2_host, id=f2_id).first()
                    if not friend:
                        # Ignore if this user is not cached, it happend because either the host is not
                        # connected to us or new data created since updating users, the second one can
                        # be simply solved by refreshing webpages
                        continue
                    else:
                        current_friends.append(friend)
                        if not Friend.objects.filter(f1Id=author, f2Id=friend).exists():
                            Friend.objects.create(
                                f1Id=author, f2Id=friend, status="A", isCopy=False
                            )
                            Friend.objects.create(
                                f1Id=friend, f2Id=author, status="A", isCopy=True
                            )
                        else:
                            # already existed, update status
                            friend_relation = Friend.objects.filter(
                                f1Id=author, f2Id=friend, status="U", isCopy=False
                            ).first()
                            friend_relation.status = "A"
                            friend_relation.save()

                            friend_relation = Friend.objects.filter(
                                f1Id=friend, f2Id=author, status="U", isCopy=True
                            ).first()
                            friend_relation.status = "A"
                            friend_relation.save()

                # delete friend relations
                Friend.objects.filter(f1Id=author).exclude(
                    f2Id__in=current_friends, status="U"
                ).delete()
                Friend.objects.filter(f2Id=author).exclude(
                    f1Id__in=current_friends, status="U"
                ).delete()
            except Exception as e:
                print(type(e).__name__, e)
                continue
