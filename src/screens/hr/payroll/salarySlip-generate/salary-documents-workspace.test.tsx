import type { ReactElement } from 'react';

import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, screen, cleanup, fireEvent, render as renderUI } from '@testing-library/react';

import SalaryDocumentsWorkspace from './salary-documents-workspace';

const theme = createTheme(defaultSettings);
const render = (ui: ReactElement) =>
  renderUI(ui, {
    wrapper: ({ children }) => <ThemeProvider theme={theme}>{children}</ThemeProvider>,
  });

const state = vi.hoisted(() => ({
  preview: vi.fn(),
  exportHook: vi.fn(),
  export: vi.fn(),
  download: vi.fn(),
  successToast: vi.fn(),
  job: { data: undefined } as any,
  tableRead: vi.fn(),
}));
vi.mock('src/screens/hr/hooks/use-hr-table-export', () => ({
  useHrTableExport: (...args: any[]) => {
    state.exportHook(...args);
    return state.export;
  },
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: state.successToast } }));
vi.mock('react-redux', () => ({ useSelector: () => [] }));
vi.mock('src/redux/hr/payslip-api', () => ({ useGetPayslipSettingsQuery: () => ({}) }));
vi.mock('src/redux/hr/employeeApi', () => ({ useLazyGetEmployeeOptionsQuery: () => [vi.fn()] }));
vi.mock('src/components/paginated-search-select', () => ({ PaginatedSearchSelect: () => null }));
vi.mock('../../reports/hooks/useHrReportPermissions', () => ({
  useHrReportPermissions: () => ({ canView: true, canExport: true }),
}));
vi.mock('../../reports/components/HrReportPreviewTable', () => ({
  HrReportPreviewTable: ({ preview, operationalProps, headerAction, onExport }: any) => (
    <div>
      {preview?.reportType}
      {headerAction}
      <button
        type="button"
        onClick={() =>
          onExport({
            format: 'excel',
            columns: [{ id: 'netPay', label: 'Net pay' }],
            filters: [],
            sorts: operationalProps.sorts,
            searchTerm: '',
          })
        }
      >
        Export complete table
      </button>
      {operationalProps.onServerSort && (
        <button
          type="button"
          onClick={() =>
            operationalProps.onServerSort('netPay', [{ column: 'netPay', direction: 'desc' }])
          }
        >
          Sort net pay
        </button>
      )}
    </div>
  ),
}));
vi.mock('src/redux/hr/hrReportsApi', () => ({
  usePreviewHrReportMutation: () => [state.preview],
  useCreateHrReportExportMutation: () => [state.export, { isLoading: false }],
  useGetHrReportExportQuery: () => state.job,
  useDownloadHrReportExportMutation: () => [state.download, { isLoading: false }],
}));
const settleDebounce = () =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(351);
  });

describe('salary document previews', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    state.preview.mockReset();
    state.export.mockReset();
    state.exportHook.mockClear();
    state.download.mockReset();
    state.successToast.mockReset();
    state.job = {};
    state.tableRead.mockClear();
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('sends register sorting to the server rather than sorting only the visible page', async () => {
    state.preview.mockReturnValue({
      abort: vi.fn(),
      unwrap: async () => ({ reportType: 'Saved payroll' }),
    });
    render(<SalaryDocumentsWorkspace kind="register" />);
    await settleDebounce();
    fireEvent.click(screen.getByRole('button', { name: 'Sort net pay' }));
    await settleDebounce();
    expect(state.tableRead.mock.calls.at(-1)?.[0]).toMatchObject({
      table: 'hr-salary-documents',
      offset: 0,
      criteria: { sorts: [{ column: 'netPay', direction: 'desc' }] },
    });
  });

  it('aborts an obsolete preview and ignores its late result', async () => {
    let resolveOld!: (data: any) => void;
    const abort = vi.fn();
    state.preview.mockReturnValueOnce({
      abort,
      unwrap: () =>
        new Promise((resolve) => {
          resolveOld = resolve;
        }),
    });
    state.preview.mockReturnValue({
      abort: vi.fn(),
      unwrap: async () => ({ reportType: 'Current saved payroll' }),
    });
    render(<SalaryDocumentsWorkspace kind="register" />);
    await settleDebounce();
    fireEvent.change(screen.getByLabelText('Payroll month'), { target: { value: '2026-09' } });
    await settleDebounce();
    await act(async () => resolveOld({ reportType: 'Obsolete payroll' }));
    expect(abort).toHaveBeenCalled();
    expect(screen.queryByText('Obsolete payroll')).not.toBeInTheDocument();
    expect(screen.getByText('Current saved payroll')).toBeVisible();
  });

  it('preserves filters when inactive and pauses preview requests', async () => {
    state.preview.mockReturnValue({
      abort: vi.fn(),
      unwrap: async () => ({ reportType: 'Saved payroll' }),
    });
    const view = render(<SalaryDocumentsWorkspace kind="register" />);
    fireEvent.change(screen.getByLabelText('Payroll month'), { target: { value: '2026-06' } });
    view.rerender(<SalaryDocumentsWorkspace kind="register" active={false} />);
    await settleDebounce();
    expect(state.preview).not.toHaveBeenCalled();
    view.rerender(<SalaryDocumentsWorkspace kind="register" />);
    await settleDebounce();
    expect(state.preview.mock.calls[0][0].filters.month).toBe('2026-06');
    expect(state.preview.mock.calls[0][0].columns).toEqual(
      expect.arrayContaining(['employeeName', 'month', 'totalEarnings', 'totalDeduction', 'netPay'])
    );
  });

  it('keeps coverage and truncation notes in the standard information popover without alert banners', async () => {
    const warnings = [
      'Issued payroll only. Unavailable months are not counted as zero pay.',
      '34 matching staff have no saved payroll for this month and are unavailable. They are excluded from totals.',
      'Draft payroll is included only when explicitly selected.',
    ];
    state.preview.mockReturnValue({
      abort: vi.fn(),
      unwrap: async () => ({ reportType: 'Saved payroll', queryWarnings: warnings }),
    });
    render(<SalaryDocumentsWorkspace kind="register" />);
    await settleDebounce();
    const trigger = screen.getByRole('button', { name: 'Report notes (3)' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(warnings[0])).not.toBeInTheDocument();
    fireEvent.click(trigger);
    const notes = screen.getByRole('dialog', { name: 'Report notes' });
    warnings.forEach((warning) => expect(notes).toHaveTextContent(warning));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close report notes' }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
  it('uses the shared complete export source with the active month and sorting', async () => {
    state.preview.mockReturnValue({
      abort: vi.fn(),
      unwrap: async () => ({ reportType: 'Saved payroll', totalCount: 25001 }),
    });
    state.export.mockResolvedValue(undefined);
    render(<SalaryDocumentsWorkspace kind="register" />);
    await settleDebounce();
    fireEvent.change(screen.getByLabelText('Payroll month'), { target: { value: '2026-09' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sort net pay' }));
    await settleDebounce();
    fireEvent.click(screen.getByRole('button', { name: 'Export complete table' }));
    expect(state.export).toHaveBeenCalledWith(
      expect.objectContaining({ format: 'excel', sorts: [{ column: 'netPay', direction: 'desc' }] })
    );
    expect(state.exportHook.mock.calls.at(-1)).toEqual([
      'hr-salary-documents',
      expect.objectContaining({
        filters: expect.objectContaining({ month: '2026-09' }),
      }),
    ]);
    expect(screen.queryByRole('button', { name: 'Export PDF' })).not.toBeInTheDocument();
    expect(screen.queryByText('Export limits apply')).not.toBeInTheDocument();
  });
});

// This screen test isolates its owning reader; typed criteria transport is covered by the adapter suite.
vi.mock('src/redux/hr/hrOperationalTableApi', () => ({
  useHrOperationalTableQuery: (body: unknown, options: unknown) => {
    state.tableRead(body, options);
    return { currentData: undefined, isFetching: false, isError: false, refetch: vi.fn() };
  },
}));
