import React from "react";
import Header from "./Header";
import PostList from "./PostList";
import { VISIBLE_POSTS_API } from "../configs/api_url";

class HomePage extends React.Component {
  render() {
    return (
      <div>
        <Header selectedKey={"0"} />
        <PostList source={VISIBLE_POSTS_API(5)} showEdit={false} />
      </div>
    );
  }
}

export default HomePage;
