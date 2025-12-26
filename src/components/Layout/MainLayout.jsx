import React, { useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, Button } from 'antd';
import {
  HomeOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  ShopOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const { Header, Sider, Content } = Layout;

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link to="/profile">个人信息</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div className="logo">
          {collapsed ? 'MS' : '管理系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultSelectedKeys={['/dashboard']}
        >
          <Menu.Item key="/dashboard" icon={<HomeOutlined />}>
            <Link to="/dashboard">控制面板</Link>
          </Menu.Item>
          <Menu.Item key="/products" icon={<ShoppingOutlined />}>
            <Link to="/products">产品管理</Link>
          </Menu.Item>
          <Menu.Item key="/categories" icon={<AppstoreOutlined />}>
            <Link to="/categories">分类管理</Link>
          </Menu.Item>
          <Menu.Item key="/orders" icon={<FileTextOutlined />}>
            <Link to="/orders">订单管理</Link>
          </Menu.Item>
          <Menu.Item key="/inventory" icon={<ShopOutlined />}>
            <Link to="/inventory">库存管理</Link>
          </Menu.Item>
          {isAdmin && (
            <Menu.Item key="/users" icon={<UserOutlined />}>
              <Link to="/users">用户管理</Link>
            </Menu.Item>
          )}
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <Dropdown overlay={userMenu} placement="bottomRight">
            <div style={{ cursor: 'pointer' }}>
              <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
              <span style={{ marginLeft: 8 }}>
                {user?.profile?.full_name || user?.email || '用户'}
              </span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;