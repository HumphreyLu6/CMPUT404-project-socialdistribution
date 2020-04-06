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
import { Form, Input, Button, Tooltip } from 'antd';
import { 
    BE_CURRENT_USER_API_URL, 
    BE_AUTHOR_PROFILE_API_URL, 
    BE_AUTHOR_GITHUB_API_URL, 
    FE_USERPROFILE_URL 
} from "./utils/constants.js";

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
            isRedirect: false,
        }

        this.cleanGithub = this.cleanGithub.bind(this)
    }

    componentWillMount() {
        validateCookie();
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code) {
            this.setState({
                isRedirect: true,
            })
            this.githubValidate(code);
        }
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
                github: userInfo.github, 
                bio: userInfo.bio,
            });
        }).catch((error) => {
            console.log(error);
        });
    };

    redirectToAuth() {
        window.onbeforeunload = null;
        const githubAuthUrl = "https://github.com/login/oauth/authorize"
        var requestUrl = githubAuthUrl + "?client_id=" + CLIENT_ID;
        window.location = requestUrl;
    }

    githubValidate(code) {
        axios.post("https://github.com/login/oauth/access_token", {
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
        axios.get("https://api.github.com/user",
        { headers: { 'Authorization': 'token ' + accessToken } })
        .then(res => {
            const githubUrl = "https://github.com/";
            this.setState({
                github: githubUrl.concat(res.data.login),
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

    cleanGithub() {
        this.setState({
            github: "", 
        });
    }

    handleSubmit = e => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                window.onbeforeunload = null;
                const token = cookie.load('token');
                const headers = { 'Authorization': 'Token '.concat(token) }
                axios.patch(BE_AUTHOR_PROFILE_API_URL(this.state.id),
                {
                    "github": values.github,
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
        const { userName, email, displayName, github, bio } = this.state;
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
                        {getFieldDecorator('github', {
                            initialValue: github,
                        })(<Input disabled/>)}
                        {github ?
                            <div className="github-choice">
                                <Tooltip title='This action will delete all "Github posts" that you have.'>
                                    <Button type="link" onClick={this.cleanGithub}>
                                        Unlink my github account
                                    </Button>
                                </Tooltip>
                                <Tooltip title="To change, make sure you have signed out Github or logged in as a different account.">
                                    <Button type="link" onClick={this.redirectToAuth}>
                                        Change my github account
                                    </Button>
                                </Tooltip>
                            </div>
                            :
                            <div className="github-choice">
                                <Button type="link" onClick={this.redirectToAuth}>
                                    Link to your github
                                </Button>
                            </div>
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
