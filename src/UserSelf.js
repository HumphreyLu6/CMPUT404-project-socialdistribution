import React from 'react';
import 'antd/dist/antd.css';
import { List, Icon, Modal, Avatar} from 'antd';
import SimpleReactLightbox from "simple-react-lightbox";
import { SRLWrapper } from "simple-react-lightbox"; 
import axios from 'axios';
import AuthorHeader from './components/AuthorHeader'
import AuthorProfile from './components/AuthorProfile'
import {reactLocalStorage} from 'reactjs-localstorage';
import './UserSelf.css';
import cookie from 'react-cookies';
import validateCookie from './utils/utils.js';
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
        { headers: headers}).then(res => {
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
        axios.get("https://api.github.com/users/" + githubUsername + "/events/public").then(res => {
            res.data.forEach((item) => {
                var time = this.convertTime(item.created_at);
                var data = {
                    author: username,
                    title: item.type,
                    content: "https://github.com/" + item.repo.name,
                    visibility: item.public ? "PUBLIC" : "PRIVATE",
                    published: time,
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

    convertTime(utcTime) {
        // Reference: https://stackoverflow.com/questions/17415579/how-to-iso-8601-format-a-date-with-timezone-offset-in-javascript
        Date.prototype.toIsoString = function() {
            var tzo = -this.getTimezoneOffset(),
                dif = tzo >= 0 ? '+' : '-',
                pad = function(num) {
                    var norm = Math.floor(Math.abs(num));
                    return (norm < 10 ? '0' : '') + norm;
                };
            return this.getFullYear() +
                '-' + pad(this.getMonth() + 1) +
                '-' + pad(this.getDate()) +
                'T' + pad(this.getHours()) +
                ':' + pad(this.getMinutes()) +
                ':' + pad(this.getSeconds()) +
                dif + pad(tzo / 60) +
                ':' + pad(tzo % 60);
        }

        var mountainTime = utcTime.toLocaleString({timeZone: "america/denver"});
        mountainTime = new Date(mountainTime);
        return mountainTime.toIsoString();
    }


    fetchPost(headers, username) {
        axios.get(AUTHOR_API.concat(username).concat("/user_posts/"),{headers : headers}).then(res => {
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
                  dataSource={postData}
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
                          extra={
                            <SimpleReactLightbox>
                              <SRLWrapper>
                                <img
                                  width={250}
                                  alt=""
                                  src="https://wallpaperaccess.com/full/628286.jpg"/>
                                <img
                                width={250}
                                alt=""
                                src="https://i.pinimg.com/originals/1f/53/25/1f53250c9035c9d657971712f6b38a99.jpg"/> 

                              </SRLWrapper> 
                            </SimpleReactLightbox>
                          }
                      >
                      <List.Item.Meta
                        // avatar={<Avatar src={'https://cdn2.iconfinder.com/data/icons/user-icon-2-1/100/user_5-15-512.png'} />}
                        // title={item.author}
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
                      {item.title}
                      <br/>
                      {item.content}                      
                      </List.Item>
                  )}
              />
          </div>
        </div> : null

      );
    }
}

export default UserSelf;