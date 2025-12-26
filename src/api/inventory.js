import { supabase } from './supabase';

// 获取所有库存
export const getInventory = async (params = {}) => {
  let query = supabase
    .from('inventory')
    .select(`
      *,
      products:product_id(
        id,
        name,
        image_url,
        category_id,
        is_active,
        categories:category_id(id, name)
      )
    `);

  // 添加筛选
  if (params.product_id) {
    query = query.eq('product_id', params.product_id);
  }

  if (params.category_id) {
    query = query.eq('products.category_id', params.category_id);
  }

  if (params.low_stock) {
    query = query.lte('quantity', params.low_stock);
  }

  // 添加排序
  if (params.sort_by) {
    query = query.order(params.sort_by, { ascending: params.sort_asc !== false });
  } else {
    query = query.order('updated_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

// 更新产品库存
export const updateInventory = async (product_id, quantity) => {
  const { data, error } = await supabase
    .from('inventory')
    .update({
      quantity,
      last_restock_date: new Date().toISOString()
    })
    .eq('product_id', product_id)
    .select();

  if (error) throw error;
  return data[0];
};

// 获取库存不足产品
export const getLowStockProducts = async (threshold = 10) => {
  const { data, error } = await supabase
    .from('inventory')
    .select(`
      *,
      products:product_id(
        id,
        name,
        image_url,
        category_id,
        categories:category_id(id, name)
      )
    `)
    .lte('quantity', threshold)
    .order('quantity');

  if (error) throw error;
  return data;
};