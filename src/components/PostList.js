import React, { Component } from "react";
import ReactMarkDown from "react-markdown";
import { List, Avatar, Button, Tag, message } from "antd";
import {
  MessageOutlined,
  LikeOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";

import { fetchVisiblePosts } from "../utils/fetchPosts";
import "antd/dist/antd.css";
import styles from "./Styles/PostList.module.css";
import { SINGLE_POST_API } from "../configs/api_url";
import { FE_POST_URL, FE_SEARCH_URL } from "../configs/fe_url";
import CommentsDrawer from "./CommentsDrawer";
import axios from "axios";

class PostList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
      dataUrl: this.props.source,
      showComments: false,
      selectedPost: null,
      showEdit: this.props.showEdit,
    };
  }

  onLoadMore = () => {
    this.setState({
      loading: true,
    });

    fetchVisiblePosts(this.state.dataUrl, (res) => {
      this.setState(
        {
          loading: false,
          data: this.state.data.concat(res.data.posts),
          dataUrl: res.data.next,
        }
        // () => {
        //   // Resetting window's offsetTop so:to display react-virtualized demo underfloor.
        //   // In real scene, you can using public method of react-virtualized:
        //   // https://stackoverflow.com/questions/46700726/how-to-use-public-method-updateposition-of-react-virtualized
        //   window.dispatchEvent(new Event("resize"));
        // }
      );
    });
  };

  componentDidMount() {
    fetchVisiblePosts(this.state.dataUrl, (res) => {
      this.setState({
        loading: false,
        data: res.data.posts,
        dataUrl: res.data.next,
      });
    });
  }

  handleComments(post) {
    this.setState({
      selectedPost: post,
      showComments: true,
    });
  }

  handleEditPost = (post) => {
    window.location.href = FE_POST_URL + "/" + post.id;
  };

  handleDeletePost = async (post) => {
    try {
      const headers = {
        Authorization: "Token " + localStorage.getItem("key"),
      };
      const postId = post.id.split("/").pop();
      const res = await axios.delete(SINGLE_POST_API(postId), { headers });
      if (res.status === 204) {
        const data = [...this.state.data];
        const idx = data.indexOf(post);
        if (idx !== -1) {
          data.splice(idx, 1);
          this.setState({ data });
          message.success("deleted!", 1);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  render() {
    const {
      loading,
      data,
      dataUrl,
      showComments,
      selectedPost,
      showEdit,
    } = this.state;

    const loadMoreButton = loading ? null : dataUrl ? (
      <div className={styles.loadmore}>
        <Button type="link" htmlType="button" onClick={this.onLoadMore}>
          Load more
        </Button>
      </div>
    ) : (
      <div className={styles.loadmore}>
        <Button type="text" htmlType="button">
          No more posts
        </Button>
      </div>
    );

    return (
      <div>
        <List
          className={styles.postList}
          itemLayout="vertical"
          size="large"
          loadMore={loadMoreButton}
          dataSource={data}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              actions={
                !showEdit
                  ? [
                      <span>
                        <LikeOutlined style={{ color: "#08c" }} />
                        {" " + Math.floor((item.comments.length * 3) / 2)}
                      </span>,
                      <span
                        onClick={() => {
                          this.handleComments(item);
                        }}
                      >
                        <MessageOutlined style={{ color: "#08c" }} />
                        {" " + item.comments.length + " comment(s)"}
                      </span>,
                    ]
                  : [
                      <span>
                        <LikeOutlined style={{ color: "#08c" }} />
                        {" " + Math.floor((item.comments.length * 3) / 2)}
                      </span>,
                      <span
                        onClick={() => {
                          this.handleComments(item);
                        }}
                      >
                        <MessageOutlined style={{ color: "#08c" }} />

                        {" " + item.comments.length + " comment(s)"}
                      </span>,
                      <span
                        onClick={() => {
                          this.handleEditPost(item);
                        }}
                      >
                        <EditOutlined style={{ color: "#08c" }} />
                      </span>,
                      <span
                        onClick={() => {
                          this.handleDeletePost(item);
                        }}
                      >
                        <DeleteOutlined style={{ color: "#08c" }} />
                      </span>,
                    ]
              }
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    className={styles.avatar}
                    size={50}
                    style={{ fontSize: "35px" }}
                  >
                    {item.author.displayName[0].toUpperCase()}
                  </Avatar>
                }
                title={
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
                description={
                  <div
                    style={{
                      marginTop: "-15px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "15px",
                        fontWeight: "300",
                        color: "dark",
                      }}
                    >
                      {formatTime(item.published)}
                    </span>
                    <br />
                    {item.categories.map((cat, idx) => (
                      <Tag key={idx} color={randomColor()}>
                        {cat}
                      </Tag>
                    ))}
                  </div>
                }
              />
              <div style={{ overflow: "auto" }}>
                <h2>{item.title}</h2>
                {item.contentType === "text/plain" ? (
                  item.content
                ) : (
                  <ReactMarkDown source={item.content} />
                )}
              </div>
            </List.Item>
          )}
        />
        {showComments ? (
          <CommentsDrawer
            post={selectedPost}
            callback={() => {
              this.setState({ showComments: false });
            }}
          />
        ) : null}
      </div>
    );
  }
}

// helper funtions and components
const randomColor = () => {
  const colors = ["#f78686", "#f2da3a", "#a2eba3", "#86f7ef", "#d186f7"];
  return colors[Math.floor(Math.random() * colors.length)];
};

const formatTime = (timeStr) => {
  timeStr = timeStr.split(/-|\./);
  timeStr.splice(3, 1);
  return timeStr.join("-");
};

export default PostList;
