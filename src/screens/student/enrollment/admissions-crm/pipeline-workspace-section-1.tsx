'use client';

import type { AdmissionCrmLeadDto } from 'src/redux/student/admissions-crm/core-leads-contracts';

import { useState } from 'react';

import AddRounded from '@mui/icons-material/AddRounded';

import CustomizableTable from 'src/components/customizabaleTable';

import ViewColumnRounded from '@mui/icons-material/ViewColumnRounded';

import FormatListBulletedRounded from '@mui/icons-material/FormatListBulletedRounded';

import {
  Chip,
  Paper,
  Stack,
  Button,
  MenuItem,
  TextField,
  ToggleButton,
  LinearProgress,
  ToggleButtonGroup,
} from '@mui/material';

import {
  AdmissionInquiryChannel,
  AdmissionCrmLeadPriority,
} from 'src/redux/student/admissions-crm/core-leads-contracts';

import { PipelineStageColumn } from './pipeline-stage-column';

import { EnrollmentWorkspaceHeader } from './workspace-header';

import { getAdmissionCrmLeadName, getAdmissionCrmChannelLabel } from './admissions-crm-utils';

import { parseEnrollmentTableSorts, serializeEnrollmentTableSort } from './workspace-table-sorting';

import { getLatestEnumFilter, getLatestStringFilter } from './workspace-table-filters';

import { createApplicantRowNavigationProps } from './applicant-row-navigation';

import {
  enrollmentTableWrapperSx,
  EnrollmentTableEmptyState,
  enrollmentTableContainerSx,
  EnrollmentWorkspaceErrorState,
  EnrollmentWorkspaceFilterPanel,
} from './workspace-table-patterns';

import { usePipelineWorkspaceWorkspace } from './pipeline-workspace-context';

import { enrollmentPipelineColumns } from './pipeline-column-definitions';

const pageSize = 50;

const permissionRoot = 'Students.Enrollment.AdmissionsCrm';

const actionPermissions = {
  add: `${permissionRoot}.Add`,
  assignOwner: `${permissionRoot}.AssignOwner`,
  manageTasks: `${permissionRoot}.ManageTasks`,
  changeStage: `${permissionRoot}.ChangeStage`,
  archiveReopen: `${permissionRoot}.ArchiveReopen`,
  scheduleExam: `${permissionRoot}.ScheduleExam`,
  issueRegistrationForm: `${permissionRoot}.IssueRegistrationForm`,
  overrideExamCapacity: `${permissionRoot}.OverrideExamCapacity`,
  manageConfiguration: `${permissionRoot}.ManageConfiguration`,
};

const channels = Object.values(AdmissionInquiryChannel).filter(
  (value): value is AdmissionInquiryChannel => typeof value === 'number'
);

const priorities = Object.values(AdmissionCrmLeadPriority).filter(
  (value): value is AdmissionCrmLeadPriority => typeof value === 'number'
);

const priorityLabels: Record<AdmissionCrmLeadPriority, string> = {
  [AdmissionCrmLeadPriority.None]: 'Not set',
  [AdmissionCrmLeadPriority.Hot]: 'Hot',
  [AdmissionCrmLeadPriority.Warm]: 'Warm',
  [AdmissionCrmLeadPriority.Cold]: 'Cold',
  [AdmissionCrmLeadPriority.Low]: 'Low',
};

export function PipelineWorkspaceSection1() {
  const { state: controllerState, actions, meta } = usePipelineWorkspaceWorkspace();
  const {
    academicMediumId,
    academicYearId,
    boardScopeKey,
    can,
    columnFilters,
    columns,
    debouncedSearch,
    leads,
    leadsQuery,
    openApplicant,
    page,
    renderLeadCard,
    search,
    selectedLeadIds,
    setBulkAction,
    setColumnFilters,
    setDebouncedSearch,
    setQuickDialogOpen,
    setSearch,
    setSelectedLeadIds,
    stagesQuery,
    state,
    tableFilters,
    updateState,
  } = { ...controllerState, ...actions, ...meta };

  const [isRetryingLeads, setIsRetryingLeads] = useState(false);
  const [isRetryingStages, setIsRetryingStages] = useState(false);

  const retryLeads = async () => {
    if (isRetryingLeads) return;
    setIsRetryingLeads(true);
    try {
      await leadsQuery.refetch();
    } finally {
      setIsRetryingLeads(false);
    }
  };

  const retryStages = async () => {
    if (isRetryingStages) return;
    setIsRetryingStages(true);
    try {
      await stagesQuery.refetch();
    } finally {
      setIsRetryingStages(false);
    }
  };

  if (!academicYearId) return null;

  return (
    <>
      <EnrollmentWorkspaceHeader
        title="Admissions Pipeline"
        description="Capture and progress every applicant from inquiry through activation."
        actions={
          <Stack direction="row" alignItems="center" gap={1}>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={state.view || 'list'}
              onChange={(_, value) =>
                value &&
                updateState(
                  { view: value, owner: value === 'board' ? undefined : state.owner, page: 1 },
                  'push'
                )
              }
              aria-label="Pipeline view"
            >
              <ToggleButton value="board" aria-label="Board view">
                <ViewColumnRounded />
              </ToggleButton>
              <ToggleButton value="list" aria-label="List view">
                <FormatListBulletedRounded />
              </ToggleButton>
            </ToggleButtonGroup>
            {can(actionPermissions.add) ? (
              <Button
                variant="contained"
                startIcon={<AddRounded />}
                onClick={() => setQuickDialogOpen(true)}
              >
                Add Inquiry
              </Button>
            ) : null}
          </Stack>
        }
      />
      {state.view === 'board' ? (
        <EnrollmentWorkspaceFilterPanel
          columns={{ xs: 1, sm: 2, lg: 4 }}
          onClear={() => {
            setSearch('');
            setDebouncedSearch('');
            updateState({
              channel: undefined,
              priority: undefined,
              page: 1,
            });
          }}
          clearDisabled={state.channel == null && state.priority == null && !search}
        >
          <>
            <TextField
              size="small"
              label="Search applicants"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                updateState({ page: 1 }, 'replace');
              }}
              autoComplete="off"
            />
            <TextField
              select
              size="small"
              label="Channel"
              value={state.channel ?? ''}
              onChange={(event) =>
                updateState({
                  channel: event.target.value === '' ? undefined : Number(event.target.value),
                  page: 1,
                })
              }
            >
              <MenuItem value="">All channels</MenuItem>
              {channels.map((channel) => (
                <MenuItem key={channel} value={channel}>
                  {getAdmissionCrmChannelLabel(channel)}
                </MenuItem>
              ))}
            </TextField>
          </>
          <TextField
            select
            size="small"
            label="Priority"
            value={state.priority ?? ''}
            onChange={(event) =>
              updateState({
                priority: event.target.value === '' ? undefined : Number(event.target.value),
                page: 1,
              })
            }
          >
            <MenuItem value="">All priorities</MenuItem>
            {priorities.map((priority) => (
              <MenuItem key={priority} value={priority}>
                {priorityLabels[priority]}
              </MenuItem>
            ))}
          </TextField>
        </EnrollmentWorkspaceFilterPanel>
      ) : null}
      {selectedLeadIds.length > 0 && (
        <Paper
          variant="outlined"
          role="region"
          aria-label="Bulk inquiry actions"
          sx={{ p: 1, position: 'sticky', top: 8, zIndex: 2, borderRadius: 1 }}
        >
          <Stack direction="row" gap={0.75} flexWrap="wrap" alignItems="center">
            <Chip label={`${selectedLeadIds.length} selected`} color="primary" />
            {can(actionPermissions.assignOwner) && (
              <Button size="small" onClick={() => setBulkAction('owner')}>
                Assign Owner
              </Button>
            )}
            {can(actionPermissions.manageTasks) && (
              <Button size="small" onClick={() => setBulkAction('task')}>
                Create Task
              </Button>
            )}
            {can(actionPermissions.changeStage) && (
              <Button size="small" onClick={() => setBulkAction('stage')}>
                Move Stage
              </Button>
            )}
            {can(actionPermissions.archiveReopen) && (
              <Button size="small" color="warning" onClick={() => setBulkAction('archive')}>
                Archive
              </Button>
            )}
          </Stack>
        </Paper>
      )}
      {(state.view || 'list') === 'list' && stagesQuery.isFetching && (
        <LinearProgress aria-label="Loading pipeline stages" />
      )}
      {(state.view || 'list') === 'list' && (stagesQuery.isError || isRetryingStages) && (
        <EnrollmentWorkspaceErrorState
          message="Pipeline stages are unavailable. Review Enrollment configuration before continuing."
          onRetry={retryStages}
          isRetrying={isRetryingStages}
        />
      )}
      {state.view === 'board' && (
        <Stack
          data-enrollment-scroll-root="true"
          direction={{ xs: 'column', lg: 'row' }}
          spacing={1.25}
          alignItems="stretch"
          sx={{
            flex: 1,
            minHeight: 0,
            overflowX: { lg: 'auto' },
            overflowY: { xs: 'auto', lg: 'hidden' },
            pb: 1,
          }}
        >
          {enrollmentPipelineColumns.map((column) => (
            <PipelineStageColumn
              key={column.key}
              academicYearId={academicYearId}
              column={column}
              query={{
                filterText: debouncedSearch || undefined,
                academicMediumId,
                channel: state.channel,
                campaignName: state.campaign,
                priority: state.priority,
              }}
              resetKey={boardScopeKey}
              renderLead={renderLeadCard}
            />
          ))}
        </Stack>
      )}
      {(state.view || 'list') === 'list' &&
        (leadsQuery.isError || isRetryingLeads ? (
          <EnrollmentWorkspaceErrorState
            message="Inquiry leads could not be loaded. Your filters and current view are preserved."
            onRetry={retryLeads}
            isRetrying={isRetryingLeads}
          />
        ) : (
          <CustomizableTable
            tableId="student-enrollment-pipeline"
            tableTitle="Admissions Pipeline"
            columns={columns}
            data={leads}
            isLoading={leadsQuery.isLoading || (leadsQuery.isFetching && !leadsQuery.data)}
            serverSide
            serverSidePagination
            serverSideSearch
            serverSideSort
            serverSideSortMode="single"
            serverSideFilter
            searchTerm={search}
            defaultSearchTerm={search}
            searchFieldProps={{
              placeholder: 'Search applicants',
              inputProps: { 'aria-label': 'Search applicants' },
            }}
            filters={[...tableFilters, ...columnFilters]}
            sorts={parseEnrollmentTableSorts(state.sorting || 'LastActivityTime DESC', columns)}
            totalCount={leadsQuery.data?.totalCount || 0}
            page={page}
            rowsPerPage={pageSize}
            defaultRowsPerPage={pageSize}
            rowsPerPageOptions={[pageSize]}
            onSearchInputChange={(value) => {
              setSearch(value);
              setSelectedLeadIds([]);
              if (state.page !== 1) {
                updateState({ page: 1 }, 'replace');
              }
            }}
            onServerSearch={(value) => {
              setDebouncedSearch(value.trim());
              setSelectedLeadIds([]);
            }}
            onServerPagination={(nextPage) => updateState({ page: nextPage }, 'push')}
            onServerSort={(_column, sorts) => {
              const nextSorting = serializeEnrollmentTableSort(sorts);
              updateState(
                {
                  sorting: nextSorting || undefined,
                  page: 1,
                },
                'push'
              );
            }}
            onServerFilter={(filters) => {
              const stateColumns = new Set([
                'pipelineColumn',
                'channel',
                'priority',
                'intendedRouteType',
                'desiredClassName',
                'ownerUserId',
              ]);
              setSelectedLeadIds([]);
              setColumnFilters(filters.filter((filter) => !stateColumns.has(filter.column)));
              updateState(
                {
                  pipelineColumn: getLatestEnumFilter(filters, 'pipelineColumn'),
                  channel: getLatestEnumFilter(filters, 'channel'),
                  priority: getLatestEnumFilter(filters, 'priority'),
                  routeType: getLatestEnumFilter(filters, 'intendedRouteType'),
                  className: getLatestStringFilter(filters, 'desiredClassName'),
                  owner: getLatestStringFilter(filters, 'ownerUserId'),
                  page: 1,
                },
                'push'
              );
            }}
            noDataText={
              <EnrollmentTableEmptyState
                title="No applicants match this view"
                description="Add an inquiry for this admission year or clear filters to show existing applicants."
              />
            }
            rowProps={(row) => ({
              ...createApplicantRowNavigationProps({
                applicantName: getAdmissionCrmLeadName(row as AdmissionCrmLeadDto),
                onOpen: () => openApplicant((row as AdmissionCrmLeadDto).id, 'inquiry'),
              }),
              'data-testid': 'student-enrollment-pipeline-row',
              'data-lead-id': row.id,
            })}
            wrapperProps={{ sx: enrollmentTableWrapperSx }}
            tableContainerProps={{
              'data-enrollment-scroll-root': 'true',
              sx: enrollmentTableContainerSx,
            }}
          />
        ))}
    </>
  );
}
