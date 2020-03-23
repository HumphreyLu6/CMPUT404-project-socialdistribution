import React from 'react';
import 'antd/dist/antd.css';
import './index.css';
import { Form, Input, Button, Upload, Modal, Icon, Radio, message} from 'antd';
import axios from 'axios';
import './components/PostInput.css';
import './components/Header.css';
import cookie from 'react-cookies';
import validateCookie from './utils/validate.js';
import AuthorHeader from './components/AuthorHeader';
import {reactLocalStorage} from 'reactjs-localstorage';
import {POST_API, CURRENT_USER_API, HOST} from "./utils/constants.js";

const { TextArea } = Input;
var urljoin;
urljoin = require('url-join');
var profileUrl='';

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

class PostInput extends React.Component {

    state = {
        authorid:'',
        profileUrl:'',

        previewVisible: false,
        previewImage: '',
       
        fileList:[],
        encoding:'',
    };

    componentDidMount () {
      if(validateCookie()){
        this.setState({isloading : false});
        
      }
      else{
        axios.get(CURRENT_USER_API, { headers: { 'Authorization': 'Token ' + cookie.load('token') } })
        .then(function (response) {
            reactLocalStorage.set("urlauthorid", response.data.username);
            urljoin = require('url-join');
            profileUrl = urljoin("/author", response.data.username, "/posts");
        })
        .catch(function (error) {
          console.log(error);
        });
      }
      
    }

    handleMarkdown = () => {
      this.setState({markdownSelected: !this.state.markdownSelected});
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
        this.setState({ fileList});
        
    }


    handleSubmit = e => {
      this.props.form.validateFieldsAndScroll((err, values) => {
        if (!err) {              
          axios.post(POST_API(HOST),
            {
                title: values.postTitle,
	              description: "",            
	              content: values.postContent,  
          	    contentType: values.Type,                      
	              visibility: values.Visibility,           
	              visibleTo: "",                
	              unlisted: false, 
            },{ headers: { 'Authorization': 'Token ' + cookie.load('token') } }
            )
            .then(function (response) {
              document.location.replace("/author/profile");
            })
            .catch(function (error) {
              console.log(error);
            });
            // check if filelist is empty
            /*var i;
            for (i = 0; i < this.state.fileList.length; i++) {
              encoding[i] = this.state.fileList[i].thumbUrl;
            }
            console.log(encoding);*/
        }
      });
    };  

    render(){
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

        const { previewVisible, previewImage, fileList } = this.state;

        const uploadButton = (
        <div>
            <Icon type="plus" />
            <div className="ant-upload-text" style={{left: "5%"}}>Upload</div>
        </div>
        );
        
        return( 
            <div>
              <AuthorHeader/>
              <div className={'postInput'} style={{display: 'flex',  justifyContent:'center'}} >
                <Form {...formItemLayout}>
                    
                <Form.Item>
                    {getFieldDecorator("postTitle", {
                        rules: [
                        {
                            required: true,
                            message: "Enter your title here",
                            whitespace: true
                        }
                        ]
                    })(<Input placeholder="Enter your title here"/>)}
                    </Form.Item>
                    
                    <Form.Item>
                    {getFieldDecorator("postContent", {
                        rules: [
                        {
                            required: true,
                            message: "Enter your post body here",
                            whitespace: true
                        }
                        ]
                    })(<TextArea rows={13} placeholder="Enter your post body here"/>)}
                    </Form.Item>
            
                    <Form.Item>
                    {getFieldDecorator("Visibility", {
                        rules: [
                        {
                            required: true,
                        },
                        ]
                    })( <Radio.Group>
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
                        ]
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
            </div>

        )

    }
}

const WrappedPostInput = Form.create({ name: 'PostInput' })(PostInput)


export default WrappedPostInput