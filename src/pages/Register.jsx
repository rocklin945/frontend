import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from '../api/auth';

const { Title } = Typography;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      setLoading(true);

      if (values.password !== values.confirmPassword) {
        message.error('两次输入的密码不一致');
        return;
      }

      // 准备用户数据
      const userData = {
        fullName: values.fullName,
        phone: values.phone,
        address: values.address
      };

      // 调用注册API
      await signUp(values.email, values.password, userData);

      message.success('注册成功，请登录');
      navigate('/login');
    } catch (error) {
      message.error('注册失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card>
        <Title level={3} className="login-title">注册新账号</Title>

        <Form
          form={form}
          name="register"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="邮箱"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="fullName"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="姓名"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="phone"
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="联系电话（选填）"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="address"
          >
            <Input
              prefix={<HomeOutlined />}
              placeholder="地址（选填）"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="确认密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              注册
            </Button>
          </Form.Item>
        </Form>

        <Divider>
          <span style={{ color: '#999', fontSize: '14px' }}>已有账号?</span>
        </Divider>

        <Link to="/login">
          <Button block size="large">
            返回登录
          </Button>
        </Link>
      </Card>
    </div>
  );
};

export default Register;