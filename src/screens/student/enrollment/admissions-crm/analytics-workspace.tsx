'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';

import CustomizableTable from 'src/components/customizabaleTable';
import { useGetAdmissionCrmAdmissionReportQuery } from 'src/redux/student/admissions-crm/admissions-crm-api';
import {
  Box,
  Alert,
  Stack,
  Paper,
  Button,
  Skeleton,
  TextField,
  Typography,
  ToggleButton,
  LinearProgress,
  ToggleButtonGroup,
} from '@mui/material';

import { EnrollmentWorkspaceHeader } from './workspace-header';
import { useEnrollmentWorkspace } from './enrollment-workspace-context';
import { getAdmissionReportDateRangeError } from './admission-report-date-range';
import {
  enrollmentTableWrapperSx,
  EnrollmentTableEmptyState,
  enrollmentWorkspaceRootSx,
  enrollmentTableContainerSx,
} from './workspace-table-patterns';

import type { EnrollmentReportView } from './enrollment-workspace-state';

const integerFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
const decimalFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });
const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});
const formatPercent = (value: number) => `${decimalFormatter.format(value)}%`;

const lifecycleColumns: IColumn[] = [
  { id: 'columnName', label: 'Admission status', minWidth: 210 },
  {
    id: 'applicantCount',
    label: 'Applicants',
    minWidth: 110,
    align: 'right',
    filterType: 'number',
    render: (value) => integerFormatter.format(Number(value)),
  },
  {
    id: 'shareOfApplicants',
    label: 'Share',
    minWidth: 110,
    align: 'right',
    filterType: 'number',
    render: (value) => formatPercent(Number(value)),
  },
];

const sourceColumns: IColumn[] = [
  { id: 'sourceName', label: 'Inquiry source', minWidth: 200 },
  {
    id: 'inquiryCount',
    label: 'Inquiries',
    minWidth: 100,
    align: 'right',
    filterType: 'number',
  },
  {
    id: 'examScheduledCount',
    label: 'Exam scheduled',
    minWidth: 135,
    align: 'right',
    filterType: 'number',
  },
  {
    id: 'activatedCount',
    label: 'Activated',
    minWidth: 105,
    align: 'right',
    filterType: 'number',
  },
  {
    id: 'activationRate',
    label: 'Activation rate',
    minWidth: 135,
    align: 'right',
    filterType: 'number',
    render: (value) => formatPercent(Number(value)),
  },
];

const standardColumns: IColumn[] = [
  { id: 'standardName', label: 'Standard', minWidth: 150 },
  { id: 'inquiryCount', label: 'Inquiries', minWidth: 100, align: 'right' },
  { id: 'examScheduledCount', label: 'Exam scheduled', minWidth: 135, align: 'right' },
  { id: 'examCompletedCount', label: 'Exam completed', minWidth: 135, align: 'right' },
  { id: 'eligibleCount', label: 'Eligible', minWidth: 95, align: 'right' },
  {
    id: 'registrationPendingCount',
    label: 'Registration pending',
    minWidth: 155,
    align: 'right',
  },
  {
    id: 'registrationVerifiedCount',
    label: 'Registration verified',
    minWidth: 160,
    align: 'right',
  },
  { id: 'financePendingCount', label: 'Finance pending', minWidth: 130, align: 'right' },
  { id: 'activationPendingCount', label: 'Activation pending', minWidth: 145, align: 'right' },
  { id: 'activatedCount', label: 'Activated', minWidth: 100, align: 'right' },
  { id: 'rejectedCount', label: 'Rejected', minWidth: 95, align: 'right' },
  { id: 'withdrawnCount', label: 'Withdrawn', minWidth: 105, align: 'right' },
];

const outcomeColumns: IColumn[] = [
  { id: 'outcomeName', label: 'Outcome', minWidth: 190 },
  {
    id: 'applicantCount',
    label: 'Applicants',
    minWidth: 110,
    align: 'right',
    filterType: 'number',
  },
  {
    id: 'shareOfApplicants',
    label: 'Share',
    minWidth: 110,
    align: 'right',
    filterType: 'number',
    render: (value) => formatPercent(Number(value)),
  },
];

const viewConfiguration = {
  lifecycle: { title: 'Admission status', columns: lifecycleColumns },
  sources: { title: 'Inquiry sources', columns: sourceColumns },
  standards: { title: 'Admissions by standard', columns: standardColumns },
  outcomes: { title: 'Closed outcomes', columns: outcomeColumns },
} satisfies Record<EnrollmentReportView, { title: string; columns: IColumn[] }>;

export function AnalyticsWorkspace() {
  const { academicYearId, state, updateState } = useEnrollmentWorkspace();
  const reportView = state.reportView || 'lifecycle';
  const from = state.from || '';
  const to = state.to || '';
  const dateRangeError = getAdmissionReportDateRangeError(from, to);
  const reportQuery = useGetAdmissionCrmAdmissionReportQuery(
    {
      academicYearId: academicYearId || '',
      fromDate: from || undefined,
      toDate: to || undefined,
    },
    { skip: !academicYearId || Boolean(dateRangeError) }
  );
  const report = reportQuery.data;
  const isInitialReportLoading = reportQuery.isLoading && !report;
  const showReportWorkspace =
    !dateRangeError && !reportQuery.isError && (Boolean(report) || isInitialReportLoading);
  const view = viewConfiguration[reportView];
  const reportData = report?.[reportView] || [];

  if (!academicYearId) {
    return (
      <Stack spacing={1.5} sx={enrollmentWorkspaceRootSx}>
        <EnrollmentWorkspaceHeader
          title="Admission Reports"
          description="Auditable admission status, source, standard, and outcome reporting."
        />
        <Alert severity="info">Select an academic year to open Admission Reports.</Alert>
      </Stack>
    );
  }

  const metrics: Array<[string, number]> = report
    ? [
        ['Total applicants', report.totalApplicantCount],
        ['Open applicants', report.openApplicantCount],
        ['Activated', report.activatedApplicantCount],
        ['Rejected or ineligible', report.rejectedApplicantCount],
        ['Withdrawn', report.withdrawnApplicantCount],
        ['Standard not selected', report.unassignedStandardApplicantCount],
      ]
    : [];

  return (
    <Stack spacing={1.5} sx={enrollmentWorkspaceRootSx}>
      <EnrollmentWorkspaceHeader
        title="Admission Reports"
        description="Auditable admission status, source, standard, and outcome reporting."
      />

      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} alignItems={{ sm: 'center' }}>
          <TextField
            size="small"
            type="date"
            label="From"
            value={from}
            onChange={(event) => updateState({ from: event.target.value || undefined }, 'replace')}
            InputLabelProps={{ shrink: true }}
            error={Boolean(dateRangeError)}
          />
          <TextField
            size="small"
            type="date"
            label="To"
            value={to}
            onChange={(event) => updateState({ to: event.target.value || undefined }, 'replace')}
            InputLabelProps={{ shrink: true }}
            error={Boolean(dateRangeError)}
          />
          <Button
            size="small"
            disabled={!from && !to}
            onClick={() => updateState({ from: undefined, to: undefined }, 'replace')}
          >
            Clear Dates
          </Button>
          {report ? (
            <Typography variant="caption" color="text.secondary" sx={{ ml: { sm: 'auto' } }}>
              As of {dateTimeFormatter.format(new Date(report.generatedAt))}
            </Typography>
          ) : null}
        </Stack>
      </Paper>

      {dateRangeError === 'invalid-order' ? (
        <Alert severity="warning">The From date must be on or before the To date.</Alert>
      ) : null}
      {dateRangeError === 'invalid-date' ? (
        <Alert severity="warning">Choose valid calendar dates for this report.</Alert>
      ) : null}
      {dateRangeError === 'too-large' ? (
        <Alert severity="warning">Choose a report date range of 366 days or fewer.</Alert>
      ) : null}
      {report?.isScopeRestricted ? (
        <Alert severity="info">
          Counts include only the standards and applicants within your assigned access.
        </Alert>
      ) : null}
      {reportQuery.isFetching && !reportQuery.isLoading ? (
        <LinearProgress aria-label="Refreshing Admission Reports" />
      ) : null}
      {reportQuery.isError ? (
        <Alert
          severity="error"
          action={
            <Button size="small" color="inherit" onClick={() => reportQuery.refetch()}>
              Retry
            </Button>
          }
        >
          Admission Reports are unavailable.
        </Alert>
      ) : null}

      {showReportWorkspace ? (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
                xl: 'repeat(6, minmax(0, 1fr))',
              },
              gap: 1,
              flexShrink: 0,
            }}
          >
            {report
              ? metrics.map(([label, value]) => (
                  <Paper
                    key={label}
                    variant="outlined"
                    sx={{ p: 1.5, borderRadius: 1, minWidth: 0 }}
                  >
                    <Typography variant="h5" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {integerFormatter.format(value)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {label}
                    </Typography>
                  </Paper>
                ))
              : Array.from({ length: 6 }, (_, index) => (
                  <Paper
                    key={`report-metric-skeleton-${index}`}
                    variant="outlined"
                    sx={{ p: 1.5, borderRadius: 1, minWidth: 0 }}
                  >
                    <Skeleton variant="text" width="45%" height={32} />
                    <Skeleton variant="text" width="75%" />
                  </Paper>
                ))}
          </Box>

          <Stack spacing={1} sx={{ flex: 1, minHeight: 0 }}>
            <Box sx={{ overflowX: 'auto' }}>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={reportView}
                onChange={(_, value: EnrollmentReportView | null) => {
                  if (value) updateState({ reportView: value }, 'replace');
                }}
                aria-label="Admission report view"
              >
                <ToggleButton value="lifecycle">Admission Status</ToggleButton>
                <ToggleButton value="sources">Inquiry Sources</ToggleButton>
                <ToggleButton value="standards">Standards</ToggleButton>
                <ToggleButton value="outcomes">Outcomes</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <CustomizableTable
              key={reportView}
              tableId={`student-enrollment-admission-report-${reportView}`}
              tableTitle={view.title}
              columns={view.columns}
              data={reportData}
              isLoading={isInitialReportLoading}
              isSearch={false}
              isPagination={false}
              isShowedDense={false}
              noDataText={
                <EnrollmentTableEmptyState
                  title={`No ${view.title.toLocaleLowerCase()} data`}
                  description="No applicants match the selected admission year and date range."
                />
              }
              wrapperProps={{ sx: enrollmentTableWrapperSx }}
              tableContainerProps={{ sx: enrollmentTableContainerSx }}
            />
          </Stack>
        </>
      ) : null}
    </Stack>
  );
}
