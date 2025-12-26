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
  const { isAuthenticated, isAdmin, loading, user } = useAuth();
  const location = useLocation();

  console.log('AdminRoute - 权限状态:', {
    isAuthenticated,
    isAdmin,
    userRole: user?.profile?.role,
    loading,
    path: location.pathname
  });

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

  // 如果用户不是管理员，重定向到前台页面
  if (!isAdmin) {
    const redirectPath = "/store/products";
    console.log(`用户不是管理员，重定向到: ${redirectPath}，当前路径: ${location.pathname}`);

    // 防止无限循环
    if (location.pathname === redirectPath) {
      console.log('已经在目标路径，避免重定向');
      return null; // 不执行重定向
    }

    return <Navigate to={redirectPath} replace state={{ fromAdmin: true }} />;
  }

  // 用户已登录且是管理员，渲染后台布局和内容
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

export default AdminRoute;