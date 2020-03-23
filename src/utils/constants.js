
// https://stackoverflow.com/questions/6042007/how-to-get-the-host-url-using-javascript-from-the-current-page
var protocol = window.location.protocol;
var slashes = protocol.concat("//");
var host = slashes.concat(window.location.host);
if (window.location.port) {
    host = host.replace("3000", "8000")
}
export const HOST = host.concat("/");
// login and register api
export const LOGIN_API = HOST + "login/";
export const REGISTER_API = HOST + "signup/";

// user api
export const CURRENT_USER_API = HOST + "author/current_user";
export const AUTHOR_LIST_API = function (host){
    return `${host}author`;
}
export const AUTHOR_PROFILE_API = function (authorId) {
    return `${HOST}author/${authorId}`;
}
export const AUTHOR_GITHUB_API = function (authorId) {
    return `${HOST}author/${authorId}/github_token`;
}
export const ALL_AUTHOR_API = function (host){
    return `${host}allauthor/`;
}

// friend api
export const AUTHOR_FRIENDREQUEST_API = function (authorId){
    return `${HOST}author/${authorId}/friendrequests`;
}
export const FRIENDS_API = function (host, authorId){
    return `${host}author/${authorId}/friends/`;
}
export const ANYONE_FRIEND_API = function (host, authorId){
    return `${host}author/${authorId}/friends`;
}
export const FRIEND_REQUEST_API = function (host){
    return `${host}friendrequest`;
}

export const IF_AUTHOR_FRIEND_API = function (host, authorId, friendId){
    return `${host}author/${authorId}/friends/${friendId}`;
}

// post api
export const AUTHOR_POST_API = function (host, authorId){
    return `${host}author/${authorId}/posts`;
}
export const VISIBLE_POST_API = function (host){
    return `${host}author/posts`;
}
export const POST_API = function(host){
    return `${host}posts`;
}
export const SINGLE_POST_API = function (host, postId) {
    return `${host}posts/${postId}`;
} 

// comment api
export const COMMENT_API = function (host, postId){
    return `${host}posts/${postId}/comments`;
}


export const AUTHOR_API = HOST + "api/user/author/";
export const FRIEND_API = HOST + "api/friend/my_friends/";
export const FRIEND_BOOL = HOST + 'api/friend/if_friend/';
export const USERNAME_LIST = HOST + 'api/user/author/username_list/';