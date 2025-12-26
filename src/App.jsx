import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from './contexts/AuthContext';
import MainLayout from './components/Layout/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// 产品管理
import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';

// 分类管理
import CategoryList from './pages/categories/CategoryList';

// 订单管理
import OrderList from './pages/orders/OrderList';
import OrderDetail from './pages/orders/OrderDetail';

// 库存管理
import InventoryList from './pages/inventory/InventoryList';

// 用户管理
import UserList from './pages/users/UserList';

// 路由配置
function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* 产品管理路由 */}
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/new" element={<ProductForm />} />
        <Route path="/products/edit/:id" element={<ProductForm />} />

        {/* 分类管理路由 */}
        <Route path="/categories" element={<CategoryList />} />

        {/* 订单管理路由 */}
        <Route path="/orders" element={<OrderList />} />
        <Route path="/orders/:id" element={<OrderDetail />} />

        {/* 库存管理路由 */}
        <Route path="/inventory" element={<InventoryList />} />

        {/* 用户管理路由 */}
        <Route path="/users" element={<UserList />} />

        <Route path="*" element={<div>页面不存在</div>} />
      </Route>
    </Routes>
  );
}

// 私有路由守卫
function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spin size="large" />
    </div>;
  }

  return isAuthenticated ? (
    <MainLayout>
      <Outlet />
    </MainLayout>
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
}

// 主App组件
function App() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  console.log("App render - Auth state:", { isAuthenticated, loading, path: location.pathname });

  useEffect(() => {
    // 如果用户已经登录，但是访问登录或注册页面，则重定向到仪表盘
    if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, location.pathname, navigate]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spin size="large" />
    </div>;
  }

  return <AppRoutes />;
}

export default App;