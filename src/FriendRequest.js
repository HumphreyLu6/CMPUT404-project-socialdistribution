import React from 'react';
import 'antd/dist/antd.css';
import './index.css';
import { List, Avatar, Button, Skeleton, Modal } from 'antd';
import './components/Header.css'
import AuthorHeader from './components/AuthorHeader'
import cookie from 'react-cookies';
import axios from 'axios';
import validateCookie from './utils/validate.js';
import {HOST,AUTHOR_FRIENDREQUEST_API, FRIEND_REQUEST_API,CURRENT_USER_API} from "./utils/constants.js";
import getUserId from "./utils/getUserId";
import {reactLocalStorage} from 'reactjs-localstorage';
const { confirm } = Modal;

class FriendRequest extends React.Component {
  state = {
    list: [],
    author : "",
    isloading : true
  };

  componentDidMount() {
    validateCookie();
    this.fetchData();
  }

  showConfirm(decision,status,friend) {
    const that = this;
    const token = cookie.load('token');
    const headers = {
      'Authorization': 'Token '.concat(token)
    }
    const data = {
      "query":"friendrequest",
	    "friend": {
		    "id":this.state.author.id,
		    "host":this.state.author.host,
		    "displayName":this.state.author.displayName,
        "url":this.state.author.url
	    },
    	"author": {
		    "id":friend.id,
		    "host":friend.host,
		    "displayName":friend.displayName,
        "url":friend.url
	    },
      "status" : status
    }
    confirm({
      title: 'Are you sure you want to ' + decision + ' this friend request?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        axios.patch(FRIEND_REQUEST_API(HOST), data, {headers : headers})
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
    document.location.replace("/author/profile/");
  }

  fetchData = () => {

    const token = cookie.load('token');
    const headers = {
      'Authorization': 'Token '.concat(token)
    }

    axios.get(CURRENT_USER_API,{headers : headers} ).then(
      responseA =>
        Promise.all([
          responseA,
          axios.get(AUTHOR_FRIENDREQUEST_API(getUserId(responseA.data['id'])),{headers : headers})
        ])   
    ).then(
      ([responseA,responseB]) => {
        let authors = [];
        return Promise.all(responseB.data['authors'].map((author) => {
          return axios.get(author,{headers : headers}).then((res) => {
            authors.push(res.data);
          })
        })).then(() => {
          this.setState({
            author : responseA.data,
            list : authors,
            isloading : false
          })
        }).catch((error) => {
          console.log(error.message)
        })
    })
  };

  render() {
    const {list,isloading} = this.state;

    const liststyle = {
        backgroundColor: "white",
        padding: "1%",
    }  

    const buttonstyle={
        marginRight: 30,
    }

    const titlestyle={
        fontSize : 18 
    }

    return (!isloading ? 
        <div>
            <AuthorHeader/>
            <List
                className="demo-loadmore-list"
                itemLayout="horizontal"
                dataSource={list}
                style={liststyle}
                locale={{ emptyText: "You Currently Have No Friend Request"}}
                renderItem={item => (
                <List.Item>
                    <Skeleton avatar title={false} loading={item.loading} >
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
                    <Button type="primary" shape="round" size={'default'} style={buttonstyle} onClick={() => this.showConfirm("accept","A",item)}>Accept</Button>
                    <Button type="danger" shape="round"size={'default'} style={buttonstyle} onClick={() => this.showConfirm("reject","R",item)}>Reject</Button>
                </List.Item>
                )}
            />
        </div> : null
    );
  }
}

export default FriendRequest;
