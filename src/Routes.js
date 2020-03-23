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
import Error from './404'
const Routes = () => {
  return (
    <div>
      {/*author*/}
      <Route exact path="/" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/demo/author/posts/" component={User} />
      <Route exact path="/author/profile/" component={UserSelf} />
      <Route path="/settings" component={Settings} />
      {/* // */}
      <Route path="/demo/posts/:postid/comments" component={Comments} />
      <Route path="/demo/author/:authorid/friends" component={FriendsList} />
      <Route path="/demo/author/:authorid/friendrequest" component={FriendRequest} />
      <Route path="/demo/author/search" component={SearchPage} />
      <Route path="/new_post" component={PostInput} />
      <Route path="/posts/:postid/edit" component={PostEdit} />

      {/*admin*/}
      <Route path="/sign-up-request" component={SignUpRequestPage} />
      <Route path="/nodes-request" component={NodesRequestPage} />
      <Route path="/my-nodes" component={NodesPage} />
      <Route path="/authors" component={AuthorPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/add-nodes" component={AddNodesPage} />
    </div>
  )
}

export default Routes
