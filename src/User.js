import React from 'react';
import 'antd/dist/antd.css';
import { List, Avatar, Icon } from 'antd';
import SimpleReactLightbox from "simple-react-lightbox";
import { SRLWrapper } from "simple-react-lightbox"; 
import './components/Header.css'
import validateCookie from './utils/validate.js';
import AuthorHeader from './components/AuthorHeader';
import axios from 'axios';
import cookie from 'react-cookies';
import './UserSelf.css';
import ReactMarkdown from 'react-markdown';
import {reactLocalStorage} from 'reactjs-localstorage';
import {POST_API} from "./utils/constants.js";

var urlpostid = '';
var urljoin;
urljoin = require('url-join');
var commentUrl='';

class User extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      size: 'large',
      PublicPostData:[],
      authorid:'',
      isloading : true,
    
    }
  }

  componentDidMount() {
    validateCookie();
    this.fetchData();
  };

  fetchData = () => {
    axios.get(POST_API, { headers: { 'Authorization': 'Token ' + cookie.load('token') } })
      .then(res => {
        var publicPost = res.data.slice().sort((a, b) => Date.parse(b.published) - Date.parse(a.published));
        this.setState({
            isloading: false,
        })
        if (publicPost) {
            
            this.setState({
                PublicPostData : publicPost,
                authorid: publicPost[0].author,
            });
        }
        }).catch(function (error) {
        console.log(error);
      });
  }

  handleComment = (postId) => {
    reactLocalStorage.set("postid", postId);
    urlpostid = reactLocalStorage.set("urlpostid", postId);
    commentUrl = urljoin("/posts", urlpostid, "/comments");
    document.location.replace(commentUrl);
  }

  onPageChange = (pageIndex) => {
    console.log(pageIndex);
 }
  
  render() {  
      return(!this.state.isloading ? 
        <div>
            <AuthorHeader/>
            <div className="mystyle">
                <List
                    itemLayout="vertical"
                    size="large"
                    pagination={{pageSize: 5 , hideOnSinglePage:true}}
                    dataSource={this.state.PublicPostData}
                    locale={{ emptyText: "Currently no visible post"}}
                    onPageChange={this.onPageChange}
                    renderItem={item => (
                        <List.Item
                            key={item.title}
                            actions={[
                                <span>
                                    <a href="#!" onClick={this.handleComment.bind(this, item.id)} style={{marginRight: 8}}><Icon type="message"/></a>
                                    {String(item.comments_count).concat(" comment(s)")}

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
                                    >{item.author[0].toUpperCase()}
                                    </Avatar>
                                }
                                title={<a href={"/author/".concat(item.author).concat("/posts")} style={{color: '#031528'}}>{item.author}</a>}
                                description={"Published on ".concat(item.published.split(".")[0] + "-" + item.published.split("-", 4)[3])}
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

                            {item.contentType === "text/markdown" ? (<ReactMarkdown source = {item.content}/>) : item.content}

                        </List.Item>
                    )}
                />
          </div>
        </div> : null
      );
    }
}


export default User;
