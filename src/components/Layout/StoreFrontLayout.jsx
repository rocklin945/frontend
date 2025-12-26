import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Button, Dropdown, Badge } from 'antd';
import { UserOutlined, ShoppingCartOutlined, ShopOutlined, OrderedListOutlined, LogoutOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const { Header, Content, Footer } = Layout;

const StoreFrontLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // 从本地存储获取购物车数量并监听变化
    const loadCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.length);
    };

    loadCartCount(); // 初始加载

    // 添加事件监听器监听storage变化
    window.addEventListener('storage', loadCartCount);

    // 监听购物车更新事件
    const handleCartUpdate = () => {
      loadCartCount();
    };

    window.addEventListener('cart-updated', handleCartUpdate);

    // 每次组件重新渲染时刷新购物车数量
    const intervalId = setInterval(loadCartCount, 2000);

    return () => {
      window.removeEventListener('storage', loadCartCount);
      window.removeEventListener('cart-updated', handleCartUpdate);
      clearInterval(intervalId);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link to="/profile">个人信息</Link>
      </Menu.Item>
      <Menu.Item key="orders" icon={<OrderedListOutlined />}>
        <Link to="/store/orders">我的订单</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout className="layout" style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="logo" style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
          <Link to="/store" style={{ color: 'white', textDecoration: 'none' }}>
            在线商城
          </Link>
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          style={{ flex: 1, marginLeft: '20px' }}
        >
          <Menu.Item key="/store/products" icon={<ShopOutlined />}>
            <Link to="/store/products">商品</Link>
          </Menu.Item>
        </Menu>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Badge count={cartCount}>
            <Button
              type="text"
              icon={<ShoppingCartOutlined style={{ fontSize: '1.5rem', color: 'white' }} />}
              onClick={() => navigate('/store/cart')}
              style={{ marginRight: '20px' }}
            />
          </Badge>
          <Dropdown overlay={userMenu} placement="bottomRight">
            <div style={{ cursor: 'pointer', color: 'white' }}>
              <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
              <span style={{ marginLeft: 8 }}>
                {user?.full_name || user?.email || '用户'}
              </span>
            </div>
          </Dropdown>
        </div>
      </Header>
      <Content style={{ padding: '0 50px', marginTop: 16 }}>
        <div className="site-layout-content" style={{ background: '#fff', padding: 24, minHeight: 280 }}>
          {children}
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        在线商城 ©{new Date().getFullYear()} 版权所有
      </Footer>
    </Layout>
  );
};

export default StoreFrontLayout;