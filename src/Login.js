import { Form, Icon, Input, Button, Checkbox, message, Layout, Card} from 'antd';
import React from "react";
import "antd/dist/antd.css";
import cookie from 'react-cookies'
import "./components/Login.css"
import searocklogin from './Images/searock.jpg'
import Spongebob from './Images/Spongebob-Squarepants.png'
import seaweed from './Images/seaplant.png'
import axios from 'axios';
import { BE_LOGIN_API_URL, FE_USER_URL,FE_REGISTER_URL } from "./utils/constants.js";

class NormalLoginForm extends React.Component {

  componentDidMount(){
    document.body.style.background = "#83CEF2";
   }

  checkCookie = () => {

    if (cookie.load('token')) {
      document.location.replace(FE_USER_URL)
      return true;
    } else return false;
  }

  handleSubmit = e => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let config = {
          "Content-type": "application/json"
        }
        axios.post(BE_LOGIN_API_URL,
          {
            "email": values.Email,
            "password": values.password
          }, config
        ).then(function (response) {
          cookie.save('token', response.data['key'], { path: '/' })
          document.location.replace(FE_USER_URL)
        }).catch((error) => {
          if (error.response) {
            if (error.response) {
              let msg = JSON.parse(error.response.request.response);
              message.error(msg['non_field_errors'][0])
            } else console.log(error);
          }
        });
      }
    })
  };

  render() {
    if (this.checkCookie() === true) return;
    const { getFieldDecorator } = this.props.form;
    return (
      <Layout>
        <Layout.Content className='mainpage'>
            <Card className="login-card">
              <Form className="login-form">
                <Form.Item>
                  {getFieldDecorator('Email', {
                    rules: [
                      { required: true, message: 'Please input your address!' },
                      {
                        type: "email",
                        message: "The input is not valid E-mail!"
                      }
                    ]
                  })(
                    <Input
                      prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                      placeholder="Email Address"
                    />,
                  )}
                </Form.Item>
                <Form.Item>
                  {getFieldDecorator('password', {
                    rules: [{ required: true, message: 'Please input your Password!' }],
                  })(
                    <Input
                      prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                      type="password"
                      placeholder="Password"
                    />,
                  )}
                </Form.Item>
                <Form.Item>
                  {getFieldDecorator('remember', {
                    valuePropName: 'checked',
                    initialValue: true,
                  })(<Checkbox>Remember me</Checkbox>)}
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="button" className="login-form-button" onClick={this.handleSubmit}>
                    Log in
                  </Button>
                  <a className="login-to-register" href={FE_REGISTER_URL}>Register</a>
                </Form.Item>
              </Form>
            </Card>
            <img className="spongebob" src={Spongebob} alt=""></img>
            <img className="seaweed1" src={seaweed} alt=""></img>
            <img className="searocklogin" src={searocklogin} alt=""></img>

        </Layout.Content>
      </Layout>
      
    );
  }
}

const WrappedNormalLoginForm = Form.create({ name: 'normal_login' })(NormalLoginForm);
export default WrappedNormalLoginForm;