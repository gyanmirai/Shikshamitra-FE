'use client';

import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useSearchParams } from 'next/navigation';
import { studentPaths } from 'src/constants/student-menu';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Stack, Alert, Button, Typography } from '@mui/material';
import { studentSetupReturnUrl } from 'src/screens/student/setup/embedding/student-setup-return';
import {
  useStudentSetupEmbedding,
  StudentSetupManagerHeader as CustomBreadcrumbs,
} from 'src/screens/student/setup/embedding';
import {
  useGetAdmissionWorkflowsQuery,
  useGetAdmissionWorkflowUsageQuery,
} from 'src/redux/student/admissions/admission-workflows-api';

import { AdmissionQueryError } from './admission-query-error';
import { workflowCreatedRange } from './workflow-list/workflow-date-range';
import { WorkflowListFilters } from './workflow-list/workflow-list-filters';
import { WorkflowListDialogs } from './workflow-list/workflow-list-dialogs';
import { useWorkflowListActions } from './workflow-list/use-workflow-list-actions';
import { WorkflowSidePanel } from './workflow-builder/components/workflow-side-panel';
import { workflowColumnFiltersRequest } from './workflow-list/workflow-column-filters';
import { STATUS_LABELS, createWorkflowColumns } from './workflow-list/workflow-columns';
import { useWorkflowFilters, WORKFLOW_PAGE_SIZES } from './workflow-list/use-workflow-filters';
import {
  activeWorkflowFilters,
  workflowFiltersFromTable,
} from './workflow-list/workflow-table-filters';

export default function AdmissionWorkflowsScreen() {
  const filterState = useWorkflowFilters();
  const { embedded } = useStudentSetupEmbedding();
  const params = useSearchParams();
  const actions = useWorkflowListActions(
    embedded
      ? studentSetupReturnUrl('admission-stages', params.get('guideYear'), params.get('returnTo'))
      : undefined
  );
  const [usageWorkflow, setUsageWorkflow] = useState<AdmissionWorkflow | null>(null);
  const showUsage = Boolean(usageWorkflow && actions.allowed.canViewUsage);
  const usageQuery = useGetAdmissionWorkflowUsageQuery(usageWorkflow?.id ?? '', {
    skip: !showUsage,
  });
  const lifecycleLoading = Boolean(actions.creatingVersionId || actions.publishingId);
  const { filters } = filterState;
  const query = useGetAdmissionWorkflowsQuery({
    search: filters.search || undefined,
    status: filters.status === 'all' ? undefined : filters.status,
    version: filters.version ? Number(filters.version) : undefined,
    isUsed: filters.usage === 'all' ? undefined : filters.usage === 'used',
    columnFilters: workflowColumnFiltersRequest(filters.columnFilters ?? '') || undefined,
    sorting: filters.sorting || undefined,
    ...workflowCreatedRange(filters.createdFrom, filters.createdTo),
    maxResultCount: filters.rowsPerPage,
    skipCount: filters.page * filters.rowsPerPage,
  });
  const data = query.currentData;
  const tableFilters = activeWorkflowFilters(filters, STATUS_LABELS);
  const hasActiveFilters = Boolean(filters.search || tableFilters.length);
  const columns = createWorkflowColumns(actions.allowed, {
    onEdit: (workflow) => actions.navigate(workflow),
    onCreateVersion: actions.createVersion,
    onUsage: setUsageWorkflow,
    onArchive: (workflow) => actions.requestConfirmation(workflow, 'archive'),
    onReopen: (workflow) => actions.requestConfirmation(workflow, 'reopen'),
    onDelete: (workflow) => actions.requestConfirmation(workflow, 'delete'),
    onPublish: actions.publish,
    publishingId: actions.publishingId,
    creatingVersionId: actions.creatingVersionId,
  });
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: actions.createDialog.value ? 1.5 : 1,
        height: 1,
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <CustomBreadcrumbs
        editorOpen={
          actions.createDialog.value ||
          actions.cloneDialog.value ||
          Boolean(actions.pendingConfirmation) ||
          showUsage
        }
        busy={
          actions.createState.isLoading ||
          actions.cloneState.isLoading ||
          actions.confirmationBusy ||
          lifecycleLoading
        }
        heading="Admission Stage"
        isBack={actions.createDialog.value}
        backDisabled={actions.createState.isLoading || actions.openingCreatedWorkflow}
        onBack={() => actions.createCloseRef.current?.()}
        description="Design, Validate, Version, and Publish the Admission Journey Used by Offerings."
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: 'Settings', href: studentPaths.enrollment.settings.root },
          { name: 'Admission Stage' },
        ]}
        slotProps={{
          action: { alignSelf: { xs: 'flex-end', md: 'center' }, maxWidth: '100%' },
          heading: actions.createDialog.value
            ? { whiteSpace: 'nowrap', overflowWrap: 'normal', textWrap: 'nowrap' }
            : {},
          moreLink: {},
          breadcrumbs: actions.createDialog.value ? { display: { xs: 'none', sm: 'flex' } } : {},
        }}
        action={
          !actions.createDialog.value ? (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="flex-end"
              useFlexGap
              flexWrap="wrap"
            >
              <WorkflowListFilters
                filters={filters}
                onUpdate={filterState.update}
                onClear={filterState.clearFilters}
              />
              <Button
                aria-label="Add Workflow"
                size="small"
                variant="contained"
                disabled={!actions.allowed.canCreate}
                startIcon={<Iconify icon="mdi:plus" />}
                onClick={actions.createDialog.onTrue}
              >
                Workflow
              </Button>
            </Stack>
          ) : undefined
        }
      />
      {actions.existingDraftNotice && (
        <Alert
          severity="info"
          variant="outlined"
          onClose={actions.dismissExistingDraftNotice}
          action={
            <Button
              size="small"
              aria-label={`Open draft for ${actions.existingDraftNotice.workflowName}`}
              onClick={actions.openExistingDraft}
            >
              Open Draft
            </Button>
          }
        >
          A draft version already exists for this workflow. Open the existing draft to continue
          editing.
        </Alert>
      )}
      {!actions.createDialog.value && query.isError && Boolean(data?.items.length) && (
        <AdmissionQueryError onRetry={() => query.refetch()} />
      )}
      {!actions.createDialog.value && (
        <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
          <CustomizableTable
            tableId="admission-workflows"
            tableTitle="Admission Stage Workflows"
            wrapperProps={{ sx: { flex: 1, height: 1, minHeight: 0, minWidth: 0 } }}
            tableContainerProps={{ sx: { height: 1 } }}
            columns={columns}
            data={data?.items ?? []}
            errorContent={
              query.isError && !data?.items.length ? (
                <AdmissionQueryError onRetry={() => query.refetch()} />
              ) : undefined
            }
            getRowAction={(row) => ({
              label: `Preview ${(row as AdmissionWorkflow).name}`,
              onClick: () => actions.navigate(row as AdmissionWorkflow, 'preview'),
              disabled: Boolean(actions.pendingNavigationId),
            })}
            rowProps={(row) => ({
              'aria-busy': actions.pendingNavigationId === row.id || undefined,
            })}
            isLoading={!data && (query.isLoading || query.isFetching)}
            isRefreshing={Boolean(data && query.isFetching && !lifecycleLoading)}
            isPagination
            isSearch
            serverSide
            serverSidePagination
            serverSideSearch
            serverSideFilter
            serverSideSort
            serverSideSortMode="single"
            isFilter
            filters={tableFilters}
            sorts={
              filters.sorting
                ? [
                    {
                      column:
                        filters.sorting.split(' ')[0] === 'statusLabel'
                          ? 'status'
                          : filters.sorting.split(' ')[0],
                      originalId: filters.sorting.split(' ')[0],
                      direction: filters.sorting.endsWith(' desc') ? 'desc' : 'asc',
                    },
                  ]
                : []
            }
            onServerFilter={(next) => filterState.update(workflowFiltersFromTable(next))}
            onServerSort={(_column, sorts) =>
              filterState.update({
                sorting: sorts.length
                  ? `${sorts[0].originalId ?? sorts[0].column}${sorts[0].direction === 'desc' ? ' desc' : ''}`
                  : '',
              })
            }
            onClearCriteria={filterState.clear}
            page={filters.page}
            rowsPerPage={filters.rowsPerPage}
            rowsPerPageOptions={WORKFLOW_PAGE_SIZES}
            searchTerm={filters.search}
            totalCount={data?.totalCount ?? 0}
            onServerSearch={(search) => filterState.update({ search })}
            onServerPagination={(page, rowsPerPage) =>
              filterState.update({ page: page - 1, rowsPerPage })
            }
            noDataText={
              hasActiveFilters ? (
                <Stack component="span" spacing={1} alignItems="center">
                  <Typography component="span" variant="inherit">
                    No admission workflows match the selected filters.
                  </Typography>
                  <Button size="small" color="inherit" onClick={filterState.clear}>
                    Clear Filters
                  </Button>
                </Stack>
              ) : (
                'No Admission Workflows Configured Yet. Create a Draft to Begin.'
              )
            }
          />
        </Box>
      )}
      {showUsage && usageWorkflow && (
        <WorkflowSidePanel
          panel="usage"
          workflow={usageWorkflow}
          stages={usageWorkflow.stages}
          transitions={usageWorkflow.transitions}
          usage={usageQuery.currentData}
          usageLoading={usageQuery.isFetching && !usageQuery.currentData}
          usageError={usageQuery.isError}
          onRetryUsage={() => usageQuery.refetch()}
          canCreateVersion={false}
          governanceLoading={false}
          onClose={() => setUsageWorkflow(null)}
        />
      )}
      <WorkflowListDialogs actions={actions} />
    </Box>
  );
}
