import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAdmin } = useAuth();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const currentUser = await login(values.email, values.password);

      // 直接使用登录返回的完整用户信息
      console.log('登录成功，用户信息:', currentUser);

      // 使用currentUser的profile信息判断角色
      if (currentUser?.profile?.role === 'admin') {
        console.log('检测到管理员角色，跳转到后台');
        navigate('/dashboard');
      } else {
        console.log('检测到普通用户角色，跳转到前台');
        navigate('/store/products');
      }
    } catch (error) {
      message.error('登录失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card>
        <Title level={3} className="login-title">后台管理系统</Title>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: '请输入邮箱' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="邮箱"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
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
              登录
            </Button>
          </Form.Item>
        </Form>

        <Divider>
          <span style={{ color: '#999', fontSize: '14px' }}>还没有账号?</span>
        </Divider>

        <Link to="/register">
          <Button block size="large">
            注册新账号
          </Button>
        </Link>
      </Card>
    </div>
  );
};

export default Login;