import React from "react";

import { Card, Form, Input, Button, Checkbox, message } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import "antd/dist/antd.css";
import styles from "./Styles/Login.module.css";
import { FE_HOME_URL, FE_REGISTER_URL } from "../configs/fe_url";
import { LOGIN_API } from "../configs/api_url";
import axios from "axios";

class LogIn extends React.Component {
  onFinish = async (values) => {
    try {
      const res = await axios.post(LOGIN_API, {
        email: values.email,
        password: values.password,
      });
      localStorage.setItem("key", res.data.key);
      window.location.href = FE_HOME_URL;
    } catch (err) {
      console.log(err);
      message.error(Object.entries(err.response.data)[0][1], 1.5);
    }
  };

  render() {
    return (
      <div className={styles.logInBG}>
        <Card className={styles.logInCard} hoverable>
          <Form onFinish={this.onFinish}>
            <Form.Item
              name="email"
              rules={[
                {
                  type: "email",
                  required: true,
                  message: "Please type in a valid email address.",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                placeholder="Email Address"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please type in your password.",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                placeholder="Password"
              />
            </Form.Item>
            <Form.Item name="remember" valuePropName="checked">
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className={styles.logInButton}
              >
                Log in
              </Button>
              <div style={{ textAlign: "center" }}>
                Don't have an account? <a href={FE_REGISTER_URL}>Sign up</a>
              </div>
            </Form.Item>
            <Form.Item style={{ textAlign: "center", marginBottom: "0em" }}>
              <Button type="link" htmlType="button" href={FE_HOME_URL}>
                Not now?
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    );
  }
}

export default LogIn;
