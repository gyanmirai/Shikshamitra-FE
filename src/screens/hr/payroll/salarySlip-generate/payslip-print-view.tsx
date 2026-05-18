'use client';

import type { Dayjs } from 'dayjs';

import React from 'react';
import { formatCurrency } from 'src/utils/cureencyFormater';

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

// Minimal employee definition needed for this view
interface EmployeeDefinition {
  label: string;
}

// Reusable structure for both earning and deduction line items
interface LineItem {
  name: string;
  amount: number | null | undefined;
}

// The core data structure for the salary slip itself
interface SalarySlipData {
  totalEarning: number | null | undefined;
  totalDeduction: number | null | undefined;
  netSalary: number | null | undefined;
  payrollBasisDays?: number | null;
  payableDays?: number | null;
  lopDays?: number | null;
  presentDays?: number | null;
  halfWorkingDays?: number | null;
  prorationFactor?: number | null;
  payrollDayCalculationMode?: string | null;
  earnings: LineItem[];
  deductions: LineItem[];
}

// ---------------------------------------------------------------------------
// Props for the PaySlipPrintView Component
// ---------------------------------------------------------------------------
export interface PaySlipPrintViewProps {
  employee: EmployeeDefinition | null | undefined;
  monthYear: Dayjs | null | undefined;
  slip: SalarySlipData | null | undefined;
}

// ---------------------------------------------------------------------------
// Hidden payslip view — rendered off-screen, used by react-to-print
// ---------------------------------------------------------------------------

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '13px',
};

const thStyle: React.CSSProperties = {
  background: '#f3f4f6',
  padding: '8px 12px',
  textAlign: 'left',
  borderBottom: '1px solid #e5e7eb',
  fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid #e5e7eb',
};

// Combining base TD styles with text-align: right
const tdRightStyle: React.CSSProperties = {
  ...tdStyle,
  textAlign: 'right',
};

const formatDays = (value: number | null | undefined) =>
  value === null || value === undefined ? '-' : Number(value).toLocaleString('en-IN');

const formatMode = (value: string | null | undefined) =>
  value
    ? value
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : '-';

const PaySlipPrintView = React.forwardRef<HTMLDivElement, PaySlipPrintViewProps>(
  ({ employee, monthYear, slip }, ref) => {
    // 1. Guard against null or missing slip data. Using optional chaining below is a secondary defense.
    if (!slip) return null;

    const period = monthYear ? monthYear.format('MMMM YYYY') : '-';

    return (
      <div
        ref={ref}
        style={{
          // No fixed positioning here to avoid blank print pages
          top: 0,
          width: '794px', // A4 width in px at 96 dpi
          fontFamily: 'Arial, sans-serif',
          background: '#fff',
          padding: '40px',
          color: '#111',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Salary Slip</h2>
            <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>
              Pay Period: {period}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>{employee?.label || '-'}</p>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '2px solid #e5e7eb', marginBottom: 24 }} />

        {/* Summary row */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
          {[
            {
              label: 'Total Earnings',
              value: slip?.totalEarning,
              color: '#16a34a',
            },
            {
              label: 'Total Deductions',
              value: slip?.totalDeduction,
              color: '#dc2626',
            },
            {
              label: 'Net Payable',
              value: slip?.netSalary,
              color: '#2563eb',
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                flex: 1,
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: '12px 16px',
                textAlign: 'center',
              }}
            >
              <p style={{ margin: 0, color: '#6b7280', fontSize: 12 }}>{s.label}</p>
              <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 700, color: s.color }}>
                {formatCurrency(s.value ?? 0)}
              </p>
            </div>
          ))}
        </div>

        <div
          style={{
            border: '1px solid #e5e7eb',
            background: '#f8fafc',
            padding: 12,
            marginBottom: 24,
          }}
        >
          <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700 }}>Pay Basis</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              ['Payable Days', formatDays(slip.payableDays)],
              ['Payroll Basis Days', formatDays(slip.payrollBasisDays)],
              ['LOP / Absent Days', formatDays(slip.lopDays)],
              [
                'Proration Factor',
                slip.prorationFactor === null || slip.prorationFactor === undefined
                  ? '-'
                  : Number(slip.prorationFactor).toFixed(4),
              ],
              ['Present Days', formatDays(slip.presentDays)],
              ['Half Days', formatDays(slip.halfWorkingDays)],
              ['Day Calculation', formatMode(slip.payrollDayCalculationMode)],
              ['Pay Period', period],
            ].map(([label, value]) => (
              <div key={label}>
                <p style={{ margin: 0, color: '#6b7280', fontSize: 10 }}>{label}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, fontWeight: 600 }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tables side by side */}
        <div style={{ display: 'flex', gap: 20 }}>
          {/* Earnings */}
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: '#16a34a' }}>
              Earnings
            </h3>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Earning Type</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {(slip.earnings ?? []).map((e: LineItem, i: number) => (
                  <tr key={i}>
                    <td style={tdStyle}>{e.name}</td>
                    <td style={tdRightStyle}>{formatCurrency(e.amount ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Deductions */}
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: '#dc2626' }}>
              Deductions
            </h3>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Deduction Type</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {(slip.deductions ?? []).map((d: LineItem, i: number) => (
                  <tr key={i}>
                    <td style={tdStyle}>{d.name}</td>
                    <td style={tdRightStyle}>{formatCurrency(d.amount ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '28px 0 12px' }} />
        <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>
          This is a computer-generated payslip and does not require a signature.
        </p>
      </div>
    );
  }
);

PaySlipPrintView.displayName = 'PaySlipPrintView';

export default PaySlipPrintView;
