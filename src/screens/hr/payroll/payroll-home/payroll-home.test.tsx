import type { PayrollPreviewPage } from 'src/redux/runPayroll/payroll-preview-run-api';

import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';

import PayrollHome from './payroll-home';

const mocks = vi.hoisted(() => ({
  yearId: 'year-1',
  data: undefined as PayrollPreviewPage | undefined,
  error: null as { message: string } | null,
  isCurrent: true,
  loadPreview: vi.fn(),
}));
vi.mock('react-redux', () => ({ useSelector: () => ({ currentYear: { id: mocks.yearId } }) }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));
vi.mock('@mui/x-date-pickers', () => ({ DatePicker: () => <input aria-label="Payroll month" /> }));
vi.mock('../run-payroll/use-payroll-preview-run', () => ({
  usePayrollPreviewRun: () => ({ ...mocks, busy: false, fetching: false }),
}));

const page = (overrides = {}): PayrollPreviewPage => ({
  previewRunId: 'run-1',
  isCurrent: true,
  isGenerated: true,
  totalCount: 3,
  currentPage: 0,
  pageSize: 25,
  items: [],
  readiness: {
    netPayTotal: 45000,
    month: '2026-10',
    canPreview: true,
    canLock: false,
    employeeCount: 3,
    snapshotCount: 3,
    reviewedCount: 0,
    lockedCount: 0,
    attendanceFoundCount: 3,
    missingAttendanceCount: 0,
    missingSalaryStructureCount: 2,
    policyConfigurationIssueCount: 1,
    blockingIssues: [],
    recommendedActions: [],
    ...overrides,
  },
});
const renderHome = () =>
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <PayrollHome />
    </ThemeProvider>
  );

describe('Payroll overview readiness', () => {
  beforeEach(() => {
    mocks.data = undefined;
    mocks.error = null;
    mocks.isCurrent = true;
    mocks.yearId = 'year-1';
  });

  it('explains salary and policy blockers and links to their owning workflows', () => {
    mocks.data = page();
    renderHome();
    expect(screen.getByText('Missing salary structure (2)')).toBeVisible();
    expect(screen.getByText('Payroll policy issues (1)')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Review salary setup' })).toHaveAttribute(
      'href',
      '/hr/payroll/structure'
    );
    expect(screen.getByRole('link', { name: 'Review payroll policies' })).toHaveAttribute(
      'href',
      '/hr/payrollPolicies'
    );
    expect(screen.queryByRole('link', { name: 'Review attendance' })).not.toBeInTheDocument();
  });

  it('does not claim a clear cycle while readiness is loading or failed', () => {
    const view = renderHome();
    expect(screen.queryByText(/No readiness blockers/)).not.toBeInTheDocument();
    mocks.error = { message: 'Request failed' };
    view.rerender(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <PayrollHome />
      </ThemeProvider>
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load payroll readiness');
    expect(screen.getAllByText('Unavailable')).toHaveLength(4);
    expect(screen.queryByText(/No readiness blockers/)).not.toBeInTheDocument();
  });

  it('shows server blockers even when category counts are zero', () => {
    mocks.data = page({
      missingSalaryStructureCount: 0,
      policyConfigurationIssueCount: 0,
      blockingIssues: ['A payroll exception requires review.'],
    });
    renderHome();
    expect(screen.getByText('A payroll exception requires review.')).toBeVisible();
    expect(screen.queryByText(/No readiness blockers/)).not.toBeInTheDocument();
  });

  it('opens payslips only after current payroll is fully locked', () => {
    mocks.data = page({
      lockedCount: 3,
      missingSalaryStructureCount: 0,
      policyConfigurationIssueCount: 0,
    });
    renderHome();
    expect(screen.getAllByRole('link', { name: 'Open payslips' })[0]).toHaveAttribute(
      'href',
      '/hr/payroll/payslip-generation'
    );
  });

  it('keeps stale results from reporting confirmed readiness or recommending payslips', () => {
    mocks.data = page({
      lockedCount: 3,
      missingSalaryStructureCount: 0,
      policyConfigurationIssueCount: 0,
    });
    mocks.isCurrent = false;
    renderHome();
    expect(screen.getByText('Refresh status to confirm readiness for this month.')).toBeVisible();
    expect(screen.getAllByRole('link', { name: 'Open payroll workbench' })[0]).toHaveAttribute(
      'href',
      '/hr/payroll/run-payroll'
    );
  });

  it('explains missing academic-year context and disables refresh', () => {
    mocks.yearId = '';
    renderHome();
    expect(screen.getByRole('alert')).toHaveTextContent('Select an academic year');
    expect(screen.getByRole('button', { name: 'Refresh status' })).toBeDisabled();
  });
});
