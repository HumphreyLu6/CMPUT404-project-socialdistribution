import React from "react";
import Header from "../components/Header";
import { Input, List, Avatar } from "antd";
import axios from "axios";
import { ALL_AUTHOR_API, AUTHOR_POST_API } from "../configs/api_url";
import { FE_SEARCH_URL } from "../configs/fe_url";
import * as actions from "../actions";
import { connect } from "react-redux";
import ProfileContent from "../components/ProfileContent";
import PostList from "../components/PostList";

class SearchPage extends React.Component {
  state = {
    allAuthors: [],
    searchResult: null,
  };

  componentDidMount() {
    this.fetchAllAuthors();
    const { match } = this.props;
    if (match && match.params && match.params.authorId) {
      this.props.fetchAuthor(match.params.authorId);
    }
  }

  fetchAllAuthors = async () => {
    try {
      const res = await axios.get(ALL_AUTHOR_API);
      this.setState({
        allAuthors: res.data,
      });
    } catch (err) {
      console.log(err);
    }
  };

  search = (val) => {
    let result = null;
    if (!(/\s/.test(val) | !val)) {
      result = this.state.allAuthors.filter((author) => {
        return author.displayName.toLowerCase().indexOf(val) !== -1;
      });
    }
    this.setState({
      searchResult: result,
    });
  };

  renderProfile = (user, author) => {
    if (!author || !user) return null;
    const authorId = author.id.split("/").pop();
    return (
      <div>
        <ProfileContent user={user} author={author} />
        <PostList source={AUTHOR_POST_API(authorId, 5)} showEdit={false} />
      </div>
    );
  };

  render() {
    const { author, user } = this.props;
    return (
      <div>
        <Header selectedKey="1" />
        <div
          style={{ marginLeft: "30%", marginRight: "30%", marginTop: "1em" }}
        >
          <Input.Search
            id="dsadnlajsdsa"
            enterButton
            size="large"
            placeholder="Enter to search authors"
            onSearch={(value) => this.search(value)}
          />
          {this.state.searchResult === null ? null : (
            <List
              locale={{ emptyText: "No Author Found." }}
              size="small"
              bordered
              dataSource={this.state.searchResult}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{ color: "#3992f7", backgroundColor: "#ccebff" }}
                      >
                        {item.displayName[0].toUpperCase()}
                      </Avatar>
                    }
                    title={
                      <a href={FE_SEARCH_URL(item.id.split("/").pop())}>
                        {item.displayName}
                      </a>
                    }
                    description={"Email: " + item.email}
                  />
                </List.Item>
              )}
            />
          )}
        </div>
        {this.renderProfile(user, author)}
      </div>
    );
  }
}

const mapStateToProps = ({ user, author }) => {
  return { user, author };
};

export default connect(mapStateToProps, actions)(SearchPage);
