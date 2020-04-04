import React from 'react';
import 'antd/dist/antd.css';
import './index.css';
import { Form, Input, Button, Modal, Radio, Tag} from 'antd';
import { reactLocalStorage } from 'reactjs-localstorage';
import axios from 'axios';
import './components/PostInput.css';
import cookie from 'react-cookies';
import AuthorHeader from './components/AuthorHeader'
import validateCookie from './utils/validate.js';
import UploadImageModal from './components/UploadImageModal';
import { TweenOneGroup } from 'rc-tween-one';
import { PlusOutlined } from '@ant-design/icons';
import { BE_POST_API_URL, BE_SINGLE_POST_API_URL, HOST, FE_USERPROFILE_URL} from "./utils/constants.js";
const { TextArea } = Input;
var id = '';
var imageFileName = '';
var imageEncoding = '';

function createimage(imagePostId) {
  return "![".concat(imageFileName).concat("]").concat("(").concat(HOST).concat("posts/").concat(imagePostId).concat(")");
}

class PostEdit extends React.Component {

  state = {
    postTitle: '',
    postContent: '',
    postType: '',
    postVisibility: '',
    authorid: '',

    tags: [],
    inputVisible: false,
    inputValue: '',

    specificPost: [],
    previewVisible: false,
    previewImage: '',
    isloading: true,
    fileList: [],

    modalVisibility:false,
    fullPostContent:'',
  };

  handleMarkdown = () => {
    this.setState({ markdownSelected: !this.state.markdownSelected });
  }

  handleValueChange = (event) =>{
    this.setState({ fullPostContent: event.target.value });
  }

  dummyRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  handleClose = removedTag => {
    const tags = this.state.tags.filter(tag => tag !== removedTag);
    this.setState({ tags });
  };

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus());
  };

  handleInputChange = e => {
    this.setState({ inputValue: e.target.value });
  };

  handleInputConfirm = () => {
    const { inputValue } = this.state;
    let { tags } = this.state;
    if (inputValue && tags.indexOf(inputValue) === -1) {
      tags = [...tags, inputValue];
    }
    this.setState({
      tags,
      inputVisible: false,
      inputValue: '',
    });
  };

  saveInputRef = input => (this.input = input);

  forMap = tag => {
    const tagElem = (
      <Tag
        closable
        onClose={e => {
          e.preventDefault();
          this.handleClose(tag);
        }}
      >
        {tag}
      </Tag>
    );
    return (
      <span key={tag} style={{ display: 'inline-block' }}>
        {tagElem}
      </span>
    );
  };

  componentDidMount() {
    validateCookie();
    id = reactLocalStorage.get("postid");
    axios.get(BE_SINGLE_POST_API_URL(HOST, id), { headers: { 'Authorization': 'Token ' + cookie.load('token') } })
      .then(res => {
        const getPost = res.data;
        this.setState({
          specificPost: getPost,
          postTitle: getPost.title,
          fullPostContent: getPost.content,
          postType: getPost.contentType,
          postVisibility: getPost.visibility,
          tags: getPost.categories,
          isloading: false
        });
      }).catch(function (error) {
        console.log(error);
      });

    reactLocalStorage.clear();
  }

  showModal = () => {
    this.setState({
      modalVisibility: true,
    });
  };

  handleCancel = e => {
    this.setState({
      modalVisibility: false,
    });
  };

  handleUpload = e => {
    imageFileName = reactLocalStorage.get("imageName");
    imageEncoding = reactLocalStorage.get("imageEncoding");
    if(imageFileName){
      this.setState({
        modalVisibility: false,
      });
      var imageType = imageEncoding.split(":")[1].split(",")[0];
      var parsedimageEncoding = imageEncoding.split(":")[1].split(",")[1];
      axios.post(BE_POST_API_URL(HOST),
            {
              title: imageFileName,
              description: "",
              content: parsedimageEncoding,
              contentType: imageType,
              visibility: "PUBLIC",
              visibleTo: "",
              unlisted: true,
            }, { headers: { 'Authorization': 'Token ' + cookie.load('token') } }
          )
            .then((response) => {
              reactLocalStorage.clear();
              this.setState((prevState) => ({
                fullPostContent: prevState.fullPostContent + createimage(String(response.data.id)),
              }));

            })
            .catch(function (error) {
              console.log(error);
            });  
    }
    else{
      alert("Please choose a file");
    }
  };

  handleSubmit = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        axios.patch(BE_SINGLE_POST_API_URL(HOST, id),
          {
            title: values.postTitle,
            description: "",
            content: this.state.fullPostContent,
            contentType: values.Type,
            visibility: values.Visibility,
            categories: this.state.tags,
            visibleTo: "",
            unlisted: false,
          }, { headers: { 'Authorization': 'Token ' + cookie.load('token') } }
        )
          .then(function (response) {
            document.location.replace(FE_USERPROFILE_URL);
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    });
  };

  render() {

    const { getFieldDecorator } = this.props.form;
    const { tags, inputVisible, inputValue } = this.state;
    const tagChild = tags.map(this.forMap);

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

    const { modalVisibility, postTitle, postType, postVisibility, isloading, fullPostContent} = this.state;

    return (!isloading ?
      <div>
         <Modal
          visible={modalVisibility}
          title="Choose your image"
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          destroyOnClose={true}
          width={400}
          height={400}
          footer={[
            <Button key="back" onClick={this.handleCancel}>
              Cancel
            </Button>,
            <Button key="submit" onClick={this.handleUpload}>
              Upload
            </Button>,
          ]}
          >
            <UploadImageModal/>
          </Modal>
        <AuthorHeader />

        <div className={'postInput'} style={{justifyContent: 'center' }} >
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
              <TextArea rows={13} value={fullPostContent} onChange={this.handleValueChange} placeholder="Enter your post body here" />
            </Form.Item>

            <Form.Item>
                <TweenOneGroup
                    enter={{
                    scale: 0.8,
                    opacity: 0,
                    type: 'from',
                    duration: 100,
                    onComplete: e => {
                      e.target.style = '';
                    },
                   }}
                    leave={{ opacity: 0, width: 0, scale: 0, duration: 200 }}
                    appear={false}
                >
                {tagChild}
              </TweenOneGroup>
            {inputVisible && (
              <Input
                ref={this.saveInputRef}
                type="text"
                size="small"
                style={{ width: 78 }}
                value={inputValue}
                onChange={this.handleInputChange}
                onBlur={this.handleInputConfirm}
                onPressEnter={this.handleInputConfirm}
              />
            )}
            {!inputVisible && (
              <Tag onClick={this.showInput} className="site-tag-plus">
                <PlusOutlined /> post category
              </Tag>
            )}

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
                <Radio.Button value="text/markdown">Markdown</Radio.Button>
                <Radio.Button value="text/plain">Plain Text</Radio.Button>
              </Radio.Group>
              )}
            </Form.Item>

            <Form.Item>
            <Button type="primary" onClick={this.showModal}>
                Add image
            </Button>
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
