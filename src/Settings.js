import React from 'react';
import 'antd/dist/antd.css';
import './index.css';
import { Form, Input, Button } from 'antd';
import axios from 'axios';
import './components/Settings.css';
import './components/Header.css';
import AuthorHeader from './components/AuthorHeader';
import cookie from 'react-cookies';
import validateCookie from './utils/utils.js';
import {CURRENT_USER_API,AUTHOR_API} from "./utils/constants.js";

const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: {
      span: 16,
    },
  };
const tailLayout = {
    wrapperCol: {
      offset: 8,
      span: 16,
    },
};

class ProfileContent extends React.Component {
    constructor(props) {
        super(props)
    
        this.state = {
            userName: null,
            email: null,
            displayName: null,
            github: null,
            bio: null,
        }
    }

    componentWillMount() {
        validateCookie();
    }

    componentDidMount() {
        validateCookie();
        axios.get(CURRENT_USER_API, 
        { headers: { 'Authorization': 'Token ' + cookie.load('token') } })
        .then(res => {
            var userInfo = res.data;
            this.setState({
                userName: userInfo.username,
                email: userInfo.email,
                displayName: userInfo.displayName,
                github: userInfo.github,
                bio: userInfo.bio
            });
        }).catch((error) => {
            console.log(error);
        });
    };
    
    handleSubmit = e => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                var { userName } = this.state;
                axios.patch(AUTHOR_API + userName + '/',
                {
                    "github": values.github,
                    "displayName": values.displayName,
                    "bio": values.bio,
                },{ headers: { 'Authorization': 'Token ' + cookie.load('token') } })
                .then(() =>{
                    document.location.replace("/author/".concat(userName).concat("/posts"));
                }).catch ((error) => {
                    console.log(error);
                });
            }
        });
    };  

    render(){
        const { getFieldDecorator } = this.props.form;
        const { userName, email, displayName, github, bio } = this.state;
        return(
            <div>
                <AuthorHeader/>
                <Form {...layout} className = "user-info">
                    <Form.Item label="User Name">
                        {userName}
                    </Form.Item>
                    <Form.Item label="Email">
                        {email}
                    </Form.Item>
                    <Form.Item label="Display Name">
                        {getFieldDecorator('displayName', {
                            initialValue: displayName,
                        })(<Input />)}
                    </Form.Item>
                    
                    <Form.Item label="GitHub">
                        {getFieldDecorator('github', {
                            initialValue: github,
                        })(<Input />)}
                        {/* <Button type="primary" htmlType="button" onClick={this.handleSubmit}>
                            Save
                        </Button> */}
                    </Form.Item>

                    <Form.Item label="Bio">
                        {getFieldDecorator('bio', {
                            initialValue: bio,
                        })(<Input.TextArea autoSize={true}/>)}
                    </Form.Item>
            
                    <Form.Item {...tailLayout}>
                        <Button type="primary" htmlType="button" onClick={this.handleSubmit}>
                            Save
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        )
    }
}

const WrappedProfileContent = Form.create({ name: 'ProfileContent' })(ProfileContent)


export default WrappedProfileContent
