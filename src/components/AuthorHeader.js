import React from 'react'
import cookie from 'react-cookies';
import axios from 'axios';
import validateCookie from '../utils/validate.js';
import { reactLocalStorage } from 'reactjs-localstorage';
import './AuthorHeader.css';
import { Menu } from 'antd';
import 'antd/dist/antd.css';
import { 
    HomeOutlined,
    UsergroupAddOutlined, 
    TeamOutlined,
    UserAddOutlined, 
    BulbOutlined,
    UserOutlined,
    SearchOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
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

const { SubMenu } = Menu;

class AuthorHeader extends React.Component {
    state = {
        username: "",
        displayName: "",
    };

    logout = () => {
        cookie.remove('token', { path: FE_LOGIN_URL })
        document.location.replace(FE_LOGIN_URL)
    }

    componentDidMount() {
        validateCookie();
        const token = cookie.load('token');
        const headers = { 'Authorization': 'Token '.concat(token) }
        axios.get(BE_CURRENT_USER_API_URL, { headers: headers }).then(res => {
            var currentUserId = String(res.data.id);
            reactLocalStorage.set("currentUserId", currentUserId);
            this.setState({
                username: res.data.username,
                displayName: res.data.displayName
            });
        }).catch((error) => {
            console.log(error);
        });
    };

    handleMyProfile = () => {
        document.location.replace(FE_USERPROFILE_URL);
    }

    handleFriendsList = () => {
        document.location.replace(FE_FREND_LIST_URL(this.state.username));
    }

    handleFriendRequest = () => {
        document.location.replace(FE_FREND_REQUEST_URL(this.state.username));
    }

    render() {
        const { displayName } = this.state;
        const {defaultSelectedKeys} = this.props
        return (
            <div>
                <Menu className="menu" mode="horizontal" defaultSelectedKeys={defaultSelectedKeys}>
                    <Menu.Item className="menu-item-intro" key="Intro" disabled>
                        <span>Hi, {displayName}</span>
                    </Menu.Item>

                    <Menu.Item className="menu-item" key="Home" >
                        <a href={FE_USER_URL}>
                            <HomeOutlined className="menu-icon" style={{fontSize: 18}} />
                            <span>Home</span>
                        </a>
                    </Menu.Item>

                    <SubMenu 
                        className="menu-item" 
                        key="Friends" 
                        title={
                            <span>
                                <UsergroupAddOutlined className="menu-icon" style={{fontSize: 19}}/>
                                Friends
                            </span>
                        }>
                        <Menu.Item className="sub-menu" key="FriendList">
                            <a onClick={this.handleFriendsList} href="#!">
                                <TeamOutlined className="menu-icon" style={{fontSize: 17}}/>
                                <span>Friend List</span>
                            </a>
                        </Menu.Item>
                        <Menu.Item className="sub-menu" key="FriendRequest">
                            <a onClick={this.handleFriendRequest} href="#!">
                                <UserAddOutlined className="menu-icon" style={{fontSize: 16}}/>
                                <span>Friend Request</span>
                            </a>
                        </Menu.Item>
                    </SubMenu>

                    <Menu.Item className="menu-item" key="PostInput">
                        <a href={FE_ADD_POST_URL}>
                            <BulbOutlined className="menu-icon" style={{fontSize: 18}}/>
                            <span>What's on your mind</span>
                        </a>
                    </Menu.Item>

                    <Menu.Item className="menu-item" key="MyPost">
                        <a onClick={this.handleMyProfile} href="#!">
                            <UserOutlined className="menu-icon" style={{fontSize: 18}}/>
                            <span>My Profile</span>
                        </a>
                    </Menu.Item>

                    <Menu.Item className="menu-item" key="Search">
                        <a href={FE_SEARCH_URL}>
                            <SearchOutlined className="menu-icon" style={{fontSize: 18}}/>
                            <span>Search Author</span>
                        </a>
                    </Menu.Item>

                    <Menu.Item className="menu-item" key="Logout">
                        <a href="#!" onClick={this.logout}>
                            <LogoutOutlined className="menu-icon" style={{fontSize: 18}}/>
                            <span>Logout</span>
                        </a>
                    </Menu.Item>
                </Menu>
            </div>
        )
    }
}

export default AuthorHeader