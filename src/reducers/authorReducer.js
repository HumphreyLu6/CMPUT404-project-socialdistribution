import { FETCH_AUTHOR } from "../actions/types";

// const initialValue = {
//   id: null,
//   host: null,
//   username: null,
//   displayName: null,
//   url: null,
//   friends: [],
//   github: null,
//   email: null,
//   bio: null,
// };

const authorReducer = (state = null, action) => {
  switch (action.type) {
    case FETCH_AUTHOR:
      return action.payload;
    default:
      return state;
  }
};

export default authorReducer;
