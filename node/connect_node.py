import json
import time
import urllib
import uuid
from typing import Optional

import requests

from comment.models import Comment
from friend.models import Friend
from post.models import Post
from user.models import User
from mysite.settings import DEFAULT_HOST, REMOTE_HOST1
import mysite.utils as utils
from .models import Node


def update_db(
    update_users: bool, update_posts: bool, update_user: Optional[User] = None,
):
    """
    Params:
        update_users: bool, update_posts: bool, update_user: User
    """
    print_time_usage = False
    t_time = time.time()
    for node in Node.objects.all():
        if update_users:
            stime = time.time()
            update_remote_authors(node.host, node.auth)
            if print_time_usage:
                print(f"Time used for update {node} DB user:", time.time() - stime)
        if update_posts:
            stime = time.time()
            update_remote_posts(node.host, node.auth)
            if print_time_usage:
                print(f"Time used for update {node} DB post:", time.time() - stime)
    if update_user:
        stime = time.time()
        update_friends(update_user, 1, None)
        if print_time_usage:
            print(
                f"Time used for update {str(update_user)} DB friend:",
                time.time() - stime,
            )
    if print_time_usage:
        print(f"Time used for update DB:", time.time() - t_time)


"""
update friends-------------------------------------------------------------------------------------
"""


def deal_unprocessed_active_requests(user):
    friends = []
    unprocessed_active_requests = Friend.objects.filter(
        status="U", f1Id=user.id, isCopy=False
    )
    for request in unprocessed_active_requests:
        friend = request.f2Id
        if friend.host == DEFAULT_HOST:
            continue
        tmp = user.host
        if friend.host != REMOTE_HOST1:
            tmp = tmp.replace("https://", "")
        second_author_url = urllib.parse.quote(f"{tmp}author/{user.id}", safe="~()*!.'")
        url = f"{friend.host}author/{friend.id}/friends/{second_author_url}"
        auth = Node.objects.filter(host=friend.host).first().auth
        response = requests.get(
            url,
            headers={"Authorization": f"Basic {auth}", "Accept": "application/json",},
        )
        if response.status_code in range(200, 300):
            response_data = response.json()
            isFriend = response_data["friends"]
            if isFriend:
                request.status = "A"
                request.save()
                Friend.objects.filter(
                    status="U", f1Id=friend.id, f2Id=user.id, isCopy=True
                ).update(status="A")
                friends.append(friends)
            else:
                isPending = response_data["pending"]
                if not isPending:
                    request.delete()
                    Friend.objects.filter(
                        status="U", f1Id=friend.id, f2Id=user.id, isCopy=True
                    ).delete()
    return friends


def deal_current_friends(current_friend_ids, user):
    friends = []
    for friend_id in current_friend_ids:
        friend = User.objects.filter(id=friend_id).first()
        if friend.host == DEFAULT_HOST:
            continue
        tmp = user.host
        if friend.host != REMOTE_HOST1:
            tmp = tmp.replace("https://", "")
        second_author_url = urllib.parse.quote(f"{tmp}author/{user.id}", safe="~()*!.'")
        url = f"{friend.host}author/{friend.id}/friends/{second_author_url}"
        auth = Node.objects.filter(host=friend.host).first().auth
        response = requests.get(
            url,
            headers={"Authorization": f"Basic {auth}", "Accept": "application/json",},
        )
        if response.status_code in range(200, 300):
            response_data = response.json()
            isFriend = response_data["friends"]
            if not isFriend:
                isPending = response_data["pending"]
                if not isPending:
                    Friend.objects.filter(f1Id=user.id, f2Id=friend.id).delete()
                    Friend.objects.filter(f1Id=friend.id, f2Id=user.id).delete()
            else:
                friends.append(friend)
        else:
            raise Exception(response.text)
    return friends


def update_friends(user, depth, ignoreuser):
    """
    update friendships of user
    """
    try:
        friends = []
        if not user:
            utils.print_warning("Parameter 'user' is None!")
            return
        if user.host == DEFAULT_HOST:
            # user from local server
            friends += deal_unprocessed_active_requests(user)
            tmp1 = Friend.objects.filter(
                status="A", f1Id=user.id, isCopy=False
            ).values_list("f2Id", flat=True)
            friends += deal_current_friends(tmp1, user)
            tmp2 = Friend.objects.filter(
                status="A", f2Id=user.id, isCopy=False
            ).values_list("f1Id", flat=True)
            friends += deal_current_friends(tmp2, user)
        else:
            # user from remote servers
            url = f"{user.host}author/{str(user.id)}"
            if user.host == REMOTE_HOST1:
                url = f"{user.host}author/{user.non_uuid_id}"
            auth = Node.objects.filter(host=user.host).first().auth
            response = requests.get(
                url,
                headers={
                    "Authorization": f"Basic {auth}",
                    "Accept": "application/json",
                },
            )
            if response.status_code not in range(200, 300):
                no_dash_uuid = str(user.id).replace("-", "")
                url = f"{user.host}author/{no_dash_uuid}"
                response = requests.get(
                    url,
                    headers={
                        "Authorization": f"Basic {auth}",
                        "Accept": "application/json",
                    },
                )
                if response.status_code not in range(200, 300):
                    raise Exception(response.text)
            friend_dicts = response.json()["friends"]
            for friend_dict in friend_dicts:
                friend_id_str = friend_dict["id"].split("/")[-1]
                friend = None
                try:
                    friend_id = uuid.UUID(friend_id_str)
                    friend = User.objects.filter(id=friend_id).first()
                except ValueError:
                    friend = User.objects.filter(non_uuid_id=id).first()
                if friend:
                    friends.append(friend)

            if ignoreuser:
                friends += [ignoreuser]
            Friend.objects.filter(status="A", f1Id=user.id).exclude(
                f2Id__in=friends
            ).delete()

            Friend.objects.filter(status="A", f2Id=user.id).exclude(
                f1Id__in=friends
            ).delete()

        if depth:
            for friend in friends:
                update_friends(friend, 0, user)
    except Exception as e:
        utils.print_warning(f"{type(e).__name__} {str(e)}")


"""
update posts and comments--------------------------------------------------------------------------
"""


def update_remote_posts(host: str, auth: str):
    url = f"{host}author/posts"
    response = requests.get(
        url, headers={"Authorization": f"Basic {auth}", "Accept": "application/json",}
    )
    if response.status_code not in range(200, 300):
        utils.print_warning(
            f"Warning: {url} GET method failed with status code {response.status_code}"
        )
    else:
        try:
            data = response.json()
            raw_posts_dict_list = data["posts"]
            while data.pop("next", None):
                response = requests.get(
                    data["next"],
                    headers={
                        "Authorization": f"Basic {auth}",
                        "Accept": "application/json",
                    },
                )
                data = response.json()
                raw_posts_dict_list += data["posts"]
            posts_dict_list = []
            all_comments_dict_list = []
            for raw_post_dict in raw_posts_dict_list:
                author_dict = raw_post_dict.pop("author", None)
                author = None
                if author_dict["host"] == REMOTE_HOST1:
                    author_dict["non_uuid_id"] = author_dict["id"].split("/")[-1]
                    author = User.objects.filter(
                        host=author_dict["host"], non_uuid_id=author_dict["non_uuid_id"]
                    ).first()
                else:
                    author_dict["id"] = author_dict["id"].split("/")[-1]
                    author = User.objects.filter(id=author_dict["id"]).first()
                if not author:
                    # author not cached, ignore this post
                    continue
                else:
                    valid, post_dict, comments_dict_list = tidy_post_data(
                        raw_post_dict, host, author
                    )
                    all_comments_dict_list += comments_dict_list
                    if valid:
                        posts_dict_list.append(post_dict)
                create_or_update_remote_posts(posts_dict_list)
                delete_non_existing_remote_posts(host, posts_dict_list)
            create_or_update_remote_comments(all_comments_dict_list)
            delete_non_existing_remote_comments(posts_dict_list, all_comments_dict_list)
        except Exception as e:
            # traceback.print_stack(e)
            utils.print_warning(f"{type(e).__name__} {str(e)}")


def create_or_update_remote_posts(posts_dict_list: list):
    try:
        for post_dict in posts_dict_list:
            obj, created = Post.objects.update_or_create(
                id=post_dict["id"], defaults=post_dict,
            )
    except Exception as e:
        # traceback.print_exc(e)
        utils.print_warning(f"{type(e).__name__} {str(e)}")


def create_or_update_remote_comments(comments_dict_list: list):
    try:
        for comment_dict in comments_dict_list:
            post_id = comment_dict.pop("post", None)
            post = Post.objects.filter(id=post_id).first()
            obj, created = Comment.objects.update_or_create(
                id=comment_dict["id"], post=post, defaults=comment_dict,
            )
    except Exception as e:
        utils.print_warning(f"{type(e).__name__} {str(e)}")


def delete_non_existing_remote_posts(node: str, posts_dict_list: list):
    try:
        existing_posts_ids = [post_dict["id"] for post_dict in posts_dict_list]
        Post.objects.filter(origin__icontains=node).exclude(
            id__in=existing_posts_ids
        ).delete()
    except Exception as e:
        utils.print_warning(f"{type(e).__name__} {str(e)}")


def delete_non_existing_remote_comments(
    posts_dict_list: list, comments_dict_list: list
):
    try:
        existing_comments_ids = [
            comment_dict["id"] for comment_dict in comments_dict_list
        ]
        for post_dict in posts_dict_list:
            post = Post.objects.filter(id=post_dict["id"]).first()
            Comment.objects.filter(post=post).exclude(
                id__in=existing_comments_ids
            ).delete()
    except Exception as e:
        utils.print_warning(f"{type(e).__name__} {str(e)}")


def tidy_post_data(data: dict, node: str, author: User) -> (bool, dict, list):
    """
    Tidy up the post data received from other servers
    """
    new_data = {}
    try:
        new_data["author"] = author
        new_data["id"] = data["id"]
        new_data["title"] = data["title"]
        new_data["source"] = node
        new_data["content"] = data["content"]
        new_data["published"] = data["published"]
        new_data["visibility"] = data["visibility"]
        new_data["unlisted"] = data["unlisted"]
        if "description" in data.keys():
            new_data["description"] = data["description"]
        if "contentType" in data.keys():
            new_data["contentType"] = data["contentType"]
        if "categories" in data.keys():
            new_data["categoriesStr"] = json.dumps(data["categories"])
        if "visibleTo" in data.keys():
            new_data["visibleToStr"] = json.dumps(data["visibleTo"])
        if "origin" in data.keys():
            new_data["origin"] = data["origin"].split("posts/")[0]
        else:
            new_data["origin"] = node

        raw_comments = data["comments"]
        valid_comments = []
        for raw_comment in raw_comments:
            valid, valid_comment = tidy_comment_data(raw_comment, new_data["id"])
            if valid:
                valid_comments.append(valid_comment)

        return True, new_data, valid_comments
    except Exception as e:
        utils.print_warning(f"{type(e).__name__} {str(e)}")
        return False, new_data, []


def tidy_comment_data(data: dict, post_id: str) -> (bool, dict):
    """
    Tidy up the comment data received from other servers
    """
    new_data = {}
    try:
        author_dict = data.pop("author", None)
        author = None
        if author_dict["host"] == REMOTE_HOST1:
            author_dict["non_uuid_id"] = author_dict["id"].split("/")[-1]
            author = User.objects.filter(
                host=author_dict["host"], non_uuid_id=author_dict["non_uuid_id"]
            ).first()
        else:
            author_dict["id"] = author_dict["id"].split("/")[-1]
            author = User.objects.filter(id=author_dict["id"]).first()
        if not author:
            return False, new_data

        new_data["author"] = author
        new_data["post"] = post_id
        new_data["id"] = data["id"]
        new_data["comment"] = data["comment"]
        new_data["published"] = data["published"]
        if "contentType" in data.keys():
            new_data["contentType"] = data["contentType"]
        return True, new_data
    except Exception as e:
        utils.print_warning(f"{type(e).__name__} {str(e)}")
        return False, new_data


"""
update authors--------------------------------------------------------------------------------------
"""


def update_remote_authors(host: str, auth: str):
    url = f"{host}author"
    response = requests.get(
        url, headers={"Authorization": f"Basic {auth}", "Accept": "application/json",}
    )
    raw_author_dict_list = response.json()
    if not raw_author_dict_list or response.status_code not in range(200, 300):
        print(
            f"Warning: {url} GET method failed with status code {response.status_code}"
        )
    else:
        author_dict_list = []  # processed valid list
        for raw_author_dict in raw_author_dict_list:
            valid, author_dict = tidy_user_data(raw_author_dict, host)
            if not valid:
                continue
            author_dict_list.append(author_dict)
        create_or_update_remote_users(host, author_dict_list)
        delete_non_existing_remote_users(host, author_dict_list)


def delete_non_existing_remote_users(host: str, author_dict_list: list):
    try:
        if host == REMOTE_HOST1:
            non_uuid_ids = [
                author_dict["non_uuid_id"] for author_dict in author_dict_list
            ]
            User.objects.filter(host=host).exclude(
                non_uuid_id__in=non_uuid_ids
            ).delete()
        else:
            ids = [author_dict["id"] for author_dict in author_dict_list]
            User.objects.filter(host=host).exclude(id__in=ids).delete()
    except Exception as e:
        utils.print_warning(f"{type(e).__name__} {str(e)}")


def create_or_update_remote_users(host: str, author_dict_list: list):
    try:
        for author_dict in author_dict_list:
            if host == REMOTE_HOST1:
                if User.objects.filter(
                    non_uuid_id=int(author_dict["non_uuid_id"])
                ).exists():
                    author_dict.pop("id")
                    author_dict.pop("username")
                    author_dict.pop("email")
                    obj, created = User.objects.update_or_create(
                        non_uuid_id=int(author_dict["non_uuid_id"]),
                        defaults=author_dict,
                    )
                else:
                    obj, created = User.objects.update_or_create(
                        non_uuid_id=int(author_dict["non_uuid_id"]),
                        defaults=author_dict,
                    )
            else:
                obj, created = User.objects.update_or_create(
                    id=author_dict["id"], defaults=author_dict
                )
    except Exception as e:
        utils.print_warning(f"{type(e).__name__} {str(e)}")


def tidy_user_data(data: dict, node: str) -> (bool, dict):
    """
    Tidy up the data received from other servers
    """
    new_data = {}
    try:
        host = data.pop("host", None)
        id = data.pop("id", None)
        displayName = data.pop("displayName", None)
        if not host or not id or not displayName or host not in node:
            return False, new_data
        else:
            if host != node:
                host = node
            new_data["host"] = host
            new_data["displayName"] = displayName

            id = id.split("/")[-1]
            if host == REMOTE_HOST1:
                new_data["id"] = str(uuid.uuid4())
                new_data["non_uuid_id"] = id
            else:
                new_data["id"] = id

        github = data.pop("github", None)
        if github:
            new_data["github"] = github

        bio = data.pop("bio", None)
        if bio:
            new_data["bio"] = github

        email = data.pop("email", None)
        new_data["email"] = (
            str(new_data["id"]) + email if email else str(new_data["id"]) + "@email.com"
        )

        new_data["username"] = str(new_data["id"])
        return True, new_data
    except Exception as e:
        utils.print_warning(f"{type(e).__name__} {str(e)}")
        return False, new_data
