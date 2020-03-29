import json
import uuid
import datetime

from pprint import pprint
from django.test import TestCase, RequestFactory
from django.shortcuts import render
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from user.models import User
from friend.models import Friend
from post.models import Post
from .models import Comment
from .views import CommentViewSet


class CommentTestCase(APITestCase):
    def setUp(self):
        """
        setup: user1, user2
        setup: post1 by user1,  post2 by user2
        setup: friend(user1, user2)
        setup: comment1 for post1 by user2, comment 2 for post2 by user1, 
            comment 3 for post1 by user1.
        """
        self.user1 = User.objects.create_user(
            email="user1@email.com", username="user1", password="passqweruser1",
        )
        self.token1 = Token.objects.create(user=self.user1)

        self.user2 = User.objects.create_user(
            email="user2@email.com", username="user2", password="passqweruser2",
        )
        self.token2 = Token.objects.create(user=self.user2)

        self.post1 = Post.objects.create(
            title="post1",
            content="this post1 from user1",
            author=self.user1,
            visibility="PUBLIC",
        )
        self.post2 = Post.objects.create(
            title="post2",
            content="this post2 from user2",
            author=self.user2,
            visibility="FRIENDS",
        )

        Friend.objects.create(
            f1Id=self.user1, f2Id=self.user2, status="A", isCopy=False
        )
        Friend.objects.create(
            f1Id=self.user2, f2Id=self.user1, status="A", isCopy=False
        )

        self.comment1 = Comment.objects.create(
            id=uuid.uuid4(),
            comment="this is comment1 for post1 by user2",
            post=self.post1,
            author=self.user2,
            published=timezone.now(),
        )

        self.comment2 = Comment.objects.create(
            id=uuid.uuid4(),
            comment="this is comment2 for post2 by user1",
            post=self.post2,
            author=self.user1,
            published=timezone.now(),
        )

        self.comment3 = Comment.objects.create(
            id=uuid.uuid4(),
            comment="this is comment3 for post1 by user1",
            post=self.post1,
            author=self.user1,
            published=timezone.now(),
        )

    def test_create_comment(self):
        request_body = {
            "query": "addComment",
            "post": f"http://127.0.0.1:8000/posts/{self.post1.id}",
            "comment": {
                "author": {
                    "id": f"http://127.0.0.1:8000/author/{self.user1.id}",
                    "host": "http://127.0.0.1:8000/",
                    "displayName": "Greg Johnson",
                    "url": f"http://127.0.0.1:8000/author/{self.user1.id}",
                    "github": "http://github.com/gjohnson",
                },
                "comment": "this is comment test for post 1 by user 1",
                "contentType": "text/markdown",
                "published": "2015-03-09T13:07:04+00:00",
                "id": uuid.uuid4(),
            },
        }

        response = self.client.post(
            f"/posts/{str(self.post1.id)}/comments",
            request_body,
            HTTP_AUTHORIZATION="Token " + self.token1.key,
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response = self.client.post(
            f"/posts/{str(self.post1.id)}/comments", request_body,
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_comment(self):
        response = self.client.get(f"/posts/{str(self.post1.id)}/comments")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.get(f"/posts/{str(self.post1.id)}/comments")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.get(
            f"/posts/{str(self.post1.id)}/comments",
            HTTP_AUTHORIZATION="Token " + self.token1.key,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
