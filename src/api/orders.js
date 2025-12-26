import { supabase } from './supabase';

// 获取所有订单
export const getOrders = async (params = {}) => {
  let query = supabase
    .from('orders')
    .select(`
      *,
      order_items(
        id,
        quantity,
        unit_price,
        products:product_id(id, name)
      )
    `);

  // 添加筛选
  if (params.user_id) {
    query = query.eq('user_id', params.user_id);
  }

  if (params.status) {
    query = query.eq('status', params.status);
  }

  // 添加日期范围筛选
  if (params.start_date) {
    query = query.gte('created_at', params.start_date);
  }

  if (params.end_date) {
    query = query.lte('created_at', params.end_date);
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

// 获取单个订单详情
export const getOrderById = async (id) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(
        id,
        quantity,
        unit_price,
        products:product_id(id, name, image_url)
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// 创建新订单
export const createOrder = async (orderData) => {
  try {
    console.log("开始创建订单，数据:", orderData);

    // 1. 创建订单记录
    const { data: order, error } = await supabase
      .from('orders')
      .insert([{
        user_id: orderData.user_id,
        status: 'pending',
        total_amount: orderData.total_amount,
        shipping_address: orderData.shipping_address,
        contact_phone: orderData.contact_phone
      }])
      .select();

    if (error) {
      console.error("创建订单记录失败:", error);
      throw error;
    }

    console.log("创建订单成功:", order);

    // 2. 创建订单明细
    if (orderData.items && orderData.items.length > 0) {
      const orderItems = orderData.items.map(item => ({
        order_id: order[0].id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      }));

      console.log("准备创建订单项:", orderItems);

      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
        .select();

      if (itemsError) {
        console.error("创建订单项失败:", itemsError);
        // 如果订单项创建失败，删除已创建的订单
        await supabase.from('orders').delete().eq('id', order[0].id);
        throw itemsError;
      }

      console.log("创建订单项成功:", itemsData);

      // 3. 更新库存数量
      try {
        for (const item of orderData.items) {
          console.log("准备更新库存，商品ID:", item.product_id);

          const { data: inventoryData, error: invError } = await supabase
            .from('inventory')
            .select('quantity')
            .eq('product_id', item.product_id)
            .single();

          if (invError) {
            console.error("获取库存信息失败:", invError);
            throw invError;
          }

          console.log("当前库存:", inventoryData);
          const newQuantity = inventoryData.quantity - item.quantity;
          console.log("新库存数量:", newQuantity);

          const { data: updateData, error: updateError } = await supabase
            .from('inventory')
            .update({ quantity: newQuantity })
            .eq('product_id', item.product_id)
            .select();

          if (updateError) {
            console.error("更新库存失败:", updateError);
            throw updateError;
          }

          console.log("库存更新成功:", updateData);
        }
      } catch (invError) {
        console.error("库存更新过程中发生错误:", invError);
        // 如果库存更新失败，不回滚订单，但记录错误
        console.warn("库存更新失败，但订单仍然创建成功");
      }
    }

    return order[0];
  } catch (error) {
    console.error("创建订单过程中发生错误:", error);
    throw error;
  }
};

// 更新订单状态
export const updateOrderStatus = async (id, status) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data[0];
};

// 删除订单
export const deleteOrder = async (id) => {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};