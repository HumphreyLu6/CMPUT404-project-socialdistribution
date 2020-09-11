import axios from "axios";
import { CURRENT_USER_API, AUTHOR_PROFILE_API } from "../configs/api_url";
import { FETCH_USER, FETCH_AUTHOR } from "./types";

export const fetchUser = () => async (dispatch) => {
  try {
    const res = await axios.get(CURRENT_USER_API, {
      headers: {
        Authorization: "Token " + localStorage.getItem("key"),
      },
    });
    dispatch({ type: FETCH_USER, payload: { ...res.data, loggedIn: true } });
  } catch (err) {
    dispatch({ type: FETCH_USER, payload: { loggedIn: false } });
    console.log(err);
  }
};

export const fetchAuthor = (authorId) => async (dispatch) => {
  try {
    const res = await axios.get(AUTHOR_PROFILE_API(authorId));
    dispatch({ type: FETCH_AUTHOR, payload: res.data });
  } catch (err) {
    console.log(err);
  }
};
