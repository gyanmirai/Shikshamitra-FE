import type React from 'react';
import type {
  HrReportSchedule,
  HrReportTemplate,
  HrReportExportJob,
} from 'src/redux/hr/hrReportsApi';

import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within, waitFor } from '@testing-library/react';

import { HrReportExportsTab } from './HrReportExportsTab';
import { HrReportSchedulesTab } from './HrReportSchedulesTab';
import { HrReportTemplatesTab } from './HrReportTemplatesTab';
import { HrReportsLandingTable } from '../HrReportsLandingTable';
import { HrReportRunTemplateDialog } from './HrReportRunTemplateDialog';
import { HrReportShareExportDialog } from './HrReportShareExportDialog';
import { defaultHrReportPermissions } from '../../hr-report-permissions';
import { HrReportActiveExportBanner } from './HrReportActiveExportBanner';
import { HrReportExportDetailsDrawer } from './HrReportExportDetailsDrawer';

vi.mock('src/redux/hr/hrReportsApi', () => ({
  useGetHrReportRecipientsQuery: (params?: { ids?: string[] }) => {
    const recipients = [
      { id: 'recipient-1', displayName: 'Report Viewer', email: 'viewer@test.local' },
      { id: 'recipient-2', displayName: 'Payroll Viewer', email: 'payroll@test.local' },
    ];
    if (params?.ids?.includes('recipient-3')) {
      recipients.push({
        id: 'recipient-3',
        displayName: 'Outside Page Viewer',
        email: 'outside@test.local',
      });
    }

    return {
      data: recipients,
      isFetching: false,
    };
  },
}));

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

vi.mock('src/components/custom-tabs', () => ({
  CustomTabs: ({ children }: { children: React.ReactNode }) => <div role="tablist">{children}</div>,
}));

vi.mock('src/components/customizabaleTable', () => ({
  default: ({ columns, data, rowProps, noDataText }: any) =>
    data.length ? (
      <div>
        {data.map((row: any) => {
          rowProps?.(row);
          return (
            <div key={row.id} data-testid={`hr-report-export-row-${row.id}`}>
              {columns.map((column: any) => (
                <div key={column.id}>
                  {column.render ? column.render(row[column.id], row) : row[column.id]}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    ) : (
      <div>{noDataText}</div>
    ),
}));

const exportJob = (overrides: Partial<HrReportExportJob> = {}): HrReportExportJob => ({
  id: overrides.id ?? 'job-1',
  reportType: overrides.reportType ?? 'Staff Report',
  format: overrides.format ?? 'excel',
  status: overrides.status ?? 'Completed',
  progressPercent: overrides.progressPercent ?? 100,
  creationTime: overrides.creationTime ?? '2026-06-01T10:00:00Z',
  expiresAt: overrides.expiresAt ?? '2026-06-08T10:00:00Z',
  isExpired: overrides.isExpired ?? false,
  requestedByUserId: overrides.requestedByUserId ?? 'user-1',
  ...overrides,
});

const template = (overrides: Partial<HrReportTemplate> = {}): HrReportTemplate => ({
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
    columns: ['employeeCode', 'employeeName'],
    groups: ['department'],
    summaries: [{ field: 'grossSalary', function: 'sum' }],
    filters: {
      conditions: [{ field: 'status', operator: 'equals', value: 'Active' }],
    },
  },
  ...overrides,
});

const schedule = (overrides: Partial<HrReportSchedule> = {}): HrReportSchedule => ({
  id: overrides.id ?? 'schedule-1',
  name: overrides.name ?? 'Monthly Staff Report',
  frequency: overrides.frequency ?? 'monthly',
  deliveryMode: overrides.deliveryMode ?? 'inApp',
  status: overrides.status ?? 'Active',
  recipientUserIds: overrides.recipientUserIds ?? [],
  definition: overrides.definition ?? {
    reportType: 'Staff Report',
    dataSource: 'employee',
    filters: {},
  },
  nextRunAt: overrides.nextRunAt ?? '2026-06-15T07:00:00Z',
  ownerUserId: overrides.ownerUserId ?? 'user-1',
  creationTime: overrides.creationTime ?? '2026-06-01T10:00:00Z',
  ...overrides,
});

describe('HR report center enhancements', () => {
  it('shows and refreshes the active export banner', async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();

    render(
      <HrReportActiveExportBanner
        exportJobs={[
          exportJob({ id: 'queued', status: 'Queued' }),
          exportJob({ id: 'running', status: 'Running' }),
        ]}
        isRefreshing={false}
        onRefresh={onRefresh}
      />
    );

    expect(screen.getByText('2 exports are preparing')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('renders export details, snapshot metadata, and download action', async () => {
    const user = userEvent.setup();
    const onDownload = vi.fn();

    render(
      <HrReportExportDetailsDrawer
        job={exportJob({
          fileSizeBytes: 2048,
          rowCount: 12,
          templateName: 'Staff Template',
          requestSnapshot: {
            reportType: 'Staff Report',
            dataSource: 'employee',
            columns: ['employeeCode', 'employeeName'],
            filters: {
              month: '2026-06',
              departments: ['Academics'],
              conditions: [{ field: 'employeeCode', operator: 'contains', value: 'EMP' }],
            },
          },
        })}
        isDownloading={false}
        currentUserId="user-1"
        permissions={{ ...defaultHrReportPermissions, canExport: true }}
        onClose={vi.fn()}
        onDownload={onDownload}
        onExportAction={vi.fn()}
      />
    );

    expect(screen.getByText('Generated from template: Staff Template')).toBeVisible();
    expect(screen.getByText('Request Snapshot')).toBeVisible();
    expect(
      within(screen.getByTestId('hr-report-export-request-columns')).getByText('2 selected')
    ).toBeVisible();
    expect(
      within(screen.getByTestId('hr-report-export-request-filters')).getByText('3')
    ).toBeVisible();
    expect(
      within(screen.getByTestId('hr-report-export-detail-file-size')).getByText('2.0 KB')
    ).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Download' }));
    expect(onDownload).toHaveBeenCalledWith('job-1', 'Staff Report');
  });

  it('lets view-only shared recipients download completed exports', async () => {
    const user = userEvent.setup();
    const onDownload = vi.fn();

    render(
      <HrReportExportDetailsDrawer
        job={exportJob({ requestedByUserId: 'owner-user' })}
        isDownloading={false}
        currentUserId="shared-user"
        permissions={{ ...defaultHrReportPermissions, canView: true }}
        onClose={vi.fn()}
        onDownload={onDownload}
        onExportAction={vi.fn()}
      />
    );

    const downloadButton = screen.getByRole('button', { name: 'Download' });
    expect(downloadButton).toBeEnabled();

    await user.click(downloadButton);
    expect(onDownload).toHaveBeenCalledWith('job-1', 'Staff Report');
  });

  it('keeps owner-only actions hidden for shared export rows', () => {
    const onExportAction = vi.fn();

    const { rerender } = render(
      <HrReportExportsTab
        exportJobs={[
          exportJob({
            id: 'shared-running',
            status: 'Running',
            requestedByUserId: 'owner-user',
          }),
        ]}
        highlightedExportId={null}
        isLoading={false}
        isDownloading={false}
        currentUserId="shared-user"
        permissions={{ ...defaultHrReportPermissions, canView: true, canExport: true }}
        onDownload={vi.fn()}
        onExportAction={onExportAction}
      />
    );

    expect(screen.queryByTestId('hr-report-export-cancel-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('hr-report-export-share-button')).not.toBeInTheDocument();

    rerender(
      <HrReportExportsTab
        exportJobs={[
          exportJob({
            id: 'owned-running',
            status: 'Running',
            requestedByUserId: 'owner-user',
          }),
        ]}
        highlightedExportId={null}
        isLoading={false}
        isDownloading={false}
        currentUserId="owner-user"
        permissions={{ ...defaultHrReportPermissions, canView: true, canExport: true }}
        onDownload={vi.fn()}
        onExportAction={onExportAction}
      />
    );

    expect(screen.getByTestId('hr-report-export-cancel-button')).toBeVisible();
  });

  it('shows share only for owned export rows with share permission', async () => {
    const user = userEvent.setup();
    const onExportAction = vi.fn();

    render(
      <HrReportExportsTab
        exportJobs={[exportJob({ id: 'owned-export', requestedByUserId: 'owner-user' })]}
        highlightedExportId={null}
        isLoading={false}
        isDownloading={false}
        currentUserId="owner-user"
        permissions={{ ...defaultHrReportPermissions, canView: true, canShare: true }}
        onDownload={vi.fn()}
        onExportAction={onExportAction}
      />
    );

    await user.click(screen.getByTestId('hr-report-export-share-button'));
    expect(onExportAction).toHaveBeenCalledWith('share', 'owned-export');
  });

  it('shows failed-export removal only to the owner with delete permission', async () => {
    const user = userEvent.setup();
    const onExportAction = vi.fn();
    const { rerender } = render(
      <HrReportExportsTab
        exportJobs={[
          exportJob({
            id: 'owned-failed-export',
            status: 'Failed',
            requestedByUserId: 'owner-user',
          }),
        ]}
        highlightedExportId={null}
        isLoading={false}
        isDownloading={false}
        currentUserId="owner-user"
        permissions={{ ...defaultHrReportPermissions, canView: true, canDelete: true }}
        onDownload={vi.fn()}
        onExportAction={onExportAction}
      />
    );

    await user.click(screen.getByTestId('hr-report-export-delete-button'));
    expect(onExportAction).toHaveBeenCalledWith('delete', 'owned-failed-export');

    rerender(
      <HrReportExportsTab
        exportJobs={[
          exportJob({
            id: 'shared-failed-export',
            status: 'Failed',
            requestedByUserId: 'owner-user',
          }),
        ]}
        highlightedExportId={null}
        isLoading={false}
        isDownloading={false}
        currentUserId="shared-user"
        permissions={{ ...defaultHrReportPermissions, canView: true, canDelete: true }}
        onDownload={vi.fn()}
        onExportAction={onExportAction}
      />
    );
    expect(screen.queryByTestId('hr-report-export-delete-button')).not.toBeInTheDocument();
  });

  it('emits requested-date preset changes and validates an inverted custom range', async () => {
    const user = userEvent.setup();
    const onDateFilterChange = vi.fn();
    const { rerender } = render(
      <HrReportExportsTab
        exportJobs={[]}
        highlightedExportId={null}
        isLoading={false}
        isDownloading={false}
        currentUserId="owner-user"
        permissions={{ ...defaultHrReportPermissions, canView: true }}
        dateFilter={{ preset: 'all', fromDate: '', toDate: '' }}
        onDateFilterChange={onDateFilterChange}
        onDownload={vi.fn()}
        onExportAction={vi.fn()}
      />
    );

    await user.click(screen.getByRole('combobox', { name: 'Date range' }));
    await user.click(screen.getByRole('option', { name: 'Today' }));
    expect(onDateFilterChange).toHaveBeenCalledWith({
      preset: 'today',
      fromDate: '',
      toDate: '',
    });

    rerender(
      <HrReportExportsTab
        exportJobs={[]}
        highlightedExportId={null}
        isLoading={false}
        isDownloading={false}
        currentUserId="owner-user"
        permissions={{ ...defaultHrReportPermissions, canView: true }}
        dateFilter={{ preset: 'custom', fromDate: '2026-07-20', toDate: '2026-07-19' }}
        onDateFilterChange={onDateFilterChange}
        onDownload={vi.fn()}
        onExportAction={vi.fn()}
      />
    );
    expect(screen.getByText('To date must be on or after from date.')).toBeVisible();
  });

  it('closes export details when the requested-date query identity changes', async () => {
    const user = userEvent.setup();
    const job = exportJob({ id: 'date-a-export' });
    const props = {
      exportJobs: [job],
      highlightedExportId: null,
      isLoading: false,
      isDownloading: false,
      currentUserId: 'user-1',
      permissions: { ...defaultHrReportPermissions, canView: true },
      onDownload: vi.fn(),
      onExportAction: vi.fn(),
    };
    const { rerender } = render(
      <HrReportExportsTab {...props} dateFilter={{ preset: 'all', fromDate: '', toDate: '' }} />
    );

    await user.click(screen.getByTestId('hr-report-export-details-button'));
    expect(screen.getByTestId('hr-report-export-detail-status')).toBeVisible();

    rerender(
      <HrReportExportsTab {...props} dateFilter={{ preset: 'today', fromDate: '', toDate: '' }} />
    );

    await waitFor(() =>
      expect(screen.queryByTestId('hr-report-export-detail-status')).not.toBeInTheDocument()
    );
  });

  it('disables export row actions while the active query is pending', async () => {
    const onExportAction = vi.fn();

    render(
      <HrReportExportsTab
        exportJobs={[
          exportJob({
            id: 'pending-query-failed-export',
            status: 'Failed',
            requestedByUserId: 'user-1',
          }),
        ]}
        highlightedExportId={null}
        isLoading
        isDownloading={false}
        actionsDisabled
        currentUserId="user-1"
        permissions={{
          ...defaultHrReportPermissions,
          canView: true,
          canExport: true,
          canDelete: true,
        }}
        onDownload={vi.fn()}
        onExportAction={onExportAction}
      />
    );

    expect(screen.getByTestId('hr-report-export-delete-button')).toBeDisabled();
    expect(screen.getByTestId('hr-report-export-retry-button')).toBeDisabled();
    expect(screen.getByTestId('hr-report-export-details-button')).toBeDisabled();
    expect(onExportAction).not.toHaveBeenCalled();
  });

  it('closes a failed-export delete confirmation when the date query changes', async () => {
    const user = userEvent.setup();
    const job = exportJob({
      id: 'date-a-failed-export',
      status: 'Failed',
      requestedByUserId: 'user-1',
    });
    const sharedProps = {
      templates: [],
      schedules: [],
      exportJobs: [job],
      activeTab: 'exports' as const,
      highlightedExportId: null,
      isLoading: false,
      isDownloading: false,
      exportActionsDisabled: false,
      currentUserId: 'user-1',
      onRefreshExports: vi.fn(),
      onTabChange: vi.fn(),
      onOpenTemplate: vi.fn(),
      onRunTemplate: vi.fn(),
      onDownload: vi.fn(),
      onExportAction: vi.fn(),
      onTemplateAction: vi.fn(),
      onScheduleAction: vi.fn(),
      permissions: {
        ...defaultHrReportPermissions,
        canView: true,
        canDelete: true,
      },
      onExportDateFilterChange: vi.fn(),
    };
    const { rerender } = render(
      <HrReportsLandingTable
        {...sharedProps}
        exportDateFilter={{ preset: 'all', fromDate: '', toDate: '' }}
      />
    );

    await user.click(screen.getByTestId('hr-report-export-delete-button'));
    expect(screen.getByText('Remove failed export?')).toBeVisible();

    rerender(
      <HrReportsLandingTable
        {...sharedProps}
        exportDateFilter={{ preset: 'today', fromDate: '', toDate: '' }}
      />
    );

    await waitFor(() =>
      expect(screen.queryByText('Remove failed export?')).not.toBeInTheDocument()
    );
  });

  it('does not require export permission for completed export row downloads', async () => {
    const user = userEvent.setup();
    const onDownload = vi.fn();

    render(
      <HrReportExportsTab
        exportJobs={[
          exportJob({
            id: 'shared-completed',
            requestedByUserId: 'owner-user',
          }),
        ]}
        highlightedExportId={null}
        isLoading={false}
        isDownloading={false}
        currentUserId="shared-user"
        permissions={{ ...defaultHrReportPermissions, canView: true }}
        onDownload={onDownload}
        onExportAction={vi.fn()}
      />
    );

    const downloadButton = screen.getByTestId('hr-report-export-download-button');
    expect(downloadButton).toBeEnabled();

    await user.click(downloadButton);
    expect(onDownload).toHaveBeenCalledWith('shared-completed', 'Staff Report');
  });

  it('keeps drawer actions in parity with export row ownership rules', () => {
    const { rerender } = render(
      <HrReportExportDetailsDrawer
        job={exportJob({ status: 'Queued', requestedByUserId: 'owner-user' })}
        isDownloading={false}
        currentUserId="shared-user"
        permissions={{ ...defaultHrReportPermissions, canView: true, canExport: true }}
        onClose={vi.fn()}
        onDownload={vi.fn()}
        onExportAction={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();

    rerender(
      <HrReportExportDetailsDrawer
        job={exportJob({ status: 'Queued', requestedByUserId: 'owner-user' })}
        isDownloading={false}
        currentUserId="owner-user"
        permissions={{ ...defaultHrReportPermissions, canView: true, canExport: true }}
        onClose={vi.fn()}
        onDownload={vi.fn()}
        onExportAction={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();

    rerender(
      <HrReportExportDetailsDrawer
        job={exportJob({
          status: 'Completed',
          isExpired: true,
          requestedByUserId: 'owner-user',
        })}
        isDownloading={false}
        currentUserId="shared-user"
        permissions={{ ...defaultHrReportPermissions, canView: true, canExport: true }}
        onClose={vi.fn()}
        onDownload={vi.fn()}
        onExportAction={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Regenerate' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Download' })).toBeDisabled();
  });

  it('keeps drawer share action owner-only', () => {
    const { rerender } = render(
      <HrReportExportDetailsDrawer
        job={exportJob({ requestedByUserId: 'owner-user' })}
        isDownloading={false}
        currentUserId="shared-user"
        permissions={{ ...defaultHrReportPermissions, canView: true, canShare: true }}
        onClose={vi.fn()}
        onDownload={vi.fn()}
        onExportAction={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: 'Share' })).not.toBeInTheDocument();

    rerender(
      <HrReportExportDetailsDrawer
        job={exportJob({ requestedByUserId: 'owner-user' })}
        isDownloading={false}
        currentUserId="owner-user"
        permissions={{ ...defaultHrReportPermissions, canView: true, canShare: true }}
        onClose={vi.fn()}
        onDownload={vi.fn()}
        onExportAction={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Share' })).toBeVisible();
  });

  it('submits selected recipients from the share export dialog', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <HrReportShareExportDialog
        open
        job={exportJob()}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByRole('button', { name: 'Share Export' })).toBeDisabled();
    await user.click(screen.getByLabelText('Recipients'));
    await user.click(screen.getByRole('option', { name: 'Report Viewer (viewer@test.local)' }));
    await user.click(screen.getByRole('button', { name: 'Share Export' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith([
        { id: 'recipient-1', displayName: 'Report Viewer', email: 'viewer@test.local' },
      ])
    );
  });

  it('preselects shared recipients and submits newly added recipients together', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <HrReportShareExportDialog
        open
        job={exportJob({ sharedUserIds: ['recipient-1'] })}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    expect(await screen.findByText(/Report Viewer/)).toBeVisible();
    await user.click(screen.getByLabelText('Recipients'));
    await user.click(screen.getByRole('option', { name: 'Payroll Viewer (payroll@test.local)' }));
    await user.click(screen.getByRole('button', { name: 'Share Export' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith([
        { id: 'recipient-1', displayName: 'Report Viewer', email: 'viewer@test.local' },
        { id: 'recipient-2', displayName: 'Payroll Viewer', email: 'payroll@test.local' },
      ])
    );
  });

  it('resolves preselected shared recipients that are outside the first recipient page', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <HrReportShareExportDialog
        open
        job={exportJob({ sharedUserIds: ['recipient-3'] })}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    expect(await screen.findByText(/Outside Page Viewer/)).toBeVisible();
    expect(screen.queryByText('recipient-3')).not.toBeInTheDocument();
  });

  it('shows schedule delete from the schedule permission, not the report delete permission', () => {
    const { rerender } = render(
      <HrReportSchedulesTab
        schedules={[schedule()]}
        isLoading={false}
        permissions={{ ...defaultHrReportPermissions, canView: true, canSchedule: true }}
        onScheduleAction={vi.fn()}
      />
    );

    expect(screen.getByTestId('hr-report-schedule-delete-button')).toBeVisible();

    rerender(
      <HrReportSchedulesTab
        schedules={[schedule()]}
        isLoading={false}
        permissions={{ ...defaultHrReportPermissions, canView: true, canDelete: true }}
        onScheduleAction={vi.fn()}
      />
    );

    expect(screen.queryByTestId('hr-report-schedule-delete-button')).not.toBeInTheDocument();
  });

  it('shows Run Report in templates only for export-capable users', async () => {
    const user = userEvent.setup();
    const onRunTemplate = vi.fn();

    const { rerender } = render(
      <HrReportTemplatesTab
        templates={[template()]}
        isLoading={false}
        permissions={{ ...defaultHrReportPermissions, canView: true }}
        onOpenTemplate={vi.fn()}
        onRunTemplate={onRunTemplate}
        onTemplateAction={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: 'Run Report' })).not.toBeInTheDocument();

    rerender(
      <HrReportTemplatesTab
        templates={[template()]}
        isLoading={false}
        permissions={{ ...defaultHrReportPermissions, canView: true, canExport: true }}
        onOpenTemplate={vi.fn()}
        onRunTemplate={onRunTemplate}
        onTemplateAction={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Run Report' }));
    expect(onRunTemplate).toHaveBeenCalledWith(expect.objectContaining({ id: 'template-1' }));
  });

  it('submits template run format and summary from the dialog', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <HrReportRunTemplateDialog
        open
        template={template()}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByRole('dialog', { name: 'Run report' })).toBeVisible();
    expect(screen.getByText('Staff Template')).toBeVisible();
    expect(
      within(screen.getByTestId('hr-report-run-template-summary-columns')).getByText('2 selected')
    ).toBeVisible();
    expect(
      within(screen.getByTestId('hr-report-run-template-summary-filters')).getByText('1')
    ).toBeVisible();
    expect(
      within(screen.getByTestId('hr-report-run-template-summary-groups')).getByText('1')
    ).toBeVisible();
    expect(
      within(screen.getByTestId('hr-report-run-template-summary-summaries')).getByText('1')
    ).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'PDF' }));
    await user.click(screen.getByTestId('hr-report-run-template-submit-button'));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('pdf'));
  });

  it('shows template run summaries for non-condition filters', () => {
    render(
      <HrReportRunTemplateDialog
        open
        template={template({
          name: 'Payroll Monthly Template',
          definition: {
            reportType: 'Payroll Monthly Template',
            dataSource: 'payroll',
            columns: ['employeeCode'],
            filters: {
              month: '2026-06',
              departments: ['Academics'],
              statuses: [1],
            },
          },
        })}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText('Payroll Monthly Template')).toBeVisible();
    expect(
      within(screen.getByTestId('hr-report-run-template-summary-columns')).getByText('1 selected')
    ).toBeVisible();
    expect(
      within(screen.getByTestId('hr-report-run-template-summary-filters')).getByText('3')
    ).toBeVisible();
  });

  it('prevents duplicate template export submissions while queueing', async () => {
    const user = userEvent.setup();
    let resolveSubmit!: () => void;
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        })
    );

    render(
      <HrReportRunTemplateDialog
        open
        template={template()}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    const submitButton = screen.getByTestId('hr-report-run-template-submit-button');
    await user.dblClick(submitButton);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(submitButton).toBeDisabled();

    resolveSubmit();
    await waitFor(() => expect(submitButton).toBeEnabled());
  });
});
