'use client';

import { useMemo } from 'react';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { fDate, fDateTime } from 'src/utils/format-time';
import { studentPaths } from 'src/constants/student-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Paper,
  Table,
  Button,
  Divider,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
  LinearProgress,
} from '@mui/material';
import {
  AdmissionCrmMeritRankingMode,
  useGetAdmissionCrmCyclesQuery,
  useGetAdmissionCrmCycleSummaryQuery,
  type AdmissionCrmCycleListItemDto,
  type AdmissionCrmCycleStatus,
  type AdmissionCrmSetupReadiness,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useEnrollmentWorkspace } from './enrollment-workspace-context';

const readinessLabels: Record<AdmissionCrmSetupReadiness, string> = {
  0: 'Not started',
  1: 'Needs attention',
  2: 'Ready',
  3: 'Managed',
  4: 'Locked',
};

const cycleStatusLabels: Record<AdmissionCrmCycleStatus, string> = {
  0: 'Draft',
  1: 'Readiness review',
  2: 'Open',
  3: 'Paused',
  4: 'Closed',
  5: 'Archived',
};

const meritModeLabels: Record<AdmissionCrmMeritRankingMode, string> = {
  [AdmissionCrmMeritRankingMode.MarksThenInquiryDate]: 'Marks, then inquiry date',
  [AdmissionCrmMeritRankingMode.MarksThenLeadScore]: 'Marks, then lead score',
  [AdmissionCrmMeritRankingMode.LeadScoreThenMarks]: 'Lead score, then marks',
};

const readinessColor = (status: AdmissionCrmSetupReadiness) => {
  if (status === 2 || status === 3) return 'success';
  if (status === 1) return 'warning';
  if (status === 4) return 'default';
  return 'info';
};

const cycleStatusColor = (status: AdmissionCrmCycleStatus) => {
  if (status === 2) return 'success';
  if (status === 1 || status === 3) return 'warning';
  if (status === 4 || status === 5) return 'default';
  return 'info';
};

const formatDateRange = (start?: string | null, end?: string | null) => {
  if (!start || !end) return 'Not configured';
  return `${fDate(start)} - ${fDate(end)}`;
};

const getSettingsHref = (path: string, academicYearId: string) =>
  `${path}?cycle=${encodeURIComponent(academicYearId)}`;

function CycleSummaryPanel({ academicYearId }: { academicYearId?: string }) {
  const query = useGetAdmissionCrmCycleSummaryQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId }
  );
  const summary = query.data;

  if (!academicYearId) {
    return (
      <Alert severity="info">Select an admission cycle to review its configuration.</Alert>
    );
  }

  if (query.isFetching && !summary) {
    return <LinearProgress aria-label="Loading admission cycle summary" />;
  }

  if (query.isError) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" onClick={() => query.refetch()}>
            Retry
          </Button>
        }
      >
        Admission cycle summary could not be loaded.
      </Alert>
    );
  }

  if (!summary) return null;

  const setupHref = getSettingsHref(studentPaths.enrollment.settings, academicYearId);
  const journeyHref = getSettingsHref(
    studentPaths.enrollment.settingsSections.journey,
    academicYearId
  );

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2 }}>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', md: 'row' }} gap={1.5} justifyContent="space-between">
          <Box>
            <Typography variant="overline" color="text.secondary">
              Cycle summary
            </Typography>
            <Typography variant="h6">{summary.cycle.cycleName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {summary.cycle.academicYearName} · Academic year{' '}
              {formatDateRange(
                summary.cycle.academicYearStartDate,
                summary.cycle.academicYearEndDate
              )}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              color={cycleStatusColor(summary.cycle.status)}
              label={cycleStatusLabels[summary.cycle.status]}
            />
            <Chip
              color={readinessColor(summary.cycle.readiness)}
              label={readinessLabels[summary.cycle.readiness]}
            />
          </Stack>
        </Stack>

        <Divider />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
            gap: 1.25,
          }}
        >
          <SummaryStat label="Applicants" value={summary.cycle.applicantCount.toString()} />
          <SummaryStat
            label="Admission window"
            value={formatDateRange(
              summary.cycle.admissionWindowStart,
              summary.cycle.admissionWindowEnd
            )}
          />
          <SummaryStat label="Owner" value={summary.cycle.ownerDisplayName || 'Not assigned'} />
          <SummaryStat
            label="Entrance exam"
            value={summary.policy.entranceExamRequired ? 'Required' : 'Not required'}
          />
          <SummaryStat
            label="Registration path"
            value={
              summary.policy.registrationFormRequiredBeforeExam
                ? 'Registration before exam'
                : 'Registration after inquiry/exam'
            }
          />
          <SummaryStat
            label="Lead SLA"
            value={`${summary.policy.defaultLeadSlaHours || 0} hours`}
          />
          <SummaryStat
            label="Exam passing"
            value={`${summary.policy.defaultExamPassingPercentage || 0}%`}
          />
          <SummaryStat
            label="Merit ranking"
            value={meritModeLabels[summary.policy.meritRankingMode]}
          />
          <SummaryStat
            label="Last updated"
            value={summary.cycle.lastUpdatedAt ? fDateTime(summary.cycle.lastUpdatedAt) || '-' : '-'}
          />
        </Box>

        {summary.cycle.requiredActions.length > 0 ? (
          <Stack spacing={1}>
            <Typography variant="subtitle2">Required actions</Typography>
            {summary.cycle.requiredActions.map((action) => (
              <Alert
                key={action.key}
                severity="warning"
                action={
                  <Button
                    component={RouterLink}
                    href={getSettingsHref(action.path, academicYearId)}
                    color="inherit"
                    size="small"
                  >
                    Open
                  </Button>
                }
              >
                {action.title}
              </Alert>
            ))}
          </Stack>
        ) : (
          <Alert severity="success">Core readiness checks are clear for this cycle.</Alert>
        )}

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            component={RouterLink}
            href={journeyHref}
            variant="contained"
            startIcon={<Iconify icon="mdi:map-marker-path" />}
          >
            Review Journey
          </Button>
          <Button
            component={RouterLink}
            href={setupHref}
            variant="outlined"
            startIcon={<Iconify icon="mdi:cog-outline" />}
          >
            Open Setup Center
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5 }}>
        {value}
      </Typography>
    </Paper>
  );
}

function CycleRow({
  cycle,
  selected,
  onSelect,
}: {
  cycle: AdmissionCrmCycleListItemDto;
  selected: boolean;
  onSelect: () => void;
}) {
  const setupHref = getSettingsHref(studentPaths.enrollment.settings, cycle.academicYearId);

  return (
    <TableRow hover selected={selected} sx={{ cursor: 'pointer' }} onClick={onSelect}>
      <TableCell>
        <Typography variant="subtitle2">{cycle.cycleName}</Typography>
        <Typography variant="caption" color="text.secondary">
          {cycle.academicYearName}
        </Typography>
      </TableCell>
      <TableCell>{formatDateRange(cycle.admissionWindowStart, cycle.admissionWindowEnd)}</TableCell>
      <TableCell>
        <Chip
          size="small"
          color={cycleStatusColor(cycle.status)}
          label={cycleStatusLabels[cycle.status]}
        />
      </TableCell>
      <TableCell>
        <Chip
          size="small"
          color={readinessColor(cycle.readiness)}
          label={readinessLabels[cycle.readiness]}
        />
      </TableCell>
      <TableCell align="right">{cycle.applicantCount}</TableCell>
      <TableCell>{cycle.ownerDisplayName || 'Not assigned'}</TableCell>
      <TableCell>{cycle.lastUpdatedAt ? fDateTime(cycle.lastUpdatedAt) : '-'}</TableCell>
      <TableCell align="right">
        <Button
          component={RouterLink}
          href={setupHref}
          size="small"
          onClick={(event) => event.stopPropagation()}
        >
          Setup
        </Button>
      </TableCell>
    </TableRow>
  );
}

export function AdmissionCyclesWorkspace() {
  const { state, updateState } = useEnrollmentWorkspace();
  const cyclesQuery = useGetAdmissionCrmCyclesQuery({ skipCount: 0, maxResultCount: 20 });
  const cycles = cyclesQuery.data?.items ?? [];
  const selectedAcademicYearId = useMemo(
    () =>
      cycles.some((cycle) => cycle.academicYearId === state.cycle)
        ? state.cycle
        : cycles[0]?.academicYearId,
    [cycles, state.cycle]
  );

  const selectCycle = (academicYearId: string) => {
    updateState({ cycle: academicYearId }, 'replace');
  };

  return (
    <Stack spacing={2} sx={{ minWidth: 0 }}>
      <CustomBreadcrumbs
        heading="Admission Cycles"
        description="Review admission-cycle readiness and open the existing setup sections for each academic year."
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Student Enrollment' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={
              selectedAcademicYearId
                ? getSettingsHref(studentPaths.enrollment.settings, selectedAcademicYearId)
                : studentPaths.enrollment.settings
            }
            variant="contained"
            startIcon={<Iconify icon="mdi:cog-outline" />}
          >
            Setup Center
          </Button>
        }
        sx={{ px: 2 }}
      />

      {cyclesQuery.isFetching ? <LinearProgress aria-label="Loading admission cycles" /> : null}
      {cyclesQuery.isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => cyclesQuery.refetch()}>
              Retry
            </Button>
          }
        >
          Admission cycles could not be loaded.
        </Alert>
      ) : null}

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small" aria-label="Admission cycles">
            <TableHead>
              <TableRow>
                <TableCell>Cycle</TableCell>
                <TableCell>Admission Window</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Readiness</TableCell>
                <TableCell align="right">Applicants</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cycles.map((cycle) => (
                <CycleRow
                  key={cycle.academicYearId}
                  cycle={cycle}
                  selected={cycle.academicYearId === selectedAcademicYearId}
                  onSelect={() => selectCycle(cycle.academicYearId)}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {!cyclesQuery.isFetching && cycles.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Alert severity="info">No academic-year admission cycles are available.</Alert>
          </Box>
        ) : null}
      </Paper>

      <CycleSummaryPanel academicYearId={selectedAcademicYearId} />
    </Stack>
  );
}
