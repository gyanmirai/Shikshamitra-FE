import type { PayrollPreviewPage } from 'src/redux/runPayroll/payroll-preview-run-api';

import dayjs from 'dayjs';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import PayrollHome from './payroll-home';

const mocks = vi.hoisted(() => ({
  yearId: 'year-1',
  data: undefined as PayrollPreviewPage | undefined,
  error: null as { message: string } | null,
  isCurrent: true,
  loadPreview: vi.fn(),
  refreshStatus: vi.fn(),
  requestedRunId: 'run-1',
  refreshingStatus: false,
  params: new URLSearchParams('month=2026-09'),
  replace: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
  usePathname: () => '/hr/payroll',
  useSearchParams: () => mocks.params,
}));
vi.mock('react-redux', () => ({ useSelector: () => ({ currentYear: { id: mocks.yearId } }) }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));
vi.mock('@mui/x-date-pickers', () => ({
  DatePicker: ({ value, onChange }: any) => (
    <input
      aria-label="Payroll month"
      value={value.format('YYYY-MM')}
      onChange={(event) => onChange(dayjs(`${event.target.value}-01`))}
    />
  ),
}));
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
    mocks.params = new URLSearchParams('month=2026-09');
    mocks.requestedRunId = 'run-1';
    mocks.refreshingStatus = false;
    vi.clearAllMocks();
  });

  it('explains salary and policy blockers and links to their owning workflows', () => {
    mocks.data = page();
    renderHome();
    expect(screen.getByText('Missing salary structure (2)')).toBeVisible();
    expect(screen.getByText('Payroll policy issues (1)')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Review salary setup' })).toHaveAttribute(
      'href',
      '/hr/payroll/structure?month=2026-09'
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
    expect(screen.getByText(/A payroll setup issue needs attention/)).toBeVisible();
    expect(screen.queryByText('A payroll exception requires review.')).not.toBeInTheDocument();
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
      '/hr/payroll/payslip-generation?month=2026-09'
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
    expect(
      screen.getByText('Open the payroll workbench to calculate and review the updated payroll.')
    ).toBeVisible();
    expect(screen.getAllByRole('link', { name: 'Open payroll workbench' })[0]).toHaveAttribute(
      'href',
      '/hr/payroll/run-payroll?month=2026-09'
    );
  });

  it('explains missing academic-year context and disables refresh', () => {
    mocks.yearId = '';
    renderHome();
    expect(screen.getByRole('status')).toHaveTextContent('Select an academic year');
    expect(screen.getByRole('button', { name: 'Refresh status' })).toBeDisabled();
  });

  it('refetches status without requesting a new calculation', () => {
    mocks.data = page();
    renderHome();
    fireEvent.click(screen.getByRole('button', { name: 'Refresh status' }));
    expect(mocks.refreshStatus).toHaveBeenCalledOnce();
    expect(mocks.loadPreview).not.toHaveBeenCalled();
  });

  it('preserves the selected month in both overview navigation actions', () => {
    renderHome();
    screen
      .getAllByRole('link', { name: 'Open payroll workbench' })
      .forEach((link) =>
        expect(link).toHaveAttribute('href', '/hr/payroll/run-payroll?month=2026-09')
      );
    expect(screen.getByRole('link', { name: 'Open payslips' })).toHaveAttribute(
      'href',
      '/hr/payroll/payslip-generation?month=2026-09'
    );
  });

  it('uses actionable known blocker messages and safely groups unknown codes', () => {
    mocks.data = page({
      missingSalaryStructureCount: 0,
      policyConfigurationIssueCount: 0,
      blockingIssues: ['ESI_WAGE_CLASSIFICATION_REQUIRED', 'INTERNAL_CODE_A', 'INTERNAL_CODE_B'],
    });
    renderHome();
    expect(screen.getByText(/Review how earning components count toward ESIC wages/)).toBeVisible();
    expect(screen.getAllByText(/A payroll setup issue needs attention/)).toHaveLength(1);
    expect(screen.queryByText('ESI_WAGE_CLASSIFICATION_REQUIRED')).not.toBeInTheDocument();
    expect(screen.queryByText('INTERNAL_CODE_A')).not.toBeInTheDocument();
  });

  it('does not enable status refresh when there is no existing preview', () => {
    mocks.requestedRunId = '';
    renderHome();
    expect(screen.getByRole('button', { name: 'Refresh status' })).toBeDisabled();
  });
});
