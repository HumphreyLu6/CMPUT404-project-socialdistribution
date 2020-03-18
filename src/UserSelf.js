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
    MyPostData:[],
    username : "",
    currentUser: "",
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
    const headers = {
      'Authorization': 'Token '.concat(token)
    }
    const pathArray = window.location.pathname.split('/');
    let username = pathArray[2];
    axios.get(CURRENT_USER_API,
    {headers : headers}).then(res => {
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
        this.fetchPost(headers, username);

    }).catch((error) => {
          console.log(error);
    });
  };

  fetchPost(headers, username) {
    axios.get(AUTHOR_API.concat(username).concat("/user_posts/"), 
    {headers : headers}).then(res => {
        this.setState({
            username: username,
            MyPostData: res.data.slice().sort((a, b) => Date.parse(b.published) - Date.parse(a.published)),
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
      
      const {username, isloading, MyPostData, isSelf} = this.state;
      return(!isloading ? 
        <div>
          <AuthorHeader/>
          <div className="mystyle">
              <AuthorProfile 
                username={username}
                isSelf={isSelf}
              />
              <List
                  itemLayout="vertical"
                  size="large"
                  pagination={{pageSize: 5, hideOnSinglePage:true}}
                  dataSource={MyPostData}
                  locale={{ emptyText: "You have not posted anything yet"}}
                  renderItem={item => (
                      <List.Item
                          key={item.title}
                          actions={[
                            <span>
                                <a href="#!" onClick={this.handleComment.bind(this, item.id)} style={{marginRight: 8}}><Icon type="message"/></a>
                                {String(item.comments_count).concat(" comment(s)")}   
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
                            description={item.published.split(".")[0] + "-" + item.published.split("-", 4)[3]}                        
                      />
                      {"Title: ".concat(item.title)}<p>  </p>
                      {item.content}
                      <p>  </p>
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
                      </List.Item>
                  )}
              />
          </div>
        </div> : null

      );
    }
}

export default UserSelf;