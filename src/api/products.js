import { supabase } from './supabase';

// 获取所有产品
export const getProducts = async (params = {}) => {
  let query = supabase
    .from('products')
    .select(`
      *,
      categories(id, name),
      inventory(quantity)
    `);

  // 添加筛选
  if (params.category_id) {
    query = query.eq('category_id', params.category_id);
  }

  if (params.is_active !== undefined) {
    query = query.eq('is_active', params.is_active);
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

// 获取单个产品
export const getProductById = async (id) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories(id, name),
      inventory(quantity)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// 创建新产品
export const createProduct = async (productData) => {
  // 1. 创建产品记录
  const { data: product, error } = await supabase
    .from('products')
    .insert([{
      name: productData.name,
      description: productData.description,
      price: productData.price,
      category_id: productData.category_id,
      image_url: productData.image_url,
      is_active: productData.is_active
    }])
    .select();

  if (error) throw error;

  // 2. 如果有库存数据，创建库存记录
  if (productData.quantity !== undefined) {
    const { error: inventoryError } = await supabase
      .from('inventory')
      .insert([{
        product_id: product[0].id,
        quantity: productData.quantity
      }]);

    if (inventoryError) throw inventoryError;
  }

  return product[0];
};

// 更新产品
export const updateProduct = async (id, productData) => {
  // 1. 更新产品记录
  const { data: product, error } = await supabase
    .from('products')
    .update({
      name: productData.name,
      description: productData.description,
      price: productData.price,
      category_id: productData.category_id,
      image_url: productData.image_url,
      is_active: productData.is_active
    })
    .eq('id', id)
    .select();

  if (error) throw error;

  // 2. 如果有库存数据，更新库存
  if (productData.quantity !== undefined) {
    // 检查是否已存在库存记录
    const { data: inventoryData, error: checkError } = await supabase
      .from('inventory')
      .select('*')
      .eq('product_id', id);

    if (checkError) throw checkError;

    if (inventoryData && inventoryData.length > 0) {
      // 更新现有库存
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ quantity: productData.quantity })
        .eq('product_id', id);

      if (updateError) throw updateError;
    } else {
      // 创建新库存记录
      const { error: insertError } = await supabase
        .from('inventory')
        .insert([{ product_id: id, quantity: productData.quantity }]);

      if (insertError) throw insertError;
    }
  }

  return product[0];
};

// 删除产品
export const deleteProduct = async (id) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};