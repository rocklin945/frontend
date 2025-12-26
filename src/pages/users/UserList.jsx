import React, { useState, useEffect } from 'react';
import { Table, Card, Space, Input, Select, Button, Tag, message, Avatar, Modal } from 'antd';
import { SearchOutlined, UserOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { getUsers, updateUserRole } from '../../api/users';

const { Option } = Select;
const { confirm } = Modal;

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      message.error('获取用户列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (userId, newRole) => {
    confirm({
      title: '确定更改此用户的角色吗?',
      icon: <ExclamationCircleOutlined />,
      content: `将用户角色更改为: ${getRoleName(newRole)}`,
      async onOk() {
        try {
          console.log('Confirming role change for user:', userId, 'to role:', newRole);
          await updateUserRole(userId, newRole);
          message.success('用户角色已更新');
          fetchUsers();
        } catch (error) {
          message.error('更新用户角色失败: ' + error.message);
          console.error('Error in handleRoleChange:', error);
        }
      },
    });
  };

  const getRoleName = (role) => {
    const roleMap = {
      'admin': '管理员',
      'staff': '员工',
      'customer': '客户'
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role) => {
    const colorMap = {
      'admin': 'red',
      'staff': 'blue',
      'customer': 'green'
    };
    return colorMap[role] || 'default';
  };

  // 应用过滤条件
  const filteredUsers = users.filter(user => {
    // 关键字搜索
    const searchMatch = !searchText ||
      (user.full_name && user.full_name.toLowerCase().includes(searchText.toLowerCase())) ||
      (user.phone && user.phone.includes(searchText));

    // 角色过滤
    const roleMatch = !roleFilter || user.role === roleFilter;

    return searchMatch && roleMatch;
  });

  const columns = [
    {
      title: '用户',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={record.avatar_url} />
          <span>{record.full_name || '未设置姓名'}</span>
        </Space>
      ),
      sorter: (a, b) => (a.full_name || '').localeCompare(b.full_name || ''),
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      render: phone => phone || '未设置',
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      render: address => address || '未设置',
      ellipsis: true,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: role => (
        <Tag color={getRoleColor(role)}>
          {getRoleName(role)}
        </Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: date => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            size="small"
          >
            编辑
          </Button>
          <Select
            defaultValue={record.role}
            style={{ width: 100 }}
            onChange={value => handleRoleChange(record.id, value)}
            size="small"
          >
            <Option value="admin">管理员</Option>
            <Option value="staff">员工</Option>
            <Option value="customer">客户</Option>
          </Select>
        </Space>
      ),
    },
  ];

  return (
    <Card title="用户管理">
      <div className="list-header">
        <Space>
          <Input
            placeholder="搜索用户名/电话"
            prefix={<SearchOutlined />}
            allowClear
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            placeholder="用户角色"
            style={{ width: 150 }}
            allowClear
            onChange={value => setRoleFilter(value)}
          >
            <Option value="admin">管理员</Option>
            <Option value="staff">员工</Option>
            <Option value="customer">客户</Option>
          </Select>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

export default UserList;