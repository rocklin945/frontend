import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Spin, Result, Button } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from './Layout/MainLayout';

/**
 * 管理员路由守卫
 * 仅允许管理员角色访问，其他角色将被重定向到前台页面
 */
const AdminRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 如果用户不是管理员，显示无权限页面，提供前往前台页面的链接
  if (!isAdmin) {
    return (
      <Result
        status="403"
        title="没有权限"
        subTitle="抱歉，您没有访问后台管理系统的权限。"
        extra={
          <Button type="primary" onClick={() => window.location.href = '/store/products'}>
            前往前台页面
          </Button>
        }
      />
    );
  }

  // 用户已登录且是管理员，渲染后台布局和内容
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

export default AdminRoute;