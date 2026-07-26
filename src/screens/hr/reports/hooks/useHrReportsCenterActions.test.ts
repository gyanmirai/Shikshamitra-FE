import type {
  HrReportSchedule,
  HrReportTemplate,
  HrReportExportJob,
} from 'src/redux/hr/hrReportsApi';

import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { hrReportToast } from '../hr-report-notifications';
import { useHrReportsCenterActions } from './useHrReportsCenterActions';

const mocks = vi.hoisted(() => ({
  downloadExport: vi.fn(),
  createExport: vi.fn(),
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
}));

vi.mock('../hr-report-notifications', () => ({
  hrReportToast: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('src/redux/hr/hrReportsApi', () => ({
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

const unwrapResult = (value: unknown) => ({
  unwrap: vi.fn().mockResolvedValue(value),
});

const unwrapError = () => ({
  unwrap: vi.fn().mockRejectedValue(new Error('request failed')),
});

const exportJob = (overrides: Partial<HrReportExportJob> = {}): HrReportExportJob => ({
  id: overrides.id ?? 'job-1',
  reportType: overrides.reportType ?? 'Employee Report',
  format: overrides.format ?? 'excel',
  status: overrides.status ?? 'Completed',
  creationTime: overrides.creationTime ?? '2026-06-01T10:00:00Z',
  expiresAt: overrides.expiresAt ?? '2026-06-08T10:00:00Z',
  isExpired: overrides.isExpired ?? false,
  ...overrides,
});

const schedule = (): HrReportSchedule => ({
  id: 'schedule-1',
  name: 'Monthly Employee Report',
  frequency: 'monthly',
  deliveryMode: 'inApp',
  status: 'Active',
  recipientUserIds: [],
  definition: {
    reportType: 'Employee Report',
    dataSource: 'employee',
    filters: {},
  },
  nextRunAt: '2026-06-15T07:00:00Z',
  ownerUserId: 'user-1',
  creationTime: '2026-06-01T10:00:00Z',
});

const template = (): HrReportTemplate => ({
  id: 'template-1',
  name: 'Employee Template',
  category: 'Employee',
  dataSource: 'employee',
  visibility: 'private',
  status: 'Draft',
  ownerUserId: 'user-1',
  creationTime: '2026-06-01T10:00:00Z',
  definition: {
    reportType: 'Employee Template',
    dataSource: 'employee',
    columns: ['employeeCode'],
  },
});

const renderActions = () => {
  const setActiveCenterTab = vi.fn();
  const setDirectSelection = vi.fn();
  const highlightExportJob = vi.fn();
  const refetchExports = vi.fn().mockResolvedValue(undefined);

  const hook = renderHook(() =>
    useHrReportsCenterActions({
      sources: [],
      exportJobs: [exportJob()],
      setActiveCenterTab,
      setDirectSelection,
      highlightExportJob,
      refetchExports,
      openGenerateReport: vi.fn(),
      closeGenerateReport: vi.fn(),
    })
  );

  return {
    ...hook,
    setActiveCenterTab,
    highlightExportJob,
    refetchExports,
  };
};

describe('useHrReportsCenterActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.downloadExport.mockReturnValue(unwrapResult(new Blob(['report'])));
    mocks.createExport.mockReturnValue(unwrapResult({ jobId: 'new-job', status: 'Queued' }));
    mocks.shareExport.mockReturnValue(unwrapResult(exportJob()));
    mocks.cancelExport.mockReturnValue(unwrapResult(exportJob({ status: 'Cancelled' })));
    mocks.deleteFailedExport.mockReturnValue(unwrapResult(undefined));
    mocks.retryExport.mockReturnValue(unwrapResult({ jobId: 'job-1', status: 'Queued' }));
    mocks.regenerateExport.mockReturnValue(unwrapResult({ jobId: 'new-job', status: 'Queued' }));
    mocks.duplicateTemplate.mockReturnValue(unwrapResult(template()));
    mocks.updateTemplate.mockReturnValue(unwrapResult(template()));
    mocks.deleteTemplate.mockReturnValue(unwrapResult(undefined));
    mocks.pauseSchedule.mockReturnValue(unwrapResult(schedule()));
    mocks.resumeSchedule.mockReturnValue(unwrapResult(schedule()));
    mocks.runScheduleNow.mockReturnValue(
      unwrapResult({ scheduleId: 'schedule-1', jobId: 'job-2' })
    );
    mocks.deleteSchedule.mockReturnValue(unwrapResult(undefined));
  });

  it('shows an error toast when download fails', async () => {
    mocks.downloadExport.mockReturnValue(unwrapError());
    const { result } = renderActions();

    await act(async () => {
      await result.current.handleDownload('job-1', 'Employee Report');
    });

    expect(hrReportToast.error).toHaveBeenCalledWith(
      'Export could not be downloaded. Refresh and try again.'
    );
  });

  it('does not refresh exports after a failed export action', async () => {
    mocks.cancelExport.mockReturnValue(unwrapError());
    const { result, refetchExports } = renderActions();

    await act(async () => {
      await result.current.handleExportAction('cancel', 'job-1');
    });

    expect(refetchExports).not.toHaveBeenCalled();
    expect(hrReportToast.error).toHaveBeenCalledWith(
      'Export could not be cancelled. Refresh and try again.'
    );
  });

  it('deletes a failed export and refreshes the export list', async () => {
    const { result, refetchExports } = renderActions();

    await act(async () => {
      await result.current.handleExportAction('delete', 'job-1');
    });

    expect(mocks.deleteFailedExport).toHaveBeenCalledWith('job-1');
    expect(refetchExports).toHaveBeenCalledTimes(1);
    expect(hrReportToast.success).toHaveBeenCalledWith('Failed export removed');
  });

  it('keeps the current tab stable when schedule run now fails', async () => {
    mocks.runScheduleNow.mockReturnValue(unwrapError());
    const { result, setActiveCenterTab, highlightExportJob } = renderActions();

    await act(async () => {
      await result.current.handleScheduleAction('runNow', schedule());
    });

    expect(highlightExportJob).not.toHaveBeenCalled();
    expect(setActiveCenterTab).not.toHaveBeenCalled();
    expect(hrReportToast.error).toHaveBeenCalledWith(
      'Schedule run could not be queued. Refresh and try again.'
    );
  });

  it('shows an error toast when template actions fail', async () => {
    mocks.updateTemplate.mockReturnValue(unwrapError());
    const { result } = renderActions();

    await act(async () => {
      await result.current.handleTemplateAction('publish', template());
    });

    expect(hrReportToast.error).toHaveBeenCalledWith(
      'Template could not be updated. Refresh and try again.'
    );
  });
});
