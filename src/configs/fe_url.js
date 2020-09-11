//###########################################################################
//FE-URLS
//###########################################################################

// https://stackoverflow.com/questions/6042007/how-to-get-the-host-url-using-
// javascript-from-the-current-page
let protocol = window.location.protocol;
let slashes = protocol.concat("//");
let host = slashes.concat(window.location.host);
// if (window.location.port) {
//   host = host.replace("3000", "8000");
// }
export const HOST = host.concat("/");
export const FE_HOME_URL = "/";
export const FE_LOGIN_URL = "/fe/login";
export const FE_REGISTER_URL = "/fe/register";
export const FE_SEETING_URL = "/fe/settings";
export const FE_POST_URL = "/fe/post";
export const FE_EDIT_POST_URL = `${FE_POST_URL}/:postId`;
export const FE_SEARCH_URL = (authorid) => {
  return "/fe/author/search/" + authorid;
};

//Parameter based URLs
export const FE_USERPROFILE_URL = `/fe/user/profile`;

export const FE_FREND_LIST_URL = "/fe/author/friends";

export const FE_FREND_REQUEST_URL = "/fe/author/friendrequest";

export const FE_POST_COMMENTS_URL = function (postid) {
  return `/fe/posts/${postid}/comments`;
};

//###########################################################################
//GITHUB
//###########################################################################

export const FE_GET_GITHUB_EVENTS_URL = function (username) {
  return `https://api.github.com/users/${username}/events`;
};
