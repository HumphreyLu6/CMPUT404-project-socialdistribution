import React from "react";
import { connect } from "react-redux";
import Header from "./Header";
import ProfileContent from "./ProfileContent";
import PostList from "./PostList";
import { Spin } from "antd";
import { AUTHOR_POST_API } from "../configs/api_url";

class ProfilePage extends React.Component {
  renderProfile() {
    const { user } = this.props;
    if (!user || !user.loggedIn) {
      return (
        <Spin
          spinning
          size="large"
          style={{ marginLeft: "50%", marginTop: "50%" }}
        />
      );
    }
    const authorId = user.id.split("/").pop();
    return (
      <div>
        <ProfileContent user={user} author={user} />
        <PostList source={AUTHOR_POST_API(authorId, 3)} showEdit={true} />
      </div>
    );
  }

  render() {
    return (
      <div>
        <Header selectedKey="3" />
        {this.renderProfile()};
      </div>
    );
  }
}

const mapStateToProps = ({ user }) => {
  return { user };
};

export default connect(mapStateToProps, null)(ProfilePage);
