import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Layout, Form, Select, InputNumber, Button, Typography, Checkbox, message } from 'antd';
import AppHeader from './Header';  // Import the Header component

const { Option } = Select;
const { Title, Text, Link } = Typography;
const { Content } = Layout;

const AnonymityForm = () => {
  const [algorithm, setAlgorithm] = useState('k-anonymity');
  const location = useLocation();
  const {identifier, quasiIdentifiers, file, sensitiveColumn, hierarchyRules } = location.state || {identifier:'', quasiIdentifiers: [], file: null, sensitiveColumn: '', hierarchyRules: {} };
  
  const onAlgorithmChange = (value) => {
    setAlgorithm(value);
  };

  const downloadCSV = (data, filename) => {
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onFinish = async (values) => {
    const formData = new FormData();
  
    formData.append('file', file);
    formData.append('sensitive_column', sensitiveColumn);
    formData.append('identifier', identifier);
    formData.append('privacy_model', values.algorithm);
    formData.append('k', values.kValue || '');
    formData.append('l', values.lValue || '');
    formData.append('t', values.tValue || '');
    formData.append('m', values.mValue || '');
    formData.append('e', values.eValue || '');
    formData.append('suppression_threshold', values.supRate || '');
    formData.append('quasi_identifiers', quasiIdentifiers.join(','));
    
  
    // 将 hierarchyRules 转换为 JSON 字符串并传递
    formData.append('hierarchy_rules', JSON.stringify(hierarchyRules));
  
    try {
      const response = await fetch('/anonymize', {
        method: 'POST',
        body: formData,
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log('Anonymized Data:', result);
  
        // Convert the result to CSV format
        const header = Object.keys(result[0]).join(',') + '\n';
        const rows = result.map(row => Object.values(row).join(',')).join('\n');
        const csvData = header + rows;
  
        downloadCSV(csvData, 'anonymized_data.csv');
        message.success('Data anonymization successful! CSV downloaded.');
      } else {
        const error = await response.json();
        message.error(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error during data anonymization:', error);
      message.error('An error occurred while processing the data.');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader /> {/* Include the Header component */}
      <Content style={{ maxWidth: 600, margin: '0 auto', padding: '20px' }}>
        <Title level={3}>Manual Dataset Anonymity</Title>
        <Text type="secondary">Subheading</Text>
        <Form
          layout="vertical"
          onFinish={onFinish}
          style={{ marginTop: '20px' }}
        >
          <Form.Item
            name="algorithm"
            label="Algorithm"
            rules={[{ required: true, message: 'Please select an algorithm!' }]}
          >
            <Select placeholder="Select Algorithm" onChange={onAlgorithmChange}>
              <Option value="k-anonymity">K-anonymity</Option>
              <Option value="l-diversity">L-diversity</Option>
              <Option value="t-closeness">T-closeness</Option>
              <Option value="km-anonymity">Km-anonymity</Option>
              <Option value="differential_privacy">Differential Privacy</Option>
            </Select>
          </Form.Item>

          {(algorithm === 'k-anonymity' || algorithm === 'l-diversity' || algorithm === 't-closeness' || algorithm === 'km-anonymity') && (
            <Form.Item
              name="kValue"
              label="K-value"
              rules={[{ required: true, message: 'Please input the K-value!' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} placeholder="Enter K-value" />
            </Form.Item>
          )}

          {(algorithm === 'l-diversity') && (
            <Form.Item
              name="lValue"
              label="L-value"
              rules={[{ required: algorithm === 'l-diversity', message: 'Please input the L-value!' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} placeholder="Enter L-value" />
            </Form.Item>
          )}

          {algorithm === 't-closeness' && (
            <>
              <Form.Item
                name="tValue"
                label="T-value"
                rules={[{ required: algorithm === 't-closeness', message: 'Please input the T-value!' }]}
              >
                <InputNumber min={0.01} max={1} step={0.01} style={{ width: '100%' }} placeholder="Enter T-value" />
              </Form.Item>
            </>
          )}
          {algorithm === 'km-anonymity' && (
            <>
              <Form.Item
                name="mValue"
                label="M-value"
                rules={[{ required: algorithm === 'km-anonymity', message: 'Please input the M-value!' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="Enter M-value (2-5)" />
              </Form.Item>
            </>
          )}
          {algorithm === 'differential_privacy' && (
            <>
              <Form.Item
                name="eValue"
                label="Epsilon-value"
                rules={[{ required: algorithm === 'differential_privacy', message: 'Please input the Epsilon-value' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="Please input the Epsilon-value!" />
              </Form.Item>
            </>
          )}
          <Form.Item
              name="supRate"
              label="Suppression Rate"
              rules={[{ required: true, message: 'Please input the suppression rate!' }]}
            >
              <InputNumber min={0} max={1} step={0.01}style={{ width: '100%' }} placeholder="Enter suppression rate" />
            </Form.Item>
          <Form.Item>
            <Checkbox>I accept the terms</Checkbox>
            <Link href="#" target="_blank">Read our T&Cs</Link>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
};

export default AnonymityForm;
