import React from "react";
import { render, screen } from "@testing-library/react";
import ComplianceAuditSection from "../ComplianceAuditSection";

describe("ComplianceAuditSection", () => {
  it("renders audit history rows", () => {
    const data = [
      { timestamp: "2024-01-01T00:00:00Z", type: "SEC_17a-4" },
      { timestamp: "2024-02-01T00:00:00Z", type: "SOX" },
    ];
    render(<ComplianceAuditSection complianceHistory={data} />);
    expect(screen.getByText(/Compliance Audit History/i)).toBeInTheDocument();
    expect(screen.getByText("2024-01-01T00:00:00Z")).toBeInTheDocument();
    expect(screen.getByText("SEC_17a-4")).toBeInTheDocument();
    expect(screen.getByText("2024-02-01T00:00:00Z")).toBeInTheDocument();
    expect(screen.getByText("SOX")).toBeInTheDocument();
  });

  it("handles empty or non-array complianceHistory", () => {
    render(<ComplianceAuditSection complianceHistory={null} />);
    // Should render table headers but no rows
    expect(screen.getByText(/Compliance Audit History/i)).toBeInTheDocument();
    expect(screen.getByText(/Timestamp/i)).toBeInTheDocument();
    expect(screen.getByText(/Type/i)).toBeInTheDocument();
    // No data rows
    expect(screen.queryByRole('row', { name: /SEC_17a-4/i })).not.toBeInTheDocument();
  });
});
