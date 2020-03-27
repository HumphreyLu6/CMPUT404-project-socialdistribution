import json
import base64
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from .models import User


class UserTestCase(APITestCase):
    def setUp(self):

        self.user = User.objects.create_user(
            email="user2@email.com", username="user2", password="passqweruser2",
        )
        self.token = base64.b64encode(
            bytes("user2@email.com:passqweruser2", "utf-8")
        ).decode("utf-8")
        self.id = User.objects.get(username="user2").id

    def test_register_login(self):

        # register a new user
        request_body = {
            "username": "user1",
            "email": "user1@email.com",
            "password1": "passqwer",
            "password2": "passqwer",
        }

        response = self.client.post("/signup/", request_body)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # approve the new user
        User.objects.filter(username="user1").update(is_approve=True)

        # test login
        request_body = {"email": "user1@email.com", "password": "passqwer"}

        response = self.client.post("/login/", request_body)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_authors(self):
        response = self.client.get("/author")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data,
            [
                {
                    "id": f"https://spongebook.herokuapp.com/author/{self.id}",
                    "host": "https://spongebook.herokuapp.com/",
                    "username": "user2",
                    "displayName": "user2",
                    "url": f"https://spongebook.herokuapp.com/author/{self.id}",
                    "friends": [],
                    "github": None,
                    "email": "user2@email.com",
                    "bio": None,
                }
            ],
        )

    def test_get_profile(self):
        response = self.client.get(
            f"/author/{self.id}", HTTP_AUTHORIZATION=f"Basic {self.token}"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "user2")
        self.assertEqual(response.data["displayName"], "user2")
        self.assertEqual(response.data["bio"], None)

    def test_update_profile(self):
        # test update display name
        request_body = {"displayName": "new name"}

        response = self.client.patch(
            f"/author/{self.id}", request_body, HTTP_AUTHORIZATION=f"Basic {self.token}"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["displayName"], "new name")

        # test update bio
        request_body = {"bio": "this is user2"}

        response = self.client.patch(
            f"/author/{self.id}", request_body, HTTP_AUTHORIZATION=f"Basic {self.token}"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["bio"], "this is user2")

    def test_get_github(self):
        response = self.client.get(
            f"/author/{self.id}/github_token", HTTP_AUTHORIZATION=f"Basic {self.token}"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["GithubToken"], None)
