import React from "react";
import { Card, Row, Col, Statistic, Typography, Progress, Alert } from 'antd';

const mockData = {
  cpu: 52,
  memory: 73,
  uptime: '3d 22h',
  txPerSec: 148,
  errorRate: 0.3,
  services: [
    { name: 'ML Engine', status: 'healthy' },
    { name: 'Streaming Processor', status: 'healthy' },
    { name: 'Compliance Engine', status: 'degraded' },
    { name: 'WebSocket Gateway', status: 'healthy' },
  ],
};

const statusColor = (status: string) => {
  switch (status) {
    case 'healthy': return 'green';
    case 'degraded': return 'orange';
    case 'down': return 'red';
    default: return 'gray';
  }
};

const OperationalIntelligence: React.FC = () => (
  <div style={{ padding: 32 }}>
    <Typography.Title level={2}>Operational Intelligence Panel</Typography.Title>
    <Row gutter={[24, 24]}>
      <Col xs={24} sm={12} md={8}>
        <Card>
          <Statistic title="CPU Usage" value={mockData.cpu} suffix="%" />
          <Progress percent={mockData.cpu} status={mockData.cpu > 90 ? 'exception' : 'active'} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <Card>
          <Statistic title="Memory Usage" value={mockData.memory} suffix="%" />
          <Progress percent={mockData.memory} status={mockData.memory > 90 ? 'exception' : 'active'} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <Card>
          <Statistic title="Uptime" value={mockData.uptime} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <Card>
          <Statistic title="Throughput" value={mockData.txPerSec} suffix="tx/sec" />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <Card>
          <Statistic title="Error Rate" value={mockData.errorRate} suffix="%" precision={2} />
          {mockData.errorRate > 1 && <Alert message="High Error Rate!" type="error" showIcon />} 
        </Card>
      </Col>
      <Col xs={24} sm={24} md={8}>
        <Card title="Service Status">
          {mockData.services.map(s => (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: statusColor(s.status), display: 'inline-block', marginRight: 8 }} />
              <Typography.Text>{s.name}</Typography.Text>
              <Typography.Text type="secondary" style={{ marginLeft: 8 }}>{s.status.charAt(0).toUpperCase() + s.status.slice(1)}</Typography.Text>
            </div>
          ))}
        </Card>
      </Col>
    </Row>
  </div>
);

export default OperationalIntelligence;
