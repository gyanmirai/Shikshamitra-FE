import type {
  HrReportSchedule,
  HrReportTemplate,
  HrReportExportJob,
} from 'src/redux/hr/hrReportsApi';

import { it, expect, describe } from 'vitest';

import {
  countHrReportFilters,
  formatHrReportFileSize,
  formatHrReportRowCount,
  getHrReportsCenterCounts,
  getHrReportRecipientLabel,
  canDownloadHrReportExport,
  shouldPollHrReportExports,
  sortHrReportExportsForCenter,
  isHrReportRefetchErrorResult,
  getHrReportTemplateRunSummary,
  getHrReportExportLineageLabel,
  getHrReportSchedulePreviewRuns,
  getHrReportExportDisplayStatus,
  getHrReportExportPollingDecision,
  buildHrReportTemplateExportRequest,
  isHrReportExportOwnedByCurrentUser,
  HR_REPORT_MISSING_HIGHLIGHTED_EXPORT_POLL_LIMIT,
} from './hr-report-center-utils';

const exportJob = (overrides: Partial<HrReportExportJob>): HrReportExportJob => ({
  id: overrides.id ?? 'job-1',
  reportType: overrides.reportType ?? 'Staff Report',
  format: overrides.format ?? 'excel',
  status: overrides.status ?? 'Completed',
  creationTime: overrides.creationTime ?? '2026-06-01T10:00:00Z',
  expiresAt: overrides.expiresAt ?? '2026-06-08T10:00:00Z',
  isExpired: overrides.isExpired ?? false,
  ...overrides,
});

const template = (overrides: Partial<HrReportTemplate>): HrReportTemplate => ({
  id: overrides.id ?? 'template-1',
  name: overrides.name ?? 'Staff Template',
  category: overrides.category ?? 'Employee',
  dataSource: overrides.dataSource ?? 'employee',
  visibility: overrides.visibility ?? 'private',
  status: overrides.status ?? 'Draft',
  ownerUserId: overrides.ownerUserId ?? 'user-1',
  creationTime: overrides.creationTime ?? '2026-06-01T10:00:00Z',
  definition: overrides.definition ?? {
    reportType: 'Staff Template',
    dataSource: 'employee',
    filters: {},
  },
  ...overrides,
});

const schedule = (overrides: Partial<HrReportSchedule>): HrReportSchedule => ({
  id: overrides.id ?? 'schedule-1',
  name: overrides.name ?? 'Monthly Staff Report',
  frequency: overrides.frequency ?? 'monthly',
  deliveryMode: overrides.deliveryMode ?? 'inApp',
  status: overrides.status ?? 'Active',
  recipientUserIds: overrides.recipientUserIds ?? [],
  definition: overrides.definition ?? {
    reportType: 'Staff Template',
    dataSource: 'employee',
    filters: {},
  },
  nextRunAt: overrides.nextRunAt ?? '2026-07-01T10:00:00Z',
  ownerUserId: overrides.ownerUserId ?? 'user-1',
  creationTime: overrides.creationTime ?? '2026-06-01T10:00:00Z',
  ...overrides,
});

describe('HR reports center utils', () => {
  it('sorts export jobs by workflow priority and recency', () => {
    const sorted = sortHrReportExportsForCenter([
      exportJob({ id: 'expired', status: 'Completed', isExpired: true }),
      exportJob({ id: 'failed', status: 'Failed' }),
      exportJob({ id: 'completed-old', creationTime: '2026-06-01T10:00:00Z' }),
      exportJob({ id: 'completed-new', creationTime: '2026-06-02T10:00:00Z' }),
      exportJob({ id: 'running', status: 'Running' }),
      exportJob({ id: 'queued', status: 'Queued', creationTime: '2026-06-03T10:00:00Z' }),
    ]);

    expect(sorted.map((job) => job.id)).toEqual([
      'queued',
      'running',
      'completed-new',
      'completed-old',
      'failed',
      'expired',
    ]);
  });

  it('builds summary counts for the tabbed reports center', () => {
    expect(
      getHrReportsCenterCounts(
        [
          exportJob({ id: 'queued', status: 'Queued' }),
          exportJob({ id: 'completed', status: 'Completed' }),
          exportJob({ id: 'expired', status: 'Completed', isExpired: true }),
        ],
        [template({ id: 'draft' }), template({ id: 'published', status: 'Published' })],
        [schedule({ id: 'active' }), schedule({ id: 'paused', status: 'Paused' })]
      )
    ).toEqual({
      activeExports: 1,
      completedExports: 1,
      draftTemplates: 1,
      activeSchedules: 1,
    });
  });

  it('shows expired exports as their user-facing status', () => {
    expect(
      getHrReportExportDisplayStatus(exportJob({ status: 'Completed', isExpired: true }))
    ).toBe('Expired');
  });

  it('builds export requests from saved templates without mutating the template definition', () => {
    const malformedDefinition = {
      reportType: '',
      dataSource: '',
      columns: ['employeeCode', 'employeeName'],
      filters: {},
      sourceAction: 'scheduleRun',
      parentJobId: 'stale-job-id',
      SourceAction: 'retry',
      ParentJobId: 'pascal-job-id',
      SOURCEACTION: 'regenerate',
      PARENTJOBID: 'upper-job-id',
    } as HrReportTemplate['definition'] &
      Record<'SourceAction' | 'ParentJobId' | 'SOURCEACTION' | 'PARENTJOBID', string>;

    const savedTemplate = template({
      id: 'template-run-1',
      name: 'Leadership Snapshot',
      dataSource: 'employee',
      definition: malformedDefinition,
    });

    const request = buildHrReportTemplateExportRequest(savedTemplate, 'pdf');

    expect(request).toEqual({
      reportType: 'Leadership Snapshot',
      dataSource: 'employee',
      columns: ['employeeCode', 'employeeName'],
      filters: {},
      format: 'pdf',
      templateId: 'template-run-1',
      templateName: 'Leadership Snapshot',
      sourceAction: 'manualExport',
    });
    expect(request).not.toHaveProperty('parentJobId');
    expect(request).not.toHaveProperty('ParentJobId');
    expect(request).not.toHaveProperty('PARENTJOBID');
    expect(request).not.toHaveProperty('SourceAction');
    expect(request).not.toHaveProperty('SOURCEACTION');
    expect(savedTemplate.definition.format).toBeUndefined();
    expect(savedTemplate.definition.templateId).toBeUndefined();
    expect(savedTemplate.definition.sourceAction).toBe('scheduleRun');
    expect(savedTemplate.definition.parentJobId).toBe('stale-job-id');
    expect(malformedDefinition.SourceAction).toBe('retry');
    expect(malformedDefinition.ParentJobId).toBe('pascal-job-id');
  });

  it('counts all supported report filter shapes for template and drawer summaries', () => {
    const filters = {
      employeeIds: ['employee-1'],
      departments: ['Academics'],
      statuses: [1],
      genderType: 0,
      month: '2026-06',
      componentNames: ['Basic Pay'],
      dateField: 'dateOfJoining',
      fromDate: '2026-06-01',
      toDate: '2026-06-30',
      conditions: [
        { field: 'employeeCode', operator: 'contains', value: 'EMP' },
        { field: 'department', operator: 'in', values: ['Academics'] },
        { field: 'status', operator: 'equals', value: '' },
      ],
    };

    expect(countHrReportFilters(filters)).toBe(9);
    expect(
      getHrReportTemplateRunSummary(
        template({
          definition: {
            reportType: 'Filtered Template',
            dataSource: 'employee',
            filters,
          },
        })
      ).filterCount
    ).toBe(9);
  });

  it('detects RTK Query refetch error results that resolve instead of reject', () => {
    expect(isHrReportRefetchErrorResult({ error: { status: 500 } })).toBe(true);
    expect(isHrReportRefetchErrorResult({ data: [] })).toBe(false);
    expect(isHrReportRefetchErrorResult(undefined)).toBe(false);
  });

  it('derives export ownership and download access from the job, not export permission', () => {
    expect(
      isHrReportExportOwnedByCurrentUser(exportJob({ requestedByUserId: 'USER-1' }), 'user-1')
    ).toBe(true);
    expect(
      isHrReportExportOwnedByCurrentUser(
        exportJob({ requestedByUserId: 'owner-user' }),
        'shared-user'
      )
    ).toBe(false);
    expect(
      isHrReportExportOwnedByCurrentUser(exportJob({ requestedByUserId: undefined }), 'user-1')
    ).toBe(false);
    expect(canDownloadHrReportExport(exportJob({ status: 'Completed', isExpired: false }))).toBe(
      true
    );
    expect(canDownloadHrReportExport(exportJob({ status: 'Completed', isExpired: true }))).toBe(
      false
    );
    expect(canDownloadHrReportExport(exportJob({ status: 'Running' }))).toBe(false);
  });

  it('keeps polling until a newly queued export appears in a terminal state', () => {
    const missingDecision = getHrReportExportPollingDecision([], 'queued-job');
    expect(missingDecision).toEqual(
      expect.objectContaining({
        hasActiveExports: false,
        hasHighlightedJob: false,
        isHighlightedJobMissing: true,
        isMissingHighlightedExportLimitReached: false,
        shouldPoll: true,
      })
    );
    expect(shouldPollHrReportExports([], 'queued-job')).toBe(missingDecision.shouldPoll);

    const missingAtLimitDecision = getHrReportExportPollingDecision(
      [],
      'queued-job',
      HR_REPORT_MISSING_HIGHLIGHTED_EXPORT_POLL_LIMIT
    );
    expect(missingAtLimitDecision).toEqual(
      expect.objectContaining({
        isHighlightedJobMissing: true,
        isMissingHighlightedExportLimitReached: true,
        shouldPoll: false,
      })
    );
    expect(
      shouldPollHrReportExports([], 'queued-job', HR_REPORT_MISSING_HIGHLIGHTED_EXPORT_POLL_LIMIT)
    ).toBe(missingAtLimitDecision.shouldPoll);

    expect(
      getHrReportExportPollingDecision(
        [exportJob({ id: 'queued-job', status: 'Queued' })],
        'queued-job'
      )
    ).toEqual(
      expect.objectContaining({
        hasActiveExports: true,
        hasHighlightedJob: true,
        isHighlightedJobMissing: false,
        shouldPoll: true,
      })
    );
    expect(
      getHrReportExportPollingDecision(
        [exportJob({ id: 'queued-job', status: 'Completed' })],
        'queued-job'
      )
    ).toEqual(
      expect.objectContaining({
        hasActiveExports: false,
        hasHighlightedJob: true,
        isHighlightedJobMissing: false,
        shouldPoll: false,
      })
    );
    expect(
      getHrReportExportPollingDecision(
        [exportJob({ id: 'running-other-job', status: 'Running' })],
        'completed-job'
      )
    ).toEqual(expect.objectContaining({ hasActiveExports: true, shouldPoll: true }));
  });

  it('formats details metadata for export drawers and schedule rows', () => {
    expect(formatHrReportFileSize(1536)).toBe('1.5 KB');
    expect(formatHrReportFileSize(2 * 1024 * 1024)).toBe('2.0 MB');
    expect(formatHrReportRowCount(undefined)).toBe('-');
    expect(formatHrReportRowCount(null)).toBe('-');
    expect(formatHrReportRowCount(0)).toBe('0');
    expect(formatHrReportRowCount(1200)).toBe('1,200');
    expect(getHrReportRecipientLabel(schedule({ recipientUserIds: [] }))).toBe('You only');
    expect(getHrReportRecipientLabel(schedule({ recipientUserIds: ['user-1', 'user-2'] }))).toBe(
      'You + 2'
    );
    expect(getHrReportExportLineageLabel(exportJob({ templateName: 'Staff Template' }))).toBe(
      'Generated from template: Staff Template'
    );
    expect(getHrReportExportLineageLabel(exportJob({ sourceAction: 'scheduleRun' }))).toBe(
      'Scheduled run'
    );
    expect(
      getHrReportExportLineageLabel(
        exportJob({ sourceAction: 'scheduleRun', templateName: 'Staff Template' })
      )
    ).toBe('Scheduled run');
  });

  it('computes the next three schedule runs from an explicit first run', () => {
    const runs = getHrReportSchedulePreviewRuns(
      'weekly',
      '2026-07-01T09:30',
      new Date('2026-06-13T12:00:00Z')
    );

    expect(runs.map((run) => run.format('YYYY-MM-DDTHH:mm'))).toEqual([
      '2026-07-01T09:30',
      '2026-07-08T09:30',
      '2026-07-15T09:30',
    ]);
  });

  it('mirrors backend default schedule run timing', () => {
    expect(
      getHrReportSchedulePreviewRuns('daily', undefined, new Date(2026, 5, 13, 6, 30)).map((run) =>
        run.format('YYYY-MM-DDTHH:mm')
      )
    ).toEqual(['2026-06-13T07:00', '2026-06-14T07:00', '2026-06-15T07:00']);

    expect(
      getHrReportSchedulePreviewRuns('daily', undefined, new Date(2026, 5, 13, 8, 30)).map((run) =>
        run.format('YYYY-MM-DDTHH:mm')
      )
    ).toEqual(['2026-06-14T07:00', '2026-06-15T07:00', '2026-06-16T07:00']);

    expect(
      getHrReportSchedulePreviewRuns('weekly', undefined, new Date(2026, 5, 13, 8, 30)).map((run) =>
        run.format('YYYY-MM-DDTHH:mm')
      )
    ).toEqual(['2026-06-21T07:00', '2026-06-28T07:00', '2026-07-05T07:00']);

    expect(
      getHrReportSchedulePreviewRuns('monthly', undefined, new Date(2026, 5, 13, 8, 30)).map(
        (run) => run.format('YYYY-MM-DDTHH:mm')
      )
    ).toEqual(['2026-07-14T07:00', '2026-08-14T07:00', '2026-09-14T07:00']);
  });
});
