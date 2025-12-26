import React, { useState, useEffect } from 'react';
import { Table, Space, Button, Input, Select, Tag, Popconfirm, message, Card } from 'antd';
import { PlusOutlined, SearchOutlined, DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct } from '../../api/products';
import { getCategories } from '../../api/categories';

const { Option } = Select;

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      message.error('获取产品列表失败: ' + error.message);
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

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      message.success('产品删除成功');
      fetchProducts();
    } catch (error) {
      message.error('删除产品失败: ' + error.message);
    }
  };

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleCategoryFilter = (value) => {
    setFilters(prev => ({ ...prev, category: value }));
  };

  const handleStatusFilter = (value) => {
    setFilters(prev => ({ ...prev, status: value }));
  };

  // 应用筛选
  const filteredProducts = products.filter(product => {
    // 关键字搜索
    const searchMatch = !filters.search ||
      product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(filters.search.toLowerCase()));

    // 分类筛选
    const categoryMatch = !filters.category || product.category_id === filters.category;

    // 状态筛选
    const statusMatch = filters.status === '' ||
      (filters.status === 'active' && product.is_active) ||
      (filters.status === 'inactive' && !product.is_active);

    return searchMatch && categoryMatch && statusMatch;
  });

  const columns = [
    {
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link to={`/products/${record.id}`}>
          {text}
        </Link>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: '分类',
      dataIndex: ['categories', 'name'],
      key: 'category',
      render: (text) => text || '未分类',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `¥${parseFloat(price).toFixed(2)}`,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: '库存',
      dataIndex: 'inventory',
      key: 'inventory',
      render: (inventory) => {
        const quantity = inventory && inventory.length > 0 ? inventory[0].quantity : 0;
        return quantity <= 10 ? <Tag color="red">{quantity}</Tag> : quantity;
      },
      sorter: (a, b) => {
        const qtyA = a.inventory && a.inventory.length > 0 ? a.inventory[0].quantity : 0;
        const qtyB = b.inventory && b.inventory.length > 0 ? b.inventory[0].quantity : 0;
        return qtyA - qtyB;
      },
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'status',
      render: (active) => (
        active ? <Tag color="green">上架中</Tag> : <Tag color="red">已下架</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString(),
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
            onClick={() => navigate(`/products/${record.id}`)}
          />
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => navigate(`/products/edit/${record.id}`)}
          />
          <Popconfirm
            title="确定要删除此产品吗?"
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
    <Card title="产品管理">
      <div className="list-header">
        <Space>
          <Input
            placeholder="搜索产品"
            prefix={<SearchOutlined />}
            allowClear
            onChange={e => handleSearch(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            placeholder="产品分类"
            style={{ width: 150 }}
            allowClear
            onChange={handleCategoryFilter}
          >
            {categories.map(category => (
              <Option key={category.id} value={category.id}>{category.name}</Option>
            ))}
          </Select>
          <Select
            placeholder="产品状态"
            style={{ width: 150 }}
            allowClear
            onChange={handleStatusFilter}
            defaultValue=""
          >
            <Option value="">全部</Option>
            <Option value="active">上架中</Option>
            <Option value="inactive">已下架</Option>
          </Select>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/products/new')}
          >
            添加产品
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredProducts}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

export default ProductList;