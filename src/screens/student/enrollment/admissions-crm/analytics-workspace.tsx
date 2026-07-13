'use client';

import dayjs from 'dayjs';
import { useEffect } from 'react';
import { useGetAdmissionCrmAnalyticsSummaryQuery } from 'src/redux/student/admissions-crm/admissions-crm-api';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Paper,
  Table,
  Button,
  TableRow,
  TextField,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  LinearProgress,
} from '@mui/material';

import { EnrollmentWorkspaceHeader } from './workspace-header';
import { useEnrollmentWorkspace } from './enrollment-workspace-context';
import { getAdmissionCrmStageLabel, getAdmissionCrmChannelLabel } from './admissions-crm-utils';

const integerFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
const decimalFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });
const formatPercent = (value: number) => `${decimalFormatter.format(value)}%`;

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
    return <Alert severity="info">Select an academic year to open Enrollment Analytics.</Alert>;
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
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.25} alignItems={{ sm: 'center' }}>
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
            <Paper variant="outlined" sx={{ borderRadius: 1, overflow: 'hidden' }}>
              <Box sx={{ px: 1.5, py: 1.25 }}>
                <Typography variant="subtitle2">Stage Funnel</Typography>
              </Box>
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 520 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Stage</TableCell>
                      <TableCell align="right">Leads</TableCell>
                      <TableCell align="right">Share of leads</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics.stageFunnel.map((item) => (
                      <TableRow key={item.stage}>
                        <TableCell>{getAdmissionCrmStageLabel(item.stage)}</TableCell>
                        <TableCell align="right">
                          {integerFormatter.format(item.leadCount)}
                        </TableCell>
                        <TableCell align="right">{formatPercent(item.shareOfLeads)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Paper>

            <Paper variant="outlined" sx={{ borderRadius: 1, overflow: 'hidden' }}>
              <Box sx={{ px: 1.5, py: 1.25 }}>
                <Typography variant="subtitle2">Channel Performance</Typography>
              </Box>
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 520 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Channel</TableCell>
                      <TableCell align="right">Leads</TableCell>
                      <TableCell align="right">Exam rate</TableCell>
                      <TableCell align="right">Eligibility rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics.channelPerformance.map((item) => (
                      <TableRow key={item.channel}>
                        <TableCell>{getAdmissionCrmChannelLabel(item.channel)}</TableCell>
                        <TableCell align="right">
                          {integerFormatter.format(item.leadCount)}
                        </TableCell>
                        <TableCell align="right">
                          {formatPercent(
                            item.leadCount ? (item.examScheduledCount / item.leadCount) * 100 : 0
                          )}
                        </TableCell>
                        <TableCell align="right">{formatPercent(item.eligibilityRate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Paper>
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
              <Stack direction="row" gap={0.75} flexWrap="wrap" mt={1}>
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
              <Stack direction="row" gap={0.75} flexWrap="wrap" mt={1}>
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
              <Stack direction="row" gap={0.75} flexWrap="wrap" mt={1}>
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
