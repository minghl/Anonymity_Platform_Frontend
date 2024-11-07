// DatasetProcessingForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Form, Button, Select, Checkbox, Typography, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Papa from 'papaparse';
import AppHeader from './Header'; // 导入头部组件

const { Option } = Select;
const { Title, Text, Link } = Typography;
const { Content } = Layout;

const DatasetProcessingForm = () => {
  const [form] = Form.useForm();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const navigate = useNavigate();

  const handleTermsChange = (e) => {
    setTermsAccepted(e.target.checked);
  };

  const onFinish = (values) => {
    console.log('Form values:', values);
    console.log('CSV Data:', csvData);
    console.log('CSV Headers:', csvHeaders);
    navigate('/hierarchy', { state: { identifier:values.identifier, quasiIdentifiers: values.quasiIdentifier, file: uploadedFile, sensitiveColumn: values.sensitiveAttribute[0] } });
  };

  const handleUpload = (file) => {
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target.result;
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          setCsvData(result.data);
          setCsvHeaders(result.meta.fields);
          message.success('CSV file uploaded and parsed successfully!');
        },
        error: (error) => {
          message.error('Error parsing CSV file');
          console.error(error);
        }
      });
    };
    reader.readAsText(file);
    return false;
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader /> {/* 使用头部组件 */}
      <Content style={{ padding: '50px', backgroundColor: '#f0f2f5' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Title level={1}>Privacy Enhancement Toolbox</Title>
          <Text type="secondary">Application</Text>
        </div>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
          <Title level={3}>Dataset Processing</Title>
          <Text type="secondary">Subheading</Text>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            style={{ marginTop: '20px' }}
          >
            <Form.Item
              name="csvUpload"
              label="Upload CSV"
              rules={[{ required: true, message: 'Please upload a CSV file!' }]}
            >
              <Upload
                beforeUpload={handleUpload}
                accept=".csv"
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>Click to Upload CSV</Button>
              </Upload>
            </Form.Item>

            <Form.Item
              name="missedValue"
              label="Missed Value"
              rules={[{ required: true, message: 'Please select a missed value handling method!' }]}
            >
              <Select placeholder="Select Missed Value Handling">
                <Option value="delete">Delete Entries</Option>
                <Option value="mean">Replace with Mean</Option>
                <Option value="median">Replace with Median</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="identifier"
              label="Identifiers"
              rules={[{ required: true, message: 'Please select an identifier!' }]}
            >
              <Select
                mode="multiple"
                placeholder="Select Identifier"
              >
                {csvHeaders.map((header) => (
                  <Option key={header} value={header}>{header}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="quasiIdentifier"
              label="Quasi-identifiers"
              rules={[{ required: true, message: 'Please select a quasi-identifier!' }]}
            >
              <Select
                mode="multiple"
                placeholder="Select Quasi-identifier"
              >
                {csvHeaders.map((header) => (
                  <Option key={header} value={header}>{header}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="sensitiveAttribute"
              label="Sensitive Attributes"
              rules={[{ required: true, message: 'Please select a sensitive attribute!' }]}
            >
              <Select
                mode="multiple"
                placeholder="Select Sensitive Attribute"
              >
                {csvHeaders.map((header) => (
                  <Option key={header} value={header}>{header}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item>
              <Checkbox checked={termsAccepted} onChange={handleTermsChange}>
                I accept the terms
              </Checkbox>
              <Link href="#" target="_blank">Read our T&Cs</Link>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" disabled={!termsAccepted} block>
                Submit Processing Info
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Content>
    </Layout>
  );
};

export default DatasetProcessingForm;
