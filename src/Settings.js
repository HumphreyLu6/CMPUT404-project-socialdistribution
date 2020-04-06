import React from 'react';
import axios from 'axios';
import cookie from 'react-cookies';
import AuthorHeader from './components/AuthorHeader';
import validateCookie from './utils/validate.js';
import getUserId from './utils/getUserId.js';
import { CLIENT_ID, CLIENT_SECRET } from "./utils/githubOAuth";
import './components/Header.css';
import './components/Settings.css';
import './index.css';
import 'antd/dist/antd.css';
import { Form, Input, Button, Tooltip, Icon, message } from 'antd';
import { 
    BE_CURRENT_USER_API_URL, 
    BE_AUTHOR_PROFILE_API_URL, 
    BE_AUTHOR_GITHUB_API_URL, 
    FE_USERPROFILE_URL 
} from "./utils/constants.js";

const GITHUB_URL = "https://github.com/";

class ProfileContent extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            id: null,
            userName: null,
            email: null,
            displayName: null,
            github: null,
            bio: null,
            isValid: false,
        }

        this.validateAgain = this.validateAgain.bind(this)
    }

    componentWillMount() {
        validateCookie();
        window.onbeforeunload = function() {
            return -1;
        }
    }

    componentDidMount() {
        const token = cookie.load('token');
        const headers = { 'Authorization': 'Token '.concat(token) }
        axios.get(BE_CURRENT_USER_API_URL, { headers: headers })
        .then(res => {
            var userInfo = res.data;
            this.setState({
                id: getUserId(userInfo.id),
                userName: userInfo.username,
                email: userInfo.email,
                displayName: userInfo.displayName,
                github: userInfo.github ? userInfo.github.replace(GITHUB_URL, "") : null,
                bio: userInfo.bio,
            });
        }).catch((error) => {
            console.log(error);
        });
    };

    validateGithub = e => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                var githubUsername = values.github;
                if (githubUsername) {
                    var githubEventsUrl = "https://api.github.com/users/" + githubUsername + "/events";
                    axios.get(githubEventsUrl)
                    .then(res => {
                        this.setState({
                            isValid: true,
                        });
                    }).catch((error) => {
                        message.error("Invalid Github username!");
                    });
                } else {
                    message.error("Please enter your Github username!");
                }
            }
        });
    };

    validateAgain() {
        this.setState({
            isValid: false,
        });
    };

    handleSubmit = e => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                var { isValid } = this.state;
                var github = null;
                if (values.github) {
                    github = GITHUB_URL + values.github;
                    if (!isValid) {
                        message.error("Please validate your github account before your save the change!");
                        return -1;
                    }
                }
                window.onbeforeunload = null;
                const token = cookie.load('token');
                const headers = { 'Authorization': 'Token '.concat(token) }
                axios.patch(BE_AUTHOR_PROFILE_API_URL(this.state.id),
                {
                    "github": github,
                    "displayName": values.displayName,
                    "bio": values.bio,
                }, { headers: headers })
                .then(() => {
                    document.location.replace(FE_USERPROFILE_URL);
                }).catch((error) => {
                    console.log(error);
                });
            }
        });
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        const { userName, email, displayName, github, bio, isValid } = this.state;
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
        return (
            <div>
                <AuthorHeader />
                <Form {...layout} className="user-info">
                    <Form.Item label="Username">
                        {userName}
                    </Form.Item>

                    <Form.Item label="Email">
                        {email}
                    </Form.Item>

                    <Form.Item label="Display Name">
                        {getFieldDecorator('displayName', {
                            initialValue: displayName,
                        })(<Input/>)}
                    </Form.Item>

                    <Form.Item label="GitHub">
                        <span>{GITHUB_URL}</span>
                        {getFieldDecorator('github', {
                            initialValue: github,
                        })(<Input onChange={this.validateAgain} style={{ width: 620 }} />)}
                        {isValid ?
                            <Button type="link">
                                <Icon type="check" />
                                Validated
                            </Button>
                            :
                            <Tooltip title="You need to validate first">
                                <Button type="link" onClick={this.validateGithub}>
                                    Validate
                                </Button>
                            </Tooltip>
                        }
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
