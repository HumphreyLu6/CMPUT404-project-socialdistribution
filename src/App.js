import React, { Component } from "react";
import { Switch, Route, BrowserRouter } from "react-router-dom";
import LogIn from "./components/LogIn";
import Register from "./components/Register";
import HomePage from "./components/HomePage";
import ProfilePage from "./components/ProfilePage";
import FriendRequestsPage from "./components/FriendRequestsPage";
import FriendsPage from "./components/FriendsPage";
import SearchPage from "./components/SearchPage";
import EditPostPage from "./components/EditPostPage";
import Page404 from "./components/Page404";
import { BackTop } from "antd";

import {
  FE_HOME_URL,
  FE_LOGIN_URL,
  FE_REGISTER_URL,
  FE_USERPROFILE_URL,
  FE_FREND_REQUEST_URL,
  FE_FREND_LIST_URL,
  FE_SEARCH_URL,
  FE_POST_URL,
  FE_EDIT_POST_URL,
} from "./configs/fe_url";

class App extends Component {
  render() {
    return (
      <div>
        <BackTop />
        <BrowserRouter className="App">
          <Switch>
            <Route exact path={FE_LOGIN_URL} render={() => <LogIn />} />
            <Route exact path={FE_REGISTER_URL} render={() => <Register />} />
            <Route exact path={FE_HOME_URL} render={() => <HomePage />} />
            <Route
              exact
              path={FE_USERPROFILE_URL}
              render={() => <ProfilePage />}
            />
            <Route
              exact
              path={FE_FREND_REQUEST_URL}
              render={() => <FriendRequestsPage />}
            />
            <Route
              exact
              path={FE_FREND_LIST_URL}
              render={() => <FriendsPage />}
            />
            <Route
              exact
              path={FE_SEARCH_URL(":authorId")}
              component={SearchPage}
            />
            <Route exact path={FE_SEARCH_URL("")} component={SearchPage} />
            <Route exact path={FE_POST_URL} render={() => <EditPostPage />} />
            <Route exact path={FE_EDIT_POST_URL} component={EditPostPage} />
            <Route eaxct path="*" status={404} component={Page404} />
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
