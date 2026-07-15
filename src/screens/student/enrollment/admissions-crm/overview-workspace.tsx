'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AdmissionCrmEnrollmentOverviewItemDto } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useRouter } from 'next/navigation';
import { useMemo, useCallback } from 'react';
import { studentPaths } from 'src/constants/student-menu';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Chip, Alert, Stack, Paper, Typography } from '@mui/material';
import { useGetAdmissionCrmEnrollmentOverviewQuery } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { formatEnrollmentDate } from './enrollment-display';
import { EnrollmentWorkspaceHeader } from './workspace-header';
import { useEnrollmentWorkspace } from './enrollment-workspace-context';
import {
  enrollmentActionsColumn,
  EnrollmentTableEmptyState,
  EnrollmentWorkspaceErrorState,
} from './workspace-table-patterns';

const workspaceLabels = {
  registrations: 'Registrations',
  offers: 'Offers & Seats',
  activation: 'Activation',
  exams: 'Entrance Exams',
  operations: 'Operations',
} as const;

const workspacePaths = {
  registrations: studentPaths.enrollment.registrations,
  offers: studentPaths.enrollment.offersSeats,
  activation: studentPaths.enrollment.activation,
  exams: studentPaths.enrollment.exams,
  operations: studentPaths.enrollment.operations,
} as const;

const workspaceTabs = {
  registrations: 'registration',
  offers: 'offer',
  activation: 'activation',
  exams: 'exam',
  operations: 'overview',
} as const;

export function EnrollmentOverviewWorkspace() {
  const router = useRouter();
  const { academicYearId, persona } = useEnrollmentWorkspace();
  const overviewQuery = useGetAdmissionCrmEnrollmentOverviewQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId }
  );
  const overview = overviewQuery.data;

  const openItem = useCallback(
    (entry: AdmissionCrmEnrollmentOverviewItemDto) => {
      if (!academicYearId) return;
      const params = new URLSearchParams({
        cycle: academicYearId,
        queue: String(entry.queueType),
        applicant: entry.item.leadId,
        tab: workspaceTabs[entry.workspace],
      });
      router.push(`${workspacePaths[entry.workspace]}?${params.toString()}`);
    },
    [academicYearId, router]
  );

  const metrics = useMemo(() => {
    if (!overview) return [];
    const all = [
      { key: 'urgent', label: 'Urgent work', value: overview.urgentCount },
      { key: 'unassigned', label: 'Unassigned inquiries', value: overview.unassignedLeadCount },
      { key: 'exams', label: 'Exams in next 7 days', value: overview.upcomingExamCount },
      { key: 'links', label: 'Expiring links', value: overview.expiringRegistrationCount },
      { key: 'approvals', label: 'Pending approvals', value: overview.pendingApprovalCount },
      {
        key: 'activation',
        label: 'Activation & handoff blockers',
        value: overview.activationFailureCount + overview.handoffBlockerCount,
      },
    ];
    if (persona === 'receptionist')
      return all.filter((item) => ['urgent', 'unassigned', 'links'].includes(item.key));
    if (persona === 'counselor')
      return all.filter((item) => ['urgent', 'exams', 'links'].includes(item.key));
    if (persona === 'approver')
      return all.filter((item) => ['urgent', 'approvals', 'activation'].includes(item.key));
    return all;
  }, [overview, persona]);

  const columns = useMemo<IColumn[]>(
    () => [
      {
        id: 'workspace',
        label: 'Workspace',
        width: 150,
        minWidth: 135,
        isSort: false,
        isFilter: false,
        render: (value) => workspaceLabels[value as keyof typeof workspaceLabels],
      },
      {
        id: 'applicantName',
        label: 'Applicant',
        width: 220,
        minWidth: 190,
        isSort: false,
        isFilter: false,
        render: (_value, row) => (
          <Typography variant="subtitle2">
            {(row as AdmissionCrmEnrollmentOverviewItemDto).item.applicantName}
          </Typography>
        ),
      },
      {
        id: 'action',
        label: 'Action Required',
        width: 380,
        minWidth: 280,
        isSort: false,
        isFilter: false,
        render: (_value, row) => {
          const { item } = row as AdmissionCrmEnrollmentOverviewItemDto;
          return (
            <Stack spacing={0.25}>
              <Typography variant="body2">{item.title}</Typography>
              {item.details ? (
                <Typography variant="caption" color="text.secondary" noWrap>
                  {item.details}
                </Typography>
              ) : null}
            </Stack>
          );
        },
      },
      {
        id: 'dueAt',
        label: 'Due',
        width: 130,
        minWidth: 115,
        isSort: false,
        isFilter: false,
        render: (_value, row) =>
          formatEnrollmentDate((row as AdmissionCrmEnrollmentOverviewItemDto).item.dueAt),
      },
      {
        id: 'severity',
        label: 'Priority',
        width: 110,
        minWidth: 100,
        isSort: false,
        isFilter: false,
        render: () => <Chip size="small" color="warning" label="Urgent" />,
      },
      {
        id: 'actions',
        label: 'Actions',
        ...enrollmentActionsColumn,
        isSort: false,
        isFilter: false,
        render: (_value, row) => (
          <ThreeDotsActions
            placement="right-top"
            showViewIcon
            viewLabel="Open Work Item"
            handleViewClick={() => openItem(row as AdmissionCrmEnrollmentOverviewItemDto)}
            showThreeDots={false}
          />
        ),
      },
    ],
    [openItem]
  );

  if (!academicYearId)
    return <Alert severity="info">Select an academic year to open My Work.</Alert>;

  return (
    <Stack spacing={1.5}>
      <EnrollmentWorkspaceHeader
        title="My Admissions Work"
        description="Urgent actions and handoff blockers for the selected admission cycle."
      />
      {overviewQuery.isError ? (
        <EnrollmentWorkspaceErrorState
          message="Admissions work could not be loaded."
          onRetry={() => overviewQuery.refetch()}
        />
      ) : (
        <>
          <Paper variant="outlined" sx={{ borderRadius: 1, overflow: 'hidden' }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, minmax(0, 1fr))',
                  md: `repeat(${Math.max(metrics.length, 1)}, minmax(0, 1fr))`,
                },
              }}
            >
              {metrics.map((metric) => (
                <Stack
                  key={metric.key}
                  spacing={0.25}
                  sx={{
                    px: 1.5,
                    py: 1.25,
                    borderRight: 1,
                    borderBottom: { xs: 1, md: 0 },
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="h6">{metric.value}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {metric.label}
                  </Typography>
                </Stack>
              ))}
            </Box>
          </Paper>
          <CustomizableTable
            tableId="student-enrollment-overview-urgent-work"
            tableTitle="Urgent Work"
            columns={columns}
            data={overview?.urgentItems || []}
            isLoading={overviewQuery.isLoading}
            defaultRowsPerPage={12}
            rowsPerPageOptions={[12]}
            noDataText={
              <EnrollmentTableEmptyState
                title="Urgent work cleared"
                description="No permitted admissions queue currently has urgent work."
              />
            }
            tableContainerProps={{ sx: { minHeight: 320 } }}
          />
          {overview ? (
            <Typography variant="caption" color="text.secondary" textAlign="right">
              Updated {formatEnrollmentDate(overview.generatedAt, true)}
            </Typography>
          ) : null}
        </>
      )}
    </Stack>
  );
}
