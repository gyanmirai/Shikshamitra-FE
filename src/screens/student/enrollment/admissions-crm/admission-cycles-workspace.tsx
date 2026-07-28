'use client';

import type { IData, IColumn } from 'src/components/customizabaleTable/types';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { fDate, fDateTime } from 'src/utils/format-time';
import { studentPaths } from 'src/constants/student-menu';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Chip, Alert, Stack, Button, Typography, LinearProgress } from '@mui/material';
import {
  type AdmissionCrmCycleStatus,
  useGetAdmissionCrmCyclesQuery,
  type AdmissionCrmSetupReadiness,
  type AdmissionCrmCycleListItemDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useEnrollmentWorkspace } from './enrollment-workspace-context';
import {
  enrollmentTableWrapperSx,
  EnrollmentTableEmptyState,
  enrollmentTableContainerSx,
} from './workspace-table-patterns';

export const readinessLabels: Record<AdmissionCrmSetupReadiness, string> = {
  0: 'Not started',
  1: 'Needs attention',
  2: 'Ready',
  3: 'Managed',
  4: 'Locked',
};

export const cycleStatusLabels: Record<AdmissionCrmCycleStatus, string> = {
  0: 'Draft',
  1: 'Readiness review',
  2: 'Open',
  3: 'Paused',
  4: 'Closed',
  5: 'Archived',
};

export const readinessColor = (status: AdmissionCrmSetupReadiness) => {
  if (status === 2 || status === 3) return 'success';
  if (status === 1) return 'warning';
  if (status === 4) return 'default';
  return 'info';
};

export const cycleStatusColor = (status: AdmissionCrmCycleStatus) => {
  if (status === 2) return 'success';
  if (status === 1 || status === 3) return 'warning';
  if (status === 4 || status === 5) return 'default';
  return 'info';
};

export const formatDateRange = (start?: string | null, end?: string | null) => {
  if (!start || !end) return 'Not configured';
  return `${fDate(start)} - ${fDate(end)}`;
};

export const getSettingsHref = (path: string, academicYearId: string) =>
  `${path}?cycle=${encodeURIComponent(academicYearId)}`;

export const getAdmissionCycleWorkspaceHref = (academicYearId: string) =>
  `${studentPaths.enrollment.settingsSections.admissionCycles}/${encodeURIComponent(
    academicYearId
  )}?cycle=${encodeURIComponent(academicYearId)}`;

export function AdmissionCyclesWorkspace() {
  const { state, updateState } = useEnrollmentWorkspace();
  const router = useRouter();
  const cyclesQuery = useGetAdmissionCrmCyclesQuery({ skipCount: 0, maxResultCount: 100 });
  const cycles = useMemo(() => cyclesQuery.data?.items ?? [], [cyclesQuery.data?.items]);
  const selectedAcademicYearId = useMemo(
    () =>
      cycles.some((cycle) => cycle.academicYearId === state.cycle)
        ? state.cycle
        : cycles[0]?.academicYearId,
    [cycles, state.cycle]
  );

  const openCycle = (academicYearId: string) => {
    updateState({ cycle: academicYearId }, 'replace');
    router.push(getAdmissionCycleWorkspaceHref(academicYearId));
  };

  const columns = useMemo<IColumn[]>(
    () => [
      {
        id: 'cycleName',
        label: 'Cycle',
        isSort: true,
        isFilter: true,
        filterType: 'string',
        minWidth: 220,
        render: (_value, row) => {
          const cycle = row as AdmissionCrmCycleListItemDto;
          return (
            <Box>
              <Typography variant="subtitle2">{cycle.cycleName}</Typography>
              <Typography variant="caption" color="text.secondary">
                {cycle.academicYearName}
              </Typography>
            </Box>
          );
        },
      },
      {
        id: 'academicYearName',
        label: 'Academic Year',
        isSort: true,
        isFilter: true,
        filterType: 'string',
        minWidth: 160,
      },
      {
        id: 'admissionWindowStart',
        label: 'Admission Window',
        isSort: true,
        filterType: 'date',
        minWidth: 180,
        render: (_value, row) => {
          const cycle = row as AdmissionCrmCycleListItemDto;
          return formatDateRange(cycle.admissionWindowStart, cycle.admissionWindowEnd);
        },
      },
      {
        id: 'status',
        label: 'Status',
        isSort: true,
        isFilter: true,
        filterType: 'enum',
        enumOptions: Object.entries(cycleStatusLabels).map(([value, label]) => ({
          value: Number(value),
          label,
        })),
        minWidth: 150,
        render: (value) => (
          <Chip
            size="small"
            color={cycleStatusColor(value as AdmissionCrmCycleStatus)}
            label={cycleStatusLabels[value as AdmissionCrmCycleStatus]}
          />
        ),
      },
      {
        id: 'readiness',
        label: 'Readiness',
        isSort: true,
        isFilter: true,
        filterType: 'enum',
        enumOptions: Object.entries(readinessLabels).map(([value, label]) => ({
          value: Number(value),
          label,
        })),
        minWidth: 170,
        render: (value) => (
          <Chip
            size="small"
            color={readinessColor(value as AdmissionCrmSetupReadiness)}
            label={readinessLabels[value as AdmissionCrmSetupReadiness]}
          />
        ),
      },
      {
        id: 'applicantCount',
        label: 'Applicants',
        isSort: true,
        filterType: 'number',
        align: 'right',
        minWidth: 120,
      },
      {
        id: 'ownerDisplayName',
        label: 'Owner',
        isSort: true,
        isFilter: true,
        filterType: 'string',
        minWidth: 160,
        render: (value) => value || 'Not assigned',
      },
      {
        id: 'lastUpdatedAt',
        label: 'Last Updated',
        isSort: true,
        filterType: 'dateTime',
        minWidth: 160,
        render: (value) => (value ? fDateTime(value as string) : '-'),
      },
      {
        id: 'actions',
        label: 'Actions',
        align: 'right',
        minWidth: 128,
        render: (_value, row) => {
          const cycle = row as AdmissionCrmCycleListItemDto;
          return (
            <Button
              component={RouterLink}
              href={getAdmissionCycleWorkspaceHref(cycle.academicYearId)}
              size="small"
              onClick={(event) => event.stopPropagation()}
            >
              Open setup
            </Button>
          );
        },
      },
    ],
    []
  );

  return (
    <Stack spacing={2} sx={{ minWidth: 0 }}>
      <CustomBreadcrumbs
        heading="Admission Cycles"
        description="Select an academic-year cycle, then complete setup in its focused workspace."
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Student Enrollment', href: studentPaths.enrollment.overview },
          { name: 'Settings', href: studentPaths.enrollment.settings },
          { name: 'Admission Cycles' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={
              selectedAcademicYearId
                ? getAdmissionCycleWorkspaceHref(selectedAcademicYearId)
                : studentPaths.enrollment.settings
            }
            variant="contained"
            startIcon={<Iconify icon="mdi:arrow-right-circle-outline" />}
          >
            Open Selected Cycle
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

      <CustomizableTable
        tableId="student-enrollment-admission-cycles"
        tableTitle="Admission Cycles"
        columns={columns}
        data={cycles as unknown as IData[]}
        isLoading={cyclesQuery.isLoading || cyclesQuery.isFetching}
        isSearch
        isFilter
        isPagination
        defaultRowsPerPage={10}
        rowsPerPageOptions={[10, 25, 50]}
        handleRowClick={(row) =>
          openCycle((row as unknown as AdmissionCrmCycleListItemDto).academicYearId)
        }
        rowProps={(row) => {
          const cycle = row as unknown as AdmissionCrmCycleListItemDto;
          return {
            selected: cycle.academicYearId === selectedAcademicYearId,
            sx: { cursor: 'pointer' },
            'data-testid': 'student-enrollment-admission-cycle-row',
            'data-academic-year-id': cycle.academicYearId,
          };
        }}
        noDataText={
          <EnrollmentTableEmptyState
            title="No admission cycles"
            description="Create or activate an academic year before configuring admissions."
          />
        }
        wrapperProps={{ sx: enrollmentTableWrapperSx }}
        tableContainerProps={{ sx: enrollmentTableContainerSx }}
      />
    </Stack>
  );
}
