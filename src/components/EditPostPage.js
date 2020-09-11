import React from "react";
import {
  Form,
  Input,
  Button,
  Tag,
  Radio,
  Select,
  Modal,
  message,
  Spin,
} from "antd";
import { PictureOutlined, EyeOutlined } from "@ant-design/icons";
import Header from "../components/Header";
import axios from "axios";
import { ALL_AUTHOR_API, POST_API, SINGLE_POST_API } from "../configs/api_url";
import { FE_HOME_URL } from "../configs/fe_url";
import ReactMarkdown from "react-markdown";
import styles from "./Styles/EditPost.module.css";

const emptyPost = {
  title: null,
  content: null,
  categories: ["cat", "dog"],
  contentType: "text/markdown",
  visibility: "PUBLIC",
  visibleTo: [],
  unlisted: false,
};

class EditPost extends React.Component {
  state = {
    post: this.props.post ? this.props.post : emptyPost,
    isAddingCat: false,
    newCatToAdd: null,
    allAuthorOptions: [],
    showImageModal: false,
    showPreviewModal: false,
  };

  componentDidMount() {
    this.fetchAllAuthors();
  }

  fetchAllAuthors = async () => {
    try {
      const res = await axios.get(ALL_AUTHOR_API);
      const allAuthorOptions = [];
      let author;
      for (author of res.data) {
        allAuthorOptions.push(
          <Select.Option key={author.id} value={author.id}>
            {author.displayName + " Email: " + author.email}
          </Select.Option>
        );
      }
      this.setState({ allAuthorOptions });
    } catch (err) {
      console.log(err);
    }
  };

  onPost = async () => {
    try {
      const { post } = this.state;
      if (!post.title || !/[^\s]/.test(post.title)) {
        message.error("Title can not be empty!", 1.5);
        return;
      }
      if (!post.content || !/[^\s]/.test(post.content)) {
        message.error("Content can not be empty!", 1.5);
        return;
      }
      const headers = {
        Authorization: "Token " + localStorage.getItem("key"),
      };
      const httpMethod = post.id ? axios.patch : axios.post;
      const url = post.id ? SINGLE_POST_API(post.id) : POST_API;
      await httpMethod(url, post, { headers });
      window.location.href = FE_HOME_URL;
    } catch (err) {
      console.log(err);
    }
  };

  handleContentType = (e) => {
    const post = { ...this.state.post };
    post.contentType = e.target.value;
    this.setState({ post });
  };

  handleAddCat = () => {
    const post = { ...this.state.post };
    const { newCatToAdd: newCat } = this.state;
    if (newCat && post.categories.indexOf(newCat) === -1) {
      post.categories.push(this.state.newCatToAdd);
    }
    this.setState({ post, isAddingCat: false, newCatToAdd: null });
  };

  handleDelCat = (category) => {
    const post = { ...this.state.post };
    const index = post.categories.indexOf(category);
    if (index !== -1) {
      post.categories.splice(index, 1);
      this.setState({ post });
    }
  };

  handleVisibility = (visibility) => {
    const post = { ...this.state.post };
    post.visibility = visibility;
    this.setState({ post });
  };

  handleVisibleAuthors = (value) => {
    const post = { ...this.state.post };
    post.visibleTo = value;
    this.setState({ post });
  };

  handleContentChange = (e) => {
    const post = { ...this.state.post };
    post.content = e.target.value;
    this.setState({ post });
  };

  handleTitleChange = (e) => {
    const post = { ...this.state.post };
    post.title = e.target.value;
    this.setState({ post });
  };

  getBase64(e, image) {
    var file = e.target.files[0];
    if (file === undefined) {
      return;
    } else {
      var imageName = file.name;
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        image.name = imageName;
        image.encoding = reader.result;
      };
      reader.onerror = (err) => {
        console.log(err);
      };
    }
  }

  renderUploadImageModal(show) {
    let image = { name: null, encoding: null };
    const handleConfirm = async () => {
      try {
        if (!image.name || !image.encoding) return;
        const [contentType, content] = image.encoding.split(":")[1].split(",");
        const body = {
          title: image.name,
          contentType,
          content,
          visibility: "PUBLIC",
          unlisted: true,
        };
        const headers = {
          Authorization: "Token " + localStorage.getItem("key"),
        };
        const res = await axios.post(POST_API, body, { headers });
        const post = { ...this.state.post };
        const imageLink = createImageLink(image.name, res.data.id);
        post.content =
          post.content === null ? imageLink : post.content.concat(imageLink);
        this.setState({ post, showImageModal: false });
      } catch (err) {
        console.log(err);
      }
    };

    return (
      <Modal
        visible={show}
        title="Select a image"
        destroyOnClose={true}
        closable={false}
        footer={[
          <Button
            key="back"
            onClick={() => {
              this.setState({ showImageModal: false });
            }}
          >
            Cancel
          </Button>,
          <Button key="submit" onClick={handleConfirm}>
            Confirm
          </Button>,
        ]}
      >
        <input
          type="file"
          className="input-file"
          name="imgUpload"
          accept="image/*"
          onChange={(e) => this.getBase64(e, image)}
        />
      </Modal>
    );
  }

  renderPreviewModal(show) {
    return (
      <Modal
        width="66%"
        visible={show}
        title="Preview"
        destroyOnClose={true}
        closable={true}
        footer={null}
        onCancel={() => this.setState({ showPreviewModal: false })}
      >
        <div
          style={{
            overflow: "auto",
          }}
        >
          <ReactMarkdown source={this.state.post.content} />
        </div>
      </Modal>
    );
  }

  render() {
    const {
      post,
      isAddingCat,
      allAuthorOptions,
      showImageModal,
      showPreviewModal,
    } = this.state;
    // console.log(post);
    return (
      <Form className={styles.form}>
        <Form.Item style={{ textAlign: "center" }}>
          <Radio.Group
            defaultValue={post.contentType}
            onChange={this.handleContentType}
          >
            <Radio.Button value="text/markdown">Markdown</Radio.Button>
            <Radio.Button value="text/plain">Plain Text</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item>
          <Input.TextArea
            rows={1}
            value={post.title}
            onChange={this.handleTitleChange}
            placeholder="title"
            style={{ resize: "none" }}
          />
        </Form.Item>

        <Form.Item>
          {post.categories.map((cat, index) => {
            return (
              <Tag
                key={index}
                closable
                onClose={(e) => {
                  e.preventDefault();
                  this.handleDelCat(cat);
                }}
              >
                {cat}
              </Tag>
            );
          })}
          {isAddingCat ? (
            <Input
              type="text"
              size="small"
              style={{ width: 78, height: 31 }}
              value={this.state.newCatToAdd}
              autoFocus
              onChange={(e) => {
                this.setState({ newCatToAdd: e.target.value });
              }}
              onBlur={this.handleAddCat}
              onPressEnter={this.handleAddCat}
            />
          ) : (
            <Tag
              onClick={() => {
                this.setState({ isAddingCat: true });
              }}
            >
              + category
            </Tag>
          )}
        </Form.Item>

        <Form.Item className={styles.contentWrapper}>
          <Input.TextArea
            rows={13}
            value={post.content}
            onChange={this.handleContentChange}
            placeholder="What do you wanna say?"
            className={styles.contentTextArea}
          ></Input.TextArea>

          {post.contentType === "text/markdown" ? (
            <div className={styles.contentButtonsWrapper}>
              <Button
                className={styles.contentButton}
                onClick={() => {
                  this.setState({ showImageModal: true });
                }}
              >
                <PictureOutlined />
              </Button>
              <Button
                className={styles.contentButton}
                onClick={() => {
                  this.setState({ showPreviewModal: true });
                }}
              >
                <EyeOutlined />
              </Button>
            </div>
          ) : null}
        </Form.Item>

        <Form.Item>
          <Select
            placeholder="Select visibility"
            defaultValue={post.visibility}
            onChange={this.handleVisibility}
          >
            <Select.Option value="PUBLIC">Public</Select.Option>
            <Select.Option value="FOAF">Friends of Friends</Select.Option>
            <Select.Option value="FRIENDS">Friends Only</Select.Option>
            <Select.Option value="PRIVATE">Selected Authors Only</Select.Option>
          </Select>
        </Form.Item>
        {post.visibility !== "PRIVATE" ? null : (
          <Form.Item>
            <Select
              mode="multiple"
              allowClear
              placeholder="Please select authors who can view this post ..."
              defaultValue={post.visibleTo}
              onChange={this.handleVisibleAuthors}
            >
              {allAuthorOptions}
            </Select>
          </Form.Item>
        )}
        <Form.Item style={{ textAlign: "center" }}>
          <Button type="primary" htmlType="submit" onClick={this.onPost}>
            {post.id ? "Update" : "Post"}
          </Button>
        </Form.Item>
        <Form.Item>{this.renderUploadImageModal(showImageModal)}</Form.Item>
        <Form.Item>{this.renderPreviewModal(showPreviewModal)}</Form.Item>
      </Form>
    );
  }
}

class EditPostPage extends React.Component {
  state = { loading: true, post: null };

  fetchPost = async (id) => {
    try {
      const headers = {
        Authorization: "Token " + localStorage.getItem("key"),
      };
      const res = await axios.get(SINGLE_POST_API(id), { headers });
      this.setState({ post: res.data, loading: false });
    } catch (err) {
      console.log(err);
    }
  };

  componentDidMount() {
    const { match } = this.props;
    if (match && match.params && match.params.postId) {
      this.fetchPost(match.params.postId);
    } else {
      this.setState({ loading: false });
    }
  }

  render() {
    return (
      <div>
        <Header selectedKey="2" />
        {this.state.loading ? (
          <Spin
            spinning
            size="large"
            style={{ marginLeft: "50%", marginTop: "50%" }}
          />
        ) : (
          <EditPost post={this.state.post} />
        )}
      </div>
    );
  }
}

const createImageLink = (name, id) => {
  return "!["
    .concat(name)
    .concat("]")
    .concat("(")
    .concat(POST_API)
    .concat("/")
    .concat(id)
    .concat(")");
};

export default EditPostPage;
