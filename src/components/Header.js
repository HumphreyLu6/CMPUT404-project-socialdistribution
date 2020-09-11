import React from "react";
import { connect } from "react-redux";
import { Menu } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  BulbOutlined,
  SearchOutlined,
  UsergroupAddOutlined,
  LogoutOutlined,
  LoginOutlined,
  TeamOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import "antd/dist/antd.css";
import styles from "./Styles/Header.module.css";
import {
  FE_HOME_URL,
  FE_LOGIN_URL,
  FE_SEARCH_URL,
  FE_POST_URL,
  FE_USERPROFILE_URL,
} from "../configs/fe_url";
import * as actions from "../actions";
import { FE_FREND_REQUEST_URL } from "../configs/fe_url";
import { FE_FREND_LIST_URL } from "../configs/fe_url";

const headerItems = [
  {
    href: FE_HOME_URL,
    text: "Home",
    icon: <HomeOutlined style={{ color: "#7f553b", fontSize: "18px" }} />,
  }, //0
  {
    href: FE_SEARCH_URL(""),
    text: "Search Author",
    icon: <SearchOutlined style={{ color: "#7f553b", fontSize: "18px" }} />,
  }, //1
  {
    href: FE_POST_URL,
    text: "What's on Your Mind",
    icon: <BulbOutlined style={{ color: "#7f553b", fontSize: "18px" }} />,
  }, //2
  {
    href: FE_USERPROFILE_URL,
    text: "My Profile",
    icon: <UserOutlined style={{ color: "#7f553b", fontSize: "18px" }} />,
  }, //3
  {
    href: FE_HOME_URL,
    text: "Friends",
    icon: (
      <UsergroupAddOutlined style={{ color: "#7f553b", fontSize: "18px" }} />
    ),
  }, //4
  {
    href: FE_FREND_LIST_URL,
    text: "My Friends",
    icon: <TeamOutlined style={{ color: "#7f553b", fontSize: "18px" }} />,
  }, //5
  {
    href: FE_FREND_REQUEST_URL,
    text: "Friend Requests",
    icon: <UserAddOutlined style={{ color: "#7f553b", fontSize: "18px" }} />,
  }, //6
  {
    href: null,
    text: "Logout",
    icon: <LogoutOutlined style={{ color: "#7f553b", fontSize: "18px" }} />,
  }, //7
  {
    href: FE_LOGIN_URL,
    text: "Log in",
    icon: <LoginOutlined style={{ color: "#7f553b", fontSize: "18px" }} />,
  }, //8
];

class Header extends React.Component {
  componentDidMount() {
    this.props.fetchUser();
  }

  renderAnchor(i, onClick) {
    return (
      <a
        href={headerItems[i].href}
        onClick={onClick}
        style={{ color: "#7f553b", fontWeight: "450", fontSize: "18px" }}
      >
        {headerItems[i].icon}
        {headerItems[i].text}
      </a>
    );
  }

  renderContext() {
    const { user, selectedKey } = this.props;
    if (user && user.loggedIn) {
      return (
        <Menu
          className={styles.menu}
          mode="horizontal"
          selectedKeys={selectedKey}
        >
          <Menu.Item key="-1" disabled style={{ marginRight: "5%" }}>
            <span
              style={{
                color: "#7f553b",
                fontWeight: "450",
                fontSize: "18px",
              }}
            >
              Hi, {user.displayName}
            </span>
          </Menu.Item>
          <Menu.Item key="0">{this.renderAnchor(0)}</Menu.Item>
          <Menu.Item key="1">{this.renderAnchor(1)}</Menu.Item>
          <Menu.Item key="2">{this.renderAnchor(2)}</Menu.Item>
          <Menu.Item key="3">{this.renderAnchor(3)}</Menu.Item>
          <Menu.SubMenu
            key="4"
            style={{ color: "#7f553b", fontWeight: "450", fontSize: "18px" }}
            title={
              <div>
                {headerItems[4].icon}
                {headerItems[4].text}
              </div>
            }
          >
            <Menu.Item key="5">{this.renderAnchor(5)}</Menu.Item>
            <Menu.Item key="6">{this.renderAnchor(6)}</Menu.Item>
          </Menu.SubMenu>
          <Menu.Item key="7" style={{ float: "right", marginRight: "6%" }}>
            {this.renderAnchor(7, () => {
              localStorage.removeItem("key");
              window.location.href = FE_HOME_URL;
            })}
          </Menu.Item>
        </Menu>
      );
    } else {
      return (
        <Menu
          className={styles.menu}
          theme="light"
          mode="horizontal"
          selectedKeys={selectedKey}
        >
          <Menu.Item key="0">{this.renderAnchor(0)}</Menu.Item>
          <Menu.Item key="1">{this.renderAnchor(1)}</Menu.Item>
          <Menu.Item key="8">{this.renderAnchor(8)}</Menu.Item>
        </Menu>
      );
    }
  }

  render() {
    return <div>{this.renderContext()}</div>;
  }
}

const mapStatesToProps = ({ user }) => {
  return { user };
};

export default connect(mapStatesToProps, actions)(Header);
