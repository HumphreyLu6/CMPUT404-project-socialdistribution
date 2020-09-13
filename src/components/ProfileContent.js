import React from "react";
import styles from "./Styles/Profile.module.css";
import { Button, message } from "antd";
import {
  EditOutlined,
  CheckOutlined,
  UserAddOutlined,
  TeamOutlined,
  SaveOutlined,
  LoadingOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import axios from "axios";
import {
  IF_TWO_AUTHORS_FRIENDS_API,
  FRIEND_REQUEST_API,
  AUTHOR_PROFILE_API,
} from "../configs/api_url";
import { FE_LOGIN_URL, FE_SEARCH_URL } from "../configs/fe_url";

class ProfileContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.user,
      author: this.props.author,
      pageType: 0,
    };
  }

  fetchFriendsStatus = async () => {
    const userId = this.props.user.id.split("/").pop();
    const authorId = this.props.author.id.split("/").pop();
    try {
      const res = await axios.get(IF_TWO_AUTHORS_FRIENDS_API(userId, authorId));
      let newPageType = this.state.pageType;
      if (res.data.friends) {
        newPageType = 1;
      } else {
        if (res.data.pending) newPageType = 2;
        else newPageType = 3;
      }
      this.setState({
        pageType: newPageType,
      });
    } catch (err) {
      console.log(err);
    }
  };

  componentDidMount() {
    if (!this.state.user.loggedIn) {
      this.setState({
        pageType: 6,
      });
    } else if (this.state.user.id === this.state.author.id) {
      this.setState({
        pageType: 4,
      });
    } else {
      this.fetchFriendsStatus();
    }
  }

  editProfile = () => {
    this.setState({
      pageType: 5,
    });
  };

  saveProfile = async () => {
    try {
      const newBio = document.getElementById("bioInput").value;
      const newDisplayName = document.getElementById("displayNameInput").value;
      if (/\s/.test(newDisplayName) | !newDisplayName) {
        message.error("Invalid Display Name!", 2);
        return;
      }
      const githubUsername = document.getElementById("githubInput").value;
      if (/\s/.test(githubUsername)) {
        message.error("Invalid Github Username!", 2);
        return;
      }
      const newGithub =
        githubUsername === ""
          ? ""
          : "https://github.com/" +
            document.getElementById("githubInput").value;
      const url = AUTHOR_PROFILE_API(this.state.user.id.split("/").pop());
      const body = {
        github: newGithub,
        displayName: newDisplayName,
        bio: newBio,
      };
      const headers = { Authorization: "Token " + localStorage.getItem("key") };
      await axios.patch(url, body, { headers: headers });
      message.success("Saved!", 1.5, () => {
        window.location.href = FE_SEARCH_URL(
          this.state.user.id.split("/").pop()
        );
      });
    } catch (err) {
      console.log(err);
    }
  };

  addFriend = async () => {
    try {
      const { user: author, author: friend } = this.state;
      await axios.post(
        FRIEND_REQUEST_API,
        {
          query: "friendrequest",
          author: {
            id: author.id,
            host: author.host,
            displayName: author.displayName,
            url: author.url,
          },
          friend: {
            id: friend.id,
            host: friend.host,
            displayName: friend.displayName,
            url: friend.url,
          },
        },
        {
          headers: {
            Authorization: "Token " + localStorage.getItem("key"),
          },
        }
      );
      this.fetchFriendsStatus();
    } catch (err) {
      console.log(err);
    }
  };

  renderButton() {
    const buttons = [
      {
        text: "Loading",
        disable: true,
        onClick: null,
        icon: <LoadingOutlined />,
      }, //0
      {
        text: "Friends",
        disable: true,
        onClickEvent: null,
        icon: <TeamOutlined />,
      }, //1
      {
        text: "Friend Request Sent",
        disable: true,
        onClickEvent: null,
        icon: <CheckOutlined />,
      }, //2
      {
        text: "Add Friend",
        disable: false,
        onClickEvent: this.addFriend,
        icon: <UserAddOutlined />,
      }, //3
      {
        text: "Edit",
        disable: false,
        onClickEvent: this.editProfile,
        icon: <EditOutlined />,
      }, //4
      {
        text: "Save",
        disable: false,
        onClickEvent: this.saveProfile,
        icon: <SaveOutlined />,
      }, //5
      {
        text: "Log in",
        disable: false,
        onClickEvent: () => {
          window.location.href = FE_LOGIN_URL;
        },
        icon: <LoginOutlined />,
      }, //6
    ];
    const button = buttons[this.state.pageType];
    return (
      <div className={styles.buttonWrapper}>
        <Button
          shape="round"
          disabled={button.disable}
          style={{
            color: "#3992f7",
            backgroundColor: "#ccebff",
            fontWeight: "bold",
            float: "right",
          }}
          onClick={button.onClickEvent}
        >
          {button.icon}
          {button.text}
        </Button>
      </div>
    );
  }

  render() {
    const { user, author, pageType } = this.state;
    return (
      <div className={styles.profile}>
        <div className={styles.content}>
          <ul className={styles.column1}>
            <li>
              User Name: <span>{author.username}</span>
            </li>
            <li>
              Email: <span>{author.email}</span>
            </li>
            <li>
              {"Bio: "}
              <span>
                {pageType === 5 ? (
                  <input
                    id="bioInput"
                    name="bioInput"
                    defaultValue={author.bio}
                  />
                ) : (
                  author.bio
                )}
              </span>
            </li>
          </ul>
          <ul className={styles.column2}>
            <li>
              {"Display Name: "}
              <span>
                {pageType === 5 ? (
                  <input
                    id="displayNameInput"
                    name="displayNameInput"
                    defaultValue={author.displayName}
                  />
                ) : (
                  author.displayName
                )}
              </span>
            </li>
            <li>
              {"Github: "}
              <span>
                {pageType === 5 ? (
                  <input
                    id="githubInput"
                    name="githubInput"
                    defaultValue={
                      author.github ? author.github.split("/").pop() : null
                    }
                  />
                ) : (
                  author.github
                )}
              </span>
            </li>
          </ul>
        </div>
        {this.renderButton(user, author)}
        <hr />
      </div>
    );
  }
}

export default ProfileContent;
