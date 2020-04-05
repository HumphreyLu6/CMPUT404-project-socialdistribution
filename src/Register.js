import React from "react";
import "antd/dist/antd.css";
import './components/Register.css';
import SpongebobRegister from './Images/SpongeBob-register.jpg'
import searock from './Images/searock.jpg'
import { Form, Input, Button, Layout, Card} from 'antd';
import axios from 'axios';
import _ from "lodash"
import { BE_REGISTER_API_URL, FE_LOGIN_URL } from "./utils/constants.js";

class RegistrationForm extends React.Component {
  state = {
    confirmDirty: false,
    autoCompleteResult: []
  };
l
  handleSubmit = e => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let config = {
          "Content-type": "application/json"
        }
        axios.post(BE_REGISTER_API_URL,
          {
            "username": values.username,
            "email": values.email.toLowerCase(),
            "password1": values.password,
            "password2": values.confirm
          }, config
        )
          .then(function (response) {
            document.location.replace(FE_LOGIN_URL)
          })
          .catch(function (error) {
            if (error.response) {
              let msg = "";
              _.each(error.response.data, warnings => {
                _.each(warnings, w => {
                  msg += w + "\n"
                })
              })
              alert(msg)
            }

          });
      }
    });
  };

  handleConfirmBlur = e => {
    const { value } = e.target;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  compareToFirstPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue("password")) {
      callback("Two passwords that you enter is inconsistent!");
    } else {
      callback();
    }
  };

  validateToNextPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && this.state.confirmDirty) {
      form.validateFields(["confirm"], { force: true });
    }
    callback();
  };

  render() {

    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: {
        xs: { span: 30 },
        sm: { span: 9 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 8 }
      }
    };
    
    return (
      <Layout>
      <Layout.Content className='R-mainpage'>
        <Card className="register-card">
          <Form {...formItemLayout}>
            <Form.Item
              label={
                <span>
                  Username&nbsp;
              </span>
              }
            >
              {getFieldDecorator("username", {
                rules: [
                  {
                    required: true,
                    message: "Please input your username!",
                    whitespace: true
                  }
                ]
              })(<Input />)}
            </Form.Item>

            <Form.Item label="E-mail">
              {getFieldDecorator("email", {
                rules: [
                  {
                    type: "email",
                    message: "The input is not valid E-mail!"
                  },
                  {
                    required: true,
                    message: "Please input your E-mail!"
                  }
                ]
              })(<Input />)}
            </Form.Item>

            <Form.Item label="Password" hasFeedback>
              {getFieldDecorator("password", {
                rules: [
                  {
                    required: true,
                    message: "Please input your password!"
                  },
                  {
                    validator: this.validateToNextPassword
                  }
                ]
              })(<Input.Password />)}
            </Form.Item>
            <Form.Item label="Confirm Password" hasFeedback>
              {getFieldDecorator("confirm", {
                rules: [
                  {
                    required: true,
                    message: "Please confirm your password!"
                  },
                  {
                    validator: this.compareToFirstPassword
                  }
                ]
              })(<Input.Password onBlur={this.handleConfirmBlur} />)}
            </Form.Item>
            <div className="buttondiv">
              <Form.Item>
                <Button className="register-button" type="primary" htmlType="button" onClick={this.handleSubmit}>
                  Register
                </Button>
              </Form.Item>
              <Form.Item>
                <a className="back-to-login" href={FE_LOGIN_URL}> Back to log in </a>
              </Form.Item>
            </div>
            </Form>
        </Card>
        <img className="SpongebobRegister" src={SpongebobRegister} alt=""></img>
        <img className="searock" src={searock} alt=""></img>
      </Layout.Content>
    </Layout>

    );
  }
}

const WrappedRegistrationForm = Form.create({ name: 'register' })(RegistrationForm)
export default WrappedRegistrationForm;