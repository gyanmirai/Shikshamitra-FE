import type { ReactNode } from 'react';

import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, screen, render, within, waitFor, fireEvent } from '@testing-library/react';

import RunPayroll from './runPayroll';

const mocks = vi.hoisted(() => ({
  preview: {} as any,
  query: 'month=2026-08',
  state: {
    auth: { permissions: [] },
    globalState: { currentYear: { id: 'year-1', name: '2026-27' } },
  },
  load: vi.fn(),
  replace: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
  mark: vi.fn(),
  unmark: vi.fn(),
  lock: vi.fn(),
  confirmLock: null as null | (() => Promise<void>),
  adjustment: vi.fn(),
}));
vi.mock('./payroll-registration-readiness', () => ({ PayrollRegistrationReadiness: () => null }));

vi.mock('react-redux', () => ({ useSelector: (selector: any) => selector(mocks.state) }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
  usePathname: () => '/hr/payroll/run-payroll',
  useSearchParams: () => new URLSearchParams(mocks.query),
}));
vi.mock('src/utils/permissions', () => ({ hasGrantedPermission: () => true }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: mocks.success, error: mocks.error },
}));
vi.mock('./use-payroll-preview-run', () => ({ usePayrollPreviewRun: () => mocks.preview }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/routes/components', () => ({
  RouterLink: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));
vi.mock('@mui/x-date-pickers', () => ({
  DatePicker: () => <input aria-label="Payroll month" readOnly value="August 2026" />,
}));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading, action }: { heading: string; action: ReactNode }) => (
    <header>
      <h1>{heading}</h1>
      {action}
    </header>
  ),
}));
vi.mock('src/components/three-dots-actions', () => ({
  default: ({ handleViewClick }: any) => (
    <button type="button" onClick={handleViewClick}>
      View employee
    </button>
  ),
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ columns, data, isLoading }: any) => (
    <section aria-label="Payroll rows" data-loading={String(isLoading)}>
      {data.map((row: any) => (
        <div key={row.id}>
          {columns
            .filter((column: any) => ['checkBox', 'issueFilter', 'actions'].includes(column.id))
            .map((column: any) => (
              <div key={column.id}>{column.render(null, row)}</div>
            ))}
        </div>
      ))}
    </section>
  ),
}));
vi.mock('src/components/confirm-dialog', () => ({
  ConfirmDialog: ({ open, action }: any) => {
    mocks.confirmLock = action.props.onClick;
    return open ? (
      <div role="dialog" aria-label="Lock reviewed payroll rows">
        {action}
      </div>
    ) : null;
  },
}));
vi.mock('../../policies/components/HRPolicySharedUI', () => ({
  DrawerHeader: ({ title, helpText, onClose }: any) => (
    <header>
      <h2>{title}</h2>
      <p>{helpText}</p>
      <button type="button" onClick={onClose}>
        Close details
      </button>
    </header>
  ),
}));
vi.mock('./salary-details-table-card', () => ({ SalaryDetailsTableCard: () => null }));
vi.mock('src/redux/hr/hr-policy-api', () => ({
  useGetHrAuditEventsQuery: () => ({ data: { items: [] } }),
}));
vi.mock('src/redux/runPayroll/runPayrollApi', () => ({
  useMarkPayrollReviewedMutation: () => mocks.mark,
  useUnmarkPayrollReviewedMutation: () => mocks.unmark,
  useGenerateAndLockPayrollMutation: () => mocks.lock,
  useCreatePayrollAdjustmentMutation: () => mocks.adjustment,
  useUpdatePayrollAdjustmentMutation: () => mocks.adjustment,
  useDeletePayrollAdjustmentMutation: () => mocks.adjustment,
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ currentQueryAndMutation }: any) => [currentQueryAndMutation(), { isLoading: false }],
}));

const theme = createTheme(defaultSettings);
const view = () => (
  <ThemeProvider theme={theme}>
    <RunPayroll />
  </ThemeProvider>
);

beforeEach(() => {
  vi.clearAllMocks();
  mocks.query = 'month=2026-08';
  mocks.state.globalState.currentYear = { id: 'year-1', name: '2026-27' };
  mocks.load.mockResolvedValue({ id: 'run-2', status: 'QUEUED' });
  mocks.preview = {
    data: {
      isGenerated: false,
      items: [
        {
          employeeId: 'employee-1',
          employeeName: 'Test Staff',
          reviewStatus: 'REVIEWED',
          totalWorkingDays: 26,
          payableDays: 26,
          issueCodes: [],
        },
      ],
      readiness: {
        month: '2026-08',
        canPreview: true,
        employeeCount: 1,
        snapshotCount: 1,
        reviewedCount: 1,
        lockedCount: 0,
        missingAttendanceCount: 0,
        missingSalaryStructureCount: 0,
        policyConfigurationIssueCount: 0,
        blockingIssues: [],
        netPayTotal: 10000,
      },
    },
    runId: 'run-1',
    requestedRunId: 'run-1',
    isCurrent: true,
    isPreparing: false,
    isStale: false,
    busy: false,
    fetching: false,
    error: null,
    loadPreview: mocks.load,
    page: 0,
    pageSize: 25,
    searchInput: '',
    setSearchInput: vi.fn(),
    updateQuery: vi.fn(),
  };
  mocks.mark.mockReturnValue({ unwrap: () => Promise.resolve({}) });
  mocks.unmark.mockReturnValue({ unwrap: () => Promise.resolve({}) });
  mocks.lock.mockReturnValue({ unwrap: () => Promise.resolve({}) });
});

describe('Run Payroll preview feedback', () => {
  it('keeps pending identifiers as warnings and still blocks genuine payroll setup issues', async () => {
    const pending = ['PF_NUMBER_MISSING', 'ESI_NUMBER_MISSING', 'ESI_INSURANCE_NUMBER_REQUIRED'];
    mocks.preview.data.items[0].issueCodes = pending;
    const ui = render(view());
    expect(screen.getByText('Warning • 3')).toBeVisible();
    await userEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('button', { name: 'Lock Reviewed' })).toBeEnabled();
    mocks.preview = {
      ...mocks.preview,
      data: {
        ...mocks.preview.data,
        items: [{ ...mocks.preview.data.items[0], issueCodes: [...pending, 'NO_ATTENDANCE'] }],
      },
    };
    ui.rerender(view());
    expect(screen.getByText('Critical • 4')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Lock Reviewed' })).toBeDisabled();
    expect(mocks.lock).not.toHaveBeenCalled();
  });

  it('keeps refresh and readiness together in the register action row', async () => {
    render(view());
    expect(
      within(screen.getByRole('region', { name: 'Payroll Register' })).getByRole('button', {
        name: 'Refresh preview',
      })
    ).toBeVisible();
    expect(
      within(screen.getByRole('banner')).queryByRole('button', { name: 'Refresh preview' })
    ).not.toBeInTheDocument();
    expect(
      within(screen.getByRole('group', { name: 'Payroll preview' })).getByRole('button', {
        name: 'Refresh preview',
      })
    ).toBeVisible();
    const inspectionActions = within(
      screen.getByRole('group', { name: 'Payroll readiness and audit' })
    );
    expect(inspectionActions.getByRole('button', { name: 'View readiness' })).toBeVisible();
    expect(inspectionActions.getByRole('button', { name: 'Audit' })).toBeVisible();
    const reviewActions = within(
      screen.getByRole('group', { name: 'Review and lock selected payroll rows' })
    );
    expect(reviewActions.getByRole('button', { name: 'Mark Reviewed' })).toBeDisabled();
    expect(reviewActions.getByRole('button', { name: 'Unmark' })).toBeDisabled();
    expect(reviewActions.getByRole('button', { name: 'Lock Reviewed' })).toBeDisabled();
    expect(screen.queryByRole('link', { name: 'Open attendance' })).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Payroll Readiness' })).not.toBeInTheDocument();
    expect(screen.queryByText('Academic year')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    await userEvent.click(
      within(screen.getByRole('region', { name: 'Payroll Register' })).getByRole('button', {
        name: 'View readiness',
      })
    );
    expect(
      within(screen.getByRole('region', { name: 'Readiness checks' })).getByRole('link', {
        name: 'Open attendance',
      })
    ).toHaveAttribute('href', '/hr/manual-attendance');
    expect(screen.queryByRole('button', { name: 'Move to Attendance' })).not.toBeInTheDocument();
    expect(mocks.success).not.toHaveBeenCalled();
  });

  it('starts closed, supports keyboard opening and Escape, and restores focus', async () => {
    render(view());
    fireEvent.scroll(window);
    const toggle = screen.getByRole('button', { name: 'View readiness' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    act(() => toggle.focus());
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('dialog', { name: 'Payroll Readiness' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Payroll Readiness' })).not.toBeInTheDocument()
    );
    expect(toggle).toHaveFocus();
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('preserves row selection, search, and pagination when inspecting readiness', async () => {
    mocks.preview.searchInput = 'Test';
    mocks.preview.page = 2;
    render(view());
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select payroll for Test Staff' }));
    await userEvent.click(screen.getByRole('button', { name: 'View readiness' }));
    await userEvent.click(
      within(screen.getByRole('dialog', { name: 'Payroll Readiness' })).getByRole('button', {
        name: 'Close details',
      })
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Payroll Readiness' })).not.toBeInTheDocument()
    );
    expect(screen.getByRole('checkbox', { name: 'Select payroll for Test Staff' })).toBeChecked();
    expect(mocks.preview.searchInput).toBe('Test');
    expect(mocks.preview.page).toBe(2);
    expect(mocks.preview.updateQuery).not.toHaveBeenCalled();
    expect(mocks.load).not.toHaveBeenCalled();
  });

  it.each(['month', 'year'])(
    'closes readiness on a %s change and ignores previous-context aggregates',
    async (change) => {
      const ui = render(view());
      await userEvent.click(screen.getByRole('button', { name: 'View readiness' }));
      if (change === 'month') mocks.query = 'month=2026-09';
      else {
        mocks.state.globalState.currentYear = { id: 'year-2', name: '2027-28' };
        // The preview hook clears data immediately for a different year.
        mocks.preview = { ...mocks.preview, data: undefined, isCurrent: false };
      }
      ui.rerender(view());
      await waitFor(() =>
        expect(screen.queryByRole('dialog', { name: 'Payroll Readiness' })).not.toBeInTheDocument()
      );
      expect(screen.getByRole('button', { name: 'View readiness' })).toHaveAttribute(
        'aria-expanded',
        'false'
      );
      await userEvent.click(screen.getByRole('button', { name: 'View readiness' }));
      expect(screen.getByRole('status')).not.toHaveTextContent('Ready to review');
      const summary = screen.getByRole('region', { name: 'Preview summary' });
      expect(within(summary).getAllByText('Unavailable')).toHaveLength(5);
    }
  );

  it('uses run totals when a search has no rows and preserves genuine zero values', async () => {
    mocks.preview.data.items = [];
    mocks.preview.data.readiness.netPayTotal = 0;
    mocks.preview.searchInput = 'No matching employee';
    mocks.preview.page = 3;
    mocks.preview.fetching = true;
    mocks.preview.isCurrent = false;
    render(view());
    await userEvent.click(screen.getByRole('button', { name: 'View readiness' }));
    expect(screen.getByRole('status')).toHaveTextContent('Ready to review');
    const summary = screen.getByRole('region', { name: 'Preview summary' });
    expect(within(summary).getByText('₹0')).toBeVisible();
    expect(within(summary).getAllByText('1')).toHaveLength(2);
    expect(within(summary).getByText('0 / 1')).toBeVisible();
    expect(mocks.success).not.toHaveBeenCalled();
  });

  it.each([
    {
      missingAttendanceCount: 28,
      missingSalaryStructureCount: 0,
      blockingIssues: ['NO_ATTENDANCE'],
      status: 'Attendance missing · 28',
    },
    {
      missingAttendanceCount: 0,
      missingSalaryStructureCount: 2,
      blockingIssues: ['MISSING_SALARY_STRUCTURE'],
      status: 'Salary setup missing · 2',
    },
    {
      missingAttendanceCount: 28,
      missingSalaryStructureCount: 2,
      blockingIssues: ['NO_ATTENDANCE', 'MISSING_SALARY_STRUCTURE'],
      status: 'Needs attention',
    },
  ])('shows server check status inside readiness: $status', async ({ status, ...readiness }) => {
    Object.assign(mocks.preview.data.readiness, readiness);
    render(view());
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'View readiness' }));
    expect(screen.getByRole('status')).toHaveTextContent(status);
  });

  it('lists additional blockers with friendly labels and keeps unknown blockers visible', async () => {
    mocks.preview.data.readiness.blockingIssues = [
      'COMPENSATION_REVISION_REQUIRED',
      'COMPENSATION_REVISION_REQUIRED',
      'UNKNOWN_INTERNAL_CODE',
      'PF_WAGE_BASIS_REQUIRED',
    ];
    render(view());
    await userEvent.click(screen.getByRole('button', { name: 'View readiness' }));
    expect(screen.getByRole('status')).toHaveTextContent('Needs attention');
    const additional = screen.getByRole('region', { name: 'Additional readiness checks' });
    expect(within(additional).getAllByText('Effective salary setup required')).toHaveLength(1);
    expect(within(additional).getByText('Another payroll check needs attention')).toBeVisible();
    expect(
      within(additional).getByText(
        'PF wage basis required. Update the salary structure to match the assigned PF rule.'
      )
    ).toBeVisible();
    expect(screen.queryByText('UNKNOWN_INTERNAL_CODE')).not.toBeInTheDocument();
  });

  it('does not report unavailable checks as ready or unavailable totals as zero', async () => {
    delete mocks.preview.data.readiness.missingSalaryStructureCount;
    delete mocks.preview.data.readiness.netPayTotal;
    render(view());
    await userEvent.click(screen.getByRole('button', { name: 'View readiness' }));
    expect(screen.getByRole('status')).toHaveTextContent('Readiness unavailable');
    expect(
      within(screen.getByRole('region', { name: 'Readiness checks' })).getByText('Unavailable')
    ).toBeVisible();
    expect(
      within(screen.getByRole('region', { name: 'Preview summary' })).getByText('Unavailable')
    ).toBeVisible();
    expect(screen.queryByText('₹0')).not.toBeInTheDocument();
  });

  it('reports zero staff without claiming that payroll is ready', async () => {
    Object.assign(mocks.preview.data.readiness, {
      employeeCount: 0,
      snapshotCount: 0,
      reviewedCount: 0,
      netPayTotal: 0,
    });
    mocks.preview.data.items = [];
    render(view());
    await userEvent.click(screen.getByRole('button', { name: 'View readiness' }));
    expect(screen.getByRole('status')).toHaveTextContent('No staff');
    expect(
      within(screen.getByRole('region', { name: 'Preview summary' })).getByText('₹0')
    ).toBeVisible();
  });

  it('keeps the read-only drawer dismissible while preparing and retains completed aggregates', async () => {
    mocks.preview.isPreparing = true;
    mocks.preview.isCurrent = false;
    render(view());
    await userEvent.click(screen.getByRole('button', { name: 'View readiness' }));
    expect(screen.getByRole('status')).toHaveTextContent('Preparing preview');
    expect(
      within(screen.getByRole('region', { name: 'Preview summary' })).getByText('₹10,000')
    ).toBeVisible();
    expect(
      screen.getByText('Showing the last completed preview while preparing results.')
    ).toBeVisible();
    await userEvent.click(
      within(screen.getByRole('dialog', { name: 'Payroll Readiness' })).getByRole('button', {
        name: 'Close details',
      })
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Payroll Readiness' })).not.toBeInTheDocument()
    );
    expect(screen.getByRole('button', { name: 'Refreshing…' })).toBeDisabled();
  });

  it('shows localized refresh progress without background or outdated alerts', () => {
    mocks.preview.isPreparing = true;
    mocks.preview.isCurrent = false;
    render(view());
    expect(screen.getByRole('button', { name: 'Refreshing…' })).toBeDisabled();
    expect(screen.getByRole('progressbar', { name: 'Preparing payroll preview' })).toBeVisible();
    expect(screen.queryByText(/background|outdated/)).not.toBeInTheDocument();
  });

  it('uses table skeletons for initial preparation', () => {
    mocks.preview.data = undefined;
    mocks.preview.isPreparing = true;
    mocks.preview.isCurrent = false;
    render(view());
    expect(
      within(screen.getByRole('region', { name: 'Payroll Register' })).getByRole('button', {
        name: 'Generating…',
      })
    ).toBeDisabled();
    expect(screen.getByRole('region', { name: 'Payroll rows' })).toHaveAttribute(
      'data-loading',
      'true'
    );
  });

  it('keeps ordinary row fetching separate from refresh and stale feedback', () => {
    mocks.preview.fetching = true;
    mocks.preview.isCurrent = false;
    render(view());
    expect(screen.getByRole('button', { name: 'Refresh preview' })).toBeEnabled();
    expect(screen.getByRole('progressbar', { name: 'Loading payroll rows' })).toBeVisible();
    expect(screen.queryByText('Preview needs refresh')).not.toBeInTheDocument();
    expect(mocks.success).not.toHaveBeenCalled();
  });

  it('shows genuine stale state as a compact status', () => {
    mocks.preview.isStale = true;
    mocks.preview.isCurrent = false;
    render(view());
    expect(
      within(screen.getByRole('region', { name: 'Payroll Register' })).getByRole('status')
    ).toHaveTextContent('Preview needs refresh');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('notifies once after the accepted run and its current rows are ready', async () => {
    const ui = render(view());
    await userEvent.click(screen.getByRole('button', { name: 'Refresh preview' }));
    expect(mocks.success).not.toHaveBeenCalled();
    mocks.preview = {
      ...mocks.preview,
      requestedRunId: 'run-2',
      isPreparing: true,
      isCurrent: false,
    };
    ui.rerender(view());
    expect(mocks.success).not.toHaveBeenCalled();
    mocks.preview = { ...mocks.preview, runId: 'run-2', isPreparing: false, isCurrent: true };
    ui.rerender(view());
    expect(mocks.success).toHaveBeenCalledExactlyOnceWith({ message: 'Payroll preview updated.' });
    ui.rerender(view());
    expect(mocks.success).toHaveBeenCalledTimes(1);
  });

  it('notifies after a successful zero-row result', async () => {
    const ui = render(view());
    await userEvent.click(screen.getByRole('button', { name: 'Refresh preview' }));
    mocks.preview = {
      ...mocks.preview,
      requestedRunId: 'run-2',
      runId: 'run-2',
      data: { ...mocks.preview.data, items: [] },
    };
    ui.rerender(view());
    expect(mocks.success).toHaveBeenCalledTimes(1);
  });

  it('blocks duplicate explicit requests while awaiting the accepted run', async () => {
    render(view());
    await userEvent.dblClick(screen.getByRole('button', { name: 'Refresh preview' }));
    expect(mocks.load).toHaveBeenCalledExactlyOnceWith(true);
  });

  it('shows one failure notification and persistent retry feedback', async () => {
    const ui = render(view());
    await userEvent.click(screen.getByRole('button', { name: 'Refresh preview' }));
    mocks.preview = {
      ...mocks.preview,
      requestedRunId: 'run-2',
      isCurrent: false,
      error: { message: 'Request failed' },
    };
    ui.rerender(view());
    expect(mocks.error).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Payroll preview could not be prepared. Please retry.'
    );
    expect(screen.getByRole('button', { name: 'Retry' })).toBeEnabled();
    ui.rerender(view());
    expect(mocks.error).toHaveBeenCalledTimes(1);
  });

  it('does not notify for automatic failures or superseded results', async () => {
    mocks.preview.error = { message: 'Request failed' };
    const ui = render(view());
    expect(mocks.error).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    mocks.preview = {
      ...mocks.preview,
      requestedRunId: 'run-2',
      error: null,
      isStale: true,
      isCurrent: false,
    };
    ui.rerender(view());
    expect(mocks.error).not.toHaveBeenCalled();
    expect(mocks.success).not.toHaveBeenCalled();
  });

  it('clears pending notifications when the month changes', async () => {
    const ui = render(view());
    await userEvent.click(screen.getByRole('button', { name: 'Refresh preview' }));
    mocks.query = 'month=2026-09';
    mocks.preview = { ...mocks.preview, requestedRunId: 'run-2' };
    ui.rerender(view());
    expect(mocks.success).not.toHaveBeenCalled();
  });

  it('ignores request acceptance after navigating away', async () => {
    let resolve!: (value: { id: string }) => void;
    mocks.load.mockReturnValue(
      new Promise((done) => {
        resolve = done;
      })
    );
    const ui = render(view());
    await userEvent.click(screen.getByRole('button', { name: 'Refresh preview' }));
    ui.unmount();
    await act(async () => resolve({ id: 'run-2' }));
    expect(mocks.success).not.toHaveBeenCalled();
    expect(mocks.error).not.toHaveBeenCalled();
  });

  it('keeps employee details readable and adjustment save disabled when stale', async () => {
    mocks.preview.isCurrent = false;
    mocks.preview.isStale = true;
    render(view());
    await userEvent.click(screen.getByRole('button', { name: 'View employee' }));
    expect(
      screen.getByText('Review salary, attendance, deductions, and payroll adjustments.')
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Add adjustment' })).toBeDisabled();
    expect(
      screen.getByText("Adjustments require this employee's current preview row to be loaded.")
    ).toBeVisible();
    expect(mocks.adjustment).not.toHaveBeenCalled();
  });

  it('keeps details readable but blocks adjustments when the displayed employee leaves the loaded page', async () => {
    const ui = render(view());
    await userEvent.click(screen.getByRole('button', { name: 'View employee' }));
    expect(screen.getByRole('button', { name: 'Add adjustment' })).toBeEnabled();
    mocks.preview = { ...mocks.preview, data: { ...mocks.preview.data, items: [] } };
    ui.rerender(view());
    expect(
      screen.getByText('Review salary, attendance, deductions, and payroll adjustments.')
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Add adjustment' })).toBeDisabled();
    expect(mocks.adjustment).not.toHaveBeenCalled();
  });

  it('blocks a lock handler when the preview becomes stale with confirmation open', async () => {
    const ui = render(view());
    await userEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByText(/1 selected/)).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Lock Reviewed' }));
    expect(screen.getByRole('dialog', { name: 'Lock reviewed payroll rows' })).toBeVisible();
    mocks.preview = { ...mocks.preview, isCurrent: false, isStale: true };
    ui.rerender(view());
    expect(screen.getByRole('button', { name: 'Yes, lock reviewed' })).toBeDisabled();
    await act(async () => {
      await mocks.confirmLock?.();
    });
    expect(mocks.lock).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Unmark' })).toBeDisabled();
  });

  it('does not produce preview-completion toasts for a review mutation reload', async () => {
    const ui = render(view());
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: 'Unmark' }));
    expect(mocks.unmark).toHaveBeenCalled();
    expect(mocks.load).toHaveBeenCalledWith();
    mocks.preview = { ...mocks.preview, requestedRunId: 'run-2', runId: 'run-2' };
    ui.rerender(view());
    expect(mocks.success).toHaveBeenCalledExactlyOnceWith({ message: 'Removed selected reviews.' });
  });

  it('notifies completion after retrying a transport failure for the same run', async () => {
    mocks.load.mockResolvedValue({ id: 'run-2', status: 'RUNNING' });
    const ui = render(view());
    await userEvent.click(screen.getByRole('button', { name: 'Refresh preview' }));
    mocks.preview = {
      ...mocks.preview,
      requestedRunId: 'run-2',
      isCurrent: false,
      error: { message: 'Fetch failed' },
    };
    ui.rerender(view());
    expect(mocks.error).toHaveBeenCalledTimes(1);
    mocks.load.mockImplementationOnce(async () => {
      mocks.preview = { ...mocks.preview, error: null, isPreparing: true };
      return { id: 'run-2', status: 'RUNNING' };
    });
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    mocks.preview = { ...mocks.preview, isCurrent: true, isPreparing: false, error: null };
    ui.rerender(view());
    expect(mocks.success).toHaveBeenCalledExactlyOnceWith({ message: 'Payroll preview updated.' });
  });

  it('reports an explicit failure even when the accepted run has already notified completion', async () => {
    mocks.load.mockResolvedValue({ id: 'run-1', status: 'SUCCEEDED' });
    render(view());
    await userEvent.click(screen.getByRole('button', { name: 'Refresh preview' }));
    expect(mocks.success).toHaveBeenCalledTimes(1);
    mocks.load.mockImplementationOnce(async () => {
      mocks.preview = { ...mocks.preview, isCurrent: false, error: { message: 'Fetch failed' } };
      return { id: 'run-1', status: 'SUCCEEDED' };
    });
    await userEvent.click(screen.getByRole('button', { name: 'Refresh preview' }));
    expect(mocks.error).toHaveBeenCalledTimes(1);
    expect(mocks.success).toHaveBeenCalledTimes(1);
  });

  it('reports a failed start and allows another explicit retry', async () => {
    mocks.load.mockResolvedValue(null);
    const ui = render(view());
    await userEvent.click(screen.getByRole('button', { name: 'Refresh preview' }));
    mocks.preview = { ...mocks.preview, isCurrent: false, error: { message: 'Start failed' } };
    ui.rerender(view());
    expect(mocks.error).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(mocks.load).toHaveBeenCalledTimes(2);
    expect(mocks.error).toHaveBeenCalledTimes(2);
  });
});

vi.mock('src/screens/hr/hooks/use-hr-table-export', () => ({ useHrTableExport: () => vi.fn() }));
