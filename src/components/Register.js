import React from "react";
import { Card, Form, Input, Button, message } from "antd";
import "antd/dist/antd.css";
import styles from "./Styles/Register.module.css";
import { FE_HOME_URL, FE_LOGIN_URL } from "../configs/fe_url";
import { REGISTER_API } from "../configs/api_url";
import axios from "axios";

class Register extends React.Component {
  onFinish = async (values) => {
    try {
      const res = await axios.post(REGISTER_API, {
        username: values.username,
        email: values.email,
        password1: values.password1,
        password2: values.password2,
      });
      localStorage.setItem("key", res.data.key);
      message.success("Account created!", 1.5, () => {
        window.location.href = FE_HOME_URL;
      });
    } catch (err) {
      message.error(Object.entries(err.response.data)[0][1], 3);
    }
  };

  render() {
    return (
      <div className={styles.signUpBG}>
        <Card className={styles.signUpCard} hoverable>
          <Form {...formItemLayout} onFinish={this.onFinish}>
            <Form.Item
              name="username"
              label="Username"
              rules={[
                {
                  type: "string",
                  message: "Please input your username.",
                },
                {
                  required: true,
                  message: "The input is not valid Username.",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="E-mail"
              rules={[
                {
                  type: "email",
                  message: "The input is not valid E-mail.",
                },
                {
                  required: true,
                  message: "Please input your E-mail.",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="password1"
              label="Password"
              rules={[
                {
                  required: true,
                  message: "Please input your password.",
                },
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="password2"
              label="Confirm Password"
              rules={[
                {
                  required: true,
                  message: "Please confirm your password.",
                },
                ({ getFieldValue }) => ({
                  validator(rule, value) {
                    if (!value || getFieldValue("password1") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      "The two passwords that you entered do not match!"
                    );
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item {...tailFormItemLayout}>
              <Button
                type="primary"
                htmlType="submit"
                className={styles.signUpButton}
              >
                Sign up
              </Button>
              <div style={{ textAlign: "center" }}>
                Already have an account? <a href={FE_LOGIN_URL}>Log in</a>
              </div>
            </Form.Item>
            <Form.Item
              {...tailFormItemLayout}
              style={{ textAlign: "center", marginBottom: "0em" }}
            >
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

//referenced from https://ant.design/components/form/#header
const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 8,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 16,
    },
  },
};

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};

export default Register;
