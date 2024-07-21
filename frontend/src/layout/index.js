import React from 'react';
import { VideoCameraFilled } from '@ant-design/icons';
import { Layout, Menu, theme } from 'antd';

const { Content, Footer, Sider } = Layout;
const items = [VideoCameraFilled].map(
  (icon, index) => ({
    key: 'power_stream',
    icon: React.createElement(icon),
    label: `Power Stream`,
  }),
);
const LayoutApp = ({ children }) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Layout>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          console.log(broken);
        }}
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
        }}
      >
        <div style={{ width: '100%', textAlign: 'center', padding: 15 }}>
          <img src="logo512.png" alt="logo" width={50}/>
        </div>
        
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['4']} items={items} />
      </Sider>
      <Layout>
        <Content
          style={{
            margin: '24px 16px 0',
          }}
        >
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
          </div>
        </Content>
        <Footer
          style={{
            textAlign: 'center',
          }}
        >
          Power Stream ©{new Date().getFullYear()} Created by Ivan Ivaneichyk
        </Footer>
      </Layout>
    </Layout>
  );
};
export default LayoutApp;