import React from 'react';
import AuthorHeader from './components/AuthorHeader'
import axios from 'axios';
import cookie from 'react-cookies';
import { Input, List, Avatar, message} from 'antd';
import {USERNAME_LIST} from "./utils/constants.js";

const {Search} = Input;

class SearchPage extends React.Component{

    state = {
        usernames : [],
        value : '',
        isloading : true
    }

    componentDidMount(){
        this.fetchUsernames();
    }

    fetchUsernames = () => {
        axios.get(USERNAME_LIST, { headers: { 'Authorization': 'Token ' + cookie.load('token') } })
        .then(response => {
            this.setState({
                usernames : response.data["usernames"]
            })        
        })
        .catch(function (error) {
          console.log(error);
        });
    }

    updateSearch = (val) => {
        if(/\s/.test(val) | !val){
            message.error('The author name cannot be empty!',1)
        }else{
            this.setState({
                value : val,
                isloading : false
            })
        }
    }

    handleClick = (usr) => {
        document.location.replace("/author/profile")
    }

    usernameFilter = () => {
        if(this.state.value){
            return this.state.usernames.filter(
                (username) => {
                    return username.toLowerCase().indexOf(
                        this.state.value.toLowerCase()) !== -1;
                }
            );
        }else{
            return [];
        }
    }

    render() {
        return (
            <div>
                <AuthorHeader/>
                <div style={{textAlign:"center",marginTop:"10px"}}>
                <Search
                    style={{width:"30%"}}
                    placeholder="Enter to search author"
                    enterButton="Search"
                    size="large"
                    onChange={() => this.setState({isloading : true})}
                    onSearch={value => this.updateSearch(value)}
                />
                </div>
                <div>
                    {!this.state.isloading ?
                 <List
                    style={{marginLeft:"34.9%",width:"30%"}}
                    locale={{ emptyText: "No result"}}
                    size="small"
                    bordered
                    dataSource={this.usernameFilter().map((username) => {
                        return username;
                    })}
                    renderItem={item => 
                        <List.Item>
                            <List.Item.Meta
                                avatar={
                                    <Avatar size="small" style={{color: '#FFFFFF',backgroundColor: '#3991F7'}}
                                    >{item[0].toUpperCase()}
                                    </Avatar>
                                }
                                style={{width:"30%"}}
                                title={<a href={"/author/profile"}>{item}</a>}
                                onClick={() => document.location.replace("/author/".concat(item).concat("/posts"))}
                            />
                        </List.Item>
                    }
                /> : null}
                </div>
                
            </div>
        )

    }
}

export default SearchPage;