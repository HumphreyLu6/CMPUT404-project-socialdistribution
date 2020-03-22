
// https://stackoverflow.com/questions/6042007/how-to-get-the-host-url-using-javascript-from-the-current-page
var protocol = window.location.protocol;
var slashes = protocol.concat("//");
var host = slashes.concat(window.location.host);
if (window.location.port) {
    host = host.replace("3000", "8000")
}
const HOST = host.concat("/");
// login and register api
export const LOGIN_API = HOST + "login/";
export const REGISTER_API = HOST + "signup/";

// user api
export const CURRENT_USER_API = HOST + "author/current_user/";
export const AUTHOR_LIST_API = HOST + "author";
export const AUTHOR_PROFILE_API = function (authorId) {
    return `${HOST}author/${authorId}`;
}
export const AUTHOR_GITHUB_API = function (authorId) {
    return `${HOST}author/${authorId}/github_token`;
}

// friend api
export const AUTHOR_FRIENDREQUEST_API = function (authorId){
    return `${HOST}author/${authorId}/friendrequests`;
}
export const FRIENDS_API = function (authorId){
    return `${HOST}author/${authorId}/friends/`;
}
export const FRIEND_REQUEST_API = HOST + 'friendrequest/';
export const IF_FRIEND_API = function (authorId,friendId){
    return `${HOST}author/${authorId}/friends/${friendId}`;
}

// post api
export const AUTHOR_POST_API = function (authorId){
    return `${HOST}author/${authorId}/posts`;
}
export const VISIBLE_POST_API = HOST + 'author/posts';
export const POST_API = HOST + 'posts';
export const SINGLE_POST_API = function (postId) {
    return `${HOST}posts/${postId}`;
} 

// comment api
export const COMMENT_API = function (postId){
    return `${HOST}posts/${postId}/comments`;
}
