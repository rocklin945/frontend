import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Spin, Empty, Typography, Collapse, List, Card, Tooltip, Badge, Row, Col, Modal, message, Popconfirm } from 'antd';
import { ShoppingOutlined, FileTextOutlined, InboxOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getOrders, updateOrderStatus } from '../../api/orders';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const StoreOrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      // 获取当前用户的订单
      const data = await getOrders({ user_id: user.id });
      setOrders(data);
    } catch (error) {
      console.error('获取订单失败:', error);
      message.error('获取订单失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 取消订单
  const cancelOrder = async (orderId) => {
    try {
      setLoading(true);
      await updateOrderStatus(orderId, 'cancelled');
      message.success('订单已取消');
      // 刷新订单列表
      fetchUserOrders();
    } catch (error) {
      console.error('取消订单失败:', error);
      message.error('取消订单失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': '待处理',
      'processing': '处理中',
      'completed': '已完成',
      'cancelled': '已取消'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'pending': 'gold',
      'processing': 'blue',
      'completed': 'green',
      'cancelled': 'red'
    };
    return colorMap[status] || 'default';
  };

  const expandedRowRender = (order) => (
    <Card bordered={false} style={{ background: '#f9f9f9', borderRadius: '8px' }}>
      <Collapse bordered={false} defaultActiveKey={["1"]}>
        <Panel
          header={<Title level={5}>订单详情</Title>}
          key="1"
          style={{ background: '#f9f9f9', border: 'none' }}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Card type="inner" title="收货信息" style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>收货地址：</Text> {order.shipping_address || '未设置'}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>联系电话：</Text> {order.contact_phone || '未设置'}
                </div>
                <div>
                  <Text strong>创建时间：</Text> {new Date(order.created_at).toLocaleString()}
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card type="inner" title="订单状态信息" style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>订单编号：</Text> {order.id}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>订单状态：</Text>
                  <Tag color={getStatusColor(order.status)} style={{ marginLeft: 8 }}>
                    {getStatusText(order.status)}
                  </Tag>
                </div>
                <div>
                  <Text strong>订单金额：</Text>
                  <Text style={{ color: '#ff4d4f', fontWeight: 'bold', marginLeft: 8 }}>
                    ¥{parseFloat(order.total_amount).toFixed(2)}
                  </Text>
                </div>
                {(order.status === 'pending' || order.status === 'processing') && (
                  <div style={{ marginTop: 16 }}>
                    <Popconfirm
                      title="确认取消订单"
                      description="您确定要取消此订单吗？此操作无法撤销。"
                      onConfirm={() => cancelOrder(order.id)}
                      okText="确认"
                      cancelText="取消"
                    >
                      <Button danger icon={<CloseCircleOutlined />}>取消订单</Button>
                    </Popconfirm>
                  </div>
                )}
              </Card>
            </Col>
          </Row>

          <Card type="inner" title="订单商品" style={{ marginTop: 16 }}>
            <List
              itemLayout="horizontal"
              dataSource={order.order_items || []}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={item.products?.image_url ?
                      <img src={item.products.image_url} alt={item.products?.name} style={{ width: 50, height: 50, objectFit: 'cover' }} /> : null
                    }
                    title={item.products?.name || `商品 ${item.product_id}`}
                    description={`单价: ¥${parseFloat(item.unit_price).toFixed(2)} × ${item.quantity}件`}
                  />
                  <div style={{ fontWeight: 'bold' }}>
                    小计: ¥{(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Panel>
      </Collapse>
    </Card>
  );

  const columns = [
    {
      title: '订单编号',
      dataIndex: 'id',
      key: 'id',
      render: id => (
        <Tooltip title={id}>
          <span>{id.slice(0, 8)}...</span>
        </Tooltip>
      ),
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      filters: [
        { text: '待处理', value: 'pending' },
        { text: '处理中', value: 'processing' },
        { text: '已完成', value: 'completed' },
        { text: '已取消', value: 'cancelled' }
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '商品数量',
      key: 'item_count',
      render: (_, record) => {
        const itemCount = record.order_items?.length || 0;
        return <Badge count={itemCount} showZero style={{ backgroundColor: itemCount > 0 ? '#1890ff' : '#d9d9d9' }} />;
      },
    },
    {
      title: '订单金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: amount => <Text strong style={{ color: '#ff4d4f' }}>¥{parseFloat(amount).toFixed(2)}</Text>,
      sorter: (a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: date => new Date(date).toLocaleString(),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      defaultSortOrder: 'descend',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {(record.status === 'pending' || record.status === 'processing') && (
            <Popconfirm
              title="确认取消订单"
              description="您确定要取消此订单吗？此操作无法撤销。"
              onConfirm={() => cancelOrder(record.id)}
              okText="确认"
              cancelText="取消"
            >
              <Button type="link" danger icon={<CloseCircleOutlined />}>取消</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    }
  ];

  return (
    <div className="store-orders-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>
          <FileTextOutlined /> 我的订单
        </Title>
        <Button onClick={fetchUserOrders} icon={<InboxOutlined />}>
          刷新订单
        </Button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
          <Spin size="large" />
        </div>
      ) : orders.length === 0 ? (
        <Empty
          description="您还没有订单"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Space direction="vertical" align="center">
            <Text type="secondary">开始购物并创建您的第一个订单</Text>
            <Button type="primary" icon={<ShoppingOutlined />} onClick={() => navigate('/store/products')}>
              去购物
            </Button>
          </Space>
        </Empty>
      ) : (
        <Card>
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            expandable={{
              expandedRowRender,
              expandRowByClick: true,
            }}
            pagination={{
              pageSize: 5,
              showTotal: (total) => `共 ${total} 条订单`
            }}
          />
        </Card>
      )}

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Button
          type="primary"
          icon={<ShoppingOutlined />}
          onClick={() => navigate('/store/products')}
        >
          继续购物
        </Button>
      </div>
    </div>
  );
};

export default StoreOrdersPage;