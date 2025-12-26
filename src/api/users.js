import { supabase } from './supabase';

// 获取所有用户
export const getUsers = async (params = {}) => {
  let query = supabase
    .from('profiles')
    .select('*');

  // 添加筛选
  if (params.role) {
    query = query.eq('role', params.role);
  }

  if (params.search) {
    query = query.or(`full_name.ilike.%${params.search}%,phone.ilike.%${params.search}%`);
  }

  // 添加排序
  if (params.sort_by) {
    query = query.order(params.sort_by, { ascending: params.sort_asc !== false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

// 获取单个用户
export const getUserById = async (id) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// 更新用户角色
export const updateUserRole = async (id, role) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data[0];
};

// 获取用户统计信息
export const getUserStats = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('role, count')
    .group('role');

  if (error) throw error;
  return data;
};