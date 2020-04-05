import React from 'react';
import 'antd/dist/antd.css';
import './index.css';
import { Form, Input, Button, Tooltip, Icon } from 'antd';
import axios from 'axios';
import './components/Settings.css';
import './components/Header.css';
import AuthorHeader from './components/AuthorHeader';
import cookie from 'react-cookies';
import validateCookie from './utils/validate.js';
import { BE_CURRENT_USER_API_URL, BE_AUTHOR_PROFILE_API_URL, BE_AUTHOR_GITHUB_API_URL, FE_USERPROFILE_URL } from "./utils/constants.js";
import { CLIENT_ID, CLIENT_SECRET } from "./utils/githubOAuth";
import getUserId from './utils/getUserId.js';

const githubUrl = "https://github.com/";

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
            accessToken: null,
            isValid: false,
            isRedirect: false,
        }

        this.needToAuth = this.needToAuth.bind(this)
    }

    componentWillMount() {
        validateCookie();
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code) {
            this.githubValidate(code);
            this.setState({
                isRedirect: true,
            })
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
                    github: userInfo.github ? userInfo.github.replace(githubUrl, "") : null,
                    bio: userInfo.bio
                });
                if (!this.state.isRedirect) {
                    if (this.state.github) {
                        this.setState({
                            isValid: true,
                        })
                    }
                }
            }).catch((error) => {
                console.log(error);
            });
    };

    handleSubmit = e => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                var { isValid } = this.state;
                var github = null;
                if (values.github) {
                    github = githubUrl + values.github;
                    if (!isValid) {
                        alert("Please validate your github account!");
                        return -1;
                    }
                }
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

    redirectToAuth() {
        const githubAuthUrl = "https://github.com/login/oauth/authorize"
        var requestUrl = githubAuthUrl + "?client_id=" + CLIENT_ID;
        window.location = requestUrl;
    }

    githubValidate(code) {
        axios.post("/login/oauth/access_token", {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code: code,
        }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                "Accept": 'application/json',
            }
        }, { crossDomain: true })
            .then(res => {
                var accessToken = res.data.access_token;
                this.setGithub(accessToken);
            }).catch(function (error) {
                console.log(error);
            });
    };

    setGithub(accessToken) {
        alert(accessToken);
        axios.get("https://api.github.com/user",
        { headers: { 'Authorization': 'token ' + accessToken } })
        .then(res => {
            this.setState({
                github: res.data.login,
                isValid: true,
            });

            const token = cookie.load('token');
            const headers = { 'Authorization': 'Token '.concat(token) }
            axios.post(BE_AUTHOR_GITHUB_API_URL(this.state.id),
            {
                "GithubToken": accessToken,
            }, { headers: headers })
            .catch((error) => {
                console.log(error);
            });

        }).catch((error) => {
            console.log(error);
        });
    }

    needToAuth() {
        this.setState({
            isValid: false,
        })
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const { userName, email, displayName, github, bio, isValid, isRedirect } = this.state;
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
                        <span>{githubUrl}</span>
                        {getFieldDecorator('github', {
                            initialValue: github,
                        })
                            (isValid && isRedirect ?
                                <Input style={{ width: 620 }} disabled /> :
                                <Input onChange={this.needToAuth} style={{ width: 620 }} />
                            )}
                        {isValid ?
                            <Button type="link">
                                <Icon type="check" />
                                Validated
                            </Button>
                            :
                            <Tooltip title="You need to validate first">
                                <Button type="link" onClick={this.redirectToAuth}>
                                    Validate
                                </Button>
                            </Tooltip>
                        }
                    </Form.Item>

                    <Form.Item label="Bio">
                        {getFieldDecorator('bio', {
                            initialValue: bio,
                        })(<Input.TextArea autoSize={true} />)}
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
