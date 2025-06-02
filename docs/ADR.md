# Architecture Decision Record (ADR)

## Platform Architecture Overview

This ADR documents the core architecture of the financial transaction monitoring platform, including the data flow from telemetry to ML to the UI.

---

## Visual Architecture Diagram

![Platform Architecture](architecture.png)

### 2025 Enterprise Layers

```
┌─────────────────────────────────────────────────┐
│ 🏢 Enterprise Integration & Automation          │
├─────────────────────────────────────────────────┤
│ • AIOps Automation Engine                       │
│ • Incident Response Orchestration               │
│ • Banking System Integration Hub                │
│ • Compliance & Audit Engine                     │
│ • Alert Management & Escalation                 │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ 🔄 Streaming & Real-time Processing             │
├─────────────────────────────────────────────────┤
│ • Kafka Event Streaming (simulated)             │
│ • WebSocket Real-time Updates                   │
│ • Stream Processing Engine                      │
│ • Event-driven Architecture                     │
└─────────────────────────────────────────────────┘
```

## Data Flow Description

1. **User Interaction / Data Upload**: Users upload transaction data (CSV, PDF) via the web UI.
2. **Enterprise Integration & Automation**: Automated workflows, banking integration, compliance, and incident response.
3. **Streaming & Real-time Processing**: Kafka/event streaming, WebSocket updates, real-time analytics.
4. **API & Telemetry**: FastAPI endpoints receive the data, and telemetry is collected via OpenTelemetry for observability and monitoring.
5. **ML & Analytics**: Data is preprocessed and features are engineered. Ensemble anomaly and fraud detection is performed using Isolation Forest, LSTM, and Random Forest. Results are stored in PostgreSQL.
6. **Dashboard UI**: The frontend (Next.js) fetches analytics and results via REST API and WebSocket, providing interactive dashboards and visualizations. Telemetry data may also be surfaced for operational monitoring.

---

## Rationale
- **Separation of concerns**: Each layer (telemetry, ML, UI) is modular and independently scalable.
- **Observability**: Telemetry is integrated at the API layer for real-time monitoring and auditing.
- **Extensibility**: ML logic and UI can be extended independently for new analytics or visualizations.

---

*This ADR should be updated as the architecture evolves. For rendered diagrams, use the Mermaid Live Editor or compatible Markdown viewers.*

---

## 2025 Platform & Dependency Updates
- OpenTelemetry stack pinned for compatibility (api/sdk 1.24.0, instrumentation 0.45b0)
- mlflow upgraded, Python 3.14+ readiness (deprecation warnings addressed)
- Test coverage and ML/model initialization improved for reliability
- requirements.txt, PRD, and docs updated for 2025
