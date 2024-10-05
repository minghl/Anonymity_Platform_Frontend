// Header.js
import React from 'react';
import { Layout, Menu, Button } from 'antd';

const { Header } = Layout;

const AppHeader = () => {
  return (
    <Header style={{ backgroundColor: '#202020', padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img
          src="/uzh.png" // Reference to the image in the public folder
          alt="Universität Zürich"
          style={{ height: '60px', marginRight: '20px' }} // Increase the height for better visibility
        />
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['3']} style={{ flex: 1 }}>
          <Menu.Item key="1">Home</Menu.Item>
          <Menu.Item key="2">Program</Menu.Item>
          <Menu.Item key="3">Application</Menu.Item>
          <Menu.Item key="4">Contact</Menu.Item>
        </Menu>
        <Button type="default" style={{ marginRight: '10px' }}>Sign in</Button>
        <Button type="primary">Register</Button>
      </div>
    </Header>
  );
};

export default AppHeader;

