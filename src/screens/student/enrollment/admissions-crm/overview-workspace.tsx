'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn, IParams } from 'src/components/customizabaleTable/types';
import type { AdmissionCrmMyWorkItemDto } from 'src/redux/student/admissions-crm/admissions-crm-api';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import TodayRounded from '@mui/icons-material/TodayRounded';
import { hasGrantedPermission } from 'src/utils/permissions';
import { LoadingButton } from 'src/components/loading-button';
import TaskAltRounded from '@mui/icons-material/TaskAltRounded';
import { useMemo, useState, useEffect, useCallback } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import AssignmentIndRounded from '@mui/icons-material/AssignmentIndRounded';
import ReportProblemRounded from '@mui/icons-material/ReportProblemRounded';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Paper,
  Button,
  Dialog,
  Checkbox,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  AdmissionCrmWorkUrgency,
  AdmissionCrmLeadPriority,
  AdmissionCrmApplicantStepKey,
  AdmissionCrmWorkspaceSection,
  AdmissionCrmRecommendedAction,
  useGetAdmissionCrmMyWorkQuery,
  AdmissionCrmReviewAssignmentStatus,
  useBulkCreateAdmissionCrmTasksMutation,
  useGetMyAdmissionCrmReviewAssignmentsQuery,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { EnrollmentWorkspaceHeader } from './workspace-header';
import { useEnrollmentWorkspace } from './enrollment-workspace-context';
import { admissionCrmActionPermissions } from './admission-action-permissions';
import { createApplicantRowNavigationProps } from './applicant-row-navigation';
import { useWorkspaceTableSessionState } from './workspace-table-session-state';
import { formatEnrollmentDate, formatApplicantNumber } from './enrollment-display';
import { parseEnrollmentTableSorts, serializeEnrollmentTableSort } from './workspace-table-sorting';
import {
  enrollmentTableWrapperSx,
  EnrollmentTableEmptyState,
  enrollmentWorkspaceRootSx,
  enrollmentTableContainerSx,
  EnrollmentWorkspaceErrorState,
} from './workspace-table-patterns';

import type { ApplicantWorkspaceTab } from './applicant-workspace-page';

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
  [AdmissionCrmLeadPriority.None]: 'No priority',
  [AdmissionCrmLeadPriority.Hot]: 'Hot',
  [AdmissionCrmLeadPriority.Warm]: 'Warm',
  [AdmissionCrmLeadPriority.Cold]: 'Cold',
  [AdmissionCrmLeadPriority.Low]: 'Low',
};

const priorityDotColors: Record<AdmissionCrmLeadPriority, string> = {
  [AdmissionCrmLeadPriority.None]: 'transparent',
  [AdmissionCrmLeadPriority.Hot]: 'error.main',
  [AdmissionCrmLeadPriority.Warm]: 'warning.main',
  [AdmissionCrmLeadPriority.Cold]: 'info.main',
  [AdmissionCrmLeadPriority.Low]: 'text.disabled',
};

function PriorityIndicator({ priority }: { priority: AdmissionCrmLeadPriority }) {
  const isUnprioritized = priority === AdmissionCrmLeadPriority.None;

  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Box
        aria-hidden="true"
        sx={{
          width: 8,
          height: 8,
          flexShrink: 0,
          borderRadius: '50%',
          bgcolor: priorityDotColors[priority],
          ...(isUnprioritized
            ? { border: '1.5px solid', borderColor: 'text.disabled' }
            : undefined),
        }}
      />
      <Typography
        variant="caption"
        color={isUnprioritized ? 'text.secondary' : 'text.primary'}
        sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
      >
        {priorityLabels[priority]}
      </Typography>
    </Stack>
  );
}

const urgencyLabels: Record<AdmissionCrmWorkUrgency, string> = {
  [AdmissionCrmWorkUrgency.Normal]: 'Normal',
  [AdmissionCrmWorkUrgency.DueSoon]: 'Due soon',
  [AdmissionCrmWorkUrgency.DueToday]: 'Due today',
  [AdmissionCrmWorkUrgency.Overdue]: 'Overdue',
};

const stepLabels: Record<AdmissionCrmApplicantStepKey, string> = {
  [AdmissionCrmApplicantStepKey.Inquiry]: 'Inquiry',
  [AdmissionCrmApplicantStepKey.Exam]: 'Entrance exam',
  [AdmissionCrmApplicantStepKey.Registration]: 'Registration',
  [AdmissionCrmApplicantStepKey.Finance]: 'Finance verification',
  [AdmissionCrmApplicantStepKey.Placement]: 'Class placement',
  [AdmissionCrmApplicantStepKey.Activation]: 'Activation',
};

const sectionTabs: Record<AdmissionCrmWorkspaceSection, ApplicantWorkspaceTab> = {
  [AdmissionCrmWorkspaceSection.Overview]: 'next',
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

const getLatestStringFilter = (filters: IParams['filters'], column: string) => {
  const filter = [...filters].reverse().find((item) => item.column === column);
  return filter?.value ? String(filter.value) : undefined;
};

export function EnrollmentOverviewWorkspace() {
  const permissions = useSelector((root: RootState) => root.auth.permissions);
  const {
    academicYearId,
    academicMediumId,
    currentUserId,
    sessionIdentity,
    state,
    updateState,
    openApplicant,
  } = useEnrollmentWorkspace();
  const {
    page: statePage,
    pageSize: statePageSize,
    sorting,
    priority: selectedPriority,
    urgency: selectedUrgency,
  } = state;
  const page = Math.max(0, statePage - 1);
  const requestedPageSize = statePageSize ?? 25;
  const pageSize = [10, 25, 50, 100].includes(requestedPageSize) ? requestedPageSize : 25;
  const {
    search,
    setSearch,
    filters: privateColumnFilters,
    setFilters: setPrivateColumnFilters,
  } = useWorkspaceTableSessionState(`my-work:${academicYearId || 'none'}:${sessionIdentity}`);
  const [selectedWorkKeys, setSelectedWorkKeys] = useState<string[]>([]);
  const [bulkTaskOpen, setBulkTaskOpen] = useState(false);
  const [bulkTaskTitle, setBulkTaskTitle] = useState('');
  const [bulkTaskDueAt, setBulkTaskDueAt] = useState(() =>
    dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm')
  );
  const [bulkCreateTasks, bulkCreateTasksState] = useBulkCreateAdmissionCrmTasksMutation();

  useEffect(() => {
    setSelectedWorkKeys([]);
  }, [academicMediumId, academicYearId, page, pageSize, privateColumnFilters, search, sorting]);

  const applicantSearch = getLatestStringFilter(privateColumnFilters, 'applicantName');
  const targetClassSearch = getLatestStringFilter(privateColumnFilters, 'targetClassName');

  const query = useGetAdmissionCrmMyWorkQuery(
    {
      academicYearId: academicYearId || '',
      search: search || undefined,
      applicantSearch,
      targetClassSearch,
      priority: selectedPriority,
      academicMediumId,
      urgency: selectedUrgency,
      sorting,
      skipCount: page * pageSize,
      maxResultCount: pageSize,
    },
    { skip: !academicYearId }
  );
  const canSubmitReviews = hasGrantedPermission(
    permissions,
    admissionCrmActionPermissions.submitReviews
  );
  const reviewAssignmentsQuery = useGetMyAdmissionCrmReviewAssignmentsQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId || !canSubmitReviews }
  );
  const openReviewAssignments = (reviewAssignmentsQuery.data || []).filter(
    (assignment) => assignment.status === AdmissionCrmReviewAssignmentStatus.Assigned
  );

  const tableFilters = useMemo<IParams['filters']>(
    () => [
      ...(applicantSearch
        ? [
            {
              column: 'applicantName',
              type: 'contains',
              value: applicantSearch,
              valueType: 'string',
              label: 'Applicant',
              displayValue: applicantSearch,
            },
          ]
        : []),
      ...(targetClassSearch
        ? [
            {
              column: 'targetClassName',
              type: 'contains',
              value: targetClassSearch,
              valueType: 'string',
              label: 'Target class',
              displayValue: targetClassSearch,
            },
          ]
        : []),
      ...(selectedUrgency == null
        ? []
        : [
            {
              column: 'urgency',
              type: 'equals',
              value: selectedUrgency,
              valueType: 'enum',
              label: 'Urgency',
              displayValue: urgencyLabels[selectedUrgency],
            },
          ]),
      ...(selectedPriority == null
        ? []
        : [
            {
              column: 'priority',
              type: 'equals',
              value: selectedPriority,
              valueType: 'enum',
              label: 'Priority',
              displayValue: priorityLabels[selectedPriority],
            },
          ]),
    ],
    [applicantSearch, selectedPriority, selectedUrgency, targetClassSearch]
  );

  const openItem = useCallback(
    (item: AdmissionCrmMyWorkItemDto) => {
      openApplicant(item.leadId, sectionTabs[item.recommendedSection], item);
    },
    [openApplicant]
  );

  const workItems = useMemo(() => query.data?.items || [], [query.data?.items]);
  const showEmptyWorkQueue =
    !query.isLoading && !query.isFetching && (query.data?.totalCount ?? 0) === 0;
  const selectedWorkSet = useMemo(() => new Set(selectedWorkKeys), [selectedWorkKeys]);

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
    ],
    [query.data]
  );

  const columns = useMemo<IColumn[]>(
    () => [
      {
        id: 'selection',
        label: '',
        width: 56,
        minWidth: 56,
        maxWidth: 56,
        sticky: true,
        stickyPosition: 'left',
        isSort: false,
        isFilter: false,
        excludeFromExport: true,
        renderColumn: () => (
          <Checkbox
            size="small"
            checked={
              workItems.length > 0 && workItems.every((item) => selectedWorkSet.has(item.key))
            }
            indeterminate={
              selectedWorkKeys.length > 0 &&
              !workItems.every((item) => selectedWorkSet.has(item.key))
            }
            onChange={(_event, checked) =>
              setSelectedWorkKeys(checked ? workItems.map((item) => item.key) : [])
            }
            inputProps={{ 'aria-label': 'Select visible work items' }}
          />
        ),
        render: (_value, row) => {
          const item = row as AdmissionCrmMyWorkItemDto;
          return (
            <Checkbox
              size="small"
              checked={selectedWorkSet.has(item.key)}
              onClick={(event) => event.stopPropagation()}
              onChange={() =>
                setSelectedWorkKeys((current) =>
                  current.includes(item.key)
                    ? current.filter((key) => key !== item.key)
                    : [...current, item.key]
                )
              }
              inputProps={{ 'aria-label': `Select work for ${item.applicantName}` }}
            />
          );
        },
      },
      {
        id: 'applicantNumber',
        originalId: 'ApplicantNumber',
        label: 'Applicant ID',
        width: 120,
        minWidth: 120,
        maxWidth: 120,
        sticky: true,
        stickyPosition: 'left',
        isFilter: false,
        render: (value) => (
          <Typography variant="subtitle2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatApplicantNumber(value as number)}
          </Typography>
        ),
      },
      {
        id: 'applicantName',
        label: 'Applicant',
        width: 230,
        minWidth: 210,
        isSort: true,
        filterType: 'string',
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
        id: 'title',
        label: 'Assigned work',
        width: 310,
        minWidth: 260,
        isSort: true,
        isFilter: false,
        render: (_value, row) => {
          const item = row as AdmissionCrmMyWorkItemDto;
          return (
            <Stack spacing={0.15}>
              <Typography variant="body2">{item.title}</Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {item.details || 'No additional note'}
              </Typography>
            </Stack>
          );
        },
      },
      {
        id: 'currentStep',
        label: 'Current step',
        width: 155,
        minWidth: 145,
        isSort: false,
        isFilter: false,
        render: (value) => stepLabels[value as AdmissionCrmApplicantStepKey],
      },
      {
        id: 'nextAction',
        label: 'Next action',
        width: 260,
        minWidth: 220,
        isSort: false,
        isFilter: false,
        render: (value) => value || 'Open the applicant to review the next step',
      },
      {
        id: 'targetClassName',
        label: 'Standard',
        width: 145,
        minWidth: 125,
        isSort: false,
        filterType: 'string',
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
                color={
                  item.urgency === AdmissionCrmWorkUrgency.Overdue
                    ? 'error'
                    : item.urgency === AdmissionCrmWorkUrgency.DueToday
                      ? 'warning'
                      : 'default'
                }
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
        render: (value) => <PriorityIndicator priority={value as AdmissionCrmLeadPriority} />,
      },
      {
        id: 'ownerDisplayName',
        label: 'Applicant owner',
        width: 170,
        minWidth: 150,
        isSort: false,
        isFilter: false,
        render: (value) => value || 'Unassigned',
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
          const isCompletionAction =
            item.recommendedAction === AdmissionCrmRecommendedAction.CompleteTask;
          return (
            <Button
              size="small"
              variant="outlined"
              color={isCompletionAction ? 'success' : 'primary'}
              startIcon={isCompletionAction ? <TaskAltRounded aria-hidden="true" /> : undefined}
              onClick={(event) => {
                event.stopPropagation();
                openItem(item);
              }}
              sx={{ whiteSpace: 'nowrap' }}
            >
              {actionLabels[item.recommendedAction]}
            </Button>
          );
        },
      },
    ],
    [openItem, selectedWorkKeys.length, selectedWorkSet, workItems]
  );

  const createTasksForSelection = async () => {
    if (!academicYearId || !bulkTaskTitle.trim() || selectedWorkKeys.length === 0) return;
    const leadIds = Array.from(
      new Set(workItems.filter((item) => selectedWorkSet.has(item.key)).map((item) => item.leadId))
    );
    try {
      const result = await bulkCreateTasks({
        academicYearId,
        leadIds,
        title: bulkTaskTitle.trim(),
        dueAt: new Date(bulkTaskDueAt).toISOString(),
        assignedUserId: currentUserId,
      }).unwrap();
      if (result.failedCount > 0) {
        const failedLeadIds = new Set(
          result.items.filter((item) => !item.success).map((item) => item.entityId)
        );
        setSelectedWorkKeys(
          workItems.filter((item) => failedLeadIds.has(item.leadId)).map((item) => item.key)
        );
        shikshaMitraToast.error({
          message: `${result.succeededCount} completed; ${result.failedCount} failed and remain selected.`,
        });
        return;
      }
      setSelectedWorkKeys([]);
      setBulkTaskTitle('');
      setBulkTaskOpen(false);
      shikshaMitraToast.success({
        message: `Tasks created for ${leadIds.length} applicant${leadIds.length === 1 ? '' : 's'}.`,
      });
    } catch {
      shikshaMitraToast.error({
        message: 'Tasks could not be created for the selected applicants.',
      });
    }
  };

  const handleFilters = useCallback(
    (filters: IParams['filters']) => {
      const byColumn = new Map(filters.map((filter) => [filter.column, filter.value]));
      setPrivateColumnFilters(
        filters.filter((filter) =>
          ['applicantName', 'targetClassName'].includes(filter.column)
        )
      );
      updateState({
        urgency: enumValue(byColumn.get('urgency')),
        priority: enumValue(byColumn.get('priority')),
        page: 1,
      });
    },
    [setPrivateColumnFilters, updateState]
  );

  if (!academicYearId)
    return (
      <Stack spacing={1.5} sx={enrollmentWorkspaceRootSx}>
        <EnrollmentWorkspaceHeader
          title="My Work"
          description="Tasks assigned to you for the selected admission year."
        />
        <Alert severity="info">Select an academic year to open My Work.</Alert>
      </Stack>
    );

  return (
    <Stack spacing={1.5} sx={enrollmentWorkspaceRootSx}>
      <EnrollmentWorkspaceHeader
        title="My Work"
        description="Assigned tasks and confidential admissions reviews, ordered by due date and urgency."
      />
      {canSubmitReviews && reviewAssignmentsQuery.isError ? (
        <Alert
          severity="error"
          action={<Button onClick={() => reviewAssignmentsQuery.refetch()}>Retry</Button>}
        >
          Your assigned admissions reviews could not be loaded.
        </Alert>
      ) : null}
      {openReviewAssignments.length ? (
        <Paper variant="outlined" sx={{ p: 1.5 }}>
          <Stack spacing={1}>
            <Typography variant="subtitle2">Confidential reviews assigned to you</Typography>
            {openReviewAssignments.map((assignment) => {
              const overdue = new Date(assignment.dueAt).getTime() < Date.now();
              return (
                <Button
                  key={assignment.id}
                  color="inherit"
                  onClick={() => openApplicant(assignment.leadId, 'offer')}
                  sx={{ justifyContent: 'space-between', textAlign: 'left', gap: 1 }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {assignment.reviewTitle}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Due {formatEnrollmentDate(assignment.dueAt, true)} · Open the applicant to
                      complete the confidential rubric.
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    color={overdue ? 'error' : 'warning'}
                    label={overdue ? 'Overdue' : 'Assigned'}
                  />
                </Button>
              );
            })}
          </Stack>
        </Paper>
      ) : null}
      {selectedWorkKeys.length > 0 ? (
        <Paper variant="outlined" role="region" aria-label="Bulk work actions" sx={{ p: 1 }}>
          <Stack direction="row" gap={0.75} flexWrap="wrap" alignItems="center">
            <Chip color="primary" label={`${selectedWorkKeys.length} selected`} />
            {hasGrantedPermission(
              permissions,
              'Students.Enrollment.AdmissionsCrm.BulkOperations'
            ) ? (
              <Button size="small" onClick={() => setBulkTaskOpen(true)}>
                Create follow-up tasks
              </Button>
            ) : null}
            <Button size="small" color="inherit" onClick={() => setSelectedWorkKeys([])}>
              Clear selection
            </Button>
          </Stack>
        </Paper>
      ) : null}
      {query.isError ? (
        <EnrollmentWorkspaceErrorState
          message="Admissions work could not be loaded."
          onRetry={() => query.refetch()}
        />
      ) : (
        <>
          {query.isFetching && !query.isLoading ? (
            <LinearProgress aria-label="Refreshing My Work" />
          ) : null}
          <Paper
            variant="outlined"
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(150px, 1fr))',
              borderRadius: 1.5,
              overflowX: 'auto',
            }}
          >
            {metrics.map((metric) => {
              const selected =
                metric.urgency != null
                  ? selectedUrgency === metric.urgency
                  : selectedUrgency == null;
              return (
                <Button
                  key={metric.key}
                  color="inherit"
                  aria-pressed={selected}
                  onClick={() => updateState({ urgency: metric.urgency, page: 1 })}
                  sx={{
                    justifyContent: 'flex-start',
                    px: 1.5,
                    py: 1.15,
                    borderRadius: 0,
                    borderRight: 1,
                    borderColor: 'divider',
                    bgcolor: selected ? 'action.selected' : undefined,
                  }}
                >
                  <Box
                    aria-hidden="true"
                    sx={{
                      display: 'grid',
                      placeItems: 'center',
                      mr: 1,
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      color: metric.color,
                      bgcolor: metric.surface,
                    }}
                  >
                    {metric.icon}
                  </Box>
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography
                      variant="h6"
                      sx={{ lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}
                    >
                      {metric.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {metric.label}
                    </Typography>
                  </Box>
                </Button>
              );
            })}
          </Paper>
          <CustomizableTable
            tableId="student-enrollment-my-work"
            tableTitle="My Work"
            columns={columns}
            data={workItems}
            isLoading={query.isLoading}
            serverSide
            serverSidePagination
            serverSideSearch
            serverSideSort
            serverSideSortMode="single"
            serverSideFilter
            totalCount={query.data?.totalCount || 0}
            page={page}
            rowsPerPage={pageSize}
            searchTerm={search}
            filters={tableFilters}
            sorts={parseEnrollmentTableSorts(sorting, columns)}
            defaultRowsPerPage={25}
            rowsPerPageOptions={[10, 25, 50, 100]}
            onServerPagination={(nextPage, nextPageSize) =>
              updateState({ page: nextPage, pageSize: nextPageSize }, 'push')
            }
            onServerSearch={(value) => {
              setSearch(value);
              updateState({ page: 1 }, 'replace');
            }}
            onServerSort={(_column, sorts) => {
              const nextSorting = serializeEnrollmentTableSort(sorts);
              updateState({ sorting: nextSorting || undefined, page: 1 }, 'push');
            }}
            onServerFilter={handleFilters}
            rowProps={(row) => {
              const item = row as AdmissionCrmMyWorkItemDto;
              return createApplicantRowNavigationProps({
                applicantName: item.applicantName,
                onOpen: () => openItem(item),
              });
            }}
            noDataText={
              <EnrollmentTableEmptyState
                title="No assigned work"
                description="You have no pending tasks for this admission year. Open Pipeline to review all applicants or clear filters to widen the view."
              />
            }
            wrapperProps={{ sx: enrollmentTableWrapperSx }}
            tableContainerProps={{ sx: enrollmentTableContainerSx }}
          />
          {showEmptyWorkQueue ? (
            <Alert severity="info">
              You have no pending tasks for this admission year. Open Pipeline to review all
              applicants or clear filters to widen the view.
            </Alert>
          ) : null}
          {query.data ? (
            <Typography variant="caption" color="text.secondary" textAlign="right">
              Updated {formatEnrollmentDate(query.data.generatedAt, true)}
            </Typography>
          ) : null}
        </>
      )}
      <Dialog open={bulkTaskOpen} onClose={() => setBulkTaskOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create follow-up tasks</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <Alert severity="info">
              One task will be assigned to you for each selected applicant.
            </Alert>
            <TextField
              required
              label="Task title"
              value={bulkTaskTitle}
              onChange={(event) => setBulkTaskTitle(event.target.value)}
            />
            <TextField
              required
              type="datetime-local"
              label="Due at"
              value={bulkTaskDueAt}
              onChange={(event) => setBulkTaskDueAt(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkTaskOpen(false)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            loading={bulkCreateTasksState.isLoading}
            disabled={!bulkTaskTitle.trim() || !bulkTaskDueAt}
            onClick={createTasksForSelection}
          >
            Create tasks
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
