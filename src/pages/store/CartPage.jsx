import React, { useState, useEffect } from 'react';
import { Table, InputNumber, Button, Empty, Card, Space, Typography, Divider, message, Image, Tooltip, Skeleton } from 'antd';
import { ShoppingOutlined, DeleteOutlined, ArrowRightOutlined, PictureOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageLoadingStatus, setImageLoadingStatus] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    loadCartFromStorage();
  }, []);

  const loadCartFromStorage = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  };

  const saveCartToStorage = (cart) => {
    localStorage.setItem('cart', JSON.stringify(cart));
  };

  // 处理图片加载状态
  const handleImageLoadStart = (itemId) => {
    setImageLoadingStatus(prev => ({
      ...prev,
      [itemId]: 'loading'
    }));
  };

  const handleImageLoaded = (itemId) => {
    setImageLoadingStatus(prev => ({
      ...prev,
      [itemId]: 'loaded'
    }));
  };

  const handleImageError = (itemId) => {
    setImageLoadingStatus(prev => ({
      ...prev,
      [itemId]: 'error'
    }));
  };

  // 渲染商品图片
  const renderProductImage = (record) => {
    const isLoading = imageLoadingStatus[record.id] === 'loading';
    const hasError = imageLoadingStatus[record.id] === 'error';

    // 如果没有图片URL或加载出错，显示占位图标
    if (!record.image_url || hasError) {
      return (
        <div style={{
          width: 64,
          height: 64,
          background: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px'
        }}>
          <PictureOutlined style={{ fontSize: 24, color: '#999' }} />
        </div>
      );
    }

    return (
      <div style={{ position: 'relative', width: 64, height: 64 }}>
        {isLoading && (
          <Skeleton.Image
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 64,
              height: 64
            }}
            active
          />
        )}
        <Image
          src={record.image_url}
          alt={record.name}
          style={{
            width: 64,
            height: 64,
            objectFit: 'cover',
            borderRadius: '4px',
            display: isLoading ? 'none' : 'block'
          }}
          preview={{
            mask: <div>查看大图</div>
          }}
          onLoad={() => handleImageLoaded(record.id)}
          onError={() => handleImageError(record.id)}
          fallback="data:image/png;base64,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"
          onLoadStart={() => handleImageLoadStart(record.id)}
        />
      </div>
    );
  };

  // 更新购物车并发布更新事件
  const updateCart = (newCart) => {
    setCartItems(newCart);
    saveCartToStorage(newCart);
    // 发布购物车更新事件
    window.dispatchEvent(new Event('cart-updated'));
  };

  const updateQuantity = (record, quantity) => {
    if (quantity < 1) return;

    const newCart = cartItems.map(item =>
      item.id === record.id ? { ...item, quantity } : item
    );

    updateCart(newCart);
  };

  const removeItem = (itemId) => {
    const newCart = cartItems.filter(item => item.id !== itemId);
    updateCart(newCart);
    message.success('已从购物车移除商品');
  };

  const clearCart = () => {
    updateCart([]);
    message.success('购物车已清空');
  };

  const handleCheckout = () => {
    // 重新从localStorage加载购物车数据，确保数据最新
    const savedCart = localStorage.getItem('cart');
    const currentCart = savedCart ? JSON.parse(savedCart) : [];

    if (currentCart.length === 0) {
      message.warning('购物车为空，无法结账');
      return;
    }

    // 先强制保存一次购物车数据到localStorage
    localStorage.setItem('cart', JSON.stringify(currentCart));
    console.log('跳转到结账页面，购物车数据:', currentCart);

    // 直接在state中携带购物车数据
    navigate('/store/checkout', {
      state: { cartItems: currentCart, timestamp: new Date().getTime() }
    });
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      return sum + parseFloat(item.price) * item.quantity;
    }, 0).toFixed(2);
  };

  const columns = [
    {
      title: '商品',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space align="center" size="middle">
          {renderProductImage(record)}
          <Space direction="vertical" size={0}>
            <Text strong>{text}</Text>
            {record.category && <Tag color="blue">{record.category}</Tag>}
          </Space>
        </Space>
      ),
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      render: price => <Text style={{ color: '#ff4d4f' }}>¥{parseFloat(price).toFixed(2)}</Text>,
    },
    {
      title: '数量',
      key: 'quantity',
      render: (_, record) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => updateQuantity(record, value)}
          addonBefore={
            <Button
              type="text"
              size="small"
              disabled={record.quantity <= 1}
              onClick={() => updateQuantity(record, Math.max(1, record.quantity - 1))}
            >
              -
            </Button>
          }
          addonAfter={
            <Button
              type="text"
              size="small"
              onClick={() => updateQuantity(record, record.quantity + 1)}
            >
              +
            </Button>
          }
        />
      ),
    },
    {
      title: '小计',
      key: 'subtotal',
      render: (_, record) => {
        const subtotal = parseFloat(record.price) * record.quantity;
        return <Text strong style={{ color: '#ff4d4f' }}>¥{subtotal.toFixed(2)}</Text>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(record.id)}
        >
          移除
        </Button>
      ),
    },
  ];

  return (
    <div className="cart-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>
          <ShoppingOutlined /> 购物车
        </Title>
        {cartItems.length > 0 && (
          <Text type="secondary">共 {cartItems.length} 种商品，{cartItems.reduce((sum, item) => sum + item.quantity, 0)} 件</Text>
        )}
      </div>

      {cartItems.length === 0 ? (
        <Card>
          <Empty
            description={
              <Space direction="vertical" align="center">
                <Text strong style={{ fontSize: 16 }}>购物车为空</Text>
                <Text type="secondary">快去选购喜欢的商品吧</Text>
              </Space>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              type="primary"
              size="large"
              icon={<ShoppingOutlined />}
              onClick={() => navigate('/store/products')}
            >
              去选购商品
            </Button>
          </Empty>
        </Card>
      ) : (
        <>
          <Card bordered={false}>
            <Table
              dataSource={cartItems}
              columns={columns}
              rowKey="id"
              pagination={false}
              loading={loading}
              rowClassName={() => 'cart-item-row'}
            />
          </Card>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
            <Card style={{ width: 360 }} bordered={false}>
              <Title level={4}>订单摘要</Title>
              <Divider />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>商品总计:</Text>
                <Text strong>¥{calculateTotal()}</Text>
              </div>
              <Divider />
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '16px 0' }}>
                <Text>订单总金额:</Text>
                <Text strong style={{ fontSize: 18, color: '#ff4d4f' }}>¥{calculateTotal()}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                <Button
                  danger
                  onClick={clearCart}
                  icon={<DeleteOutlined />}
                >
                  清空购物车
                </Button>
                <Button
                  type="primary"
                  icon={<ArrowRightOutlined />}
                  size="large"
                  onClick={handleCheckout}
                >
                  去结账
                </Button>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;