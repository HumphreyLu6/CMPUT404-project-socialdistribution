//###########################################################################
//BE-APIS-URLS
//###########################################################################
var protocol = window.location.protocol;
var slashes = protocol.concat("//");
var host = slashes.concat(window.location.host);
export const HOST = host.concat("/");

// login and register api
export const LOGIN_API = HOST + "login/";
export const REGISTER_API = HOST + "signup/";

// user api
export const CURRENT_USER_API = HOST + "author/current_user";
export const AUTHOR_LIST_API = function (host) {
  return `${host}author`;
};
export const AUTHOR_PROFILE_API = function (authorId) {
  return `${HOST}author/${authorId}`;
};
export const AUTHOR_GITHUB_API = function (authorId) {
  return `${HOST}author/${authorId}/github_token`;
};
export const ALL_AUTHOR_API = `${HOST}all_author/`;

// friend api
export const AUTHOR_FRIENDREQUEST_API = function (authorId) {
  return `${HOST}author/${authorId}/friendrequests`;
};
export const FRIENDS_API = function (authorId) {
  return `${HOST}author/${authorId}/friends/`;
};
export const ANYONE_FRIEND_API = function (host, authorId) {
  return `${HOST}author/${authorId}/friends`;
};
export const FRIEND_REQUEST_API = `${HOST}friendrequest`;

export const IF_TWO_AUTHORS_FRIENDS_API = function (authorId, friendId) {
  return `${HOST}author/${authorId}/friends/${friendId}`;
};

// post api
export const AUTHOR_POST_API = function (authorId, pageSize) {
  return `${HOST}author/${authorId}/posts?size=${pageSize}`;
};
export const VISIBLE_POSTS_API = (pageSize) => {
  return `${HOST}author/posts?size=${pageSize}`;
};
export const POST_API = `${HOST}posts`;
export const SINGLE_POST_API = function (postId) {
  return `${HOST}posts/${postId}`;
};

// comment api
export const COMMENT_API = function (postId) {
  return `${HOST}posts/${postId}/comments`;
};
