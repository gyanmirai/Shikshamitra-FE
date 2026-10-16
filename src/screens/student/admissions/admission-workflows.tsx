'use client';

import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import { Iconify } from 'src/components/iconify';
import { Box, Stack, Button } from '@mui/material';
import { studentPaths } from 'src/constants/student-menu';
import CustomizableTable from 'src/components/customizabaleTable';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetAdmissionWorkflowsQuery } from 'src/redux/student/admissions/admission-workflows-api';

import { AdmissionQueryError } from './admission-query-error';
import { createWorkflowColumns } from './workflow-list/workflow-columns';
import { useWorkflowFilters } from './workflow-list/use-workflow-filters';
import { WorkflowListFilters } from './workflow-list/workflow-list-filters';
import { WorkflowListDialogs } from './workflow-list/workflow-list-dialogs';
import { useWorkflowListActions } from './workflow-list/use-workflow-list-actions';

export default function AdmissionWorkflowsScreen() {
  const filterState = useWorkflowFilters();
  const actions = useWorkflowListActions();
  const { filters } = filterState;
  const query = useGetAdmissionWorkflowsQuery({
    search: filters.search || undefined,
    status: filters.status === 'all' ? undefined : filters.status,
    version: filters.version ? Number(filters.version) : undefined,
    isUsed: filters.usage === 'all' ? undefined : filters.usage === 'used',
    createdFrom: filterState.createdFrom
      ? dateConvertor(filterState.createdFrom.startOf('day').format(dateFormat))
      : undefined,
    createdTo: filterState.createdTo
      ? dateConvertor(filterState.createdTo.endOf('day').format(dateFormat))
      : undefined,
    maxResultCount: filters.rowsPerPage,
    skipCount: filters.page * filters.rowsPerPage,
  });
  const columns = createWorkflowColumns(actions.allowed, {
    onEdit: (workflow) => actions.navigate(workflow),
    onClone: actions.openClone,
    onCreateVersion: actions.createVersion,
    onUsage: (workflow) => actions.navigate(workflow, 'usage'),
    onArchive: (workflow) => actions.requestConfirmation(workflow, 'archive'),
    onReopen: (workflow) => actions.requestConfirmation(workflow, 'reopen'),
    onDelete: (workflow) => actions.requestConfirmation(workflow, 'delete'),
  });
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Admission Stage"
        isBack={actions.createDialog.value}
        onBack={() => actions.createCloseRef.current?.()}
        description="Design, validate, version, and publish the admission journey used by offerings."
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: 'Settings', href: studentPaths.enrollment.settings.root },
          { name: 'Admission Stage' },
        ]}
        slotProps={{
          action: { alignSelf: 'flex-end' },
          heading: {},
          moreLink: {},
          breadcrumbs: {},
        }}
        action={
          !actions.createDialog.value ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <WorkflowListFilters filters={filters} onUpdate={filterState.update} />
              <Button
                size="small"
                variant="contained"
                disabled={!actions.allowed.canCreate}
                startIcon={<Iconify icon="mdi:plus" />}
                onClick={actions.createDialog.onTrue}
                sx={{ minWidth: 140 }}
              >
                Add Workflow
              </Button>
            </Stack>
          ) : undefined
        }
      />
      {!actions.createDialog.value && query.isError && (
        <AdmissionQueryError onRetry={() => query.refetch()} />
      )}
      {!actions.createDialog.value && (
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <CustomizableTable
            tableId="admission-workflows"
            tableTitle="Admission stage workflows"
            wrapperProps={{ sx: { height: 1 } }}
            tableContainerProps={{ sx: { height: 1 } }}
            columns={columns}
            data={query.data?.items ?? []}
            handleRowClick={(row) => actions.navigate(row as AdmissionWorkflow, 'preview')}
            rowProps={(row) => ({
              tabIndex: 0,
              sx: { cursor: 'pointer' },
              onKeyDown: (event) => {
                if (
                  event.target === event.currentTarget &&
                  (event.key === 'Enter' || event.key === ' ')
                ) {
                  event.preventDefault();
                  actions.navigate(row as AdmissionWorkflow, 'preview');
                }
              },
            })}
            isLoading={query.isLoading}
            isPagination
            isSearch
            serverSide
            serverSidePagination
            serverSideSearch
            page={filters.page}
            rowsPerPage={filters.rowsPerPage}
            searchTerm={filters.search}
            totalCount={query.data?.totalCount ?? 0}
            onServerSearch={(search) => filterState.update({ search })}
            onServerPagination={(page, rowsPerPage) =>
              filterState.update({ page: page - 1, rowsPerPage })
            }
            noDataText="No admission workflows configured yet. Create a draft to begin."
          />
        </Box>
      )}
      <WorkflowListDialogs actions={actions} />
    </Box>
  );
}
