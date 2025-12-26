import React, { useState, useEffect } from 'react';
import { Table, Space, Button, Card, Select, DatePicker, Input, message, Tag, Popconfirm } from 'antd';
import { SearchOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getOrders, deleteOrder, updateOrderStatus } from '../../api/orders';

const { Option } = Select;
const { RangePicker } = DatePicker;

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateRange: null
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      message.error('获取订单列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteOrder(id);
      message.success('订单删除成功');
      fetchOrders();
    } catch (error) {
      message.error('删除订单失败: ' + error.message);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      message.success('订单状态更新成功');
      fetchOrders();
    } catch (error) {
      message.error('更新订单状态失败: ' + error.message);
    }
  };

  const handleSearchChange = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleStatusFilter = (value) => {
    setFilters(prev => ({ ...prev, status: value }));
  };

  const handleDateRangeChange = (dates) => {
    setFilters(prev => ({ ...prev, dateRange: dates }));
  };

  // 应用过滤条件
  const filteredOrders = orders.filter(order => {
    // 关键字搜索 - 订单ID或客户ID
    const searchMatch = !filters.search ||
      order.id.toLowerCase().includes(filters.search.toLowerCase()) ||
      (order.user_id && order.user_id.toLowerCase().includes(filters.search.toLowerCase()));

    // 状态过滤
    const statusMatch = !filters.status || order.status === filters.status;

    // 日期范围过滤
    let dateMatch = true;
    if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
      const orderDate = new Date(order.created_at);
      const startDate = new Date(filters.dateRange[0]);
      const endDate = new Date(filters.dateRange[1]);
      endDate.setHours(23, 59, 59, 999); // 设置为当天结束时间

      dateMatch = orderDate >= startDate && orderDate <= endDate;
    }

    return searchMatch && statusMatch && dateMatch;
  });

  const columns = [
    {
      title: '订单ID',
      dataIndex: 'id',
      key: 'id',
      render: id => id.slice(0, 8) + '...',
    },
    {
      title: '客户',
      dataIndex: 'user_id',
      key: 'customer',
      render: (user_id) => user_id ? `用户 ${user_id.slice(0, 8)}...` : '未知用户',
    },
    {
      title: '订单金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: amount => `¥${parseFloat(amount).toFixed(2)}`,
      sorter: (a, b) => a.total_amount - b.total_amount,
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        const statusConfig = {
          'pending': { color: 'gold', text: '待处理' },
          'processing': { color: 'blue', text: '处理中' },
          'completed': { color: 'green', text: '已完成' },
          'cancelled': { color: 'red', text: '已取消' }
        };

        const { color, text } = statusConfig[status] || { color: 'default', text: status };

        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: date => new Date(date).toLocaleString(),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => navigate(`/orders/${record.id}`)}
          />
          <Select
            defaultValue={record.status}
            style={{ width: 110 }}
            onChange={value => handleStatusChange(record.id, value)}
            size="small"
          >
            <Option value="pending">待处理</Option>
            <Option value="processing">处理中</Option>
            <Option value="completed">已完成</Option>
            <Option value="cancelled">已取消</Option>
          </Select>
          <Popconfirm
            title="确定要删除此订单吗?"
            onConfirm={() => handleDelete(record.id)}
            okText="是"
            cancelText="否"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card title="订单管理">
      <div className="list-header">
        <Space wrap>
          <Input
            placeholder="搜索订单ID/客户"
            prefix={<SearchOutlined />}
            allowClear
            onChange={e => handleSearchChange(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            placeholder="订单状态"
            style={{ width: 150 }}
            allowClear
            onChange={handleStatusFilter}
          >
            <Option value="pending">待处理</Option>
            <Option value="processing">处理中</Option>
            <Option value="completed">已完成</Option>
            <Option value="cancelled">已取消</Option>
          </Select>
          <RangePicker
            placeholder={['开始日期', '结束日期']}
            onChange={handleDateRangeChange}
          />
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredOrders}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

export default OrderList;