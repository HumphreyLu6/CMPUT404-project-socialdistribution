import React from "react";
import Header from "./Header";
import { List, Button, Avatar, Spin, message, Modal } from "antd";
import { UserDeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import {
  FRIENDS_API,
  AUTHOR_PROFILE_API,
  FRIEND_REQUEST_API,
} from "../configs/api_url";
import { FE_SEARCH_URL } from "../configs/fe_url";
import { connect } from "react-redux";

class FriendsPage extends React.Component {
  renderFriends() {
    if (!this.props.user || !this.props.user.loggedIn) {
      return (
        <Spin
          spinning
          size="large"
          style={{ marginLeft: "50%", marginTop: "20%" }}
        />
      );
    } else {
      return <Friends user={this.props.user} />;
    }
  }

  render() {
    return (
      <div>
        <Header selectedKey="5" />
        {this.renderFriends()}
      </div>
    );
  }
}

class Friends extends React.Component {
  state = {
    isLoading: true,
    user: this.props.user,
    data: [],
  };

  componentDidMount() {
    this.fetchFriends();
  }

  fetchFriends = async () => {
    try {
      const userId = this.state.user.id.split("/").pop();
      const url = FRIENDS_API(userId);
      const res = await axios.get(url);
      const newFriends = [];
      for (let author of res.data.authors) {
        const authorId = author.split("/").pop();
        const res = await axios.get(AUTHOR_PROFILE_API(authorId));
        newFriends.push(res.data);
      }
      this.setState({
        isLoading: false,
        data: newFriends,
      });
    } catch (err) {
      console.log(err);
    }
  };

  confirmDelete = (friend) => {
    Modal.confirm({
      title: `Are you sure you want to delete ${friend.displayName}?`,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        unfriend(friend);
      },
    });

    const unfriend = async (friend) => {
      try {
        const user = this.state.user;
        const body = {
          query: "friendrequest",
          author: {
            id: user.id,
            host: user.host,
            displayName: user.displayName,
            url: user.url,
          },
          friend: {
            id: friend.id,
            host: friend.host,
            displayName: friend.displayName,
            url: friend.url,
          },
          status: "R",
        };
        const headers = {
          Authorization: "Token " + localStorage.getItem("key"),
        };
        await axios.patch(FRIEND_REQUEST_API, body, { headers: headers });
        message.success("Deleted", 1.5);
        this.fetchFriends();
      } catch (err) {
        console.log(err);
      }
    };
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
                type="danger"
                shape="round"
                onClick={() => this.confirmDelete(item)}
              >
                <UserDeleteOutlined />
                Unfriend
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

export default connect(mapStateToProps, null)(FriendsPage);
