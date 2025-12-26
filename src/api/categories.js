import { supabase } from './supabase';

// 获取所有产品分类
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
};

// 获取单个产品分类
export const getCategoryById = async (id) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// 创建新分类
export const createCategory = async (categoryData) => {
  const { data, error } = await supabase
    .from('categories')
    .insert([categoryData])
    .select();

  if (error) throw error;
  return data[0];
};

// 更新分类
export const updateCategory = async (id, categoryData) => {
  const { data, error } = await supabase
    .from('categories')
    .update(categoryData)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data[0];
};

// 删除分类
export const deleteCategory = async (id) => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};