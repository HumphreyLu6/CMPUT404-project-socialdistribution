import React from "react"
import { Route, Switch } from "react-router"
import User from "./User"
import UserSelf from "./UserSelf"
import Settings from "./Settings"
import Comments from "./Comment"
import FriendsList from "./FriendsList"
import FriendRequest from "./FriendRequest"
import PostInput from "./PostInput"
import PostEdit from "./PostEdit"
import Login from "./Login"
import Register from "./Register"
import SignUpRequestPage from "./SignUpRequestPage";
import NodesRequestPage from './NodesRequestPage';
import NodesPage from './NodesPage';
import AuthorPage from './AuthorPage';
import ProfilePage from './ProfilePage';
import AddNodesPage from './AddNodesPage';
import SearchPage from './SearchPage';
import Error404 from './404'
import {
  FE_POST_EDIT_URL,
  FE_FREND_REQUEST_URL,
  FE_FREND_LIST_URL,
  FE_SEARCH_URL,
  FE_POST_COMMENTS_URL,
  FE_ADDNODES_URL,
  FE_PROFILE_URL,
  FE_AUTHORS_URL,
  FE_LOGIN_URL,
  FE_MY_NODES_URL,
  FE_REGISTER_URL,
  FE_NODE_REQUEST_URL,
  FE_SEETING_URL,
  FE_USER_URL,
  FE_USERPROFILE_URL,
  FE_ADMIN_REGISTER_URL,
  FE_ADD_POST_URL
} from "./utils/constants.js"

const Routes = () => {
  return (
    <Switch>
      {/*author*/}
      <Route exact path={FE_LOGIN_URL} component={Login} />
      <Route path={FE_REGISTER_URL} component={Register} />
      <Route path={FE_USER_URL} component={User} />
      <Route exact path={FE_USERPROFILE_URL} component={UserSelf} />
      <Route path={FE_SEETING_URL} component={Settings} />
      <Route path={FE_POST_COMMENTS_URL(':postid')} component={Comments} />
      <Route path={FE_FREND_LIST_URL(':authorid')} component={FriendsList} />
      <Route path={FE_FREND_REQUEST_URL(':authorid')} component={FriendRequest} />
      <Route path={FE_SEARCH_URL} component={SearchPage} />
      <Route path={FE_ADD_POST_URL} component={PostInput} />
      <Route path={FE_POST_EDIT_URL(':postid')} component={PostEdit} />

      {/*admin*/}
      <Route path={FE_ADMIN_REGISTER_URL} component={SignUpRequestPage} />
      <Route path={FE_NODE_REQUEST_URL} component={NodesRequestPage} />
      <Route path={FE_MY_NODES_URL} component={NodesPage} />
      <Route path={FE_AUTHORS_URL} component={AuthorPage} />
      <Route path={FE_PROFILE_URL} component={ProfilePage} />
      <Route path={FE_ADDNODES_URL} component={AddNodesPage} />
      <Route path="*" status={404} component={Error404} />

    </Switch>
  )
}

export default Routes
