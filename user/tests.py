import json
import uuid
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from .models import User


class UserTestCase(APITestCase):
    def setUp(self):
        self.superuser = User.objects.create_superuser(
            username="superuser",
            email="superuser@email.com",
            password="passqwersuperuser",
        )
        self.superuser_token = Token.objects.create(user=self.superuser)
        # self.user = User.objects.create_user(
        #     email="user1@email.com", username="user1", password="passqweruser1",
        # )
        self.user2 = User.objects.create_user(username="dasd")
        print(self.user2)
        # self.user_token = Token.objects.create(user=self.user)

    def test_something(self):
        self.assertEqual(1, 1)

    # def test_create_user(self):
    #     request_1_body = {
    #         "username": "user2",
    #         "email": "user2@email.com",
    #         "password1": "passqweruser2",
    #         "password2": "passqweruser2",
    #     }
    #     response = self.client.post("/api/user/signup/", request_1_body)
    #     self.assertEqual(response.status_code, status.HTTP_201_CREATED)  # user1 created

    #     request_2_body = {"is_approve": "true"}
    #     response = self.client.patch(
    #         f"/api/user/admin_users/{request_1_body['username']}/",
    #         request_2_body,
    #         HTTP_AUTHORIZATION="Token " + self.superuser_token.key,
    #     )
    #     self.assertEqual(response.status_code, status.HTTP_200_OK)  # user1 approved

    #     request_3_body = {
    #         "email": request_1_body["email"],
    #         "password": request_1_body["password1"],
    #     }
    #     response = self.client.post("/api/user/login/", request_3_body)
    #     self.assertEqual(response.status_code, status.HTTP_200_OK)  # user1 logged in

    # def test_username_conflict(self):
    #     request_body = {
    #         "username": self.user.username,
    #         "email": self.user.email,
    #         "password1": self.user.password,
    #         "password2": self.user.password,
    #     }
    #     response = self.client.post("/api/user/signup/", request_body)
    #     self.assertEqual(
    #         response.status_code, status.HTTP_400_BAD_REQUEST
    #     )  # user1 existed

    # def test_list_user(self):
    #     response = self.client.get("/api/user/author/")
    #     self.assertEqual(response.status_code, status.HTTP_200_OK)

    # def test_retrieve_user(self):
    #     response = self.client.get("/api/user/author/user1/")
    #     self.assertEqual(response.status_code, status.HTTP_200_OK)
    #     response = response.render()
    #     data = json.loads(json.dumps(response.data))
    #     self.assertEqual(data["email"], self.user.email)

    # def test_update_user(self):
    #     request_body = {
    #         "bio": "Hi, I am user1",
    #     }
    #     response = self.client.patch(
    #         "/api/user/author/user1/",
    #         request_body,
    #         HTTP_AUTHORIZATION="Token " + self.user_token.key,
    #     )
    #     self.assertEqual(response.status_code, status.HTTP_200_OK)
    #     response = response.render()
    #     data = json.loads(json.dumps(response.data))
    #     self.assertEqual(data["bio"], request_body["bio"])

    # def test_delete_user(self):
    #     response = self.client.delete(
    #         "/api/user/author/user1/",
    #         HTTP_AUTHORIZATION="Token " + self.user_token.key,
    #     )
    #     self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    # def test_username_list(self):

    #     response = self.client.get(
    #         "/api/user/author/username_list/",
    #         HTTP_AUTHORIZATION="Token " + self.user_token.key,
    #     )
    #     self.assertEqual(response.status_code, status.HTTP_200_OK)
