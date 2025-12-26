import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Input, Select, Empty, message, Spin, Tag, Pagination } from 'antd';
import { SearchOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { getProducts } from '../../api/products';
import { getCategories } from '../../api/categories';

const { Option } = Select;
const { Meta } = Card;

const StoreProductPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [cart, setCart] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8; // 每页显示的商品数量

  useEffect(() => {
    // 从本地存储获取购物车数据
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    fetchProducts();
    fetchCategories();
  }, []);

  // 当购物车变化时，保存到本地存储
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // 只获取激活状态的商品
      const data = await getProducts({ is_active: true });
      setProducts(data);
    } catch (error) {
      message.error('获取商品列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      message.error('获取分类失败: ' + error.message);
    }
  };

  const addToCart = (product) => {
    // 检查商品是否已在购物车中
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      // 如果商品已在购物车中，增加数量
      const updatedCart = cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCart(updatedCart);
      message.success('已增加商品数量');
    } else {
      // 如果商品不在购物车中，添加新商品
      setCart([...cart, { ...product, quantity: 1 }]);
      message.success('已添加到购物车');
    }

    // 发布购物车更新事件
    window.dispatchEvent(new Event('cart-updated'));
  };

  // 过滤商品
  const filteredProducts = products.filter(product => {
    // 关键字搜索
    const searchMatch = !searchText ||
      product.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchText.toLowerCase()));

    // 分类过滤
    const categoryMatch = !categoryFilter || product.category_id === categoryFilter;

    return searchMatch && categoryMatch;
  });

  // 分页逻辑
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // 滚动到页面顶部
    window.scrollTo(0, 0);
  };

  return (
    <div className="store-products">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <Input
            placeholder="搜索商品"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 200, marginRight: 8 }}
          />
          <Select
            placeholder="选择分类"
            style={{ width: 150 }}
            value={categoryFilter}
            onChange={setCategoryFilter}
            allowClear
          >
            {categories.map(category => (
              <Option key={category.id} value={category.id}>{category.name}</Option>
            ))}
          </Select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <Spin size="large" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <Empty description="没有找到符合条件的商品" />
      ) : (
        <div>
          <Row gutter={[16, 16]}>
            {paginatedProducts.map(product => (
              <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                <Card
                  hoverable
                  cover={product.image_url ? <img alt={product.name} src={product.image_url} style={{ height: 200, objectFit: 'cover' }} /> : null}
                  actions={[
                    <Button
                      type="primary"
                      icon={<ShoppingCartOutlined />}
                      onClick={() => addToCart(product)}
                    >
                      加入购物车
                    </Button>
                  ]}
                >
                  <Meta
                    title={product.name}
                    description={
                      <div>
                        <p>{product.description ? product.description.substring(0, 50) + (product.description.length > 50 ? '...' : '') : ''}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                          <span style={{ color: '#f5222d', fontWeight: 'bold' }}>¥{parseFloat(product.price).toFixed(2)}</span>
                          <Tag color="blue">{product.categories?.name || '未分类'}</Tag>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>

          {filteredProducts.length > pageSize && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Pagination
                current={currentPage}
                total={filteredProducts.length}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StoreProductPage;