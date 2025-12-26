import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from './contexts/AuthContext';
import AdminRoute from './components/AdminRoute';
import PrivateRoute from './components/PrivateRoute';
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

// 前台页面
import StoreProductPage from './pages/store/StoreProductPage';
import CartPage from './pages/store/CartPage';
import CheckoutPage from './pages/store/CheckoutPage';
import StoreOrdersPage from './pages/store/StoreOrdersPage';

// 路由配置
function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 前台路由 - 所有已登录用户可访问 */}
      <Route element={<PrivateRoute />}>
        <Route path="/store" element={<Navigate to="/store/products" />} />
        <Route path="/store/products" element={<StoreProductPage />} />
        <Route path="/store/cart" element={<CartPage />} />
        <Route path="/store/checkout" element={<CheckoutPage />} />
        <Route path="/store/orders" element={<StoreOrdersPage />} />
      </Route>

      {/* 后台管理路由 - 只有管理员可访问 */}
      <Route element={<AdminRoute />}>
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

// 主App组件
function App() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  console.log("App render - Auth state:", { isAuthenticated, isAdmin, loading, path: location.pathname });

  useEffect(() => {
    // 如果用户已经登录，但是访问登录或注册页面
    if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
      // 如果是管理员，重定向到后台仪表盘
      if (isAdmin) {
        navigate('/dashboard');
      } else {
        // 如果是普通用户，重定向到前台商店
        navigate('/store');
      }
    }
  }, [isAuthenticated, isAdmin, location.pathname, navigate]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spin size="large" />
    </div>;
  }

  return <AppRoutes />;
}

export default App;