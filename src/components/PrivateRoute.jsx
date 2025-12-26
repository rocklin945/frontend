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

  return isAuthenticated ? (
    <StoreFrontLayout>
      <Outlet />
    </StoreFrontLayout>
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default PrivateRoute;