import { combineReducers } from "redux";
import userReducer from "./userReducer";
import authorReducer from "./authorReducer";

export default combineReducers({
  user: userReducer,
  author: authorReducer,
});
