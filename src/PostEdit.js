import React from 'react';
import 'antd/dist/antd.css';
import './index.css';
import { Form, Input, Button, Upload, Modal, Icon, Radio, message } from 'antd';
import { reactLocalStorage } from 'reactjs-localstorage';
import axios from 'axios';
import './components/PostInput.css';
import cookie from 'react-cookies';
import AuthorHeader from './components/AuthorHeader'
import validateCookie from './utils/validate.js';
import { BE_SINGLE_POST_API_URL, HOST } from "./utils/constants.js";
const { TextArea } = Input;
var id = '';
var urljoin;
urljoin = require('url-join');
var profileUrl = '';
var authorid = '';

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

function beforeUpload(file) {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!');
  }
  return isJpgOrPng;
}


class PostEdit extends React.Component {

  state = {
    postTitle: '',
    postContent: '',
    postType: '',
    postVisibility: '',
    authorid: '',

    specificPost: [],
    previewVisible: false,
    previewImage: '',
    isloading: true,
    fileList: [
      {
        uid: '-1',
        url: 'https://wallpaperaccess.com/full/628286.jpg',
      },
      {
        uid: '-2',
        url: 'https://i.pinimg.com/originals/1f/53/25/1f53250c9035c9d657971712f6b38a99.jpg',
      },
      {
        uid: '-3',
        url: 'https://wallpaperaccess.com/full/628286.jpg',
      },
      {
        uid: '-4',
        url: 'https://wallpaperaccess.com/full/628286.jpg',
      },
    ],
  };

  handleMarkdown = () => {
    this.setState({ markdownSelected: !this.state.markdownSelected });
  }

  handleCancel = () => {
    this.setState({ previewVisible: false });
  }

  handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);

    }
    this.setState({
      previewImage: file.url || file.preview,
      previewVisible: true,
    });
  };

  handleChange = ({ fileList }) => {
    this.setState({ fileList });
  }

  componentDidMount() {
    validateCookie();
    id = reactLocalStorage.get("postid");
    console.log(id);
    axios.get(BE_SINGLE_POST_API_URL(HOST, id), { headers: { 'Authorization': 'Token ' + cookie.load('token') } })
      .then(res => {
        const getPost = res.data;
        this.setState({
          specificPost: getPost,
          postTitle: getPost.title,
          postContent: getPost.content,
          postType: getPost.contentType,
          postVisibility: getPost.visibility,
          isloading: false
        });
        authorid = String(getPost.author);
      }).catch(function (error) {
        console.log(error);
      });

    reactLocalStorage.clear();
  }

  handleSubmit = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        axios.patch(BE_SINGLE_POST_API_URL(HOST, id),
          {
            title: values.postTitle,
            description: "",
            content: values.postContent,
            contentType: values.Type,
            isImage: false,
            visibility: values.Visibility,
            visibleTo: "",
            unlisted: false,
          }, { headers: { 'Authorization': 'Token ' + cookie.load('token') } }
        )
          .then(function (response) {
            //reactLocalStorage.set("urlauthorid", authorid);
            //profileUrl = urljoin("/author", authorid, "/posts");
            document.location.replace("/author/profile/");
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    });
  };

  render() {

    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 }
      },
      wrapperCol: {
        xs: { span: 30 },
        sm: { span: 50 }
      }
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0
        },
        sm: {
          span: 16,
          offset: 8
        }
      }
    };


    const { previewVisible, previewImage, fileList, postTitle, postContent, postType, postVisibility, isloading } = this.state;

    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text" style={{ left: "5%" }}>Upload</div>
      </div>
    );


    return (!isloading ?
      <div>
        <AuthorHeader />

        <div className={'postInput'} style={{ display: 'flex', justifyContent: 'center' }} >
          <Form {...formItemLayout}>

            <Form.Item>
              {getFieldDecorator("postTitle", {
                rules: [
                  {
                    required: true,
                    message: "Enter your title here",
                    whitespace: true
                  }
                ],
                initialValue: `${postTitle}`
              })(<Input />)}
            </Form.Item>

            <Form.Item>
              {getFieldDecorator("postContent", {
                rules: [
                  {
                    required: true,
                    message: "Enter your post body here",
                    whitespace: true
                  }
                ],
                initialValue: `${postContent}`
              })(<TextArea rows={13} />)}
            </Form.Item>

            <Form.Item>
              {getFieldDecorator("Visibility", {
                rules: [
                  {
                    required: true,
                  },
                ],
                initialValue: `${postVisibility}`
              })(<Radio.Group>
                <Radio.Button value="PUBLIC">Public</Radio.Button>
                <Radio.Button value="FRIENDS">Friends</Radio.Button>
                <Radio.Button value="FOAF">Friends to friends</Radio.Button>
                <Radio.Button value="PRIVATE">Private</Radio.Button>
              </Radio.Group>)}
            </Form.Item>

            <Form.Item>
              {getFieldDecorator("Type", {
                rules: [
                  {
                    required: true,
                  },
                ],
                initialValue: `${postType}`
              })(<Radio.Group>
                <Radio.Button value="text/plain">Plain Text</Radio.Button>
                <Radio.Button value="text/markdown">Markdown</Radio.Button>
              </Radio.Group>
              )}
            </Form.Item>

            <Form.Item>
              {getFieldDecorator("imageUpload", {
                rules: [
                  {
                    required: false,
                  },
                ]
              })(<div><Upload
                action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                listType="picture-card"
                fileList={fileList}
                beforeUpload={beforeUpload}
                onPreview={this.handlePreview}
                onChange={this.handleChange}
              >
                {fileList.length >= 4 ? null : uploadButton}
              </Upload>
                <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                  <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal></div>
              )}
            </Form.Item>

            <Form.Item {...tailFormItemLayout}>
              <Button type="primary" htmlType="button" onClick={this.handleSubmit}>
                Post it
                  </Button>
            </Form.Item>
          </Form>
        </div>
      </div> : null
    )

  }
}

const WrappedPostEdit = Form.create({ name: 'PostEdit' })(PostEdit)


export default WrappedPostEdit
