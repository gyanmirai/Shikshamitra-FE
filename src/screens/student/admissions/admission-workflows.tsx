'use client';

import type { RootState } from 'src/redux/store';
import type { AdmissionWorkflowNotification } from 'src/redux/student/admissions/admission-workflows-api';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { Box, Badge, Paper, Stack, Button } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useGetAdmissionWorkflowsQuery,
  useGetAdmissionWorkflowNotificationsQuery,
  useGetAdmissionWorkflowGovernanceSettingsQuery,
  useMarkAdmissionWorkflowNotificationReadMutation,
  useUpdateAdmissionWorkflowGovernanceSettingsMutation,
} from 'src/redux/student/admissions/admission-workflows-api';

import { AdmissionQueryError } from './admission-query-error';
import { getAdmissionWorkflowAccess } from './workflow-access';
import { createWorkflowColumns } from './workflow-list/workflow-columns';
import { useWorkflowFilters } from './workflow-list/use-workflow-filters';
import { WorkflowListFilters } from './workflow-list/workflow-list-filters';
import { WorkflowListDialogs } from './workflow-list/workflow-list-dialogs';
import { useWorkflowListActions } from './workflow-list/use-workflow-list-actions';
import { WorkflowGovernanceSettingsDialog } from './workflow-list/workflow-governance-settings-dialog';
import { WorkflowGovernanceNotificationsDialog } from './workflow-list/workflow-governance-notifications-dialog';

export default function AdmissionWorkflowsScreen() {
  const router = useRouter();
  const filterState = useWorkflowFilters();
  const actions = useWorkflowListActions();
  const governanceDialog = useBoolean();
  const notificationsDialog = useBoolean();
  const [markingNotificationId, setMarkingNotificationId] = useState<string | null>(null);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const { canManageGovernance } = getAdmissionWorkflowAccess(permissions);
  const governanceSettings = useGetAdmissionWorkflowGovernanceSettingsQuery(undefined, {
    skip: !governanceDialog.value,
  });
  const [updateGovernance, updateGovernanceState] =
    useUpdateAdmissionWorkflowGovernanceSettingsMutation();
  const notificationsQuery = useGetAdmissionWorkflowNotificationsQuery(false);
  const [markNotificationRead] = useMarkAdmissionWorkflowNotificationReadMutation();
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
    onView: (workflow) => actions.navigate(workflow, 'preview'),
    onEdit: (workflow) => actions.navigate(workflow),
    onClone: actions.openClone,
    onCreateVersion: actions.createVersion,
    onUsage: (workflow) => actions.navigate(workflow, 'usage'),
    onArchive: (workflow) => actions.requestConfirmation(workflow, 'archive'),
    onDelete: (workflow) => actions.requestConfirmation(workflow, 'delete'),
  });
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Admission Process"
        description="Design, validate, version, and publish the admission journey used by offerings."
        links={[
          { name: 'Students', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: 'Admission Setup', href: studentPaths.enrollment.settings.root },
          { name: 'Admission Process' },
        ]}
      />
      <Paper variant="outlined" sx={{ p: 1, borderRadius: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Button
              size="small"
              variant="outlined"
              startIcon={
                <Badge
                  color="error"
                  badgeContent={notificationsQuery.data?.filter((item) => !item.isRead).length ?? 0}
                >
                  <Iconify icon="mdi:bell-outline" />
                </Badge>
              }
              onClick={notificationsDialog.onTrue}
              sx={{ minHeight: { xs: 44, sm: 36 }, px: 1.25 }}
            >
              Notifications
            </Button>
            {canManageGovernance && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:shield-check-outline" />}
                onClick={governanceDialog.onTrue}
                sx={{ minHeight: { xs: 44, sm: 36 }, px: 1.25 }}
              >
                Governance
              </Button>
            )}
          </Stack>
          <Stack direction="row" spacing={1} useFlexGap sx={{ alignSelf: { sm: 'center' } }}>
            <WorkflowListFilters filters={filters} onUpdate={filterState.update} />
            <Button
              size="small"
              variant="contained"
              disabled={!actions.allowed.canCreate}
              startIcon={<Iconify icon="mdi:plus" />}
              onClick={actions.createDialog.onTrue}
              sx={{
                minHeight: { xs: 44, sm: 36 },
                px: 1.25,
                bgcolor: 'text.primary',
                color: 'background.paper',
                '&:hover': { bgcolor: 'text.secondary' },
              }}
            >
              Create workflow
            </Button>
          </Stack>
        </Stack>
      </Paper>
      {query.isError && <AdmissionQueryError onRetry={() => query.refetch()} />}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId="admission-workflows"
          tableTitle="Admission processes"
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
          onServerPagination={(page, rowsPerPage) =>
            filterState.update({ page: page - 1, rowsPerPage })
          }
          noDataText="No admission workflows configured yet. Create a draft to begin."
        />
      </Box>
      <WorkflowListDialogs actions={actions} />
      <WorkflowGovernanceSettingsDialog
        open={governanceDialog.value}
        settings={governanceSettings.data}
        loading={governanceSettings.isLoading}
        saving={updateGovernanceState.isLoading}
        onClose={governanceDialog.onFalse}
        onSave={async (values) => {
          try {
            await updateGovernance(values).unwrap();
            shikshaMitraToast.success({ message: 'Workflow governance updated' });
            governanceDialog.onFalse();
          } catch {
            shikshaMitraToast.error({ message: 'Unable to update workflow governance.' });
          }
        }}
      />
      <WorkflowGovernanceNotificationsDialog
        open={notificationsDialog.value}
        notifications={notificationsQuery.data}
        loading={notificationsQuery.isLoading}
        markingId={markingNotificationId}
        onClose={notificationsDialog.onFalse}
        onOpenWorkflow={(notification: AdmissionWorkflowNotification) => {
          notificationsDialog.onFalse();
          router.push(
            `${studentPaths.enrollment.settings.workflows}/${notification.workflowDefinitionId}`
          );
        }}
        onMarkRead={async (notification) => {
          setMarkingNotificationId(notification.id);
          try {
            await markNotificationRead(notification.id).unwrap();
            await notificationsQuery.refetch();
          } finally {
            setMarkingNotificationId(null);
          }
        }}
      />
    </Box>
  );
}
