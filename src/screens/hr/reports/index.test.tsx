import type { ReactNode } from 'react';
import type { HrReportTemplate, HrReportExportJob } from 'src/redux/hr/hrReportsApi';

import userEvent from '@testing-library/user-event';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import ReportsScreen from './index';
import { hrReportToast } from './hr-report-notifications';

const mocks = vi.hoisted(() => ({
  template: {
    id: 'template-1',
    name: 'Employee Template',
    category: 'Employee',
    dataSource: 'employee',
    visibility: 'private',
    status: 'Draft',
    ownerUserId: 'user-1',
    creationTime: '2026-06-01T10:00:00Z',
    definition: {
      reportType: '',
      dataSource: '',
      columns: ['employeeCode', 'employeeName'],
      filters: {},
    },
  } as HrReportTemplate,
  createExport: vi.fn(),
  refetchExports: vi.fn(),
  downloadExport: vi.fn(),
  shareExport: vi.fn(),
  cancelExport: vi.fn(),
  deleteFailedExport: vi.fn(),
  retryExport: vi.fn(),
  regenerateExport: vi.fn(),
  duplicateTemplate: vi.fn(),
  updateTemplate: vi.fn(),
  deleteTemplate: vi.fn(),
  pauseSchedule: vi.fn(),
  resumeSchedule: vi.fn(),
  runScheduleNow: vi.fn(),
  deleteSchedule: vi.fn(),
  exportJobs: [] as HrReportExportJob[],
  hasCurrentExportJobs: true,
  isFetchingExports: false,
  exportsFulfilledTimeStamp: 100 as number | undefined,
  getExportsQueryOptions: vi.fn(),
  getExportsQueryArgs: vi.fn(),
  permissions: {
    canView: true,
    canBuild: true,
    canExport: true,
    canSchedule: false,
    canManageTemplates: false,
    canDelete: false,
    canShare: false,
  },
}));

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading, action }: { heading: string; action?: ReactNode }) => (
    <div>
      <h1>{heading}</h1>
      {action}
    </div>
  ),
}));

vi.mock('./components/HrReportCatalog', () => ({
  HrReportCatalog: () => <div data-testid="mock-report-catalog" />,
}));

vi.mock('./components/HrReportsLandingTable', () => ({
  HrReportsLandingTable: ({
    activeTab,
    highlightedExportId,
    onTabChange,
    onRunTemplate,
    onExportAction,
    exportDateFilter,
    exportJobs,
    exportActionsDisabled,
    onExportDateFilterChange,
  }: {
    activeTab: string;
    highlightedExportId?: string | null;
    onTabChange: (tab: string) => void;
    onRunTemplate: (template: HrReportTemplate) => void;
    onExportAction: (action: 'share', jobId: string) => void;
    exportDateFilter: { preset: string; fromDate: string; toDate: string };
    exportJobs: HrReportExportJob[];
    exportActionsDisabled: boolean;
    onExportDateFilterChange: (filter: {
      preset: 'all' | 'today' | 'custom';
      fromDate: string;
      toDate: string;
    }) => void;
  }) => (
    <div
      data-testid="mock-landing"
      data-active-tab={activeTab}
      data-highlighted-export={highlightedExportId ?? ''}
      data-export-date-preset={exportDateFilter.preset}
      data-export-count={exportJobs.length}
      data-export-actions-disabled={String(exportActionsDisabled)}
    >
      <button type="button" onClick={() => onTabChange('templates')}>
        Templates
      </button>
      <button type="button" onClick={() => onRunTemplate(mocks.template)}>
        Run Template
      </button>
      <button type="button" onClick={() => onExportAction('share', 'job-1')}>
        Open Share
      </button>
      <button
        type="button"
        onClick={() =>
          onExportDateFilterChange({
            preset: 'custom',
            fromDate: '2026-07-20',
            toDate: '2026-07-10',
          })
        }
      >
        Invalid Date Range
      </button>
      <button
        type="button"
        onClick={() => onExportDateFilterChange({ preset: 'today', fromDate: '', toDate: '' })}
      >
        Today Filter
      </button>
    </div>
  ),
}));

vi.mock('./hooks/useHrReportPermissions', () => ({
  useHrReportPermissions: () => mocks.permissions,
  useHrReportCurrentUserId: () => 'user-1',
}));

vi.mock('./hr-report-notifications', () => ({
  hrReportToast: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('src/redux/hr/hrReportsApi', () => ({
  useGetHrReportSourcesQuery: () => ({ data: { sources: [] }, isLoading: false }),
  useGetHrReportTemplatesQuery: () => ({
    data: { items: [mocks.template] },
    isFetching: false,
  }),
  useGetHrReportSchedulesQuery: () => ({ data: { items: [] }, isFetching: false }),
  useGetHrReportRecipientsQuery: () => ({
    data: [
      { id: 'recipient-1', displayName: 'Report Viewer', email: 'viewer@test.local' },
      { id: 'recipient-2', displayName: 'Payroll Viewer', email: 'payroll@test.local' },
    ],
    isFetching: false,
  }),
  useGetHrReportExportsQuery: (
    arg: unknown,
    options: { pollingInterval: number; skip?: boolean }
  ) => {
    mocks.getExportsQueryArgs(arg);
    mocks.getExportsQueryOptions(options);

    return {
      currentData: mocks.hasCurrentExportJobs ? mocks.exportJobs : undefined,
      isFetching: mocks.isFetchingExports,
      refetch: mocks.refetchExports,
      fulfilledTimeStamp: mocks.exportsFulfilledTimeStamp,
    };
  },
  useDownloadHrReportExportMutation: () => [mocks.downloadExport, { isLoading: false }],
  useCreateHrReportExportMutation: () => [mocks.createExport, { isLoading: false }],
  useShareHrReportExportMutation: () => [mocks.shareExport, { isLoading: false }],
  useCancelHrReportExportMutation: () => [mocks.cancelExport],
  useDeleteFailedHrReportExportMutation: () => [mocks.deleteFailedExport],
  useRetryHrReportExportMutation: () => [mocks.retryExport],
  useRegenerateHrReportExportMutation: () => [mocks.regenerateExport],
  useDuplicateHrReportTemplateMutation: () => [mocks.duplicateTemplate],
  useUpdateHrReportTemplateMutation: () => [mocks.updateTemplate],
  useDeleteHrReportTemplateMutation: () => [mocks.deleteTemplate],
  usePauseHrReportScheduleMutation: () => [mocks.pauseSchedule],
  useResumeHrReportScheduleMutation: () => [mocks.resumeSchedule],
  useRunHrReportScheduleNowMutation: () => [mocks.runScheduleNow],
  useDeleteHrReportScheduleMutation: () => [mocks.deleteSchedule],
}));

const exportJob = (overrides: Partial<HrReportExportJob>): HrReportExportJob => ({
  id: overrides.id ?? 'job-1',
  reportType: overrides.reportType ?? 'Employee Report',
  format: overrides.format ?? 'excel',
  status: overrides.status ?? 'Completed',
  creationTime: overrides.creationTime ?? '2026-06-01T10:00:00Z',
  expiresAt: overrides.expiresAt ?? '2026-06-08T10:00:00Z',
  isExpired: overrides.isExpired ?? false,
  ...overrides,
});

const getLatestExportPollingInterval = () => {
  const { calls } = mocks.getExportsQueryOptions.mock;
  const [options] = calls[calls.length - 1] ?? [];
  return options?.pollingInterval;
};

describe('ReportsScreen template run workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.exportJobs = [];
    mocks.hasCurrentExportJobs = true;
    mocks.isFetchingExports = false;
    mocks.exportsFulfilledTimeStamp = 100;
    Object.assign(mocks.permissions, {
      canView: true,
      canBuild: true,
      canExport: true,
      canSchedule: false,
      canManageTemplates: false,
      canDelete: false,
      canShare: false,
    });
    mocks.refetchExports.mockResolvedValue(undefined);
    mocks.createExport.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ jobId: 'template-export-1', status: 'Queued' }),
    });
    mocks.deleteFailedExport.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue(undefined),
    });
    mocks.shareExport.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue(exportJob({ id: 'job-1' })),
    });
  });

  it('queues a template export, switches to exports, and highlights the new job', async () => {
    const user = userEvent.setup();

    render(<ReportsScreen />);

    await user.click(screen.getByRole('button', { name: 'Templates' }));
    expect(screen.getByTestId('mock-landing')).toHaveAttribute('data-active-tab', 'templates');

    await user.click(screen.getByRole('button', { name: 'Run Template' }));
    expect(screen.getByRole('dialog', { name: 'Run report' })).toBeVisible();

    await user.click(screen.getByTestId('hr-report-run-template-submit-button'));

    await waitFor(() =>
      expect(mocks.createExport).toHaveBeenCalledWith(
        expect.objectContaining({
          reportType: 'Employee Template',
          dataSource: 'employee',
          format: 'excel',
          templateId: 'template-1',
          templateName: 'Employee Template',
        })
      )
    );
    expect(screen.getByTestId('mock-landing')).toHaveAttribute('data-active-tab', 'exports');
    expect(screen.getByTestId('mock-landing')).toHaveAttribute(
      'data-highlighted-export',
      'template-export-1'
    );
    expect(hrReportToast.success).toHaveBeenCalledWith(
      'Template report queued. Track it in Exports.'
    );
  });

  it('skips export history requests while a custom date range is inverted', async () => {
    const user = userEvent.setup();

    render(<ReportsScreen />);
    await user.click(screen.getByRole('button', { name: 'Invalid Date Range' }));

    await waitFor(() => {
      const latestOptions = mocks.getExportsQueryOptions.mock.calls.at(-1)?.[0];
      expect(latestOptions?.skip).toBe(true);
    });
    expect(screen.getByTestId('mock-landing')).toHaveAttribute('data-export-count', '0');
    expect(screen.getByTestId('mock-landing')).toHaveAttribute(
      'data-export-actions-disabled',
      'true'
    );
  });

  it('hides cached date A exports while date B is fetching', async () => {
    const user = userEvent.setup();
    mocks.exportJobs = [exportJob({ id: 'date-a-export' })];

    render(<ReportsScreen />);
    expect(screen.getByTestId('mock-landing')).toHaveAttribute('data-export-count', '1');

    mocks.hasCurrentExportJobs = false;
    mocks.isFetchingExports = true;
    await user.click(screen.getByRole('button', { name: 'Today Filter' }));

    expect(screen.getByTestId('mock-landing')).toHaveAttribute('data-export-count', '0');
    expect(screen.getByTestId('mock-landing')).toHaveAttribute(
      'data-export-actions-disabled',
      'true'
    );
  });

  it('clears the history date filter when a newly queued export must be revealed', async () => {
    const user = userEvent.setup();

    render(<ReportsScreen />);
    await user.click(screen.getByRole('button', { name: 'Today Filter' }));
    expect(screen.getByTestId('mock-landing')).toHaveAttribute('data-export-date-preset', 'today');

    await user.click(screen.getByRole('button', { name: 'Templates' }));
    await user.click(screen.getByRole('button', { name: 'Run Template' }));
    await user.click(screen.getByTestId('hr-report-run-template-submit-button'));

    await waitFor(() =>
      expect(screen.getByTestId('mock-landing')).toHaveAttribute('data-export-date-preset', 'all')
    );
  });

  it('keeps the template run dialog open when queueing fails', async () => {
    const user = userEvent.setup();
    mocks.createExport.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue(new Error('export failed')),
    });

    render(<ReportsScreen />);

    await user.click(screen.getByRole('button', { name: 'Templates' }));
    await user.click(screen.getByRole('button', { name: 'Run Template' }));
    await user.click(screen.getByTestId('hr-report-run-template-submit-button'));

    await waitFor(() =>
      expect(hrReportToast.error).toHaveBeenCalledWith('Template report could not be queued.')
    );
    expect(screen.getByRole('dialog', { name: 'Run report' })).toBeVisible();
    expect(screen.getByTestId('mock-landing')).toHaveAttribute('data-active-tab', 'templates');
  });

  it('warns when template export queues but export refresh resolves with an error', async () => {
    const user = userEvent.setup();
    mocks.refetchExports.mockResolvedValue({ error: { status: 500 } });

    render(<ReportsScreen />);

    await user.click(screen.getByRole('button', { name: 'Templates' }));
    await user.click(screen.getByRole('button', { name: 'Run Template' }));
    await user.click(screen.getByTestId('hr-report-run-template-submit-button'));

    await waitFor(() =>
      expect(hrReportToast.warning).toHaveBeenCalledWith(
        'Template report queued, but exports could not refresh. It will update on the next poll or manual refresh.'
      )
    );
    expect(screen.getByTestId('mock-landing')).toHaveAttribute('data-active-tab', 'exports');
    expect(screen.getByTestId('mock-landing')).toHaveAttribute(
      'data-highlighted-export',
      'template-export-1'
    );
  });

  it('stops polling and clears a highlighted export that never appears after the grace window', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ReportsScreen />);

    await user.click(screen.getByRole('button', { name: 'Templates' }));
    await user.click(screen.getByRole('button', { name: 'Run Template' }));
    await user.click(screen.getByTestId('hr-report-run-template-submit-button'));

    await waitFor(() =>
      expect(screen.getByTestId('mock-landing')).toHaveAttribute(
        'data-highlighted-export',
        'template-export-1'
      )
    );
    expect(getLatestExportPollingInterval()).toBe(5000);

    mocks.exportsFulfilledTimeStamp = 101;
    rerender(<ReportsScreen />);
    mocks.exportsFulfilledTimeStamp = 102;
    rerender(<ReportsScreen />);
    mocks.exportsFulfilledTimeStamp = 103;
    rerender(<ReportsScreen />);

    await waitFor(() =>
      expect(hrReportToast.warning).toHaveBeenCalledWith(
        'Export was queued, but it is not visible in the current export list. Use Refresh to check again.'
      )
    );
    expect(screen.getByTestId('mock-landing')).toHaveAttribute('data-highlighted-export', '');
    await waitFor(() => expect(getLatestExportPollingInterval()).toBe(0));
  });

  it('keeps polling when another export is still active during highlighted export lookup', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ReportsScreen />);

    await user.click(screen.getByRole('button', { name: 'Templates' }));
    await user.click(screen.getByRole('button', { name: 'Run Template' }));
    await user.click(screen.getByTestId('hr-report-run-template-submit-button'));

    await waitFor(() =>
      expect(screen.getByTestId('mock-landing')).toHaveAttribute(
        'data-highlighted-export',
        'template-export-1'
      )
    );

    mocks.exportJobs = [exportJob({ id: 'other-running-job', status: 'Running' })];
    mocks.exportsFulfilledTimeStamp = 101;
    rerender(<ReportsScreen />);

    await waitFor(() => expect(getLatestExportPollingInterval()).toBe(5000));
    expect(screen.getByTestId('mock-landing')).toHaveAttribute(
      'data-highlighted-export',
      'template-export-1'
    );
    expect(hrReportToast.warning).not.toHaveBeenCalledWith(
      'Export was queued, but it is not visible in the current export list. Use Refresh to check again.'
    );
  });

  it('shares an export through the report center action hook and refreshes exports', async () => {
    const user = userEvent.setup();
    mocks.permissions.canShare = true;
    mocks.exportJobs = [
      exportJob({
        id: 'job-1',
        requestedByUserId: 'user-1',
      }),
    ];

    render(<ReportsScreen />);

    await user.click(screen.getByRole('button', { name: 'Open Share' }));
    expect(screen.getByRole('dialog', { name: 'Share export' })).toBeVisible();

    await user.click(screen.getByLabelText('Recipients'));
    await user.click(screen.getByRole('option', { name: 'Report Viewer (viewer@test.local)' }));
    await user.click(screen.getByTestId('hr-report-share-export-submit-button'));

    await waitFor(() =>
      expect(mocks.shareExport).toHaveBeenCalledWith({
        jobId: 'job-1',
        userIds: ['recipient-1'],
      })
    );
    expect(mocks.refetchExports).toHaveBeenCalledTimes(1);
    expect(hrReportToast.success).toHaveBeenCalledWith('Export shared');
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Share export' })).not.toBeInTheDocument()
    );
  });

  it('keeps the share dialog open with selected recipients when sharing fails', async () => {
    const user = userEvent.setup();
    mocks.permissions.canShare = true;
    mocks.exportJobs = [
      exportJob({
        id: 'job-1',
        requestedByUserId: 'user-1',
        sharedUserIds: ['recipient-1'],
      }),
    ];
    mocks.shareExport.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue(new Error('share failed')),
    });

    render(<ReportsScreen />);

    await user.click(screen.getByRole('button', { name: 'Open Share' }));
    expect(screen.getByRole('dialog', { name: 'Share export' })).toBeVisible();
    expect(await screen.findByText(/Report Viewer/)).toBeVisible();

    await user.click(screen.getByLabelText('Recipients'));
    await user.click(screen.getByRole('option', { name: 'Payroll Viewer (payroll@test.local)' }));
    await user.click(screen.getByTestId('hr-report-share-export-submit-button'));

    await waitFor(() =>
      expect(mocks.shareExport).toHaveBeenCalledWith({
        jobId: 'job-1',
        userIds: ['recipient-1', 'recipient-2'],
      })
    );
    expect(hrReportToast.error).toHaveBeenCalledWith('Export could not be shared.');
    expect(screen.getByRole('dialog', { name: 'Share export' })).toBeVisible();
    expect(screen.getByText(/Report Viewer/)).toBeVisible();
    expect(screen.getByText(/Payroll Viewer/)).toBeVisible();
  });
});
