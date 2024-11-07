import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Layout,
  Form,
  Select,
  Button,
  Typography,
  Checkbox,
  Input,
  DatePicker,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import AppHeader from "./Header"; // Import the Header component
import moment from "moment";
import { DeleteOutlined } from "@ant-design/icons";

const { Option } = Select;
const { Title, Text, Link } = Typography;
const { Content } = Layout;
const { RangePicker } = DatePicker;

const HierarchyForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { identifier, quasiIdentifiers, file, sensitiveColumn } =
    location.state || {
      identifier: "",
      quasiIdentifiers: [],
      file: null,
      sensitiveColumn: "",
    };
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
      const rows = content.split("\n").map((row) => row.split(","));
      rows[0] = rows[0].map((header) => header.trim());
      setFileData(rows);
    };
    reader.readAsText(file);
  };

  React.useEffect(() => {
    if (file) handleFileRead();
  }, [file]);

  const getMaxMinValues = (columnName, isDate = false) => {
    const columnIndex = fileData[0]?.indexOf(columnName);
    if (columnIndex === -1 || columnIndex === undefined)
      return { max: null, min: null };

    let columnValues = fileData
      .slice(1)
      .map((row) => row[columnIndex])
      .filter(Boolean);

    if (isDate) {
      columnValues = columnValues
        .map((value) => {
          const date = moment(
            value.trim(),
            [
              "YYYY/M/D",
              "YYYY/MM/DD",
              "M/D/YYYY",
              "MM/DD/YYYY",
              "YYYY-MM-DD",
              "DD-MM-YYYY",
            ],
            true
          );
          return date.isValid() ? date.toDate() : null;
        })
        .filter((date) => date);
    }

    const max = isDate
      ? new Date(Math.max(...columnValues.map((date) => date.getTime())))
          .toISOString()
          .slice(0, 10)
      : Math.max(...columnValues);

    const min = isDate
      ? new Date(Math.min(...columnValues.map((date) => date.getTime())))
          .toISOString()
          .slice(0, 10)
      : Math.min(...columnValues);

    return { max, min };
  };

  const handleMethodChange = (header, method) => {
    setSelectedMethods({ ...selectedMethods, [header]: method });

    if (method === "dates") {
      const { max, min } = getMaxMinValues(header, true);
      setRanges({ ...ranges, [header]: { max, min } });
    } else if (method === "ordering") {
      const { max, min } = getMaxMinValues(header, false);
      setRanges({ ...ranges, [header]: { max, min } });
    }
  };

  const addLayer = (header) => {
    setLayers({
      ...layers,
      [header]: [...(layers[header] || []), { min: "", max: "" }],
    });
  };

  const updateLayerValue = (header, index, key, value) => {
    const updatedLayers = [...layers[header]];
    updatedLayers[index][key] = value;
    setLayers({ ...layers, [header]: updatedLayers });
  };

  const onFinish = (values) => {
    const hierarchyRules = {};

    quasiIdentifiers.forEach((header) => {
      hierarchyRules[header] = {
        method: values[header],
        layers: layers[header] || [],
      };

      if (values[header] === "dates" || values[header] === "ordering") {
        const { max, min } = ranges[header];
        hierarchyRules[header].max = max;
        hierarchyRules[header].min = min;
      }
    });

    navigate("/anonymity", {
      state: {
        identifier,
        quasiIdentifiers,
        file,
        sensitiveColumn,
        hierarchyRules,
      },
    });
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader />
      <Content style={{ maxWidth: 600, margin: "0 auto", padding: "20px" }}>
        <Title level={3}>Hierarchy</Title>
        <Text type="secondary">Quasi-identifiers</Text>
        <Form
          layout="vertical"
          onFinish={onFinish}
          style={{ marginTop: "20px" }}
        >
          {quasiIdentifiers.map((header) => (
            <div key={header}>
              <Form.Item
                name={header}
                label={header}
                rules={[
                  {
                    required: true,
                    message: `Please select a method for ${header}!`,
                  },
                ]}
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

              {selectedMethods[header] &&
                (selectedMethods[header] === "dates" ||
                  selectedMethods[header] === "ordering") && (
                  <>
                    <Text type="secondary">
                      {ranges[header]
                        ? `Range: ${ranges[header].min} - ${ranges[header].max}`
                        : "Loading range..."}
                    </Text>

                    {layers[header]?.map((layer, index) => (
                      <Form.Item key={`${header}-layer-${index}`}>
                        <div style={{ marginBottom: "5px" }}>
                          <label>{`Layer ${index + 1}:`}</label>
                        </div>

                        <Input.Group
                          compact
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          {selectedMethods[header] === "dates" ? (
                            <RangePicker
                              style={{ width: "85%" }}
                              onChange={(dates, dateStrings) => {
                                updateLayerValue(
                                  header,
                                  index,
                                  "min",
                                  dateStrings[0]
                                );
                                updateLayerValue(
                                  header,
                                  index,
                                  "max",
                                  dateStrings[1]
                                );
                              }}
                            />
                          ) : (
                            <>
                              <Input
                                style={{ width: "40%" }}
                                placeholder={`Min value`}
                                value={layer.min}
                                onChange={(e) =>
                                  updateLayerValue(
                                    header,
                                    index,
                                    "min",
                                    e.target.value
                                  )
                                }
                              />
                              <span style={{ margin: "0 10px" }}>-</span>
                              <Input
                                style={{ width: "40%" }}
                                placeholder={`Max value`}
                                value={layer.max}
                                onChange={(e) =>
                                  updateLayerValue(
                                    header,
                                    index,
                                    "max",
                                    e.target.value
                                  )
                                }
                              />
                            </>
                          )}
                          {/* More prominent Delete button with icon */}
                          <Button
                            type="primary"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => {
                              const updatedLayers = layers[header].filter(
                                (_, layerIndex) => layerIndex !== index
                              );
                              setLayers({ ...layers, [header]: updatedLayers });
                            }}
                            style={{ marginLeft: "10px" }} // Add some space between input and delete button
                          >
                            Delete
                          </Button>
                        </Input.Group>
                      </Form.Item>
                    ))}

                    <Form.Item>
                      <Button
                        icon={<PlusOutlined />}
                        onClick={() => addLayer(header)}
                      >
                        Add Layer
                      </Button>
                    </Form.Item>
                  </>
                )}
            </div>
          ))}

          <Form.Item>
            <Checkbox>I accept the terms</Checkbox>
            <Link href="#" target="_blank">
              Read our T&Cs
            </Link>
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
