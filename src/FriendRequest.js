import React from 'react';
import 'antd/dist/antd.css';
import './index.css';
import { List, Avatar, Button, Skeleton, Modal, Spin } from 'antd';
import './components/Header.css'
import AuthorHeader from './components/AuthorHeader'
import cookie from 'react-cookies';
import axios from 'axios';
import validateCookie from './utils/validate.js';
import getUserId from "./utils/getUserId";
import { reactLocalStorage } from 'reactjs-localstorage';
import {
  HOST,
  BE_AUTHOR_FRIENDREQUEST_API_URL,
  BE_FRIEND_REQUEST_API_URL,
  BE_CURRENT_USER_API_URL,
  FE_USERPROFILE_URL,
  BE_AUTHOR_PROFILE_API_URL
} from "./utils/constants.js";
const { confirm } = Modal;

class FriendRequest extends React.Component {
  state = {
    list: [],
    author: "",
    isloading : true
  };

  componentDidMount() {
    validateCookie();
    this.fetchData();
  }

  showConfirm(decision, status, friend) {
    const that = this;
    const token = cookie.load('token');
    const headers = {
      'Authorization': 'Token '.concat(token)
    }
    const data = {
      "query": "friendrequest",
      "friend": {
        "id": this.state.author.id,
        "host": this.state.author.host,
        "displayName": this.state.author.displayName,
        "url": this.state.author.url
      },
      "author": {
        "id": friend.id,
        "host": friend.host,
        "displayName": friend.displayName,
        "url": friend.url
      },
      "status": status
    }
    confirm({
      title: 'Are you sure you want to ' + decision + ' this friend request?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        axios.patch(BE_FRIEND_REQUEST_API_URL(HOST), data, { headers: headers })
          .then(res => {
            that.fetchData();
          }).catch(function (error) {
            console.log(error)
          });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  handleProfile = (authorId) => {
    reactLocalStorage.set("currentUserId", authorId);
    document.location.replace(FE_USERPROFILE_URL);
  }

  fetchData = () => {

    const token = cookie.load('token');
    const headers = {
      'Authorization': 'Token '.concat(token)
    }

    axios.get(BE_CURRENT_USER_API_URL, { headers: headers }).then(
      responseA =>
        Promise.all([
          responseA,
          axios.get(BE_AUTHOR_FRIENDREQUEST_API_URL(getUserId(responseA.data['id'])), { headers: headers })
        ])
    ).then(
      ([responseA, responseB]) => {
        let authors = [];
        return Promise.all(responseB.data['authors'].map((author) => {
          let parsedId = getUserId(author);
          return axios.get(BE_AUTHOR_PROFILE_API_URL(parsedId), { headers: headers }).then((res) => {
            authors.push(res.data);
          })
        })).then(() => {
          this.setState({
            author: responseA.data,
            list: authors,
            isloading : false,
          })
        }).catch((error) => {
          console.log(error.message)
        })
      })
  };

  render() {
    const { list, isloading } = this.state;

    const liststyle = {
      backgroundColor: "white",
      padding: "1%",
    }

    const buttonstyle = {
      marginRight: 30,
    }

    const titlestyle = {
      fontSize: 18
    }

    return (
      <div>
        <AuthorHeader/>
        {!isloading ? 
        <List
          className="demo-loadmore-list"
          itemLayout="horizontal"
          dataSource={list}
          style={liststyle}
          locale={{ emptyText: "You currently have no friend request" }}
          renderItem={item => (
            <List.Item>
              <Skeleton avatar title={false} loading={item.loading} >
                <List.Item.Meta
                  avatar={
                    <Avatar size={50}
                      style={{
                        color: '#FFFFFF',
                        backgroundColor: '#3991F7',
                        fontSize : "30px"
                      }}
                    >
                      {item.displayName[0].toUpperCase()}
                    </Avatar>
                  }
                  title={<a style={titlestyle} href={"#!"} onClick={this.handleProfile.bind(this, item.id)}>{item.displayName}</a>}
                  description={item.host ? `Host: ${item.host}` : null}

                />
              </Skeleton>
              <Button type="primary" shape="round" size={'default'} style={buttonstyle} onClick={() => this.showConfirm("accept", "A", item)}>Accept</Button>
              <Button type="danger" shape="round" size={'default'} style={buttonstyle} onClick={() => this.showConfirm("reject", "R", item)}>Reject</Button>
            </List.Item>
          )}
        /> : <Spin size="large" style={{marginLeft : "50%", marginTop : "5%"}}/>}
      </div>
    );
  }
}

export default FriendRequest;
