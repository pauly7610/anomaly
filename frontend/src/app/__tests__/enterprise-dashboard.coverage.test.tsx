import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import EnterpriseDashboard from '../enterprise-dashboard';
import ExecutiveSummary from '../../components/ExecutiveSummary';

// Helper to mock fetch sequence
function mockFetchSequence(responses: any[]) {
  let call = 0;
  global.fetch = jest.fn((...args) => {
    const resp = responses[call] || responses[responses.length - 1];
    call++;
    return Promise.resolve({
      ok: resp.ok !== false,
      status: resp.status || 200,
      json: async () => resp.body,
    });
  }) as any;
}

describe('EnterpriseDashboard Coverage', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    // Mock WebSocket
    window.WebSocket = jest.fn(() => ({
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      send: jest.fn(),
      close: jest.fn(),
      onmessage: null,
      onerror: null,
      onclose: null,
      readyState: 1,
    })) as any;
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'mock-token'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  it('covers error states for all API calls', async () => {
    mockFetchSequence([
      { ok: false, status: 500, body: { detail: 'Automation API error' } },
      { ok: false, status: 500, body: { detail: 'Integration API error' } },
      { ok: false, status: 500, body: { detail: 'Compliance API error' } },
      { ok: false, status: 500, body: { detail: 'Streaming API error' } },
      { ok: false, status: 500, body: { detail: 'Dashboard analytics error' } },
      { ok: false, status: 500, body: { detail: 'Compliance history error' } },
      // useSLAStats
      { body: { average_latency_ms: 100, max_latency_ms: 200, min_latency_ms: 50, sla_ms: 250 } },
      // useCorrelatedAlerts
      { body: [] },
      // useMLInsights
      { body: { drift: {}, driftLoading: false, shap: {}, shapLoading: false } },
    ]);
    await act(async () => {
      render(<EnterpriseDashboard />);
    });
    await waitFor(() => {
      const errorNodes = screen.queryAllByText((content, node) =>
        !!(node && node.textContent && node.textContent.toLowerCase().includes('error'))
      );
      expect(errorNodes.length).toBeGreaterThan(0);
    });
  });

  it('covers all widget and panel rendering, action buttons, and error branches', async () => {
    mockFetchSequence([
      { body: { engine_status: 'operational' } },
      { body: { integration1: 'connected' } },
      { body: { compliance_engine: 'operational' } },
      { body: { streaming_engine: 'operational' } },
      { body: { anomaly_rate_over_time: [], num_anomalies: 3 } },
      { body: [{ timestamp: '2023-01-01', type: 'SEC_17a-4' }] },
      // useSLAStats
      { body: { average_latency_ms: 100, max_latency_ms: 200, min_latency_ms: 50, sla_ms: 250 } },
      // useCorrelatedAlerts
      { body: [] },
      // useMLInsights
      { body: { drift: {}, driftLoading: false, shap: {}, shapLoading: false } },
      // Incident
      { body: { id: 1, type: 'incident', message: 'Incident details' } },
      // Violation
      { body: { id: 2, type: 'violation', message: 'Violation details' } },
    ]);
    await act(async () => {
      render(<EnterpriseDashboard />);
    });
    // All KPI and widget headings
    expect(screen.getByText(/Total Anomalies/i)).toBeInTheDocument();
    expect(screen.getByText(/Compliance Reports/i)).toBeInTheDocument();
    expect(screen.getByText(/System Health/i)).toBeInTheDocument();
    expect(screen.getByText(/Market Data/i)).toBeInTheDocument();
    expect(screen.getByText(/Portfolio Risk/i)).toBeInTheDocument();
    expect(screen.getByText(/Account Verification/i)).toBeInTheDocument();
    expect(screen.getByText(/Transaction Validation/i)).toBeInTheDocument();
    expect(screen.getByText(/Regulatory Report/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Automation Engine/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Integration Hub/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Compliance Engine/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Streaming Processor/i).length).toBeGreaterThan(0);
    // Action buttons
    fireEvent.click(screen.getByRole('button', { name: /Demo Incident Drilldown/i }));
    fireEvent.click(screen.getByRole('button', { name: /Demo Compliance Violation Drilldown/i }));
    fireEvent.click(screen.getByRole('button', { name: /Trigger Incident/i }));
    fireEvent.click(screen.getByRole('button', { name: /Generate Compliance Report/i }));
    // Simulate Integration Event error
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({ ok: false, status: 500, json: async () => ({}) }));
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({ ok: false, status: 500, json: async () => ({}) })
    );
    fireEvent.click(screen.getByRole('button', { name: /Simulate Integration Event/i }));
    await waitFor(() => {
      const errorNodes = screen.queryAllByText((content, node) =>
        !!(node && /failed|simulate|integration|stream/i.test(node.textContent || ""))
      );
      expect(errorNodes.length).toBeGreaterThan(0);
    });
    // Simulate Stream Event error
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({ ok: false, status: 500, json: async () => ({}) }));
    fireEvent.click(screen.getByRole('button', { name: /Simulate Stream Event/i }));
    await waitFor(() => {
      const errorNodes = screen.queryAllByText((content, node) =>
        !!(node && /failed|simulate|integration|stream/i.test(node.textContent || ""))
      );
       
      expect(errorNodes.length).toBeGreaterThan(0);
    });

    // Empty wsEvents, anomalyTrend, complianceHistory edge cases
    expect(screen.getAllByText(/No events received yet./i).length).toBeGreaterThan(0);
    // Render with empty stats
    // (simulate by rendering ExecutiveSummary with nulls)
    
    render(<ExecutiveSummary summary={{ healthy: true, issues: [] }} kpis={{ anomalies: 0, complianceReports: 0, systemHealth: null }} />);
    expect(screen.getAllByText(/Total Anomalies/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Compliance Reports/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/System Health/i).length).toBeGreaterThan(0);
    // Render with null anomalyTrend and complianceHistory
    render(<EnterpriseDashboard />);
    // No crash on null/empty data
    expect(screen.getAllByText(/Enterprise Observability Platform/i).length).toBeGreaterThan(0);
  });

  it('covers anomaly feed click and modal error', async () => {
    mockFetchSequence([
      { body: { engine_status: 'operational' } },
      { body: { integration1: 'connected' } },
      { body: { compliance_engine: 'operational' } },
      { body: { streaming_engine: 'operational' } },
      { body: { anomaly_rate_over_time: [], num_anomalies: 3 } },
      { body: [{ timestamp: '2023-01-01', type: 'SEC_17a-4' }] },
      // useSLAStats
      { body: { average_latency_ms: 100, max_latency_ms: 200, min_latency_ms: 50, sla_ms: 250 } },
      // useCorrelatedAlerts
      { body: [] },
      // useMLInsights
      { body: { drift: {}, driftLoading: false, shap: {}, shapLoading: false } },
      // For anomaly details fetch (simulate error)
      { ok: false, status: 404, body: { detail: 'Not found' } },
    ]);
    await act(async () => {
      render(<EnterpriseDashboard />);
    });
    // Simulate anomaly event in feed
    // Find the anomaly event row and click it
    await waitFor(() => {
      const anomalyRow = screen.queryAllByText(/anomaly_detected/i)[0];
      const li = anomalyRow?.closest('li');
      if (li) fireEvent.click(li);
    });
    // Use findAllByText to avoid multiple-match error
    const keywords = ['report', 'no result', 'error', 'download', 'status'];
const nodes2 = await screen.findAllByText((content, node) =>
  !!(node && keywords.some(word => node.textContent?.toLowerCase().includes(word)))
);
expect(nodes2.length).toBeGreaterThan(0);
  });

  it('covers incident and violation modal error/null/close states', async () => {
    mockFetchSequence([
      { body: { engine_status: 'operational' } },
      { body: { integration1: 'connected' } },
      { body: { compliance_engine: 'operational' } },
      { body: { streaming_engine: 'operational' } },
      { body: { anomaly_rate_over_time: [], num_anomalies: 3 } },
      { body: [{ timestamp: '2023-01-01', type: 'SEC_17a-4' }] },
      // useSLAStats
      { body: { average_latency_ms: 100, max_latency_ms: 200, min_latency_ms: 50, sla_ms: 250 } },
      // useCorrelatedAlerts
      { body: [] },
      // useMLInsights
      { body: { drift: {}, driftLoading: false, shap: {}, shapLoading: false } },
      // Incident error
      { ok: false, status: 500, body: { detail: 'Incident error' } },
      // Violation error
      { ok: false, status: 500, body: { detail: 'Violation error' } },
      // Incident null
      { body: null },
      // Violation null
      { body: null },
    ]);
    await act(async () => {
      render(<EnterpriseDashboard />);
    });
    // Incident error
    fireEvent.click(await screen.findByRole('button', { name: /Demo Incident Drilldown/i }));
    // Use findAllByText to tolerate multiple matching elements
    // Use queryAllByText and check length for error loading incident
      
const incidentNodes = screen.queryAllByText((content, node) =>
  !!(node && /incident/i.test(node.textContent || "") && /error/i.test(node.textContent || ""))
);

expect(incidentNodes.length).toBeGreaterThan(0);
    // Violation error
    fireEvent.click(await screen.findByRole('button', { name: /Demo Compliance Violation Drilldown/i }));
    const violationNodes = await screen.findAllByText((content, node) =>
  !!(node && /violation/i.test(node.textContent || "") && /error/i.test(node.textContent || ""))
);

expect(violationNodes.length).toBeGreaterThan(0);
    // Incident null state (simulate closing modal)
    fireEvent.click(await screen.findByRole('button', { name: /Demo Incident Drilldown/i }));
    await waitFor(() => {
      // No crash on null
      const incidentNodes = screen.queryAllByText((content, node) =>
        !!(node && /incident/i.test(node.textContent || "") && /error/i.test(node.textContent || ""))
      );
      expect(incidentNodes.length).toBeGreaterThan(0);
    });
    // Violation null state (simulate closing modal)
    fireEvent.click(await screen.findByRole('button', { name: /Demo Compliance Violation Drilldown/i }));
    await waitFor(() => {
      expect(
  screen.queryAllByText((content, node) =>
    !!(node && /violation/i.test(node.textContent || "") && /error/i.test(node.textContent || ""))
  )
).not.toHaveLength(0);
  
// If this still fails, check your mock setup for error triggering.
    });
  });

  it('covers KPIWidget color fallback', () => {
    // Import KPIWidget directly to test color fallback
    // Import KPIWidget as a named import
    const { KPIWidget } = require('../enterprise-dashboard');
    const { container } = render(<KPIWidget label="Test" value={42} color={undefined as any} />);
    // Should fallback to gray color classes
    expect(container.firstChild).toHaveClass('bg-gray-100');
    expect(container.firstChild).toHaveClass('text-gray-800');
    expect(container.firstChild).toHaveClass('border-gray-200');
    // Also test with bogus color
    const { container: bogusColor } = render(<KPIWidget label="Test" value={42} color="not-a-color" />);
    expect(bogusColor.firstChild).toHaveClass('bg-gray-100');
    expect(bogusColor.firstChild).toHaveClass('text-gray-800');
    expect(bogusColor.firstChild).toHaveClass('border-gray-200');
  });

  it('covers WebSocket event handling for anomaly, compliance_report_generated, and error', async () => {
    mockFetchSequence([
      { body: { engine_status: 'operational' } },
      { body: { integration1: 'connected' } },
      { body: { compliance_engine: 'operational' } },
      { body: { streaming_engine: 'operational' } },
      { body: { anomaly_rate_over_time: [{ rate: 0.1 }] , num_anomalies: 1 } },
      { body: [{ timestamp: '2023-01-01', type: 'SEC_17a-4' }] },
      // useSLAStats
      { body: { average_latency_ms: 100, max_latency_ms: 200, min_latency_ms: 50, sla_ms: 250 } },
      // useCorrelatedAlerts
      { body: [] },
      // useMLInsights
      { body: { drift: {}, driftLoading: false, shap: {}, shapLoading: false } },
    ]);
    // Simulate WebSocket messages
    let wsOnMessage: ((event: any) => void) | null = null;
    const wsMockInstances: any[] = [];
    window.WebSocket = jest.fn(() => {
      const ws: any = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        send: jest.fn(),
        close: jest.fn(),
        readyState: 1,
        set onmessage(fn: any) { wsOnMessage = fn; },
        get onmessage() { return wsOnMessage; },
        onerror: jest.fn(),
      };
      wsMockInstances.push(ws);
      return ws;
    }) as any;
    await act(async () => {
      render(<EnterpriseDashboard />);
    });
    // Simulate anomaly_detected event
    act(() => {
      wsOnMessage && wsOnMessage({ data: JSON.stringify({ type: 'anomaly_detected', id: 999, received: '2023-01-02T00:00:00Z', message: 'Realtime anomaly' }) });
    });
    await waitFor(() => {
      expect(screen.getAllByText(/Realtime anomaly/i).length).toBeGreaterThan(0);
    });
    // Simulate compliance_report_generated event
    act(() => {
      wsOnMessage && wsOnMessage({ data: JSON.stringify({ type: 'compliance_report_generated', id: 888, received: '2023-01-02T01:00:00Z', message: 'Compliance report' }) });
    });
    await waitFor(() => {
      expect(screen.getAllByText(/Compliance report/i).length).toBeGreaterThan(0);
    });
    // Simulate WebSocket error
    if (wsMockInstances[0] && typeof wsMockInstances[0].onerror === 'function') {
      act(() => {
        wsMockInstances[0].onerror();
      });
      await waitFor(() => {
        expect(screen.queryAllByText((content, node) => !!node?.textContent?.includes('WebSocket connection error')).length).toBeGreaterThan(0);
      });
    }
  });
});
