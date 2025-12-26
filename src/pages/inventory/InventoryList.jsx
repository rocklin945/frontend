import React, { useState, useEffect } from 'react';
import { Table, Card, Space, Input, Select, Button, Tag, InputNumber, message, Modal, Form } from 'antd';
import { SearchOutlined, EditOutlined, WarningOutlined, SyncOutlined } from '@ant-design/icons';
import { getInventory, updateInventory } from '../../api/inventory';
import { getCategories } from '../../api/categories';

const { Option } = Select;

const InventoryList = () => {
  const [form] = Form.useForm();
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    lowStock: false
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchInventory();
    fetchCategories();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await getInventory();
      setInventory(data);
    } catch (error) {
      message.error('获取库存信息失败: ' + error.message);
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

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleCategoryFilter = (value) => {
    setFilters(prev => ({ ...prev, category: value }));
  };

  const toggleLowStockFilter = () => {
    setFilters(prev => ({ ...prev, lowStock: !prev.lowStock }));
  };

  const showUpdateModal = (item) => {
    setEditingItem(item);
    form.setFieldsValue({
      quantity: item.quantity
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleUpdateInventory = async () => {
    try {
      const values = await form.validateFields();
      await updateInventory(editingItem.product_id, values.quantity);
      message.success('库存更新成功');
      setIsModalVisible(false);
      fetchInventory();
    } catch (error) {
      message.error('更新库存失败: ' + error.message);
    }
  };

  // 应用过滤条件
  const filteredInventory = inventory.filter(item => {
    // 关键字搜索
    const searchMatch = !filters.search ||
      item.products.name.toLowerCase().includes(filters.search.toLowerCase());

    // 分类过滤
    const categoryMatch = !filters.category ||
      (item.products.categories && item.products.categories.id === filters.category);

    // 低库存过滤
    const lowStockMatch = !filters.lowStock || item.quantity <= 10;

    return searchMatch && categoryMatch && lowStockMatch;
  });

  const columns = [
    {
      title: '产品',
      dataIndex: ['products', 'name'],
      key: 'product',
      sorter: (a, b) => a.products.name.localeCompare(b.products.name),
    },
    {
      title: '分类',
      dataIndex: ['products', 'categories', 'name'],
      key: 'category',
      render: (text) => text || '未分类',
    },
    {
      title: '库存数量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity) => {
        if (quantity <= 5) {
          return <Tag color="red" icon={<WarningOutlined />}>{quantity}</Tag>;
        } else if (quantity <= 10) {
          return <Tag color="orange">{quantity}</Tag>;
        } else {
          return quantity;
        }
      },
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: '库存状态',
      key: 'status',
      render: (_, record) => {
        const qty = record.quantity;
        if (qty <= 0) {
          return <Tag color="red">缺货</Tag>;
        } else if (qty <= 5) {
          return <Tag color="red">库存紧张</Tag>;
        } else if (qty <= 10) {
          return <Tag color="orange">库存偏低</Tag>;
        } else if (qty <= 20) {
          return <Tag color="gold">库存适中</Tag>;
        } else {
          return <Tag color="green">库存充足</Tag>;
        }
      },
    },
    {
      title: '最后更新时间',
      dataIndex: 'last_restock_date',
      key: 'last_restock_date',
      render: (date) => new Date(date).toLocaleString(),
      sorter: (a, b) => new Date(a.last_restock_date) - new Date(b.last_restock_date),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => showUpdateModal(record)}
          >
            更新库存
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card title="库存管理">
      <div className="list-header">
        <Space wrap>
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
          <Button
            type={filters.lowStock ? 'primary' : 'default'}
            icon={<WarningOutlined />}
            onClick={toggleLowStockFilter}
          >
            库存不足
          </Button>
          <Button
            icon={<SyncOutlined />}
            onClick={fetchInventory}
          >
            刷新
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredInventory}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="更新库存"
        visible={isModalVisible}
        onOk={handleUpdateInventory}
        onCancel={handleCancel}
      >
        {editingItem && (
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              label="产品名称"
            >
              <Input value={editingItem.products.name} disabled />
            </Form.Item>

            <Form.Item
              name="quantity"
              label="库存数量"
              rules={[{ required: true, message: '请输入库存数量' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </Card>
  );
};

export default InventoryList;