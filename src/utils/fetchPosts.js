import axios from "axios";

export const fetchVisiblePosts = async (url, callback) => {
  try {
    const token = localStorage.getItem("key");
    let res;
    if (token) {
      const headers = { Authorization: "Token " + token };
      res = await axios.get(url, { headers });
    } else {
      res = await axios.get(url);
    }
    callback(res);
  } catch (err) {
    console.log(err);
  }
};
