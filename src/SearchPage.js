import React from 'react';
import AuthorHeader from './components/AuthorHeader'
import axios from 'axios';
import cookie from 'react-cookies';
import { Input, List, Avatar, message } from 'antd';
import { HOST, BE_ALL_AUTHOR_API_URL, FE_USERPROFILE_URL } from "./utils/constants.js";
import { reactLocalStorage } from 'reactjs-localstorage';
const { Search } = Input;

class SearchPage extends React.Component {

    state = {
        authors: [],
        value: '',
        isloading: true
    }

    componentDidMount() {
        this.fetchUsernames();
    }

    fetchUsernames = () => {
        axios.get(BE_ALL_AUTHOR_API_URL(HOST), { headers: { 'Authorization': 'Token ' + cookie.load('token') } })
            .then(response => {
                this.setState({
                    authors: response.data
                })
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    updateSearch = (val) => {
        if (/\s/.test(val) | !val) {
            message.error('The author name cannot be empty!', 1)
        } else {
            this.setState({
                value: val,
                isloading: false
            })
        }
    }

    handleProfile = (authorId) => {
        reactLocalStorage.set("currentUserId", authorId);
        document.location.replace(FE_USERPROFILE_URL);
    }

    authorFilter = () => {
        if (this.state.value) {
            return this.state.authors.filter(
                (author) => {
                    return author.displayName.toLowerCase().indexOf(
                        this.state.value.toLowerCase()) !== -1;
                }
            );
        } else {
            return [];
        }
    }

    render() {
        return (
            <div>
                <AuthorHeader defaultSelectedKeys="Search"/>
                <div style={{ textAlign: "center", marginTop: "10px" }}>
                    <Search
                        style={{ width: "30%" }}
                        placeholder="Enter to search author"
                        enterButton="Search"
                        size="large"
                        onChange={() => this.setState({ isloading: true })}
                        onSearch={value => this.updateSearch(value)}
                    />
                </div>
                <div>
                    {!this.state.isloading ?
                        <List
                            style={{ marginLeft: "34.9%", width: "30%" }}
                            locale={{ emptyText: "No result" }}
                            size="small"
                            bordered
                            dataSource={this.authorFilter().map((author) => {
                                return author;
                            })}
                            renderItem={item =>
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar size="medium" style={{ 
                                                color: '#3992f7',
                                                backgroundColor: '#ccebff',
                                                marginTop: 1,
                                                fontSize : "15pt",
                                            }}
                                            >{item.displayName[0].toUpperCase()}
                                            </Avatar>
                                        }
                                        style={{ width: "30%" }}
                                        title={<a href="#!" onClick={this.handleProfile.bind(this, item.id)}>{item.displayName}</a>}
                                        description={item.host ? `Host: ${item.host}` : null}
                                        onClick={this.handleProfile.bind(this, item.id)}
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