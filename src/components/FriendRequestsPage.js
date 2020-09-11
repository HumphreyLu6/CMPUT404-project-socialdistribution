import React from "react";
import Header from "./Header";
import { List, Button, Avatar, Spin, message } from "antd";
import { UserDeleteOutlined, UserAddOutlined } from "@ant-design/icons";
import axios from "axios";
import {
  AUTHOR_FRIENDREQUEST_API,
  AUTHOR_PROFILE_API,
  FRIEND_REQUEST_API,
} from "../configs/api_url";
import { FE_SEARCH_URL } from "../configs/fe_url";
import { connect } from "react-redux";

class FriendRequestsPage extends React.Component {
  renderRequests() {
    if (!this.props.user || !this.props.user.loggedIn) {
      return (
        <Spin
          spinning
          size="large"
          style={{ marginLeft: "50%", marginTop: "20%" }}
        />
      );
    } else {
      return <FriendRequests user={this.props.user} />;
    }
  }

  render() {
    return (
      <div>
        <Header selectedKey="6" />
        {this.renderRequests()}
      </div>
    );
  }
}

class FriendRequests extends React.Component {
  state = {
    isLoading: true,
    user: this.props.user,
    data: [],
  };

  componentDidMount() {
    this.fetchFriendRequest();
  }

  fetchFriendRequest = async () => {
    try {
      const userId = this.state.user.id.split("/").pop();
      const url = AUTHOR_FRIENDREQUEST_API(userId);
      const res = await axios.get(url);
      const newRequests = [];
      for (let author of res.data.authors) {
        const authorId = author.split("/").pop();
        const res = await axios.get(AUTHOR_PROFILE_API(authorId));
        newRequests.push(res.data);
      }
      this.setState({
        isLoading: false,
        data: newRequests,
      });
    } catch (err) {
      console.log(err);
    }
  };

  responseRequest = async (friend, decision) => {
    try {
      const user = this.state.user;
      const body = {
        query: "friendrequest",
        author: {
          id: friend.id,
          host: friend.host,
          displayName: friend.displayName,
          url: friend.url,
        },
        friend: {
          id: user.id,
          host: user.host,
          displayName: user.displayName,
          url: user.url,
        },
        status: decision,
      };
      const headers = {
        Authorization: "Token " + localStorage.getItem("key"),
      };
      await axios.patch(FRIEND_REQUEST_API, body, { headers: headers });
      message.success(decision === "A" ? "Accepted!" : "Rejected", 1.5);
      this.fetchFriendRequest();
    } catch (err) {
      console.log(err);
    }
  };

  render() {
    if (this.state.isLoading) {
      return (
        <Spin
          spinning
          size="large"
          style={{ marginLeft: "50%", marginTop: "20%" }}
        />
      );
    }

    return (
      <div>
        <List
          dataSource={this.state.data}
          renderItem={(item) => (
            <List.Item
              style={{
                marginLeft: "17%",
                marginRight: "17%",
                marginBottom: "1em",
              }}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    size={50}
                    style={{
                      color: "#3992f7",
                      backgroundColor: "#ccebff",
                      fontSize: "35px",
                    }}
                  >
                    {item.displayName[0].toUpperCase()}
                  </Avatar>
                }
                title={
                  <a
                    style={{
                      color: "#7f553b",
                      fontSize: "18px",
                    }}
                    href={FE_SEARCH_URL(item.id.split("/").pop())}
                  >
                    {item.displayName}
                  </a>
                }
                description={"Email: " + item.email}
              />
              <Button
                type="primary"
                shape="round"
                style={{ marginRight: "1em" }}
                onClick={() => this.responseRequest(item, "A")}
              >
                <UserAddOutlined />
                Accept
              </Button>
              <Button
                type="danger"
                shape="round"
                onClick={() => this.responseRequest(item, "R")}
              >
                <UserDeleteOutlined />
                Reject
              </Button>
            </List.Item>
          )}
        ></List>
      </div>
    );
  }
}

const mapStateToProps = ({ user }) => {
  return { user };
};

export default connect(mapStateToProps, null)(FriendRequestsPage);
