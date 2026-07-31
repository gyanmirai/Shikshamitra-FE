'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn, IParams } from 'src/components/customizabaleTable/types';
import type { AdmissionCrmMyWorkItemDto } from 'src/redux/student/admissions-crm/admissions-crm-api';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import TodayRounded from '@mui/icons-material/TodayRounded';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useRouter, useSearchParams } from 'next/navigation';
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
  useBulkCreateAdmissionCrmTasksMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { formatEnrollmentDate } from './enrollment-display';
import { EnrollmentWorkspaceHeader } from './workspace-header';
import { useEnrollmentWorkspace } from './enrollment-workspace-context';
import { parseEnrollmentTablePagination } from './workspace-table-pagination';
import { createApplicantRowNavigationProps } from './applicant-row-navigation';
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

const numericEnumValues = (source: Record<string, string | number>) =>
  new Set(Object.values(source).filter((value): value is number => typeof value === 'number'));

const priorityValues = numericEnumValues(AdmissionCrmLeadPriority);
const urgencyValues = numericEnumValues(AdmissionCrmWorkUrgency);

export function EnrollmentOverviewWorkspace() {
  const permissions = useSelector((root: RootState) => root.auth.permissions);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { academicYearId, academicMediumId, currentUserId, openApplicant } =
    useEnrollmentWorkspace();
  const { page, pageSize } = parseEnrollmentTablePagination(searchParams);
  const search = searchParams.get('search') || '';
  const sorting = searchParams.get('sorting') || undefined;
  const [selectedWorkKeys, setSelectedWorkKeys] = useState<string[]>([]);
  const [bulkTaskOpen, setBulkTaskOpen] = useState(false);
  const [bulkTaskTitle, setBulkTaskTitle] = useState('');
  const [bulkTaskDueAt, setBulkTaskDueAt] = useState(() =>
    dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm')
  );
  const [bulkCreateTasks, bulkCreateTasksState] = useBulkCreateAdmissionCrmTasksMutation();

  const selectionScope = [
    academicYearId,
    academicMediumId,
    page,
    pageSize,
    search,
    sorting,
    searchParams.get('applicantSearch'),
    searchParams.get('targetClassSearch'),
    searchParams.get('priority'),
    searchParams.get('urgency'),
  ].join('|');

  useEffect(() => {
    setSelectedWorkKeys([]);
  }, [selectionScope]);

  const enumParam = useCallback(
    (key: string, allowedValues: ReadonlySet<number>) => {
      const value = searchParams.get(key);
      if (value == null || value === '') return undefined;
      const parsed = Number(value);
      return Number.isInteger(parsed) && allowedValues.has(parsed) ? parsed : undefined;
    },
    [searchParams]
  );
  const applicantSearch = searchParams.get('applicantSearch') || undefined;
  const targetClassSearch = searchParams.get('targetClassSearch') || undefined;
  const selectedPriority = enumParam('priority', priorityValues) as
    AdmissionCrmLeadPriority | undefined;
  const selectedUrgency = enumParam('urgency', urgencyValues) as
    AdmissionCrmWorkUrgency | undefined;

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

  const updateUrl = useCallback(
    (
      changes: Record<string, string | number | undefined | null>,
      mode: 'push' | 'replace' = 'replace'
    ) => {
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
        id: 'applicantName',
        label: 'Applicant',
        width: 230,
        minWidth: 210,
        sticky: true,
        stickyPosition: 'left',
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
      updateUrl({
        applicantSearch: byColumn.get('applicantName')
          ? String(byColumn.get('applicantName'))
          : undefined,
        targetClassSearch: byColumn.get('targetClassName')
          ? String(byColumn.get('targetClassName'))
          : undefined,
        urgency: enumValue(byColumn.get('urgency')),
        priority: enumValue(byColumn.get('priority')),
        page: 1,
      });
    },
    [updateUrl]
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
        description="Assigned tasks, due dates, the applicant's current step, and the next required action."
      />
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
                  ? enumParam('urgency', urgencyValues) === metric.urgency
                  : enumParam('urgency', urgencyValues) == null;
              return (
                <Button
                  key={metric.key}
                  color="inherit"
                  aria-pressed={selected}
                  onClick={() => updateUrl({ urgency: metric.urgency, page: 1 })}
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
              updateUrl({ page: nextPage, pageSize: nextPageSize })
            }
            onServerSearch={(value) => updateUrl({ search: value || null, page: 1 })}
            onServerSort={(_column, sorts) => {
              const nextSorting = serializeEnrollmentTableSort(sorts);
              updateUrl({
                sorting: nextSorting || null,
                page: 1,
              });
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
