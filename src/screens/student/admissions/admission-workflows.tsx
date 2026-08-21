'use client';

import { Box, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';
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
    onView: (workflow) => actions.navigate(workflow),
    onClone: actions.openClone,
    onCreateVersion: actions.createVersion,
    onUsage: (workflow) => actions.navigate(workflow, true),
    onArchive: (workflow) => actions.setPendingConfirmation({ workflow, action: 'archive' }),
    onDelete: (workflow) => actions.setPendingConfirmation({ workflow, action: 'delete' }),
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Workflow Builder"
        description="Design, validate, version, and publish the admission journey used by offerings."
        links={[
          { name: 'Students', href: '/student/dashboard' },
          { name: 'Admissions', href: '/student/admissions' },
          { name: 'Settings' },
          { name: 'Workflow Builder' },
        ]}
        action={
          <Button size="small" variant="contained" disabled={!actions.allowed.canCreate} startIcon={<Iconify icon="mdi:plus" />} onClick={actions.createDialog.onTrue}>
            Create workflow
          </Button>
        }
      />
      {query.isError && <AdmissionQueryError onRetry={() => query.refetch()} />}
      <WorkflowListFilters {...filterState} onUpdate={filterState.update} onClear={filterState.clear} />
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId="admission-workflows"
          tableTitle="Admission workflows"
          wrapperProps={{ sx: { height: 1 } }}
          tableContainerProps={{ sx: { height: 1 } }}
          columns={columns}
          data={query.data?.items ?? []}
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
          onServerPagination={(page, rowsPerPage) => filterState.update({ page: page - 1, rowsPerPage })}
          noDataText="No admission workflows configured yet. Create a draft to begin."
        />
      </Box>
      <WorkflowListDialogs actions={actions} />
    </Box>
  );
}
