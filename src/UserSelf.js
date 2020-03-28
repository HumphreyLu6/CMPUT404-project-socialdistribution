import React from 'react';
import 'antd/dist/antd.css';
import { List, Icon, Modal, Avatar, Drawer } from 'antd';
import SimpleReactLightbox from "simple-react-lightbox";
import { SRLWrapper } from "simple-react-lightbox";
import axios from 'axios';
import AuthorHeader from './components/AuthorHeader'
import AuthorProfile from './components/AuthorProfile'
import { reactLocalStorage } from 'reactjs-localstorage';
import './UserSelf.css';
import ReactMarkdown from 'react-markdown';
import cookie from 'react-cookies';
import validateCookie from './utils/validate.js';
import convertTime from './utils/isoFormat.js';
import getUserId from './utils/getUserId.js';
import WrappedComments from './Comment';
import { 
    HOST, 
    BE_CURRENT_USER_API_URL, 
    BE_AUTHOR_POST_API_URL, 
    BE_SINGLE_POST_API_URL, 
    BE_AUTHOR_PROFILE_API_URL,
    FE_USERPROFILE_URL,
    FE_POST_EDIT_URL,
} from "./utils/constants.js";

const { confirm } = Modal;

class UserSelf extends React.Component {
    state = {
        postData: [],
        userId: "",
        userHost: "",
        username: "",
        userDisplayName: "",
        userUrl: "",
        userGithub: "",
        userEmail: "",
        userBio: "",
        currentUserId: "",
        currentUserHost: "",
        currentUserDisplayName: "",
        currentUserUrl: "",
        isloading: true,
        isSelf: true,
        drawerVisible: false,
    };

    showDeleteConfirm = (postId, author) => {
        confirm({
            title: 'Are you sure you want to delete this post?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                axios.delete(BE_SINGLE_POST_API_URL(HOST, postId), { headers: { 'Authorization': 'Token ' + cookie.load('token') } })
                    .then(function () {
                        document.location.replace(FE_USERPROFILE_URL);
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
        const headers = { 'Authorization': 'Token '.concat(token) }
        let userId = reactLocalStorage.get("currentUserId");
        axios.get(BE_CURRENT_USER_API_URL, { headers: headers }).then(res => {
            var currentUserId = res.data.id
            if (userId) {
                if (userId !== currentUserId) {
                    this.setState({
                        isSelf: false,
                        currentUserId: currentUserId,
                        currentUserHost: res.data.host,
                        currentUserDisplayName: res.data.displayName,
                        currentUserUrl: res.data.url,
                    });
                    this.setState({
                        currentUserId: res.data.id,
                    });
                }
            } else {
                userId = currentUserId;
            }
            this.getProfile(headers, userId);
            this.fetchPost(headers, userId);
        }).catch((error) => {
            console.log(error);
        });
    };

    getProfile(headers, userId) {
        var parsedId = getUserId(userId);
        axios.get(BE_AUTHOR_PROFILE_API_URL(parsedId),
            { headers: headers }).then(res => {
                var userInfo = res.data;
                this.setState({
                    userId: userId,
                    userHost: userInfo.host,
                    username: userInfo.username,
                    userDisplayName: userInfo.displayName,
                    userUrl: userInfo.url,
                    userGithub: userInfo.github,
                    userEmail: userInfo.email,
                    userBio: userInfo.bio,
                });
                if (this.state.github) {
                    // var githubUsername = this.state.github.replace("https://github.com/", "");
                    //this.pullGithubActivity(githubUsername, username);
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

    fetchPost(headers, userId) {
        var parsedId = getUserId(userId);
        axios.get(BE_AUTHOR_POST_API_URL(HOST, parsedId), { headers: headers })
            .then(res => {
                this.setState({
                    postData: res.data.posts,
                    isloading: false,
                });
            }).catch((error) => {
                console.log(error);
            });
    }

    handleEdit = (postId) => {
        reactLocalStorage.set("postid", postId);
        document.location.replace(FE_POST_EDIT_URL(postId));
    }

    handleComment = (postId) => {
        this.setState({
          drawerVisible: true,
          postId: postId,
        });
      
      }
    
      onClose = () => {
        this.setState({drawerVisible: false,});
      }
    render() {

        const { postData, userId, userHost, username, userDisplayName, userUrl, userGithub, userEmail, userBio,
            currentUserId, currentUserHost, currentUserDisplayName, currentUserUrl, isloading, isSelf } = this.state;
        var sortedData = postData.slice().sort((a, b) => Date.parse(b.published) - Date.parse(a.published));
        return (!isloading ?
            <div>
                <AuthorHeader />
                <div className="mystyle">
                    <AuthorProfile
                        userId={userId}
                        userHost={userHost}
                        username={username}
                        userDisplayName={userDisplayName}
                        userUrl={userUrl}
                        userGithub={userGithub}
                        userEmail={userEmail}
                        userBio={userBio}
                        currentUserId={currentUserId}
                        currentUserHost={currentUserHost}
                        currentUserDisplayName={currentUserDisplayName}
                        currentUserUrl={currentUserUrl}
                        isSelf={isSelf}
                    />
                    <Drawer
                        width={600}
                        height={700}
                        visible={this.state.drawerVisible}
                        onClose={this.onClose}
                        destroyOnClose={true}
                        bodyStyle={{ paddingBottom: 80 }}
                    >
                        <WrappedComments postId={this.state.postId}/>
                    </Drawer>
                    <List
                        itemLayout="vertical"
                        size="large"
                        pagination={{ pageSize: 5, hideOnSinglePage: true }}
                        dataSource={sortedData}
                        locale={{ emptyText: "You currently do not have any post" }}
                        renderItem={item => (
                            <List.Item
                                key={item.title}
                                actions={[
                                    <span>
                                        <a href="#!" onClick={this.handleComment.bind(this, item.id)} style={{ marginRight: 8 }}><Icon type="message" /></a>
                                        {String(item.comments.length).concat(" comment(s)")}
                                    </span>,
                                    <span>
                                        {isSelf ?
                                            <a href="#!" onClick={this.handleEdit.bind(this, item.id)} style={{ marginRight: 8 }}><Icon type="edit" /></a>
                                            : null}
                                    </span>,
                                    <span>
                                        {isSelf ?
                                            <a href="#!" onClick={this.showDeleteConfirm.bind(this, item.id, item.author.displayName)} style={{ marginRight: 8 }}><Icon type="delete" /></a>
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
                                        >{item.author.displayName[0].toUpperCase()}
                                        </Avatar>
                                    }
                                    title={<a href={FE_USERPROFILE_URL} style={{ color: '#031528' }}>{item.author.displayName}</a>}
                                    description={"Published on ".concat(item.published.split(".")[0] + "-" + item.published.split("-", 4)[3])}
                                />
                                <h3>{"Title: ".concat(item.title)}</h3><p>  </p>
                                {item.contentType === "text/plain" ? item.content : (<ReactMarkdown source={item.content} />)}
                                <SimpleReactLightbox>
                                    <SRLWrapper>
                                        <img
                                            width={150}
                                            height={150}
                                            hspace={3}
                                            vspace={3}
                                            alt=""
                                            src="https://wallpaperaccess.com/full/628286.jpg" />
                                        <img
                                            width={150}
                                            height={150}
                                            hspace={3}
                                            vspace={3}
                                            alt=""
                                            src="https://i.pinimg.com/originals/1f/53/25/1f53250c9035c9d657971712f6b38a99.jpg" />
                                        <br></br>
                                        <img
                                            width={150}
                                            height={150}
                                            hspace={3}
                                            vspace={3}
                                            alt=""
                                            src="https://wallpaperaccess.com/full/628286.jpg" />
                                        <img
                                            width={150}
                                            height={150}
                                            hspace={3}
                                            vspace={3}
                                            alt=""
                                            src="https://wallpaperaccess.com/full/628286.jpg" />

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