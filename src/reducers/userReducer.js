import { FETCH_USER } from "../actions/types";

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

const userReducer = (state = null, action) => {
  switch (action.type) {
    case FETCH_USER:
      return action.payload;
    default:
      return state;
  }
};

export default userReducer;
