import React, { Component } from 'react';
import 'antd/dist/antd.css';
import { Icon, Button, message } from 'antd';
import './AuthorProfile.css'
import axios from 'axios';
import cookie from 'react-cookies';
import validateCookie from '../utils/validate.js';
import getUserId from '../utils/getUserId.js';
import { BE_IF_TWO_AUTHORS_FRIENDS_API_URL, BE_FRIEND_REQUEST_API_URL, HOST, FE_SEETING_URL } from '../utils/constants.js';

class AuthorProfile extends Component {

    constructor(props) {
        super(props)
        this.state = {
            userId: this.props.userId,
            userHost: this.props.userHost,
            username: this.props.username,
            userDisplayName: this.props.userDisplayName,
            userUrl: this.props.userUrl,
            userGithub: this.props.userGithub,
            userEmail: this.props.userEmail,
            userBio: this.props.userBio,
            currentUserId: this.props.currentUserId,
            currentUserHost: this.props.currentUserHost,
            currentUserDisplayName: this.props.currentUserDisplayName,
            currentUserUrl: this.props.currentUserUrl,
        };

    }

    componentDidMount() {
        validateCookie();
        const token = cookie.load('token');
        const headers = { 'Authorization': 'Token '.concat(token) };

        if (!this.props.isSelf) {
            axios.get(BE_IF_TWO_AUTHORS_FRIENDS_API_URL(HOST, getUserId(this.state.currentUserId), getUserId(this.state.userId)),
                { headers: headers }).then(res => {
                    if (res.data.friends === true) {
                        this.setState({
                            profileOwner: 1, // current profile page is belong to current logged-in user's friend
                        })
                    } else {
                        this.setState({
                            profileOwner: 2, // current profile page owner is not current logged-in user's friend
                        })
                    }
                }).catch((error) => {
                    console.log(error);
                });
        } else {
            this.setState({
                profileOwner: 0, // current profile page is belong to current logged-in user
            })
        }
    };

    sendFriendRequest() {
        const token = cookie.load('token');
        const headers = {
            'Authorization': 'Token '.concat(token)
        }
        axios.post(BE_FRIEND_REQUEST_API_URL(HOST),
            {
                "query": "friendrequest",
                "author": {
                    "id": this.state.currentUserId,
                    "host": this.state.currentUserHost,
                    "displayName": this.state.currentUserDisplayName,
                    "url": this.state.currentUserUrl,
                },
                "friend": {
                    "id": this.state.userId,
                    "host": this.state.userHost,
                    "displayName": this.state.username,
                    "url": this.state.userUrl,
                }
            }, { headers: headers }).then(() => {
                message.success(`You have sent friend request to ${this.state.username}`,2);
            }).catch(function (error) {
                console.log(error);
            });
    }

    render() {
        const { username, userDisplayName, userGithub, userEmail, userBio, profileOwner } = this.state;
        return (
            <div className="user">
                <ul className="column1">
                    <li>
                        User Name: <span>{username}</span>
                    </li>
                    <li>
                        Email: <span>{userEmail}</span>
                    </li>
                    <li>
                        Bio: <span>{userBio}</span>
                    </li>
                </ul>

                <ul className="column2">
                    <li>
                        Display Name: <span>{userDisplayName}</span>
                    </li>
                    <li> 
                        Github: <span>{userGithub}</span>
                    </li>
                </ul>
                {profileOwner === 0 ? <a className="self-edit" href={FE_SEETING_URL}><Icon type="edit" /></a> : null}
                {profileOwner === 1 ? <Button shape="round" ghost disabled className="friends"><Icon type="check" /><span>Friends</span></Button> : null}
                {profileOwner === 2 ? <Button type="primary" shape="round" className="not-friend" onClick={() => this.sendFriendRequest()}><Icon type="user-add" /><span>Add Friend</span></Button> : null}
                <hr />
            </div>
        );
    }
}

export default AuthorProfile
