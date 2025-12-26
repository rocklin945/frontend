import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, signIn, signOut, signUp } from '../api/auth';
import { message } from 'antd';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const { user: authUser } = await signIn(email, password);

      // 获取用户profile数据
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      message.success('登录成功');
      return currentUser; // 返回完整的用户信息，包含profile
    } catch (error) {
      message.error(error.message || '登录失败');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut();
      setUser(null);
      message.success('已退出登录');
    } catch (error) {
      message.error(error.message || '退出失败');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.profile?.role === 'admin',
    isStaff: user?.profile?.role === 'staff'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};