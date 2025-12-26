import { supabase } from './supabase';

// 用户登录
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
};

// 用户注册
export const signUp = async (email, password, userData) => {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: userData.fullName
      }
    }
  });

  if (authError) throw authError;
  return authData;
};

// 获取当前登录用户
export const getCurrentUser = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) throw error;
  if (!session) return null;

  // 获取用户的profile数据
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') throw profileError;

  return {
    ...session.user,
    profile
  };
};

// 用户登出
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return true;
};

// 更新用户信息
export const updateUserProfile = async (userId, userData) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(userData)
    .eq('id', userId)
    .select();

  if (error) throw error;
  return data;
};

// 重置密码
export const resetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
  return true;
};

// 密码更改
export const changePassword = async (newPassword) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) throw error;
  return true;
};