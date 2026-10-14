import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { act, render, screen, cleanup, fireEvent } from '@testing-library/react';

import SalaryDocumentsWorkspace from './salary-documents-workspace';

const state = vi.hoisted(() => ({
  preview: vi.fn(),
  export: vi.fn(),
  job: { data: undefined } as any,
}));
vi.mock('react-redux', () => ({ useSelector: () => [] }));
vi.mock('src/redux/hr/payslip-api', () => ({ useGetPayslipSettingsQuery: () => ({}) }));
vi.mock('src/redux/hr/employeeApi', () => ({ useLazyGetEmployeeOptionsQuery: () => [vi.fn()] }));
vi.mock('src/components/paginated-search-select', () => ({ PaginatedSearchSelect: () => null }));
vi.mock('../../reports/hooks/useHrReportPermissions', () => ({
  useHrReportPermissions: () => ({ canView: true, canExport: true }),
}));
vi.mock('../../reports/components/HrReportPreviewTable', () => ({
  HrReportPreviewTable: ({ preview, onSortChange }: any) => (
    <div>
      {preview?.reportType}
      {onSortChange && (
        <button
          type="button"
          onClick={() => onSortChange([{ field: 'netPay', direction: 'desc' }])}
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
  useDownloadHrReportExportMutation: () => [vi.fn(), { isLoading: false }],
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
    state.job = {};
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
    expect(state.preview.mock.calls.at(-1)?.[0]).toMatchObject({
      page: 1,
      sorts: [{ field: 'netPay', direction: 'desc' }],
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

  it('prevents duplicate export submission and disables expired downloads', async () => {
    state.preview.mockReturnValue({
      abort: vi.fn(),
      unwrap: async () => ({ reportType: 'Saved payroll' }),
    });
    let resolveExport!: (data: any) => void;
    state.export.mockReturnValue({
      unwrap: () =>
        new Promise((resolve) => {
          resolveExport = resolve;
        }),
    });
    const view = render(<SalaryDocumentsWorkspace kind="register" />);
    await settleDebounce();
    fireEvent.click(screen.getByRole('button', { name: 'Export PDF' }));
    fireEvent.click(screen.getByRole('button', { name: 'Export PDF' }));
    expect(state.export).toHaveBeenCalledTimes(1);
    await act(async () => resolveExport({ jobId: 'job-1' }));
    state.job = { data: { status: 'Completed', isExpired: true } };
    view.rerender(<SalaryDocumentsWorkspace kind="register" />);
    expect(screen.queryByRole('button', { name: 'Download' })).not.toBeInTheDocument();
    expect(screen.getByText(/This export has expired/)).toBeVisible();
  });
});
