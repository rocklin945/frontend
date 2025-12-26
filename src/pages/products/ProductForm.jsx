import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Switch, Button, Upload, message, Card, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductById, createProduct, updateProduct } from '../../api/products';
import { getCategories } from '../../api/categories';

const { Option } = Select;
const { TextArea } = Input;

const ProductForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      message.error('获取分类失败: ' + error.message);
    }
  };

  const fetchProduct = async (id) => {
    try {
      setLoading(true);
      const product = await getProductById(id);

      // 设置表单初始值
      form.setFieldsValue({
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        category_id: product.category_id,
        is_active: product.is_active,
        quantity: product.inventory && product.inventory.length > 0 ? product.inventory[0].quantity : 0,
        image_url: product.image_url,
      });

      if (product.image_url) {
        setImageUrl(product.image_url);
      }
    } catch (error) {
      message.error('获取产品信息失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      if (isEditMode) {
        await updateProduct(id, {
          ...values,
          price: parseFloat(values.price).toFixed(2)
        });
        message.success('产品更新成功');
      } else {
        await createProduct({
          ...values,
          price: parseFloat(values.price).toFixed(2)
        });
        message.success('产品创建成功');
      }
      navigate('/products');
    } catch (error) {
      message.error('保存失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 图片上传前的校验
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过2MB!');
    }
    return isImage && isLt2M;
  };

  // 实际上传图片的处理
  // 在真实项目中，这里应该调用API上传到存储服务，比如Supabase Storage
  // 这里为了演示，我们使用Base64编码图片
  const handleChange = info => {
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.status === 'done') {
      // 读取文件为Base64
      const reader = new FileReader();
      reader.readAsDataURL(info.file.originFileObj);
      reader.onload = () => {
        const base64Url = reader.result;
        setImageUrl(base64Url);
        form.setFieldsValue({ image_url: base64Url });
      };
    }
  };

  // 自定义上传按钮
  const uploadButton = (
    <div>
      <UploadOutlined />
      <div style={{ marginTop: 8 }}>上传图片</div>
    </div>
  );

  if (loading && isEditMode) {
    return <Spin size="large" />;
  }

  return (
    <Card title={isEditMode ? '编辑产品' : '添加产品'}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          is_active: true,
          quantity: 0
        }}
      >
        <Form.Item
          name="name"
          label="产品名称"
          rules={[{ required: true, message: '请输入产品名称' }]}
        >
          <Input placeholder="请输入产品名称" />
        </Form.Item>

        <Form.Item
          name="description"
          label="产品描述"
        >
          <TextArea rows={4} placeholder="请输入产品描述" />
        </Form.Item>

        <Form.Item
          name="price"
          label="价格"
          rules={[{ required: true, message: '请输入产品价格' }]}
        >
          <InputNumber
            min={0}
            precision={2}
            step={0.01}
            style={{ width: '100%' }}
            prefix="¥"
            placeholder="请输入产品价格"
          />
        </Form.Item>

        <Form.Item
          name="category_id"
          label="产品分类"
          rules={[{ required: true, message: '请选择产品分类' }]}
        >
          <Select placeholder="请选择产品分类">
            {categories.map(category => (
              <Option key={category.id} value={category.id}>{category.name}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="quantity"
          label="库存数量"
          rules={[{ required: true, message: '请输入库存数量' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入库存数量" />
        </Form.Item>

        <Form.Item
          name="image_url"
          label="产品图片"
          getValueFromEvent={e => {
            if (Array.isArray(e)) {
              return e;
            }
            return e && e.fileList;
          }}
        >
          <Upload
            name="avatar"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
            beforeUpload={beforeUpload}
            onChange={handleChange}
          >
            {imageUrl ? <img src={imageUrl} alt="产品图片" style={{ width: '100%' }} /> : uploadButton}
          </Upload>
        </Form.Item>

        <Form.Item
          name="is_active"
          label="上架状态"
          valuePropName="checked"
        >
          <Switch checkedChildren="上架" unCheckedChildren="下架" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEditMode ? '更新产品' : '创建产品'}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate('/products')}>
            取消
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ProductForm;