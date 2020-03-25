import React from 'react'
import { Layout, Menu, Icon } from 'antd';
import 'antd/dist/antd.css';
import './Header.css';
import cookie from 'react-cookies';
import axios from 'axios';
import { reactLocalStorage } from 'reactjs-localstorage';
import { 
    BE_CURRENT_USER_API_URL, 
    FE_LOGIN_URL, 
    FE_USERPROFILE_URL, 
    FE_FREND_LIST_URL, 
    FE_FREND_REQUEST_URL, 
    FE_USER_URL,
    FE_ADD_POST_URL,
    FE_SEARCH_URL
} from "../utils/constants.js";

const { Header } = Layout;
const { SubMenu } = Menu;

class AuthorHeader extends React.Component {

    logout = () => {
        cookie.remove('token', { path: FE_LOGIN_URL })
        document.location.replace(FE_LOGIN_URL)
    }

    handleMyProfile = () => {
        axios.get(BE_CURRENT_USER_API_URL, { headers: { 'Authorization': 'Token ' + cookie.load('token') } })
            .then(function (response) {
                var currentUserId = String(response.data.id);
                reactLocalStorage.set("currentUserId", currentUserId);
                document.location.replace(FE_USERPROFILE_URL);
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    handleFriendsList = () => {
        axios.get(BE_CURRENT_USER_API_URL, { headers: { 'Authorization': 'Token ' + cookie.load('token') } })
            .then(function (response) {
                var currentUserId = String(response.data.id);
                reactLocalStorage.set("currentUserId", currentUserId);
                document.location.replace(FE_FREND_LIST_URL(response.data.username));
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    handleFriendRequest = () => {
        axios.get(BE_CURRENT_USER_API_URL, { headers: { 'Authorization': 'Token ' + cookie.load('token') } })
        .then(function (response) {
            var currentUserId = String(response.data.id);
            reactLocalStorage.set("currentUserId", currentUserId);
            document.location.replace(FE_FREND_REQUEST_URL(response.data.username));
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    render() {
        return (
            <div>
                <Header className="header">
                    <Menu
                        theme="dark"
                        mode="horizontal"
                        style={{ lineHeight: '64px', textAlign: "center" }}
                    >
                        <Menu.Item key="Home" >
                            <a href={FE_USER_URL}>
                                <Icon type="home" />
                                <span>Home</span>
                            </a>
                        </Menu.Item>

                        <SubMenu key="Friends" title={<span>Friends</span>}>
                            <Menu.Item key="FriendList">
                                <a onClick={this.handleFriendsList} href="#!">
                                    <span>Friend List</span>
                                </a>
                            </Menu.Item>
                            <Menu.Item key="FriendRequest">
                                <a onClick={this.handleFriendRequest} href="#!">
                                    <span>Friend Request</span>
                                </a>
                            </Menu.Item>
                        </SubMenu>

                        <Menu.Item key="PostInput">
                            <a href={FE_ADD_POST_URL}>
                                <span>What's on your mind</span>
                            </a>
                        </Menu.Item>

                        <Menu.Item key="MyPost">
                            <a onClick={this.handleMyProfile} href="#!">
                                <span>My Profile</span>
                            </a>
                        </Menu.Item>

                        <Menu.Item key="Search">
                            <a href={FE_SEARCH_URL}>
                                <span>Search Author</span>
                            </a>
                        </Menu.Item>

                        <Menu.Item key="Logout">
                            <a href="#!" onClick={this.logout}>
                                <span>Logout</span>
                            </a>
                        </Menu.Item>
                    </Menu>
                </Header>
            </div>
        )
    }
}

export default AuthorHeader