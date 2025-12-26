import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import StoreFrontLayout from './Layout/StoreFrontLayout';

/**
 * 普通用户路由守卫
 * 仅验证用户是否已登录，使用StoreFrontLayout作为布局
 */
const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  // 如果用户未登录，重定向到登录页面
  if (!isAuthenticated) {
    console.log('用户未登录，从路径重定向到登录页面:', location.pathname);

    // 防止重定向循环
    if (location.pathname === '/login') {
      console.log('已经在登录页面，避免重定向循环');
      return null;
    }

    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 用户已登录，渲染前台布局和内容
  return (
    <StoreFrontLayout>
      <Outlet />
    </StoreFrontLayout>
  );
};

export default PrivateRoute;