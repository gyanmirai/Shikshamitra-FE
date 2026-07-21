'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { useEffect } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Paper,
  Button,
  TextField,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  AdmissionInquiryStage,
  AdmissionInquiryChannel,
  useGetAdmissionCrmAnalyticsSummaryQuery,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { EnrollmentWorkspaceHeader } from './workspace-header';
import { useEnrollmentWorkspace } from './enrollment-workspace-context';
import { getAdmissionCrmStageLabel, getAdmissionCrmChannelLabel } from './admissions-crm-utils';

const integerFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
const decimalFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });
const formatPercent = (value: number) => `${decimalFormatter.format(value)}%`;
const stageFunnelColumns: IColumn[] = [
  {
    id: 'stage',
    label: 'Stage',
    minWidth: 180,
    filterType: 'enum',
    enumOptions: Object.values(AdmissionInquiryStage)
      .filter((value): value is AdmissionInquiryStage => typeof value === 'number')
      .map((value) => ({ value, label: getAdmissionCrmStageLabel(value) })),
    render: (value) => getAdmissionCrmStageLabel(value),
  },
  {
    id: 'leadCount',
    label: 'Leads',
    minWidth: 100,
    align: 'right',
    filterType: 'number',
    render: (value) => integerFormatter.format(value),
  },
  {
    id: 'shareOfLeads',
    label: 'Share of leads',
    minWidth: 140,
    align: 'right',
    filterType: 'number',
    render: (value) => formatPercent(value),
  },
];
const channelPerformanceColumns: IColumn[] = [
  {
    id: 'channel',
    label: 'Channel',
    minWidth: 180,
    filterType: 'enum',
    enumOptions: Object.values(AdmissionInquiryChannel)
      .filter((value): value is AdmissionInquiryChannel => typeof value === 'number')
      .map((value) => ({ value, label: getAdmissionCrmChannelLabel(value) })),
    render: (value) => getAdmissionCrmChannelLabel(value),
  },
  {
    id: 'leadCount',
    label: 'Leads',
    minWidth: 90,
    align: 'right',
    filterType: 'number',
    render: (value) => integerFormatter.format(value),
  },
  {
    id: 'examRate',
    label: 'Exam rate',
    minWidth: 120,
    align: 'right',
    filterType: 'number',
    render: (value) => formatPercent(value),
  },
  {
    id: 'eligibilityRate',
    label: 'Eligibility rate',
    minWidth: 140,
    align: 'right',
    filterType: 'number',
    render: (value) => formatPercent(value),
  },
];

export function AnalyticsWorkspace() {
  const { academicYearId, state, updateState } = useEnrollmentWorkspace();
  const from = state.from || dayjs().subtract(29, 'day').format('YYYY-MM-DD');
  const to = state.to || dayjs().format('YYYY-MM-DD');
  const analyticsQuery = useGetAdmissionCrmAnalyticsSummaryQuery(
    { academicYearId: academicYearId || '', fromDate: from, toDate: to },
    { skip: !academicYearId }
  );
  const analytics = analyticsQuery.data;

  useEffect(() => {
    if (!state.from || !state.to) updateState({ from, to }, 'replace');
  }, [from, state.from, state.to, to, updateState]);

  if (!academicYearId) {
    return (
      <Stack spacing={1.5}>
        <EnrollmentWorkspaceHeader
          title="Enrollment Analytics"
          description="Auditable demand, conversion, exam, registration, offer, and activation performance."
        />
        <Alert severity="info">Select an academic year to open Enrollment Analytics.</Alert>
      </Stack>
    );
  }

  const metrics = analytics
    ? [
        ['Total inquiries', analytics.totalLeadCount],
        ['Active leads', analytics.activeLeadCount],
        ['Exams scheduled', analytics.examScheduledLeadCount],
        ['Eligibility handoffs', analytics.eligibilityHandoffCount],
        ['Stale or archived', analytics.staleOrArchivedLeadCount],
        ['Duplicate warnings', analytics.duplicateWarningCount],
      ]
    : [];

  return (
    <Stack spacing={1.5}>
      <EnrollmentWorkspaceHeader
        title="Enrollment Analytics"
        description="Auditable demand, conversion, exam, registration, offer, and activation performance."
      />

      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} alignItems={{ sm: 'center' }}>
          <TextField
            size="small"
            type="date"
            label="From"
            value={from}
            onChange={(event) => updateState({ from: event.target.value }, 'replace')}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            size="small"
            type="date"
            label="To"
            value={to}
            onChange={(event) => updateState({ to: event.target.value }, 'replace')}
            InputLabelProps={{ shrink: true }}
          />
          <Button
            size="small"
            onClick={() =>
              updateState({
                from: dayjs().subtract(29, 'day').format('YYYY-MM-DD'),
                to: dayjs().format('YYYY-MM-DD'),
              })
            }
          >
            Last 30 Days
          </Button>
        </Stack>
      </Paper>

      {analyticsQuery.isFetching && <LinearProgress aria-label="Loading Enrollment analytics" />}
      {analyticsQuery.isError && (
        <Alert
          severity="error"
          action={
            <Button size="small" color="inherit" onClick={() => analyticsQuery.refetch()}>
              Retry
            </Button>
          }
        >
          Enrollment analytics are unavailable.
        </Alert>
      )}

      {analytics && (
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
            }}
          >
            {metrics.map(([label, value]) => (
              <Paper key={label} variant="outlined" sx={{ p: 1.5, borderRadius: 1, minWidth: 0 }}>
                <Typography variant="h5" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {integerFormatter.format(Number(value))}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {label}
                </Typography>
              </Paper>
            ))}
          </Box>

          <Box
            sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' }, gap: 1.5 }}
          >
            <Stack spacing={1}>
              <Typography variant="subtitle2">Stage Funnel</Typography>
              <CustomizableTable
                tableId="student-enrollment-stage-funnel"
                tableTitle="Stage Funnel"
                columns={stageFunnelColumns}
                data={analytics.stageFunnel}
                isSearch={false}
                isPagination={false}
                isShowedDense={false}
                tableContainerProps={{ sx: { minHeight: 280 } }}
              />
            </Stack>

            <Stack spacing={1}>
              <Typography variant="subtitle2">Channel Performance</Typography>
              <CustomizableTable
                tableId="student-enrollment-channel-performance"
                tableTitle="Channel Performance"
                columns={channelPerformanceColumns}
                data={analytics.channelPerformance.map((item) => ({
                  ...item,
                  examRate: item.leadCount ? (item.examScheduledCount / item.leadCount) * 100 : 0,
                }))}
                isSearch={false}
                isPagination={false}
                isShowedDense={false}
                tableContainerProps={{ sx: { minHeight: 280 } }}
              />
            </Stack>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
              gap: 1,
            }}
          >
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
              <Typography variant="subtitle2">Entrance Exams</Typography>
              <Stack direction="row" gap={1} flexWrap="wrap" mt={1}>
                <Chip
                  label={`${formatPercent(analytics.examAnalytics.attendanceRate)} attendance`}
                />
                <Chip label={`${formatPercent(analytics.examAnalytics.passRate)} pass rate`} />
                <Chip
                  label={`${analytics.examAnalytics.absentCount} no-shows`}
                  color={analytics.examAnalytics.absentCount ? 'warning' : 'default'}
                />
              </Stack>
            </Paper>
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
              <Typography variant="subtitle2">Registration & Documents</Typography>
              <Stack direction="row" gap={1} flexWrap="wrap" mt={1}>
                <Chip
                  label={`${formatPercent(analytics.registrationAnalytics.completionRate)} completion`}
                />
                <Chip
                  label={`${analytics.registrationAnalytics.correctionPendingCount} corrections`}
                />
                <Chip
                  label={`${analytics.documentAnalytics.rejectedCount} rejected documents`}
                  color={analytics.documentAnalytics.rejectedCount ? 'warning' : 'default'}
                />
              </Stack>
            </Paper>
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
              <Typography variant="subtitle2">Activation</Typography>
              <Stack direction="row" gap={1} flexWrap="wrap" mt={1}>
                <Chip
                  label={`${analytics.activationAnalytics.firstDayReadyCount} first-day ready`}
                  color="success"
                />
                <Chip
                  label={`${analytics.activationAnalytics.repairRequiredCount} repair required`}
                  color={analytics.activationAnalytics.repairRequiredCount ? 'warning' : 'default'}
                />
                <Chip
                  label={`${formatPercent(analytics.activationAnalytics.firstPassSuccessRate)} first-pass success`}
                />
              </Stack>
            </Paper>
          </Box>
        </>
      )}
    </Stack>
  );
}
