import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Descriptions, Table, Button, Tag, Space,
  Divider, Statistic, Row, Col, message, Spin,
  Timeline
} from 'antd';
import {
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { getOrderById, updateOrderStatus } from '../../api/orders';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await getOrderById(id);
      setOrder(data);
    } catch (error) {
      message.error('获取订单详情失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      setLoading(true);
      await updateOrderStatus(id, status);
      message.success(`订单状态已更新为${getStatusText(status)}`);
      fetchOrder();
    } catch (error) {
      message.error('更新订单状态失败: ' + error.message);
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

  const getStatusIcon = (status) => {
    const iconMap = {
      'pending': <ShoppingCartOutlined />,
      'processing': <SyncOutlined spin />,
      'completed': <CheckCircleOutlined />,
      'cancelled': <CloseCircleOutlined />
    };
    return iconMap[status] || null;
  };

  const columns = [
    {
      title: '产品',
      dataIndex: ['products', 'name'],
      key: 'product',
    },
    {
      title: '单价',
      dataIndex: 'unit_price',
      key: 'unit_price',
      render: price => `¥${parseFloat(price).toFixed(2)}`,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: '小计',
      key: 'subtotal',
      render: (_, record) => {
        const subtotal = parseFloat(record.unit_price) * record.quantity;
        return `¥${subtotal.toFixed(2)}`;
      },
    },
  ];

  if (loading && !order) {
    return <Spin size="large" />;
  }

  if (!order) {
    return (
      <Card>
        <div>订单不存在或已被删除</div>
        <Button type="primary" onClick={() => navigate('/orders')}>返回订单列表</Button>
      </Card>
    );
  }

  console.log('Order items:', order.order_items);

  return (
    <Card
      title="订单详情"
      extra={
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/orders')}>
          返回列表
        </Button>
      }
    >
      <Row gutter={16}>
        <Col span={16}>
          <Descriptions bordered>
            <Descriptions.Item label="订单ID" span={3}>
              {order.id}
            </Descriptions.Item>
            <Descriptions.Item label="客户ID" span={3}>
              {order.user_id || '未知用户'}
            </Descriptions.Item>
            <Descriptions.Item label="联系电话" span={3}>
              {order.contact_phone || '未设置电话'}
            </Descriptions.Item>
            <Descriptions.Item label="收货地址" span={3}>
              {order.shipping_address || '未设置地址'}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间" span={3}>
              {new Date(order.created_at).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="订单状态" span={3}>
              <Tag color={getStatusColor(order.status)} icon={getStatusIcon(order.status)}>
                {getStatusText(order.status)}
              </Tag>
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Table
            columns={columns}
            dataSource={order.order_items}
            rowKey="id"
            pagination={false}
          />
        </Col>

        <Col span={8}>
          <Card title="订单摘要" bordered>
            <Statistic
              title="订单总金额"
              value={parseFloat(order.total_amount).toFixed(2)}
              precision={2}
              prefix="¥"
              style={{ marginBottom: 16 }}
            />

            <Divider />

            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                block
                disabled={order.status !== 'pending'}
                onClick={() => handleStatusChange('processing')}
              >
                开始处理订单
              </Button>
              <Button
                type="primary"
                block
                disabled={order.status !== 'processing'}
                onClick={() => handleStatusChange('completed')}
              >
                完成订单
              </Button>
              <Button
                danger
                block
                disabled={order.status === 'completed' || order.status === 'cancelled'}
                onClick={() => handleStatusChange('cancelled')}
              >
                取消订单
              </Button>
            </Space>

            <Divider />

            <Timeline>
              <Timeline.Item color="green">订单创建 ({new Date(order.created_at).toLocaleString()})</Timeline.Item>
              {order.status !== 'pending' && (
                <Timeline.Item color={order.status === 'cancelled' ? 'red' : 'blue'}>
                  {order.status === 'processing' ? '开始处理' :
                   order.status === 'completed' ? '订单完成' : '订单取消'}
                </Timeline.Item>
              )}
            </Timeline>
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default OrderDetail;