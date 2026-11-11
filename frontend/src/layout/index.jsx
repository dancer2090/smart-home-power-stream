import React from 'react';
import { BarChartOutlined, VideoCameraFilled } from '@ant-design/icons';
import { Layout, Menu, theme } from 'antd';
import { useNavigate } from 'react-router-dom'

const { Content, Footer, Sider } = Layout;
const items = [
  {
    key: '',
    icon: React.createElement(VideoCameraFilled),
    label: `Power Stream`,
  },
  {
    key: 'charts',
    icon: React.createElement(BarChartOutlined),
    label: `Charts`,
  }
];



const LayoutApp = ({ children }) => {

  const navigate = useNavigate();

  const onClick = (e) => {
    console.log(e)
    navigate('/' + e.key)
  }

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Layout>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
      >
        <div style={{ width: '100%', textAlign: 'center', padding: 15 }}>
          <img src="logo512.png" alt="logo" width={50}/>
        </div>
        
        <Menu onClick={onClick} theme="dark" mode="inline" defaultSelectedKeys={['4']} items={items} />
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