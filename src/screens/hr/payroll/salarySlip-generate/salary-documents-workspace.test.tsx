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
  export: vi.fn(),
  download: vi.fn(),
  successToast: vi.fn(),
  job: { data: undefined } as any,
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: state.successToast } }));
vi.mock('react-redux', () => ({ useSelector: () => [] }));
vi.mock('src/redux/hr/payslip-api', () => ({ useGetPayslipSettingsQuery: () => ({}) }));
vi.mock('src/redux/hr/employeeApi', () => ({ useLazyGetEmployeeOptionsQuery: () => [vi.fn()] }));
vi.mock('src/components/paginated-search-select', () => ({ PaginatedSearchSelect: () => null }));
vi.mock('../../reports/hooks/useHrReportPermissions', () => ({
  useHrReportPermissions: () => ({ canView: true, canExport: true }),
}));
vi.mock('../../reports/components/HrReportPreviewTable', () => ({
  HrReportPreviewTable: ({ preview, onSortChange, headerAction }: any) => (
    <div>
      {preview?.reportType}
      {headerAction}
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
    state.download.mockReset();
    state.successToast.mockReset();
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
    state.job = { data: { id: 'job-1', status: 'Completed', isExpired: true } };
    view.rerender(<SalaryDocumentsWorkspace kind="register" />);
    expect(screen.queryByRole('button', { name: 'Download' })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Export expired');
    expect(screen.getByRole('button', { name: 'Generate Again' })).toBeEnabled();
  });

  it('keeps coverage and truncation notes in the standard information popover without alert banners', async () => {
    const warnings = [
      'Issued payroll only. Unavailable months are not counted as zero pay.',
      '34 matching staff have no saved payroll for this month and are unavailable. They are excluded from totals.',
      'Results are truncated at the export limit.',
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

  it.each(['pdf', 'excel'] as const)(
    'shows compact %s progress and the completed download in place',
    async (format) => {
      state.preview.mockReturnValue({
        abort: vi.fn(),
        unwrap: async () => ({ reportType: 'Saved payroll' }),
      });
      state.export.mockReturnValue({ unwrap: async () => ({ jobId: 'job-1' }) });
      const view = render(<SalaryDocumentsWorkspace kind="register" />);
      await settleDebounce();
      await act(async () =>
        fireEvent.click(
          screen.getByRole('button', { name: format === 'pdf' ? 'Export PDF' : 'Export Excel' })
        )
      );
      const label = format === 'pdf' ? 'PDF' : 'Excel';
      expect(screen.getByRole('status')).toHaveTextContent(`Preparing ${label}`);
      state.job = {
        data: { id: 'job-1', status: 'Completed', format, rowCount: 18, isExpired: false },
      };
      view.rerender(<SalaryDocumentsWorkspace kind="register" />);
      expect(screen.getByRole('status')).toHaveTextContent(`${label} ready`);
      expect(state.successToast).toHaveBeenCalledWith({
        message: `${label} report ready to download.`,
      });
      view.rerender(<SalaryDocumentsWorkspace kind="register" />);
      expect(state.successToast).toHaveBeenCalledOnce();
      expect(screen.getByRole('button', { name: 'Download' })).toBeEnabled();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    }
  );

  it('keeps export failures local and allows a failed download to be retried', async () => {
    state.preview.mockReturnValue({
      abort: vi.fn(),
      unwrap: async () => ({ reportType: 'Saved payroll' }),
    });
    state.export.mockReturnValue({ unwrap: async () => ({ jobId: 'job-1' }) });
    const view = render(<SalaryDocumentsWorkspace kind="register" />);
    await settleDebounce();
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Export PDF' })));
    state.job = {
      data: { id: 'job-1', status: 'Completed', format: 'pdf', rowCount: 18, isExpired: false },
    };
    view.rerender(<SalaryDocumentsWorkspace kind="register" />);
    state.download.mockReturnValue({
      unwrap: async () => {
        throw new Error('Download unavailable');
      },
    });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Download' })));
    expect(screen.getByRole('alert')).toHaveTextContent('Download unavailable');
    expect(screen.getByRole('button', { name: 'Retry Download' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Retry preview' })).not.toBeInTheDocument();
    expect(screen.getByText('Saved payroll')).toBeVisible();
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Retry Download' })));
    expect(state.download).toHaveBeenCalledTimes(2);
  });

  it('offers status refresh without exposing a download when polling fails', async () => {
    state.preview.mockReturnValue({
      abort: vi.fn(),
      unwrap: async () => ({ reportType: 'Saved payroll' }),
    });
    state.export.mockReturnValue({ unwrap: async () => ({ jobId: 'job-1' }) });
    const view = render(<SalaryDocumentsWorkspace kind="register" />);
    await settleDebounce();
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Export PDF' })));
    const refetch = vi.fn();
    state.job = {
      isError: true,
      refetch,
      data: { id: 'job-1', status: 'Completed', isExpired: false },
    };
    view.rerender(<SalaryDocumentsWorkspace kind="register" />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'The export status could not be refreshed.'
    );
    expect(screen.queryByRole('button', { name: 'Download' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Refresh Status' }));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it('does not show an earlier export as ready while a new job is being prepared', async () => {
    state.preview.mockReturnValue({
      abort: vi.fn(),
      unwrap: async () => ({ reportType: 'Saved payroll' }),
    });
    state.export.mockReturnValueOnce({ unwrap: async () => ({ jobId: 'job-1' }) });
    const view = render(<SalaryDocumentsWorkspace kind="register" />);
    await settleDebounce();
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Export PDF' })));
    state.job = { data: { id: 'job-1', status: 'Completed', format: 'pdf', isExpired: false } };
    view.rerender(<SalaryDocumentsWorkspace kind="register" />);
    expect(screen.getByRole('button', { name: 'Download' })).toBeEnabled();
    state.export.mockReturnValueOnce({ unwrap: async () => ({ jobId: 'job-2' }) });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Export Excel' })));
    expect(screen.queryByRole('button', { name: 'Download' })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Preparing Excel');
  });

  it('shows a queue failure beside the export controls and keeps the preview available', async () => {
    state.preview.mockReturnValue({
      abort: vi.fn(),
      unwrap: async () => ({ reportType: 'Saved payroll' }),
    });
    state.export.mockReturnValue({
      unwrap: async () => {
        throw new Error('Queue unavailable');
      },
    });
    render(<SalaryDocumentsWorkspace kind="register" />);
    await settleDebounce();
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Export PDF' })));
    expect(screen.getByRole('alert')).toHaveTextContent('Queue unavailable');
    expect(screen.queryByRole('button', { name: 'Retry preview' })).not.toBeInTheDocument();
    expect(screen.getByText('Saved payroll')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Export PDF' })).toBeEnabled();
  });

  it('announces completion once when the owning document panel is active', async () => {
    state.preview.mockReturnValue({
      abort: vi.fn(),
      unwrap: async () => ({ reportType: 'Saved payroll' }),
    });
    state.export.mockReturnValue({ unwrap: async () => ({ jobId: 'job-1' }) });
    const view = render(<SalaryDocumentsWorkspace kind="register" />);
    await settleDebounce();
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Export PDF' })));
    state.job = { data: { id: 'job-1', status: 'Completed', format: 'pdf', isExpired: false } };
    view.rerender(<SalaryDocumentsWorkspace kind="register" active={false} />);
    expect(state.successToast).not.toHaveBeenCalled();
    view.rerender(<SalaryDocumentsWorkspace kind="register" />);
    expect(state.successToast).toHaveBeenCalledOnce();
    view.rerender(<SalaryDocumentsWorkspace kind="register" />);
    expect(state.successToast).toHaveBeenCalledOnce();
  });

  it.each([
    [501, 'PDF limit: 500 rows'],
    [20001, 'Export limits apply'],
  ] as const)(
    'discloses export limits for a report with %i rows without an informational banner',
    async (totalCount, label) => {
      state.preview.mockReturnValue({
        abort: vi.fn(),
        unwrap: async () => ({ reportType: 'Saved payroll', totalCount }),
      });
      render(<SalaryDocumentsWorkspace kind="register" />);
      await settleDebounce();
      expect(screen.getByText(label)).toBeVisible();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    }
  );
});
