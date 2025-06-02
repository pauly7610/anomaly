import React, { useEffect, useState } from "react";
import { Card, List, Typography, Tag } from "antd";

interface AnomalyEvent {
  id: number;
  type: string;
  customer_id: string;
  timestamp: string;
  amount: number;
  severity: string;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/anomalies";

const randomSeverity = () => {
  const levels = ["low", "medium", "high"];
  return levels[Math.floor(Math.random() * levels.length)];
};

const severityColor = (sev: string) => {
  switch (sev) {
    case "high": return "red";
    case "medium": return "orange";
    case "low": return "green";
    default: return "blue";
  }
};

const LiveAnomalyFeed: React.FC = () => {
  const [events, setEvents] = useState<AnomalyEvent[]>([]);
  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Accepts either a single event or an array
        const newEvents: AnomalyEvent[] = Array.isArray(data) ? data : [data];
        setEvents((prev) => [...newEvents.map(ev => ({ ...ev, severity: ev.severity || randomSeverity() })), ...prev].slice(0, 20));
      } catch (e) { /* ignore */ }
    };
    return () => ws.close();
  }, []);
  return (
    <Card title="Live Anomaly Feed" style={{ margin: 24 }}>
      <List
        size="small"
        dataSource={events}
        renderItem={(item: AnomalyEvent) => (
          <List.Item>
            <Typography.Text strong>{item.type}</Typography.Text> &nbsp;
            <Tag color={severityColor(item.severity)}>{item.severity}</Tag>
            <Typography.Text type="secondary">{item.customer_id}</Typography.Text> &nbsp;
            <Typography.Text>${item.amount.toFixed(2)}</Typography.Text> &nbsp;
            <Typography.Text type="secondary">{new Date(item.timestamp).toLocaleTimeString()}</Typography.Text>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default LiveAnomalyFeed;
