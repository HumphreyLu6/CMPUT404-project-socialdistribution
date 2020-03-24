import React from "react"
import { Route,Switch} from "react-router"
import {FE_POST_EDIT_API,FE_FREND_REQUEST_API,FE_FREND_LIST_API,FE_SEARCH_API,FE_POST_COMMENTS_API,FE_ADDNODES_API,FE_PROFILE_API,FE_AUTHORS_API,FE_LOGIN_API,FE_MY_NODES_API,FE_REGISTER_API,FE_NODE_REQUEST_API,FE_SEETING_API,FE_USER_API,FE_USERPROFILE_API,FE_ADMIN_REGISTER_API,FE_ADD_POST_API} from "./utils/constants.js"
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
import Error from './404'

const Routes = () => {
  return (
    <Switch>
      {/*author*/}
      <Route exact path = {FE_LOGIN_API} component={Login} />
      <Route path = {FE_REGISTER_API} component={Register} />
      <Route path= {FE_USER_API} component={User} />
      <Route exact path= {FE_USERPROFILE_API} component={UserSelf} />
      <Route path= {FE_SEETING_API} component={Settings} />
      <Route path={FE_POST_COMMENTS_API(':postid')} component={Comments} /> 
      <Route path={FE_FREND_LIST_API(':authorid')} component={FriendsList} />
      <Route path= {FE_FREND_REQUEST_API(':authorid')} component={FriendRequest} />
      <Route path={FE_SEARCH_API} component={SearchPage} />
      <Route path={FE_ADD_POST_API} component={PostInput} />
      <Route path={FE_POST_EDIT_API(':postid')} component={PostEdit} />
      
      {/*admin*/}
      <Route path={FE_ADMIN_REGISTER_API} component={SignUpRequestPage} />
      <Route path={FE_NODE_REQUEST_API} component={NodesRequestPage} />
      <Route path={FE_MY_NODES_API} component={NodesPage} />
      <Route path={FE_AUTHORS_API} component={AuthorPage} />
      <Route path={FE_PROFILE_API} component={ProfilePage} />
      <Route path={FE_ADDNODES_API} component={AddNodesPage} />
      <Route path="*" status={404} component={Error}/>
      
    </Switch>
  )
}

export default Routes
