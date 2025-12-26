import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Spin, Alert } from 'antd';
import { ShoppingOutlined, FileTextOutlined, UserOutlined, ShopOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getProducts } from '../api/products';
import { getOrders } from '../api/orders';
import { getUsers } from '../api/users';
import { getLowStockProducts } from '../api/inventory';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    productCount: 0,
    orderCount: 0,
    userCount: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log("开始获取Dashboard数据...");

        // 获取产品数据
        console.log("获取产品数据...");
        const products = await getProducts();
        console.log("产品数据:", products);

        // 获取订单数据
        console.log("获取订单数据...");
        const orders = await getOrders();
        console.log("订单数据:", orders);

        // 获取用户数据
        console.log("获取用户数据...");
        const users = await getUsers();
        console.log("用户数据:", users);

        // 获取库存不足的产品
        console.log("获取库存不足产品...");
        const lowStock = await getLowStockProducts(10);
        console.log("库存不足产品:", lowStock);

        // 计算统计数据
        const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

        // 准备图表数据 - 根据分类统计产品数量
        const categoryMap = {};
        products.forEach(product => {
          const categoryName = product.categories?.name || '未分类';
          categoryMap[categoryName] = (categoryMap[categoryName] || 0) + 1;
        });

        const chartData = Object.keys(categoryMap).map(category => ({
          name: category,
          count: categoryMap[category]
        }));

        // 更新状态
        setStats({
          productCount: products.length,
          orderCount: orders.length,
          userCount: users.length,
          totalRevenue: totalRevenue.toFixed(2)
        });

        setRecentOrders(orders.slice(0, 5));
        setLowStockProducts(lowStock);
        setSalesData(chartData);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(`获取数据失败: ${error.message}. 请刷新页面重试`);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const orderColumns = [
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
      render: (user_id) => user_id ? user_id.slice(0, 8) + '...' : '未知用户',
    },
    {
      title: '金额',
      dataIndex: 'total_amount',
      key: 'amount',
      render: amount => `¥${parseFloat(amount).toFixed(2)}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        const statusMap = {
          'pending': { text: '待处理', color: '#faad14' },
          'processing': { text: '处理中', color: '#1890ff' },
          'completed': { text: '已完成', color: '#52c41a' },
          'cancelled': { text: '已取消', color: '#f5222d' }
        };

        const { text, color } = statusMap[status] || { text: status, color: '#000' };
        return <span style={{ color }}>{text}</span>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: date => new Date(date).toLocaleString(),
    }
  ];

  const lowStockColumns = [
    {
      title: '产品名称',
      dataIndex: ['products', 'name'],
      key: 'name',
    },
    {
      title: '分类',
      dataIndex: ['products', 'categories', 'name'],
      key: 'category',
      render: name => name || '未分类',
    },
    {
      title: '库存数量',
      dataIndex: 'quantity',
      key: 'quantity',
    }
  ];

  if (loading) {
    return <Spin size="large" />;
  }

  if (error) {
    return <Alert message="错误" description={error} type="error" />;
  }

  return (
    <div>
      <h2>控制面板</h2>

      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="产品总数"
              value={stats.productCount}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="订单总数"
              value={stats.orderCount}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="用户总数"
              value={stats.userCount}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总收入"
              value={stats.totalRevenue}
              prefix="¥"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="最近订单">
            <Table
              dataSource={recentOrders}
              columns={orderColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="库存不足商品">
            <Table
              dataSource={lowStockProducts}
              columns={lowStockColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="产品分类统计">
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1890ff" name="产品数量" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;