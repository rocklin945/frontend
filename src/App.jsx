import React from 'react';
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

// 根路径重定向组件 - 单独创建为独立组件
const RootRedirect = () => {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const navigate = useNavigate();

  console.log('RootRedirect - 权限状态:', {
    isAuthenticated,
    isAdmin,
    userRole: user?.profile?.role,
    path: '/'
  });

  // 使用React的useEffect进行重定向处理
  React.useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        console.log('Root: 检测到管理员角色，跳转到后台');
        navigate('/dashboard');
      } else {
        console.log('Root: 检测到普通用户角色，跳转到前台');
        navigate('/store/products');
      }
    } else {
      console.log('Root: 未登录用户，跳转到登录页');
      navigate('/login');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // 返回一个加载指示器，防止闪烁
  return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size="large" />
  </div>;
};

// App组件
const App = () => {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  console.log("App render - Auth state:", {
    isAuthenticated,
    isAdmin,
    userRole: user?.profile?.role,
    loading,
    path: location.pathname
  });

  // 处理认证状态下的特定页面重定向
  React.useEffect(() => {
    // 只处理登录和注册页面的自动重定向
    // 如果用户已经登录，但是访问登录或注册页面
    if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
      // 如果是管理员，重定向到后台仪表盘
      if (isAdmin) {
        navigate('/dashboard');
      } else {
        // 如果是普通用户，重定向到前台商店
        navigate('/store/products');
      }
    }
  }, [isAuthenticated, isAdmin, location.pathname, navigate]);

  // 显示加载状态
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spin size="large" />
    </div>;
  }

  // 渲染路由
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

      {/* 根路径重定向 */}
      <Route path="/" element={<RootRedirect />} />
    </Routes>
  );
};

export default App;