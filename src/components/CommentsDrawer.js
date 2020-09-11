import React from "react";
import { connect } from "react-redux";
import { Drawer, List, Avatar, Comment, Input, Button } from "antd";
import { FE_LOGIN_URL, FE_SEARCH_URL } from "../configs/fe_url";
import { COMMENT_API, SINGLE_POST_API } from "../configs/api_url";
import convertTime from "../utils/isoFormat";
import uuidv4 from "../utils/getUUID.js";
import axios from "axios";

class CommentsDrawer extends React.Component {
  state = {
    user: this.props.user,
    post: this.props.post,
    callback: this.props.callback,
    comment: null,
  };

  handleCommentChange = (e) => {
    this.setState({ comment: e.target.value });
  };

  postComment = async () => {
    try {
      const { comment, user, post } = this.state;
      const body = {
        query: "addComment",
        post: post.origin,
        comment: {
          author: {
            id: user.id,
            host: user.host,
            displayName: user.displayName,
            url: user.url,
            github: user.github,
          },
          comment,
          contentType: "text/plain",
          published: convertTime(new Date()),
          id: String(uuidv4()),
        },
      };
      const headers = {
        Authorization: "Token " + localStorage.getItem("key"),
      };
      const postId = post.id.split("/").pop();
      await axios.post(COMMENT_API(postId), body, { headers });
      const res = await axios.get(SINGLE_POST_API(postId, { headers }));
      this.setState({ post: res.data });
    } catch (err) {
      console.log(err);
    }
  };

  render() {
    const { callback, user, post, comment } = this.state;
    // console.log(post);
    return (
      <Drawer
        visible={true}
        onClose={callback}
        title={post.comments.length + " comment(s)"}
        width={512}
      >
        <List
          dataSource={post.comments}
          locale={{ emptyText: "No comment yet" }}
          renderItem={(item) => (
            <Comment
              avatar={
                <Avatar
                  size="large"
                  style={{
                    color: "#3992f7",
                    backgroundColor: "#ccebff",
                    fontSize: "35px",
                  }}
                >
                  {item.author.displayName[0].toUpperCase()}
                </Avatar>
              }
              author={
                <a
                  href={FE_SEARCH_URL(item.author.id.split("/").pop())}
                  style={{
                    color: "#7f553b",
                    fontSize: "18px",
                  }}
                >
                  {item.author.displayName}
                </a>
              }
              content={item.comment}
              datetime={
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: "300",
                    color: "dark",
                  }}
                >
                  {formatTime(item.published)}
                </span>
              }
            />
          )}
        />

        <div style={{ textAlign: "center" }}>
          {!user.loggedIn ? (
            <Button
              type="link"
              onClick={() => {
                window.location.href = FE_LOGIN_URL;
              }}
              style={{ marginTop: "1em" }}
            >
              Log in to comment
            </Button>
          ) : (
            <div>
              <Input.TextArea
                rows={5}
                value={comment}
                onChange={this.handleCommentChange}
                placeholder="Type your comment here"
                style={{ resize: "none" }}
              />
              <Button
                type="primary"
                onClick={this.postComment}
                style={{ marginTop: "1em" }}
              >
                Comment
              </Button>
            </div>
          )}
        </div>
      </Drawer>
    );
  }
}

const formatTime = (timeStr) => {
  timeStr = timeStr.split(/-|\./);
  timeStr.splice(3, 1);
  return timeStr.join("-");
};

const mapStateToProps = ({ user }) => {
  return { user };
};

export default connect(mapStateToProps, null)(CommentsDrawer);
