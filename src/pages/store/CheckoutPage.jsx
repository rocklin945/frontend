import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Steps, Row, Col, List, Divider, Typography, message, Spin, Result } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createOrder } from '../../api/orders';

const { Step } = Steps;
const { Title, Text } = Typography;
const { TextArea } = Input;

const CheckoutPage = () => {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // 使用一个ref来跟踪是否已经初始化
  const initializedRef = React.useRef(false);

  // 直接使用初始数据，不依赖状态更新
  const cartDataRef = React.useRef(
    location.state?.cartItems ||
    JSON.parse(localStorage.getItem('cart') || '[]')
  );

  // 检查购物车数据是否有效
  const hasItems = cartDataRef.current.length > 0;

  // 组件挂载时的一次性初始化
  useEffect(() => {
    console.log('CheckoutPage 初始化');

    if (!initializedRef.current) {
      initializedRef.current = true;

      console.log('初始购物车数据:', cartDataRef.current);

      // 同步到state和localStorage
      setCartItems(cartDataRef.current);
      localStorage.setItem('cart', JSON.stringify(cartDataRef.current));

      // 如果购物车为空，重定向
      if (cartDataRef.current.length === 0) {
        console.log('购物车为空，重定向到购物车页面');
        message.warning('购物车为空，请先添加商品');
        navigate('/store/cart');
        return;
      }

      // 如果有用户资料，填充表单
      if (user?.profile) {
        form.setFieldsValue({
          full_name: user.profile.full_name || '',
          phone: user.profile.phone || '',
          address: user.profile.address || ''
        });
      }
    }
  }, []);

  // 监听购物车状态变化的调试日志
  useEffect(() => {
    console.log('购物车状态变化，当前数据:', cartItems);
  }, [cartItems]);

  const loadCartFromStorage = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        console.log('从localStorage加载购物车数据:', parsedCart);

        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          setCartItems(parsedCart);
          return true;
        } else {
          console.warn('购物车为空或数据格式不正确');
          return false;
        }
      } else {
        console.warn('localStorage中没有购物车数据');
        return false;
      }
    } catch (error) {
      console.error('加载购物车数据出错:', error);
      return false;
    }
  };

  // 更新购物车
  const updateCartItems = (items) => {
    setCartItems(items);
    // 触发购物车更新事件
    window.dispatchEvent(new Event('cart-updated'));
  };

  // 计算总金额
  const calculateTotal = () => {
    // 优先使用ref数据而不是state
    const cartData = cartDataRef.current.length > 0 ?
      cartDataRef.current :
      cartItems;

    return cartData.reduce((sum, item) => {
      return sum + parseFloat(item.price) * item.quantity;
    }, 0).toFixed(2);
  };

  // 检查购物车是否为空
  const validateCartItems = () => {
    // 同时检查ref和状态，以防万一
    const hasItemsInRef = cartDataRef.current.length > 0;
    const hasItemsInState = cartItems.length > 0;

    console.log('验证购物车:', {
      hasItemsInRef,
      hasItemsInState,
      refData: cartDataRef.current,
      stateData: cartItems
    });

    if (!hasItemsInRef && !hasItemsInState) {
      message.error('购物车为空，请先添加商品');
      navigate('/store/cart');
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      try {
        // 验证表单
        await form.validateFields();

        // 验证购物车不为空
        if (!validateCartItems()) return;

        setCurrentStep(1);
      } catch (error) {
        console.error('表单验证失败:', error);
      }
    } else if (currentStep === 1) {
      // 提交订单
      await handleSubmitOrder();
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmitOrder = async () => {
    // 再次检查购物车
    if (!validateCartItems()) return;

    try {
      setLoading(true);
      const formValues = form.getFieldsValue();

      // 使用ref数据而不是state
      const cartData = cartDataRef.current.length > 0 ?
        cartDataRef.current :
        cartItems;

      console.log("提交订单 - 购物车数据:", cartData);

      // 构建订单数据
      const orderItems = cartData.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price
      }));

      console.log("订单项数据:", orderItems);

      const orderData = {
        user_id: user.id,
        total_amount: calculateTotal(), // 这个函数可能需要更新
        shipping_address: formValues.address,
        contact_phone: formValues.phone,
        items: orderItems
      };

      console.log("订单数据:", orderData);

      // 创建订单
      const order = await createOrder(orderData);
      console.log("订单创建成功:", order);
      setOrderId(order.id);

      // 清空购物车
      localStorage.setItem('cart', JSON.stringify([]));
      sessionStorage.setItem('cart', JSON.stringify([]));
      cartDataRef.current = [];
      setCartItems([]);

      // 显示成功界面
      setOrderSuccess(true);
      setCurrentStep(2);

    } catch (error) {
      console.error('创建订单失败详情:', error);
      let errorMessage = '创建订单失败';

      if (error.message) {
        errorMessage += ': ' + error.message;
      }

      if (error.details) {
        errorMessage += ' - ' + error.details;
      }

      if (error.hint) {
        errorMessage += ' [提示: ' + error.hint + ']';
      }

      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card title="收货信息">
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                full_name: '',
                phone: '',
                address: ''
              }}
            >
              <Form.Item
                name="full_name"
                label="收货人"
                rules={[{ required: true, message: '请输入收货人姓名' }]}
              >
                <Input placeholder="请输入收货人姓名" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="联系电话"
                rules={[{ required: true, message: '请输入联系电话' }]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>

              <Form.Item
                name="address"
                label="收货地址"
                rules={[{ required: true, message: '请输入收货地址' }]}
              >
                <TextArea rows={3} placeholder="请输入详细收货地址" />
              </Form.Item>
            </Form>
          </Card>
        );
      case 1:
        return (
          <Card title="订单确认">
            <Row gutter={16}>
              <Col span={16}>
                <Card type="inner" title="商品清单">
                  <List
                    itemLayout="horizontal"
                    dataSource={cartItems}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={item.image_url ? <img src={item.image_url} alt={item.name} style={{ width: 50, height: 50, objectFit: 'cover' }} /> : null}
                          title={item.name}
                          description={`¥${parseFloat(item.price).toFixed(2)} × ${item.quantity}`}
                        />
                        <div>¥{(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card type="inner" title="收货信息">
                  <p><strong>收货人：</strong> {form.getFieldValue('full_name')}</p>
                  <p><strong>联系电话：</strong> {form.getFieldValue('phone')}</p>
                  <p><strong>收货地址：</strong> {form.getFieldValue('address')}</p>
                </Card>
                <Card type="inner" title="订单摘要" style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>商品总计:</Text>
                    <Text strong>¥{calculateTotal()}</Text>
                  </div>
                  <Divider />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>订单总金额:</Text>
                    <Text strong style={{ fontSize: 18, color: '#ff4d4f' }}>¥{calculateTotal()}</Text>
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        );
      case 2:
        return (
          <Result
            status="success"
            title="订单创建成功！"
            subTitle={`订单号: ${orderId?.slice(0, 8)}... 您的订单已创建成功，我们将尽快为您发货。`}
            extra={[
              <Button type="primary" key="orders" onClick={() => navigate('/store/orders')}>
                查看我的订单
              </Button>,
              <Button key="buy" onClick={() => navigate('/store/products')}>
                继续购物
              </Button>,
            ]}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="checkout-page">
      <Title level={2}>订单结算</Title>

      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        <Step title="填写收货信息" />
        <Step title="确认订单" />
        <Step title="提交成功" />
      </Steps>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {renderStepContent()}

          <div style={{ marginTop: 24, textAlign: 'right' }}>
            {currentStep > 0 && currentStep < 2 && (
              <Button style={{ marginRight: 8 }} onClick={handleBack}>
                上一步
              </Button>
            )}
            {currentStep < 2 && (
              <Button
                type="primary"
                onClick={handleNext}
              >
                {currentStep === 0 ? '下一步' : '提交订单'}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CheckoutPage;