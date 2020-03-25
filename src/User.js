import React from 'react';
import 'antd/dist/antd.css';
import { List, Avatar, Icon, Drawer} from 'antd';
import SimpleReactLightbox from "simple-react-lightbox";
import { SRLWrapper } from "simple-react-lightbox";
import './components/Header.css'
import validateCookie from './utils/validate.js';
import AuthorHeader from './components/AuthorHeader';
import axios from 'axios';
import cookie from 'react-cookies';
import './UserSelf.css';
import ReactMarkdown from 'react-markdown';
import { reactLocalStorage } from 'reactjs-localstorage';
import WrappedComments from './Comment';
import { BE_VISIBLE_POST_API_URL, HOST, FE_USERPROFILE_URL, FE_USER_URL} from "./utils/constants.js";

var publicPost = [];

class User extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      size: 'large',
      PublicPostData: [],
      authorid: '',
      isloading: true,
      drawerVisible: false,

    }
  }

  componentDidMount() {
    validateCookie();
    this.fetchData();
  };

  fetchData = () => {
    axios.get(BE_VISIBLE_POST_API_URL(HOST), { headers: { 'Authorization': 'Token ' + cookie.load('token') } })
      .then(res => {
        publicPost = res.data.posts;
        this.setState({
          isloading: false,
        })
        this.setState({
          PublicPostData: res.data.posts,
        });

      }).catch(function (error) {
        console.log(error);
      });
  }

  handleProfile = (authorId) => {
    reactLocalStorage.set("currentUserId", authorId);
    document.location.replace(FE_USERPROFILE_URL);
  }

  handleComment = (postId) => {
    reactLocalStorage.set("postid", postId);
    this.setState({
      drawerVisible: true,
      postId: postId,
    });
  }

  onClose = () => {
    this.setState({drawerVisible: false,});
    document.location.replace(FE_USER_URL);
  }

  render() {
    return (!this.state.isloading ?
      <div>
        <AuthorHeader />
        <div className="mystyle">
          <Drawer
            width={500}
            height={700}
            visible={this.state.drawerVisible}
            onClose={this.onClose}
            bodyStyle={{ paddingBottom: 80 }}
            placement={"bottom"}
          >
            <WrappedComments/>
          </Drawer>
          <List
            itemLayout="vertical"
            size="large"
            pagination={{ pageSize: 5, hideOnSinglePage: true }}
            dataSource={publicPost}
            locale={{ emptyText: "Currently no visible post" }}
            renderItem={item => (
              <List.Item
                key={item.title}
                actions={[
                  <span>
                    <a href="#!" onClick={this.handleComment.bind(this, item.id)} style={{ marginRight: 8 }}><Icon type="message" /></a>
                    {String(item.comments.length).concat(" comment(s)")}
                  </span>
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
                  title={<a href={"#!"} onClick={this.handleProfile.bind(this, item.author.id)} style={{ color: '#031528' }}>{item.author.displayName}</a>}
                  description={"Published on ".concat(item.published.split(".")[0] + "-" + item.published.split("-", 4)[3])}
                />

                <h3>{"Title: ".concat(item.title)}</h3><p>  </p>
                {item.contentType === "text/markdown" ? (<ReactMarkdown source={item.content} />) : item.content}
                <p>  </p>
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


export default User;
