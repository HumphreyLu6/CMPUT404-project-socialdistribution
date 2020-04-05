//###########################################################################
//BE-APIS-URLS
//###########################################################################
// https://stackoverflow.com/questions/6042007/how-to-get-the-host-url-using-
// javascript-from-the-current-page
var protocol = window.location.protocol;
var slashes = protocol.concat("//");
var host = slashes.concat(window.location.host);
if (window.location.port) {
    host = host.replace("3000", "8000")
}
export const HOST = host.concat("/");

// login and register api
export const BE_LOGIN_API_URL = HOST + "login/";
export const BE_REGISTER_API_URL = HOST + "signup/";

// user api
export const BE_CURRENT_USER_API_URL = HOST + "author/current_user";
export const BE_AUTHOR_LIST_API_URL = function (host) {
    return `${host}author`;
}
export const BE_AUTHOR_PROFILE_API_URL = function (authorId) {
    return `${HOST}author/${authorId}`;
}
export const BE_AUTHOR_GITHUB_API_URL = function (authorId) {
    return `${HOST}author/${authorId}/github_token`;
}
export const BE_ALL_AUTHOR_API_URL = function (host) {
    return `${host}all_author/`;
}

// friend api
export const BE_AUTHOR_FRIENDREQUEST_API_URL = function (authorId) {
    return `${HOST}author/${authorId}/friendrequests`;
}
export const BE_FRIENDS_API_URL = function (host, authorId) {
    return `${host}author/${authorId}/friends/`;
}
export const BE_ANYONE_FRIEND_API_URL = function (host, authorId) {
    return `${host}author/${authorId}/friends`;
}
export const BE_FRIEND_REQUEST_API_URL = function (host) {
    return `${host}friendrequest`;
}

export const BE_IF_TWO_AUTHORS_FRIENDS_API_URL = function (host, authorId, friendId) {
    return `${host}author/${authorId}/friends/${friendId}`;
}

// post api
export const BE_AUTHOR_POST_API_URL = function (host, authorId) {
    return `${host}author/${authorId}/posts`;
}
export const BE_VISIBLE_POST_API_URL = function (host) {
    return `${host}author/posts`;
}
export const BE_POST_API_URL = function (host) {
    return `${host}posts`;
}
export const BE_SINGLE_POST_API_URL = function (host, postId) {
    return `${host}posts/${postId}`;
}

// comment api
export const BE_COMMENT_API_URL = function (host, postId) {
    return `${host}posts/${postId}/comments`;
}

//###########################################################################
//FE-URLS
//###########################################################################

export const FE_LOGIN_URL = "/";
export const FE_USER_URL = "/fe/author/posts/";
export const FE_REGISTER_URL = "/fe/register";
export const FE_NODES_URL = HOST + "/fe/nodes-request";
export const FE_USERPROFILE_URL = "/fe/author/profile/";
export const FE_SEETING_URL = "/fe/settings";
export const FE_ADD_POST_URL = "/fe/new_post";
export const FE_SEARCH_URL = "/fe/author/search";

//Parameter based URLs
export const FE_FREND_LIST_URL = function (authorid) {
    return `/fe/author/${authorid}/friends`;
}

export const FE_FREND_REQUEST_URL = function (authorid) {
    return `/fe/author/${authorid}/friendrequest`;
}

export const FE_POST_EDIT_URL = function (postid) {
    return `/fe/posts/${postid}/edit`;
}

export const FE_POST_COMMENTS_URL = function (postid) {
    return `/fe/posts/${postid}/comments`;
}

//###########################################################################