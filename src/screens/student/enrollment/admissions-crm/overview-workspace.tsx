'use client';

import type { IColumn, IParams } from 'src/components/customizabaleTable/types';
import type { AdmissionCrmMyWorkItemDto } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useMemo, useCallback } from 'react';
import TodayRounded from '@mui/icons-material/TodayRounded';
import { useRouter, useSearchParams } from 'next/navigation';
import CustomizableTable from 'src/components/customizabaleTable';
import WarningAmberRounded from '@mui/icons-material/WarningAmberRounded';
import AssignmentIndRounded from '@mui/icons-material/AssignmentIndRounded';
import ReportProblemRounded from '@mui/icons-material/ReportProblemRounded';
import { Box, Chip, Alert, Stack, Paper, Button, Typography } from '@mui/material';
import {
  AdmissionInquiryStage,
  AdmissionCrmMyWorkType,
  AdmissionCrmWorkUrgency,
  AdmissionCrmLeadPriority,
  AdmissionCrmWorkspaceSection,
  AdmissionCrmRecommendedAction,
  useGetAdmissionCrmMyWorkQuery,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { formatEnrollmentDate } from './enrollment-display';
import { EnrollmentWorkspaceHeader } from './workspace-header';
import { AdmissionCrmStageChip } from './admission-crm-stage-chip';
import { ApplicantWorkspaceDrawer } from './applicant-workspace-drawer';
import { useEnrollmentWorkspace } from './enrollment-workspace-context';
import {
  enrollmentTableWrapperSx,
  EnrollmentTableEmptyState,
  enrollmentWorkspaceRootSx,
  enrollmentTableContainerSx,
  EnrollmentWorkspaceErrorState,
} from './workspace-table-patterns';

import type { ApplicantDrawerTab } from './applicant-workspace-drawer';

const actionLabels: Record<AdmissionCrmRecommendedAction, string> = {
  [AdmissionCrmRecommendedAction.OpenApplicant]: 'Open applicant',
  [AdmissionCrmRecommendedAction.CompleteTask]: 'Complete task',
  [AdmissionCrmRecommendedAction.ScheduleExam]: 'Schedule exam',
  [AdmissionCrmRecommendedAction.RecordAttendance]: 'Record attendance',
  [AdmissionCrmRecommendedAction.RescheduleExam]: 'Reschedule exam',
  [AdmissionCrmRecommendedAction.RecordResult]: 'Record result',
  [AdmissionCrmRecommendedAction.DecideEligibility]: 'Decide eligibility',
  [AdmissionCrmRecommendedAction.ReviewRegistration]: 'Review registration',
  [AdmissionCrmRecommendedAction.ReviewDocuments]: 'Review documents',
  [AdmissionCrmRecommendedAction.ReviewOffer]: 'Review offer',
  [AdmissionCrmRecommendedAction.RepairActivation]: 'Repair activation',
};

const priorityLabels: Record<AdmissionCrmLeadPriority, string> = {
  [AdmissionCrmLeadPriority.None]: 'Not set',
  [AdmissionCrmLeadPriority.Hot]: 'Hot',
  [AdmissionCrmLeadPriority.Warm]: 'Warm',
  [AdmissionCrmLeadPriority.Cold]: 'Cold',
  [AdmissionCrmLeadPriority.Low]: 'Low',
};

const urgencyLabels: Record<AdmissionCrmWorkUrgency, string> = {
  [AdmissionCrmWorkUrgency.Normal]: 'Normal',
  [AdmissionCrmWorkUrgency.DueSoon]: 'Due soon',
  [AdmissionCrmWorkUrgency.DueToday]: 'Due today',
  [AdmissionCrmWorkUrgency.Overdue]: 'Overdue',
};

const sectionTabs: Record<AdmissionCrmWorkspaceSection, ApplicantDrawerTab> = {
  [AdmissionCrmWorkspaceSection.Overview]: 'overview',
  [AdmissionCrmWorkspaceSection.EntranceExam]: 'exam',
  [AdmissionCrmWorkspaceSection.Registration]: 'registration',
  [AdmissionCrmWorkspaceSection.Offer]: 'offer',
  [AdmissionCrmWorkspaceSection.Activation]: 'activation',
  [AdmissionCrmWorkspaceSection.Governance]: 'governance',
};

const enumValue = (value: unknown) => {
  if (Array.isArray(value)) return value.length ? Number(value[0]) : undefined;
  if (value === '' || value == null) return undefined;
  return Number(value);
};

export function EnrollmentOverviewWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { academicYearId, academicMediumId } = useEnrollmentWorkspace();
  const page = Math.max(0, Number(searchParams.get('page') || '1') - 1);
  const pageSize = Math.min(100, Math.max(10, Number(searchParams.get('pageSize') || '25')));
  const search = searchParams.get('search') || '';
  const sorting = searchParams.get('sorting') || undefined;
  const applicantId = searchParams.get('applicant') || undefined;
  const workItemKey = searchParams.get('workItem') || undefined;

  const numberParam = useCallback(
    (key: string) => {
      const value = searchParams.get(key);
      return value == null || value === '' ? undefined : Number(value);
    },
    [searchParams]
  );

  const query = useGetAdmissionCrmMyWorkQuery(
    {
      academicYearId: academicYearId || '',
      search: search || undefined,
      workType: numberParam('workType') as AdmissionCrmMyWorkType | undefined,
      stage: numberParam('stage') as AdmissionInquiryStage | undefined,
      priority: numberParam('priority') as AdmissionCrmLeadPriority | undefined,
      academicMediumId,
      urgency: numberParam('urgency') as AdmissionCrmWorkUrgency | undefined,
      sorting,
      skipCount: page * pageSize,
      maxResultCount: pageSize,
    },
    { skip: !academicYearId }
  );

  const updateUrl = useCallback(
    (changes: Record<string, string | number | undefined | null>, mode: 'push' | 'replace' = 'replace') => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(changes).forEach(([key, value]) => {
        if (value == null || value === '') params.delete(key);
        else params.set(key, String(value));
      });
      router[mode](`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const openItem = useCallback(
    (item: AdmissionCrmMyWorkItemDto) => {
      updateUrl(
        {
          applicant: item.leadId,
          workItem: item.key,
          tab: sectionTabs[item.recommendedSection],
        },
        'push'
      );
    },
    [updateUrl]
  );

  const closeDrawer = useCallback(
    () => updateUrl({ applicant: null, workItem: null, tab: null }, 'push'),
    [updateUrl]
  );

  const selectedWorkItem = query.data?.items.find((item) => item.key === workItemKey);
  const activeTab = (searchParams.get('tab') as ApplicantDrawerTab | null) || 'overview';

  const metrics = useMemo(
    () => [
      {
        key: 'assigned',
        label: 'Assigned to me',
        value: query.data?.assignedTotal || 0,
        icon: <AssignmentIndRounded />,
        color: 'primary.main',
        surface: 'primary.lighter',
        urgency: undefined,
      },
      {
        key: 'overdue',
        label: 'Overdue',
        value: query.data?.overdueCount || 0,
        icon: <ReportProblemRounded />,
        color: 'error.main',
        surface: 'error.lighter',
        urgency: AdmissionCrmWorkUrgency.Overdue,
      },
      {
        key: 'today',
        label: 'Due today',
        value: query.data?.dueTodayCount || 0,
        icon: <TodayRounded />,
        color: 'warning.main',
        surface: 'warning.lighter',
        urgency: AdmissionCrmWorkUrgency.DueToday,
      },
      {
        key: 'blockers',
        label: 'Urgent blockers',
        value: query.data?.urgentBlockerCount || 0,
        icon: <WarningAmberRounded />,
        color: 'secondary.main',
        surface: 'secondary.lighter',
        urgency: undefined,
        workType: AdmissionCrmMyWorkType.OperationalBlocker,
      },
    ],
    [query.data]
  );

  const columns = useMemo<IColumn[]>(
    () => [
      {
        id: 'applicantName',
        label: 'Applicant',
        width: 230,
        minWidth: 210,
        sticky: true,
        stickyPosition: 'left',
        isSort: true,
        isFilter: false,
        render: (_value, row) => {
          const item = row as AdmissionCrmMyWorkItemDto;
          return (
            <Stack spacing={0.15}>
              <Typography variant="subtitle2">{item.applicantName}</Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {item.contact || 'No contact captured'}
              </Typography>
            </Stack>
          );
        },
      },
      {
        id: 'workType',
        label: 'Work Item',
        width: 310,
        minWidth: 260,
        isSort: false,
        filterType: 'enum',
        enumOptions: [
          { label: 'Assigned task', value: AdmissionCrmMyWorkType.Task },
          { label: 'Operational blocker', value: AdmissionCrmMyWorkType.OperationalBlocker },
        ],
        render: (_value, row) => {
          const item = row as AdmissionCrmMyWorkItemDto;
          return (
            <Stack spacing={0.15}>
              <Typography variant="body2">{item.title}</Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {item.details || (item.workType === AdmissionCrmMyWorkType.Task ? 'Assigned task' : 'Operational blocker')}
              </Typography>
            </Stack>
          );
        },
      },
      {
        id: 'stage',
        label: 'Stage',
        width: 145,
        minWidth: 135,
        isSort: false,
        filterType: 'enum',
        enumOptions: Object.values(AdmissionInquiryStage)
          .filter((value): value is number => typeof value === 'number')
          .map((value) => ({ label: AdmissionInquiryStage[value], value })),
        render: (_value, row) => <AdmissionCrmStageChip stage={(row as AdmissionCrmMyWorkItemDto).stage} />,
      },
      {
        id: 'targetClassName',
        label: 'Target Class',
        width: 145,
        minWidth: 125,
        isSort: false,
        isFilter: false,
        render: (value) => value || 'Placement missing',
      },
      {
        id: 'urgency',
        label: 'Due / Urgency',
        width: 175,
        minWidth: 155,
        isSort: true,
        originalId: 'dueAt',
        filterType: 'enum',
        enumOptions: Object.values(AdmissionCrmWorkUrgency)
          .filter((value): value is number => typeof value === 'number')
          .map((value) => ({ label: urgencyLabels[value as AdmissionCrmWorkUrgency], value })),
        render: (_value, row) => {
          const item = row as AdmissionCrmMyWorkItemDto;
          return (
            <Stack spacing={0.25}>
              <Typography variant="body2">{formatEnrollmentDate(item.dueAt)}</Typography>
              <Chip
                size="small"
                variant="outlined"
                color={item.urgency === AdmissionCrmWorkUrgency.Overdue ? 'error' : item.urgency === AdmissionCrmWorkUrgency.DueToday ? 'warning' : 'default'}
                label={urgencyLabels[item.urgency]}
                sx={{ width: 'fit-content' }}
              />
            </Stack>
          );
        },
      },
      {
        id: 'priority',
        label: 'Priority',
        width: 120,
        minWidth: 110,
        isSort: true,
        filterType: 'enum',
        enumOptions: Object.values(AdmissionCrmLeadPriority)
          .filter((value): value is number => typeof value === 'number')
          .map((value) => ({ label: priorityLabels[value as AdmissionCrmLeadPriority], value })),
        render: (value) => <Chip size="small" label={priorityLabels[value as AdmissionCrmLeadPriority]} />,
      },
      {
        id: 'assignedDisplayName',
        label: 'Assigned To',
        width: 170,
        minWidth: 150,
        isSort: false,
        isFilter: false,
        render: (value) => value || 'Me',
      },
      {
        id: 'actions',
        label: 'Actions',
        width: 180,
        minWidth: 170,
        sticky: true,
        stickyPosition: 'right',
        stickyOnMobile: false,
        isSort: false,
        isFilter: false,
        excludeFromExport: true,
        render: (_value, row) => {
          const item = row as AdmissionCrmMyWorkItemDto;
          return (
            <Button
              size="small"
              variant="contained"
              onClick={(event) => {
                event.stopPropagation();
                openItem(item);
              }}
            >
              {actionLabels[item.recommendedAction]}
            </Button>
          );
        },
      },
    ],
    [openItem]
  );

  const handleFilters = useCallback(
    (filters: IParams['filters']) => {
      const byColumn = new Map(filters.map((filter) => [filter.column, filter.value]));
      updateUrl({
        workType: enumValue(byColumn.get('workType')),
        stage: enumValue(byColumn.get('stage')),
        urgency: enumValue(byColumn.get('urgency')),
        priority: enumValue(byColumn.get('priority')),
        page: 1,
      });
    },
    [updateUrl]
  );

  if (!academicYearId) return <Alert severity="info">Select an academic year to open My Work.</Alert>;

  return (
    <Stack spacing={1.5} sx={enrollmentWorkspaceRootSx}>
      <EnrollmentWorkspaceHeader
        title="My Admissions Work"
        description="Tasks and operational blockers assigned to you for this admission cycle."
      />
      {query.isError ? (
        <EnrollmentWorkspaceErrorState message="Admissions work could not be loaded." onRetry={() => query.refetch()} />
      ) : (
        <>
          <Paper
            variant="outlined"
            sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(150px, 1fr))', borderRadius: 1.5, overflowX: 'auto' }}
          >
            {metrics.map((metric) => {
              const selected = metric.urgency != null
                ? numberParam('urgency') === metric.urgency
                : metric.workType != null
                  ? numberParam('workType') === metric.workType
                  : !numberParam('urgency') && !numberParam('workType');
              return (
                <Button
                  key={metric.key}
                  color="inherit"
                  aria-pressed={selected}
                  onClick={() => updateUrl({ urgency: metric.urgency, workType: metric.workType, page: 1 })}
                  sx={{ justifyContent: 'flex-start', px: 1.5, py: 1.15, borderRadius: 0, borderRight: 1, borderColor: 'divider', bgcolor: selected ? 'action.selected' : undefined }}
                >
                  <Box aria-hidden="true" sx={{ display: 'grid', placeItems: 'center', mr: 1, width: 32, height: 32, borderRadius: 1, color: metric.color, bgcolor: metric.surface }}>
                    {metric.icon}
                  </Box>
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="h6" sx={{ lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{metric.value}</Typography>
                    <Typography variant="caption" color="text.secondary">{metric.label}</Typography>
                  </Box>
                </Button>
              );
            })}
          </Paper>
          <CustomizableTable
            tableId="student-enrollment-my-work"
            tableTitle="My Work"
            columns={columns}
            data={query.data?.items || []}
            isLoading={query.isLoading || query.isFetching}
            serverSide
            serverSidePagination
            serverSideSearch
            serverSideSort
            serverSideFilter
            totalCount={query.data?.totalCount || 0}
            page={page}
            rowsPerPage={pageSize}
            searchTerm={search}
            defaultRowsPerPage={25}
            rowsPerPageOptions={[10, 25, 50, 100]}
            onServerPagination={(nextPage, nextPageSize) => updateUrl({ page: nextPage + 1, pageSize: nextPageSize })}
            onServerSearch={(value) => updateUrl({ search: value || null, page: 1 })}
            onServerSort={(_column, sorts) => {
              const sort = sorts[0];
              updateUrl({ sorting: sort ? `${sort.originalId || sort.column} ${sort.direction}` : null, page: 1 });
            }}
            onServerFilter={handleFilters}
            handleRowClick={(row) => openItem(row as AdmissionCrmMyWorkItemDto)}
            rowProps={(row) => ({
              tabIndex: 0,
              'aria-label': `Open work for ${(row as AdmissionCrmMyWorkItemDto).applicantName}`,
              onKeyDown: (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openItem(row as AdmissionCrmMyWorkItemDto);
                }
              },
            })}
            noDataText={<EnrollmentTableEmptyState title="Your work queue is clear" description="No assigned tasks or owned blockers match the current filters." />}
            wrapperProps={{ sx: enrollmentTableWrapperSx }}
            tableContainerProps={{ sx: enrollmentTableContainerSx }}
          />
          {query.data ? <Typography variant="caption" color="text.secondary" textAlign="right">Updated {formatEnrollmentDate(query.data.generatedAt, true)}</Typography> : null}
        </>
      )}
      <ApplicantWorkspaceDrawer
        leadId={applicantId}
        academicYearId={academicYearId}
        initialTab={activeTab}
        onTabChange={(tab) => updateUrl({ tab }, 'replace')}
        onClose={closeDrawer}
        context="my-work"
        workItem={selectedWorkItem}
      />
    </Stack>
  );
}
