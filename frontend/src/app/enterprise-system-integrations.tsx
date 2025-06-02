import React from "react";
import { CheckCircleTwoTone, CloseCircleTwoTone, SyncOutlined } from '@ant-design/icons';
import { Card, Row, Col, Typography, Tag } from 'antd';

const systems = [
  { name: 'Core Banking System', status: 'connected', detail: 'Account validation, transaction feed' },
  { name: 'Trading Platform', status: 'connected', detail: 'Market data, halt triggers' },
  { name: 'Compliance Engine', status: 'warning', detail: 'Regulatory reporting, audit trail' },
  { name: 'Risk Management System', status: 'disconnected', detail: 'Portfolio risk, exposure' },
];

const statusIcon = (status: string) => {
  switch (status) {
    case 'connected':
      return <CheckCircleTwoTone twoToneColor="#52c41a" />;
    case 'warning':
      return <SyncOutlined spin style={{ color: '#faad14' }} />;
    case 'disconnected':
      return <CloseCircleTwoTone twoToneColor="#ff4d4f" />;
    default:
      return <Tag>Unknown</Tag>;
  }
};

const statusLabel = (status: string) => {
  switch (status) {
    case 'connected':
      return <Tag color="green">Connected</Tag>;
    case 'warning':
      return <Tag color="orange">Warning</Tag>;
    case 'disconnected':
      return <Tag color="red">Disconnected</Tag>;
    default:
      return <Tag>Unknown</Tag>;
  }
};

const SystemIntegrations: React.FC = () => (
  <div style={{ padding: 32 }}>
    <Typography.Title level={2}>Enterprise System Integrations</Typography.Title>
    <Row gutter={[24, 24]}>
      {systems.map((sys) => (
        <Col xs={24} sm={12} md={12} lg={8} xl={6} key={sys.name}>
          <Card hoverable>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {statusIcon(sys.status)}
              <div>
                <Typography.Title level={4} style={{ margin: 0 }}>{sys.name}</Typography.Title>
                {statusLabel(sys.status)}
                <Typography.Text type="secondary">{sys.detail}</Typography.Text>
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  </div>
);

export default SystemIntegrations;
