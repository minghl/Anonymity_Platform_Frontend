import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Form, Select, Button, Typography, Checkbox, Input, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import AppHeader from './Header';  // Import the Header component
import moment from 'moment';

const { Option } = Select;
const { Title, Text, Link } = Typography;
const { Content } = Layout;

const HierarchyForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { identifier, quasiIdentifiers, file, sensitiveColumn } = location.state || { identifier: '', quasiIdentifiers: [], file: null, sensitiveColumn: '' };
  const [fileData, setFileData] = useState([]);
  const [selectedMethods, setSelectedMethods] = useState({}); // Store selected method for each quasi-identifier
  const [ranges, setRanges] = useState({}); // Store max-min ranges for selected columns
  const [layers, setLayers] = useState({}); // Store custom layers for each quasi-identifier

  // Read and parse file to get its content
  const handleFileRead = () => {
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      // 假设文件是 CSV 格式，将其拆分为行和列，并清理列标题
      const rows = content.split('\n').map(row => row.split(','));
      
      // 去除列标题中的回车符和空白字符
      rows[0] = rows[0].map(header => header.trim());
      
      console.log('清理后的列标题:', rows[0]);  // 输出清理后的列标题，确认修复
  
      setFileData(rows);
    };
    reader.readAsText(file);
  };
  
  // Call handleFileRead when component mounts to load the file
  React.useEffect(() => {
    if (file) handleFileRead();
  }, [file]);


  const getMaxMinValues = (columnName, isDate = false) => {
    const columnIndex = fileData[0]?.indexOf(columnName); // 获取列索引
    if (columnIndex === -1 || columnIndex === undefined) return { max: null, min: null };
  
    let columnValues = fileData.slice(1).map(row => row[columnIndex]).filter(Boolean);
  
    if (isDate) {
      columnValues = columnValues
        .map(value => {
          value = value.trim();  // 去除无效字符
          console.log('原始日期值:', value); 
          const date = moment(value, ['YYYY/M/D', 'YYYY/MM/DD', 'M/D/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY'], true);
          console.log('解析后的日期:', date.isValid() ? date.format('YYYY-MM-DD') : '无效日期');
          return date.isValid() ? date.toDate() : null;
        })
        .filter(date => date);
    }
  
    const max = isDate
      ? new Date(Math.max(...columnValues.map(date => date.getTime()))).toISOString().slice(0, 10)
      : Math.max(...columnValues);
  
    const min = isDate
      ? new Date(Math.min(...columnValues.map(date => date.getTime()))).toISOString().slice(0, 10)
      : Math.min(...columnValues);
  
    console.log('最大日期:', max, '最小日期:', min); // 调试输出最大最小日期
    return { max, min };
  };
  

  const handleMethodChange = (header, method) => {
    setSelectedMethods({ ...selectedMethods, [header]: method });
    console.log(method,'mmm')
    // If method is 'dates' or 'ordering', get max and min values for the selected column
    if (method === 'dates') {
      console.log(method,'22')
      const { max, min } = getMaxMinValues(header, true); // Pass true to handle date logic
      setRanges({ ...ranges, [header]: { max, min } });
    } else if (method === 'ordering') {
      const { max, min } = getMaxMinValues(header, false);
      setRanges({ ...ranges, [header]: { max, min } });
    }
  };

  const addLayer = (header) => {
    setLayers({ ...layers, [header]: [...(layers[header] || []), ''] });
  };

  const onFinish = (values) => {
    const hierarchyRules = {};

    quasiIdentifiers.forEach(header => {
      hierarchyRules[header] = {
        method: values[header],
        layers: layers[header] || [],
      };

      if (values[header] === 'dates' || values[header] === 'ordering') {
        const { max, min } = ranges[header];
        hierarchyRules[header].max = max;
        hierarchyRules[header].min = min;
      }
    });

    console.log('Hierarchy Rules:', hierarchyRules);

    // 将 hierarchyRules 传递到下一个页面
    navigate('/anonymity', { state: { identifier, quasiIdentifiers, file, sensitiveColumn, hierarchyRules } });
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader /> {/* Include the Header component */}
      <Content style={{ maxWidth: 600, margin: '0 auto', padding: '20px' }}>
        <Title level={3}>Hierarchy</Title>
        <Text type="secondary">Quasi-identifiers</Text>
        <Form
          layout="vertical"
          onFinish={onFinish}
          style={{ marginTop: '20px' }}
        >
          {quasiIdentifiers.map((header) => (
            <div key={header}>
              <Form.Item
                name={header}
                label={header}
                rules={[{ required: true, message: `Please select a method for ${header}!` }]}
              >
                <Select
                  placeholder={`Select method for ${header}`}
                  onChange={(value) => handleMethodChange(header, value)}
                >
                  <Option value="ordering">Ordering</Option>
                  <Option value="masking">Masking</Option>
                  <Option value="category">Category</Option>
                  <Option value="dates">Dates</Option>
                </Select>
              </Form.Item>

              {/* Display max-min range when 'dates' or 'ordering' is selected */}
              {selectedMethods[header] && (selectedMethods[header] === 'dates' || selectedMethods[header] === 'ordering') && (
                <>
                  <Text type="secondary">
                    {ranges[header] ? `Range: ${ranges[header].min} - ${ranges[header].max}` : 'Loading range...'}
                  </Text>

                  {/* Display input boxes for custom layers */}
                  {layers[header]?.map((_, index) => (
                    <Form.Item key={`${header}-layer-${index}`}>
                      <Input
                        placeholder={`Enter layer ${index + 1}`}
                        style={{ width: '85%', marginRight: '10px' }}
                      />
                      <Button icon={<PlusOutlined />} onClick={() => addLayer(header)}>
                        Add Layer
                      </Button>
                    </Form.Item>
                  ))}

                  {/* Button to add more layers */}
                  <Form.Item>
                    <Button icon={<PlusOutlined />} onClick={() => addLayer(header)}>
                      Add Layer
                    </Button>
                  </Form.Item>
                </>
              )}
            </div>
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
      </Content>
    </Layout>
  );
};

export default HierarchyForm;
