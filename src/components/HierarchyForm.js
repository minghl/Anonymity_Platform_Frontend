import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Form, Select, Button, Typography, Checkbox } from 'antd';

const { Option } = Select;
const { Title, Text, Link } = Typography;

const HierarchyForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { quasiIdentifiers, file, sensitiveColumn } = location.state || { quasiIdentifiers: [], file: null, sensitiveColumn: '' };
  
  const onFinish = (values) => {
    console.log('Hierarchy Form values:', values);
    // 将hierarchyRules传递到下一个页面
    navigate('/anonymity', { state: { quasiIdentifiers, file, sensitiveColumn, hierarchyRules: values } });
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px' }}>
      <Title level={3}>Hierarchy</Title>
      <Text type="secondary">Quasi-identifiers</Text>
      <Form
        layout="vertical"
        onFinish={onFinish}
        style={{ marginTop: '20px' }}
      >
        {quasiIdentifiers.map((header) => (
          <Form.Item
            key={header}
            name={header}
            label={header}
            rules={[{ required: true, message: `Please select a method for ${header}!` }]}
          >
            <Select placeholder={`Select method for ${header}`}>
              <Option value="ordering">Ordering</Option>
              <Option value="masking">Masking</Option>
              <Option value="dates">Dates</Option>
              {/* 其他选项 */}
            </Select>
          </Form.Item>
        ))}
        
        <Form.Item>
          <Checkbox>I accept the terms</Checkbox>
          <Link href="#" target="_blank">Read our T&Cs</Link>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Submit Hierarchy Info
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default HierarchyForm;
