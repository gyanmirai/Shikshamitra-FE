'use client';

import type { IParams } from 'src/components/customizabaleTable/types';
import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import { Iconify } from 'src/components/iconify';
import { studentPaths } from 'src/constants/student-menu';
import { Box, Stack, Button, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetAdmissionWorkflowsQuery } from 'src/redux/student/admissions/admission-workflows-api';

import { AdmissionQueryError } from './admission-query-error';
import { useWorkflowFilters } from './workflow-list/use-workflow-filters';
import { WorkflowListFilters } from './workflow-list/workflow-list-filters';
import { WorkflowListDialogs } from './workflow-list/workflow-list-dialogs';
import { useWorkflowListActions } from './workflow-list/use-workflow-list-actions';
import { STATUS_LABELS, createWorkflowColumns } from './workflow-list/workflow-columns';
import {
  workflowColumnFilters,
  workflowColumnFiltersRequest,
  serializeWorkflowColumnFilters,
} from './workflow-list/workflow-column-filters';

export default function AdmissionWorkflowsScreen() {
  const filterState = useWorkflowFilters();
  const actions = useWorkflowListActions();
  const { filters } = filterState;
  const query = useGetAdmissionWorkflowsQuery({
    search: filters.search || undefined,
    status: filters.status === 'all' ? undefined : filters.status,
    version: filters.version ? Number(filters.version) : undefined,
    isUsed: filters.usage === 'all' ? undefined : filters.usage === 'used',
    columnFilters: workflowColumnFiltersRequest(filters.columnFilters ?? '') || undefined,
    sorting: filters.sorting || undefined,
    createdFrom: filterState.createdFrom
      ? dateConvertor(filterState.createdFrom.startOf('day').format(dateFormat))
      : undefined,
    createdTo: filterState.createdTo
      ? dateConvertor(filterState.createdTo.endOf('day').format(dateFormat))
      : undefined,
    maxResultCount: filters.rowsPerPage,
    skipCount: filters.page * filters.rowsPerPage,
  });
  const data = query.currentData;
  const tableFilters: IParams['filters'] = [
    ...workflowColumnFilters(filters.columnFilters ?? ''),
    ...(filters.version
      ? [
          {
            column: 'version',
            type: 'equals',
            value: Number(filters.version),
            valueType: 'number',
            label: 'Version',
          },
        ]
      : []),
    ...(filters.status === 'all'
      ? []
      : [
          {
            column: 'status',
            type: 'equals',
            value: filters.status,
            valueType: 'enum',
            label: 'Status',
            displayValue: STATUS_LABELS[filters.status],
          },
        ]),
  ];
  const hasActiveFilters = Boolean(
    filters.search ||
    filters.status !== 'all' ||
    filters.version ||
    filters.usage !== 'all' ||
    filters.createdFrom ||
    filters.createdTo ||
    filters.columnFilters
  );
  const columns = createWorkflowColumns(actions.allowed, {
    onEdit: (workflow) => actions.navigate(workflow),
    onClone: actions.openClone,
    onCreateVersion: actions.createVersion,
    onUsage: (workflow) => actions.navigate(workflow, 'usage'),
    onArchive: (workflow) => actions.requestConfirmation(workflow, 'archive'),
    onReopen: (workflow) => actions.requestConfirmation(workflow, 'reopen'),
    onDelete: (workflow) => actions.requestConfirmation(workflow, 'delete'),
    onPublish: actions.publish,
    publishingId: actions.publishingId,
  });
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        height: 1,
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <CustomBreadcrumbs
        heading="Admission stage"
        isBack={actions.createDialog.value}
        onBack={() => actions.createCloseRef.current?.()}
        description="Design, validate, version, and publish the admission journey used by offerings."
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: 'Settings', href: studentPaths.enrollment.settings.root },
          { name: 'Admission stage' },
        ]}
        slotProps={{
          action: { alignSelf: { xs: 'flex-end', md: 'center' }, maxWidth: '100%' },
          heading: {},
          moreLink: {},
          breadcrumbs: {},
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
              <WorkflowListFilters filters={filters} onUpdate={filterState.update} />
              <Button
                size="small"
                variant="contained"
                disabled={!actions.allowed.canCreate}
                startIcon={<Iconify icon="mdi:plus" />}
                onClick={actions.createDialog.onTrue}
              >
                Add workflow
              </Button>
            </Stack>
          ) : undefined
        }
      />
      {!actions.createDialog.value && query.isError && Boolean(data?.items.length) && (
        <AdmissionQueryError onRetry={() => query.refetch()} />
      )}
      {!actions.createDialog.value && (
        <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
          <CustomizableTable
            tableId="admission-workflows"
            tableTitle="Admission stage workflows"
            wrapperProps={{ sx: { flex: 1, height: 1, minHeight: 0, minWidth: 0 } }}
            tableContainerProps={{ sx: { height: 1 } }}
            columns={columns}
            data={data?.items ?? []}
            errorContent={
              query.isError && !data?.items.length ? (
                <AdmissionQueryError onRetry={() => query.refetch()} />
              ) : undefined
            }
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
            isLoading={!data && (query.isLoading || query.isFetching)}
            isRefreshing={Boolean(data && query.isFetching)}
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
            onServerFilter={(next) => {
              const status = next.findLast((filter) => filter.column === 'status')?.value;
              const version = next.findLast((filter) => filter.column === 'version');
              filterState.update({
                status: status === undefined ? 'all' : (Number(status) as typeof filters.status),
                version: version?.type === 'equals' ? String(version.value) : '',
                columnFilters: serializeWorkflowColumnFilters(
                  version?.type === 'equals'
                    ? next.filter((filter) => filter.column !== 'version')
                    : next
                ),
              });
            }}
            onServerSort={(_column, sorts) =>
              filterState.update({
                sorting: sorts.length
                  ? `${sorts[0].originalId ?? sorts[0].column}${sorts[0].direction === 'desc' ? ' desc' : ''}`
                  : '',
              })
            }
            onClearCriteria={() =>
              filterState.update({ search: '', status: 'all', version: '', columnFilters: '' })
            }
            page={filters.page}
            rowsPerPage={filters.rowsPerPage}
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
                    Clear filters
                  </Button>
                </Stack>
              ) : (
                'No admission workflows configured yet. Create a draft to begin.'
              )
            }
          />
        </Box>
      )}
      <WorkflowListDialogs actions={actions} />
    </Box>
  );
}
