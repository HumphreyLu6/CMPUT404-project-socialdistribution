import json
import base64
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from .models import User

# Create your tests here.
ACCEPT_STATUS = "A"
REJECT_STATUS = "R"
UNFRIEND_STATUS = "R"


class FriendTestCase(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            email="user1@email.com", username="user1", password="passqweruser1",
        )
        self.token1 = base64.b64encode(
            bytes("user1@email.com:passqweruser1", "utf-8")
        ).decode("utf-8")

        self.user2 = User.objects.create_user(
            email="user2@email.com", username="user2", password="passqweruser2",
        )
        self.token2 = base64.b64encode(
            bytes("user2@email.com:passqweruser2", "utf-8")
        ).decode("utf-8")

        self.user3 = User.objects.create_user(
            email="user3@email.com", username="user3", password="passqweruser3",
        )
        self.token3 = base64.b64encode(
            bytes("user3@email.com:passqweruser3", "utf-8")
        ).decode("utf-8")

    def test_send_get_friend_request(self):
        # send friend request from user1 to user2
        request_body = {
            "query": "friendrequest",
            "author": {
                "id": f"{self.user1.host}author/{self.user1.id}",
                "host": f"{self.user1.host}",
                "displayName": "user1",
                "url": f"{self.user1.host}author/{self.user1.id}",
            },
            "friend": {
                "id": f"{self.user2.host}author/{self.user2.id}",
                "host": f"{self.user2.host}",
                "displayName": "user2",
                "url": f"{self.user2.host}author/{self.user2.id}",
            },
        }
        response = self.client.post(
            "/friendrequest", request_body, HTTP_AUTHORIZATION=f"Basic {self.token1}"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # get friend request for user2
        response = self.client.get(
            f"/author/{self.user2.id}/friendrequests",
            HTTP_AUTHORIZATION=f"Basic {self.token2}",
        )
        data = response.data
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(data["authors"], [f"{self.user1.host}author/{self.user1.id}"])

    def test_accept_friend_request(self):
        # send friend request from user1 to user2
        request_body = {
            "query": "friendrequest",
            "author": {
                "id": f"{self.user1.host}author/{self.user1.id}",
                "host": f"{self.user1.host}",
                "displayName": "user1",
                "url": f"{self.user1.host}author/{self.user1.id}",
            },
            "friend": {
                "id": f"{self.user2.host}author/{self.user2.id}",
                "host": f"{self.user2.host}",
                "displayName": "user2",
                "url": f"{self.user2.host}author/{self.user2.id}",
            },
        }
        response = self.client.post(
            "/friendrequest", request_body, HTTP_AUTHORIZATION=f"Basic {self.token1}"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # user2 accept friend accept from user1
        request_body = {
            "query": "friendrequest",
            "author": {
                "id": f"{self.user1.host}author/{self.user1.id}",
                "host": f"{self.user1.host}",
                "displayName": "user1",
                "url": f"{self.user1.host}author/{self.user1.id}",
            },
            "friend": {
                "id": f"{self.user2.host}author/{self.user2.id}",
                "host": f"{self.user2.host}",
                "displayName": "user2",
                "url": f"{self.user2.host}author/{self.user2.id}",
            },
            "status": "A",
        }
        response = self.client.patch(
            "/friendrequest", request_body, HTTP_AUTHORIZATION=f"Basic {self.token2}"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_reject_friend_request(self):
        # send friend request from user1 to user2
        request_body = {
            "query": "friendrequest",
            "author": {
                "id": f"{self.user1.host}author/{self.user1.id}",
                "host": f"{self.user1.host}",
                "displayName": "user1",
                "url": f"{self.user1.host}author/{self.user1.id}",
            },
            "friend": {
                "id": f"{self.user2.host}author/{self.user2.id}",
                "host": f"{self.user2.host}",
                "displayName": "user2",
                "url": f"{self.user2.host}author/{self.user2.id}",
            },
        }
        response = self.client.post(
            "/friendrequest", request_body, HTTP_AUTHORIZATION=f"Basic {self.token1}"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # user2 reject friend accept from user1
        request_body = {
            "query": "friendrequest",
            "author": {
                "id": f"{self.user1.host}author/{self.user1.id}",
                "host": f"{self.user1.host}",
                "displayName": "user1",
                "url": f"{self.user1.host}author/{self.user1.id}",
            },
            "friend": {
                "id": f"{self.user2.host}author/{self.user2.id}",
                "host": f"{self.user2.host}",
                "displayName": "user2",
                "url": f"{self.user2.host}author/{self.user2.id}",
            },
            "status": "R",
        }
        response = self.client.patch(
            "/friendrequest", request_body, HTTP_AUTHORIZATION=f"Basic {self.token2}"
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_unfriend(self):
        # send friend request from user1 to user2
        request_body = {
            "query": "friendrequest",
            "author": {
                "id": f"{self.user1.host}author/{self.user1.id}",
                "host": f"{self.user1.host}",
                "displayName": "user1",
                "url": f"{self.user1.host}author/{self.user1.id}",
            },
            "friend": {
                "id": f"{self.user2.host}author/{self.user2.id}",
                "host": f"{self.user2.host}",
                "displayName": "user2",
                "url": f"{self.user2.host}author/{self.user2.id}",
            },
        }
        response = self.client.post(
            "/friendrequest", request_body, HTTP_AUTHORIZATION=f"Basic {self.token1}"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # user2 unfriend user1
        request_body = {
            "query": "friendrequest",
            "author": {
                "id": f"{self.user1.host}author/{self.user1.id}",
                "host": f"{self.user1.host}",
                "displayName": "user1",
                "url": f"{self.user1.host}author/{self.user1.id}",
            },
            "friend": {
                "id": f"{self.user2.host}author/{self.user2.id}",
                "host": f"{self.user2.host}",
                "displayName": "user2",
                "url": f"{self.user2.host}author/{self.user2.id}",
            },
            "status": "R",
        }
        response = self.client.patch(
            "/friendrequest", request_body, HTTP_AUTHORIZATION=f"Basic {self.token2}"
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_if_friend(self):
        # send friend request from user1 to user2
        request_body = {
            "query": "friendrequest",
            "author": {
                "id": f"{self.user1.host}author/{self.user1.id}",
                "host": f"{self.user1.host}",
                "displayName": "user1",
                "url": f"{self.user1.host}author/{self.user1.id}",
            },
            "friend": {
                "id": f"{self.user2.host}author/{self.user2.id}",
                "host": f"{self.user2.host}",
                "displayName": "user2",
                "url": f"{self.user2.host}author/{self.user2.id}",
            },
        }
        response = self.client.post(
            "/friendrequest", request_body, HTTP_AUTHORIZATION=f"Basic {self.token1}"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # send friend request from user1 to user3
        request_body = {
            "query": "friendrequest",
            "author": {
                "id": f"{self.user1.host}author/{self.user1.id}",
                "host": f"{self.user1.host}",
                "displayName": "user1",
                "url": f"{self.user1.host}author/{self.user1.id}",
            },
            "friend": {
                "id": f"{self.user3.host}author/{self.user3.id}",
                "host": f"{self.user3.host}",
                "displayName": "user3",
                "url": f"{self.user3.host}author/{self.user3.id}",
            },
        }
        response = self.client.post(
            "/friendrequest", request_body, HTTP_AUTHORIZATION=f"Basic {self.token1}"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # user2 accept friend request from user1
        request_body = {
            "query": "friendrequest",
            "author": {
                "id": f"{self.user1.host}author/{self.user1.id}",
                "host": f"{self.user1.host}",
                "displayName": "user1",
                "url": f"{self.user1.host}author/{self.user1.id}",
            },
            "friend": {
                "id": f"{self.user2.host}author/{self.user2.id}",
                "host": f"{self.user2.host}",
                "displayName": "user2",
                "url": f"{self.user2.host}author/{self.user2.id}",
            },
            "status": "A",
        }
        response = self.client.patch(
            "/friendrequest", request_body, HTTP_AUTHORIZATION=f"Basic {self.token2}"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # if friend between user1 and user2
        response = self.client.get(
            f"/author/{self.user1.id}/friends/{self.user2.id}",
            HTTP_AUTHORIZATION=f"Basic {self.token1}",
        )
        data = response.data
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(data["friends"], True)

        # if friend between user1 and user3
        response = self.client.get(
            f"/author/{self.user1.id}/friends/{self.user3.id}",
            HTTP_AUTHORIZATION=f"Basic {self.token1}",
        )
        data = response.data
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(data["friends"], False)

