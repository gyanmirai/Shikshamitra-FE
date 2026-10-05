'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import React from 'react';
import { formatCurrency } from 'src/utils/cureencyFormater';

import { isOfficialPayslipStatus } from './use-payslip-actions';

interface EmployeeDefinition {
  label: string;
}

interface LineItem {
  name: string;
  amount: number | null | undefined;
}

interface SalarySlipData {
  employeeName?: string | null;
  employeeCode?: string | null;
  department?: string | null;
  designation?: string | null;
  dateOfJoining?: string | Date | null;
  slipNumber?: string | null;
  status?: string | number | null;
  generatedAt?: string | Date | null;
  fullGrossSalary?: number | null;
  grossSalary?: number | null;
  additionalEarnings?: number | null;
  totalEarning: number | null | undefined;
  totalDeduction: number | null | undefined;
  netSalary: number | null | undefined;
  netPayInWords?: string | null;
  payrollBasisDays?: number | null;
  payableDays?: number | null;
  lopDays?: number | null;
  presentDays?: number | null;
  halfWorkingDays?: number | null;
  prorationFactor?: number | null;
  payrollDayCalculationMode?: string | null;
  bankName?: string | null;
  maskedAccountNumber?: string | null;
  ifscCode?: string | null;
  uanNumber?: string | null;
  epfNumber?: string | null;
  remarks?: string | null;
  earnings: LineItem[];
  deductions: LineItem[];
}

export interface PaySlipPrintViewProps {
  employee: EmployeeDefinition | null | undefined;
  monthYear: Dayjs | null | undefined;
  slip: SalarySlipData | null | undefined;
}

const ink = '#111827';
const muted = '#667085';
const border = '#d9dde3';
const panel = '#f6f7f9';

const formatDays = (value: number | null | undefined) =>
  value === null || value === undefined ? '-' : Number(value).toLocaleString('en-IN');

const formatDecimal = (value: number | null | undefined, digits = 4) =>
  value === null || value === undefined ? '-' : Number(value).toFixed(digits);

const formatDate = (value: string | Date | null | undefined) =>
  value ? dayjs(value).format('DD MMM YYYY') : '-';

const formatMode = (value: string | null | undefined) =>
  value
    ? value
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : '-';

const formatStatus = (value: string | number | null | undefined) => {
  if (value === 0 || value === '0') return 'Draft';
  if (value === 1 || value === '1') return 'Finalized';
  if (value === 2 || value === '2') return 'Paid';
  if (!value) return 'Status Pending';

  const normalized = String(value).replace(/[_-]/g, ' ');
  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
};

const salaryLineTotal = (data: LineItem[]) =>
  (data || []).reduce((sum, item) => sum + Number(item?.amount || 0), 0);

const Section = ({
  title,
  rows,
  columns = 2,
}: {
  title: string;
  rows: Array<[string, string]>;
  columns?: 2 | 4;
}) => (
  <div style={{ flex: 1, border: `1px solid ${border}` }}>
    <div style={{ padding: '7px 10px', background: panel, borderBottom: `1px solid ${border}` }}>
      <p style={{ margin: 0, fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>
        {title}
      </p>
    </div>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      }}
    >
      {rows.map(([label, value]) => (
        <div
          key={label}
          style={{
            minHeight: 42,
            padding: '7px 10px',
            borderRight: `1px solid ${border}`,
            borderBottom: `1px solid ${border}`,
          }}
        >
          <p style={{ margin: 0, color: muted, fontSize: 9, fontWeight: 700 }}>{label}</p>
          <p style={{ margin: '2px 0 0', fontSize: 11, fontWeight: 600 }}>{value}</p>
        </div>
      ))}
    </div>
  </div>
);

const AmountTable = ({
  title,
  rows,
  total,
  emptyText,
}: {
  title: string;
  rows: LineItem[];
  total: number | null | undefined;
  emptyText: string;
}) => {
  const computedTotal = rows.length ? salaryLineTotal(rows) : Number(total || 0);

  return (
    <div style={{ flex: 1, border: `1px solid ${border}` }}>
      <div style={{ padding: '7px 10px', background: panel, borderBottom: `1px solid ${border}` }}>
        <p style={{ margin: 0, fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>
          {title}
        </p>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
        <thead>
          <tr>
            <th style={thStyle}>Component</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr key={`${row.name}-${index}`}>
                <td style={tdStyle}>{row.name || '-'}</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700 }}>
                  {formatCurrency(row.amount ?? 0)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={tdStyle} colSpan={2}>
                {emptyText}
              </td>
            </tr>
          )}
          <tr>
            <td style={totalStyle}>Total</td>
            <td style={{ ...totalStyle, textAlign: 'right' }}>{formatCurrency(computedTotal)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  padding: '7px 10px',
  textAlign: 'left',
  borderBottom: `1px solid ${border}`,
  color: muted,
  fontSize: 10,
  fontWeight: 800,
};

const tdStyle: React.CSSProperties = {
  padding: '7px 10px',
  borderBottom: `1px solid ${border}`,
  color: muted,
};

const totalStyle: React.CSSProperties = {
  padding: '8px 10px',
  background: panel,
  borderTop: `1px solid ${border}`,
  fontWeight: 800,
  color: ink,
};

const PaySlipPrintView = React.forwardRef<HTMLDivElement, PaySlipPrintViewProps>(
  ({ employee, monthYear, slip }, ref) => {
    if (!slip) return null;

    const period = monthYear ? monthYear.format('MMMM YYYY') : '-';
    const employeeName = slip.employeeName || employee?.label || '-';
    const status = formatStatus(slip.status);
    const isPreview = !isOfficialPayslipStatus(slip.status);
    const employeeRows: Array<[string, string]> = [
      ['Staff Name', employeeName],
      ['Staff Code', slip.employeeCode || '-'],
      ['Department', slip.department || '-'],
      ['Designation', slip.designation || '-'],
      ['Date of Joining', formatDate(slip.dateOfJoining)],
    ];
    const paymentRows: Array<[string, string]> = [
      ['Bank', slip.bankName || '-'],
      ['Account No.', slip.maskedAccountNumber || '-'],
      ['IFSC', slip.ifscCode || '-'],
      ['UAN', slip.uanNumber || '-'],
      ['EPF No.', slip.epfNumber || '-'],
    ];
    const payBasisRows: Array<[string, string]> = [
      ['Payroll Basis Days', formatDays(slip.payrollBasisDays)],
      ['Payable Days', formatDays(slip.payableDays)],
      ['Present Days', formatDays(slip.presentDays)],
      ['Half Days', formatDays(slip.halfWorkingDays)],
      ['LOP / Absent Days', formatDays(slip.lopDays)],
      ['Proration Factor', formatDecimal(slip.prorationFactor)],
      ['Day Calculation', formatMode(slip.payrollDayCalculationMode)],
      ['Pay Period', period],
      ['Full-month gross', formatCurrency(slip.fullGrossSalary ?? 0)],
      ['Gross Salary', formatCurrency(slip.grossSalary ?? 0)],
      ['Additional earnings', formatCurrency(slip.additionalEarnings ?? 0)],
      ['Total earnings', formatCurrency(slip.totalEarning ?? 0)],
    ];

    return (
      <div
        ref={ref}
        style={{
          width: '794px',
          minHeight: '1123px',
          fontFamily: 'Arial, sans-serif',
          background: '#fff',
          padding: '32px',
          color: ink,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ borderBottom: `2px solid ${ink}`, paddingBottom: 14, marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, textTransform: 'uppercase' }}>
                Institution Payroll
              </p>
              <p style={{ margin: '2px 0 0', color: muted, fontSize: 10 }}>
                {isPreview ? 'Preview salary statement' : 'Official salary statement'}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p
                style={{
                  display: 'inline-block',
                  margin: 0,
                  padding: '5px 12px',
                  border: `1px solid ${ink}`,
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                }}
              >
                {isPreview ? `Preview - ${status}` : status}
              </p>
            </div>
          </div>

          <h1 style={{ margin: '14px 0 10px', textAlign: 'center', fontSize: 20 }}>Salary Slip</h1>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 8 }}>
            <HeaderValue label="Staff" value={employeeName} />
            <HeaderValue label="Pay Period" value={period} alignRight />
            <HeaderValue label="Slip Number" value={slip.slipNumber || '-'} />
            <HeaderValue label="Generated On" value={formatDate(slip.generatedAt)} alignRight />
          </div>
        </div>

        {isPreview ? (
          <div
            style={{
              border: `1px solid ${border}`,
              background: panel,
              padding: '8px 10px',
              marginBottom: 12,
            }}
          >
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700 }}>
              Preview payslip only. Finalize/lock payroll to issue the official salary slip.
            </p>
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <Section title="Staff Details" rows={employeeRows} />
          <Section title="Payment & Statutory" rows={paymentRows} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <Section title="Pay Basis" rows={payBasisRows} columns={4} />
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'stretch', marginBottom: 12 }}>
          <AmountTable
            title="Earnings"
            total={slip.totalEarning}
            emptyText="No earnings"
            rows={slip.earnings ?? []}
          />
          <AmountTable
            title="Deductions"
            total={slip.totalDeduction}
            emptyText="No deductions"
            rows={slip.deductions ?? []}
          />
        </div>

        <div style={{ border: `2px solid ${ink}`, marginBottom: 12 }}>
          <div
            style={{
              padding: 10,
              background: panel,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>
                Net Payable
              </p>
              <p style={{ margin: '2px 0 0', color: muted, fontSize: 10 }}>
                Final amount payable after all deductions
              </p>
            </div>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>
              {formatCurrency(slip.netSalary ?? 0)}
            </p>
          </div>
          <div style={{ padding: 10, borderTop: `1px solid ${border}` }}>
            <p style={{ margin: 0, color: muted, fontSize: 10, fontWeight: 700 }}>
              Amount in Words
            </p>
            <p style={{ margin: '3px 0 0', fontSize: 11, fontWeight: 600 }}>
              {slip.netPayInWords || '-'}
            </p>
          </div>
        </div>

        {slip.remarks ? (
          <div style={{ border: `1px solid ${border}`, padding: 10, marginBottom: 12 }}>
            <p style={{ margin: 0, color: muted, fontSize: 10, fontWeight: 700 }}>Remarks</p>
            <p style={{ margin: '4px 0 0', fontSize: 11 }}>{slip.remarks}</p>
          </div>
        ) : null}

        <div style={{ borderTop: `1px solid ${border}`, paddingTop: 10, textAlign: 'center' }}>
          {isPreview ? (
            <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 800, color: ink }}>
              This is a preview payslip and is not an official salary slip.
            </p>
          ) : null}
          <p style={{ margin: 0, fontSize: 10, color: muted }}>
            This is a computer-generated payslip and does not require a signature.
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 10, color: muted }}>
            Confidential payroll document. Contact HR/payroll for any discrepancy.
          </p>
        </div>
      </div>
    );
  }
);

const HeaderValue = ({
  label,
  value,
  alignRight = false,
}: {
  label: string;
  value: string;
  alignRight?: boolean;
}) => (
  <div style={{ textAlign: alignRight ? 'right' : 'left' }}>
    <p style={{ margin: 0, color: muted, fontSize: 10, fontWeight: 700 }}>{label}</p>
    <p style={{ margin: '2px 0 0', fontSize: 11, fontWeight: 700 }}>{value}</p>
  </div>
);

PaySlipPrintView.displayName = 'PaySlipPrintView';

export default PaySlipPrintView;
