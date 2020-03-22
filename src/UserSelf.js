import React from 'react';
import 'antd/dist/antd.css';
import { List, Icon, Modal, Avatar } from 'antd';
import SimpleReactLightbox from "simple-react-lightbox";
import { SRLWrapper } from "simple-react-lightbox"; 
import axios from 'axios';
import AuthorHeader from './components/AuthorHeader'
import AuthorProfile from './components/AuthorProfile'
import {reactLocalStorage} from 'reactjs-localstorage';
import './UserSelf.css';
import ReactMarkdown from 'react-markdown';
import cookie from 'react-cookies';
import validateCookie from './utils/validate.js';
import convertTime from './utils/isoFormat.js';
import {POST_API,AUTHOR_API,CURRENT_USER_API} from "./utils/constants.js";

const { confirm } = Modal;
var urlpostid = '';
var urljoin;
var commentUrl='';

class UserSelf extends React.Component {
    state = {
        postData: [],
        username : "",
        currentUser: "",
        email: "",
        displayName: "",
        github: "",
        bio: "",
        isloading : true,
        isSelf: true,
    };

    showDeleteConfirm = (postId, author) => {
        confirm({
        title: 'Are you sure you want to delete this post?',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk() {
            axios.delete(POST_API + String(postId) + '/', { headers: { 'Authorization': 'Token ' + cookie.load('token') } })
            .then(function () {
            document.location.replace("/author/".concat(author).concat("/posts"));
            })
        },
        onCancel() {
            console.log('Cancel');
        },
        });
    }
  
    componentDidMount() {
        validateCookie();
        const token = cookie.load('token');
        const headers = {'Authorization': 'Token '.concat(token)}
        const pathArray = window.location.pathname.split('/');
        let username = pathArray[2];
        axios.get(CURRENT_USER_API, {headers : headers}).then(res => {
            this.setState({
                currentUser: res.data.username,
            });
            var currentUser = this.state.currentUser;
            if (username) {
                if (username !== currentUser) {
                    this.setState({
                        isSelf: false,
                    });
                }
            } else {
                username = currentUser;
            }
            this.getProfile(headers, username);
            this.fetchPost(headers, username);
        }).catch((error) => {
            console.log(error);
        });
    };

    getProfile(headers, username) {
        axios.get(AUTHOR_API.concat(username).concat("/"), 
        {headers: headers}).then(res => {
            var userInfo = res.data;
            this.setState({
                username: username,
                email: userInfo.email,
                displayName: userInfo.displayName,
                github: userInfo.github,
                bio: userInfo.bio
            });
            if (this.state.github) {
                var githubUsername = this.state.github.replace("https://github.com/", "");
                this.pullGithubActivity(githubUsername, username);
            }
        }).catch((error) => {
              console.log(error);
        });
    }

    pullGithubActivity(githubUsername, username) {
        var githubData = [];
        const githubEventUrl = "https://api.github.com/users/" + githubUsername + "/events"
        var config = {
            method: 'get',
            url: githubEventUrl,
        };
        if (this.state.isSelf) {
            const accessToken = "access token"; // load from database
            const headers = {
                'Authorization': 'Token ' + accessToken,
            };
            config = {
                method: 'get',
                url: githubEventUrl,
                headers: headers,
            };
        } 
        axios(config).then(res => {
            console.log(res.data);
            res.data.forEach((item) => {    
                var data = {
                    author: username,
                    title: item.type,
                    content: "https://github.com/" + item.repo.name,
                    visibility: item.public ? "PUBLIC" : "PRIVATE",
                    published: convertTime(item.created_at),
                }
                githubData.push(data);
            });
            this.setState({
                postData: this.state.postData.concat(githubData),
            });
        }).catch((error) => {
            console.log(error);
        });
    }

    fetchPost(headers, username) {
        axios.get(AUTHOR_API.concat(username).concat("/user_posts/"),{headers : headers}).then(res => {
            res.data.forEach((item) => {
                item.published = item.published.split(".")[0] + "-" + item.published.split("-", 4)[3];
            });
            this.setState({
                postData: this.state.postData.concat(res.data),
                isloading: false,
            });
        }).catch((error) => {
            console.log(error);
        });
    }

    handleEdit = (postId) => {
        reactLocalStorage.set("postid", postId);
        document.location.replace("/posts/".concat(postId).concat("/edit"));
    }

    handleComment = (postId) => {
        reactLocalStorage.set("postid", postId);
        urlpostid = reactLocalStorage.set("urlpostid", postId);
        urljoin = require('url-join');
        commentUrl = urljoin("/posts", urlpostid, "/comments");
        document.location.replace(commentUrl);
    }

    render() {
        
        const {postData, username, email, displayName, github, bio, isloading, isSelf} = this.state;
        var sortedData = postData.slice().sort((a, b) => Date.parse(b.published) - Date.parse(a.published));
        return(!isloading ? 
            <div>
                <AuthorHeader/>
                <div className="mystyle">
                    <AuthorProfile 
                        username={username}
                        email={email}
                        displayName={displayName}
                        github={github}
                        bio={bio}
                        isSelf={isSelf}
                    />
                    <List
                        itemLayout="vertical"
                        size="large"
                        pagination={{pageSize: 5, hideOnSinglePage:true}}
                        dataSource={sortedData}
                        renderItem={item => (
                            <List.Item
                                key={item.title}
                                actions={[
                                    <span>
                                        <a href="#!" onClick={this.handleComment.bind(this, item.id)} style={{marginRight: 8}}><Icon type="message"/></a>{0}   
                                    </span>, 
                                    <span>
                                    {isSelf ?
                                        <a href="#!" onClick={this.handleEdit.bind(this, item.id)} style={{marginRight: 8}}><Icon type="edit"/></a>
                                    : null}
                                    </span>,
                                    <span>
                                    {isSelf ?
                                        <a href="#!" onClick={this.showDeleteConfirm.bind(this, item.id, item.author)} style={{marginRight: 8}}><Icon type="delete"/></a>
                                    : null}
                                    </span>,
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <Avatar size="large"
                                            style={{
                                                color: '#FFFFFF',
                                                backgroundColor: '#3991F7',
                                                
                                            }}
                                        >{item.author[0].toUpperCase()}
                                        </Avatar>
                                    }
                                        title={<a href={"/author/".concat(item.author).concat("/posts")} style={{color: '#031528'}}>{item.author}</a>}
                                        description={item.published}
                                />
                                <h3>{"Title: ".concat(item.title)}</h3>
                                {item.content}
                                <SimpleReactLightbox>
                                    <SRLWrapper>
                                        <img
                                            width={150}
                                            height={150}
                                            hspace={3}
                                            vspace={3}
                                            alt=""
                                            src="https://wallpaperaccess.com/full/628286.jpg"/>
                                        <img
                                            width={150}
                                            height={150}
                                            hspace={3}
                                            vspace={3}
                                            alt=""
                                            src="https://i.pinimg.com/originals/1f/53/25/1f53250c9035c9d657971712f6b38a99.jpg"/>
                                        <br></br>                        
                                        <img
                                            width={150}
                                            height={150}
                                            hspace={3}
                                            vspace={3}
                                            alt=""
                                            src="https://wallpaperaccess.com/full/628286.jpg"/>
                                        <img
                                            width={150}
                                            height={150}
                                            hspace={3}
                                            vspace={3}
                                            alt=""
                                            src="https://wallpaperaccess.com/full/628286.jpg"/> 

                                    </SRLWrapper> 
                                </SimpleReactLightbox>                      
                                {item.contentType === "text/markdown" ? (<ReactMarkdown source = {item.content}/>) : item.content}                     
                            </List.Item>
                        )}
                    />
                </div>
            </div> : null
        );
    }
}
                                
export default UserSelf;