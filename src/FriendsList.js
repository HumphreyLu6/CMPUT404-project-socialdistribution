import React from 'react';
import 'antd/dist/antd.css';
import './index.css';
import { List, Avatar, Button, Skeleton, Modal } from 'antd';
import './components/Header.css';
import AuthorHeader from './components/AuthorHeader';
import axios from 'axios';
import cookie from 'react-cookies';
import validateCookie from './utils/validate.js';
import { HOST, BE_FRIENDS_API_URL, BE_CURRENT_USER_API_URL, BE_FRIEND_REQUEST_API_URL, FE_USERPROFILE_URL,BE_AUTHOR_PROFILE_API_URL } from "./utils/constants.js";
import { reactLocalStorage } from 'reactjs-localstorage';
import getUserId from "./utils/getUserId";
const { confirm } = Modal;


class FriendsList extends React.Component {
  state = {
    list: [],
    author: "",
  };

  componentDidMount() {
    validateCookie();
    this.fetchData();
  }

  showDeleteConfirm(friend) {
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
      "status": "R"
    }
    confirm({
      title: 'Are you sure you want to unfriend this friend?',
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
          axios.get(BE_FRIENDS_API_URL(HOST, getUserId(responseA.data['id'])), { headers: headers })
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
          })
        }).catch((error) => {
          console.log(error.message)
        })
      })
  };

  render() {
    const { list } = this.state;

    const liststyle = {
      backgroundColor: "white",
      padding: "1%",
    }

    const unfriendstyle = {
      height: "3%",
      width: "10%",
      right: "1%",
    }

    const titlestyle = {
      fontSize: 18
    }

    return (
      <div>
        <AuthorHeader />
        <List
          className="demo-loadmore-list"
          itemLayout="horizontal"
          dataSource={list}
          style={liststyle}
          locale={{ emptyText: "Friend list is currently empty" }}
          renderItem={item => (
            <List.Item>
              <Skeleton avatar title={false} loading={item.loading} active>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      style={{
                        color: '#FFFFFF',
                        backgroundColor: '#3991F7',
                      }}
                    >
                      {item.displayName[0].toUpperCase()}
                    </Avatar>
                  }
                  title={<a style={titlestyle} href={"#!"} onClick={this.handleProfile.bind(this, item.id)}>{item.displayName}</a>}
                />
              </Skeleton>
              <div style={unfriendstyle} onClick={() => this.showDeleteConfirm(item)}>
                <Button type="danger" shape="round" size={'default'} >Unfriend</Button>
              </div>
            </List.Item>
          )}
        />
      </div>
    );
  }
}

export default FriendsList;
