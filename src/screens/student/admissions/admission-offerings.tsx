'use client';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { studentPaths } from 'src/constants/student-menu';
import { Box, Alert, Stack, Button } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AdmissionQueryError } from './admission-query-error';
import { AdmissionOfferingTable } from './admission-offering-table';
import { AdmissionOfferingDialog } from './admission-offering-dialog';
import { AdmissionOfferingFilters } from './admission-offering-filters';
import { useAdmissionOfferingsScreen } from './use-admission-offerings-screen';
import { BulkAdmissionOfferingDialog } from './bulk-admission-offering-dialog';
import { AdmissionOfferingActionImpact } from './admission-offering-action-impact';
import { AdmissionOfferingDetailsDrawer } from './admission-offering-details-drawer';

export default function AdmissionOfferingsScreen() {
  const screen = useAdmissionOfferingsScreen();
  const action = screen.pendingAction?.type;
  const hasActiveFilters = Boolean(
    screen.filters.campusId ||
    screen.filters.boardId ||
    screen.filters.mediumId ||
    screen.filters.stageId ||
    screen.filters.standardId ||
    screen.filters.isActive ||
    screen.filters.availabilityStatus ||
    screen.filters.configurationStatus ||
    screen.filters.search
  );
  const filteredEmpty =
    hasActiveFilters &&
    !screen.cyclesQuery.isFetching &&
    !screen.offeringsQuery.isFetching &&
    !screen.offeringsQuery.isError &&
    screen.offeringsQuery.data?.totalCount === 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Admission Offering"
        description="Connect classes, admission periods, processes, and forms before accepting applications."
        links={[
          { name: 'Students', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: 'Settings', href: studentPaths.enrollment.settings.root },
          { name: 'Admission Offering' },
        ]}
        slotProps={{
          action: {
            width: { xs: 1, sm: 'auto' },
            '& > .MuiStack-root': { width: 1 },
            '& .MuiButton-root': { flex: { xs: 1, sm: '0 0 auto' } },
          },
          heading: { whiteSpace: 'nowrap', overflowWrap: 'normal' },
          moreLink: {},
          breadcrumbs: {},
        }}
        sx={{
          '& > .MuiStack-root': {
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'flex-start' },
            gap: { xs: 1, sm: 2 },
          },
        }}
        action={
          <Stack direction="row" spacing={1}>
            {screen.permissions.bulkCreate && (
              <Button
                variant="contained"
                size="small"
                startIcon={<Iconify icon={GlobalIcons.addIcon} />}
                disabled={!screen.cycle}
                onClick={screen.openBulk}
              >
                Add offering
              </Button>
            )}
          </Stack>
        }
      />

      {screen.cycles.length === 0 &&
        !screen.cyclesQuery.isLoading &&
        !screen.cyclesQuery.isFetching &&
        !screen.cyclesQuery.isError && (
          <Alert severity="info">
            Create a non-archived Admission Cycle before configuring offerings.
          </Alert>
        )}
      {screen.offeringsQuery.isError && (
        <AdmissionQueryError onRetry={() => screen.offeringsQuery.refetch()} />
      )}
      <AdmissionOfferingFilters
        cycles={screen.cycles}
        cycle={screen.cycle}
        values={screen.filters}
        onChange={screen.update}
      />
      <Box
        sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        {filteredEmpty && (
          <Alert
            severity="info"
            action={
              <Button
                size="small"
                color="inherit"
                startIcon={<Iconify icon="mdi:filter-remove-outline" />}
                onClick={screen.clearFilters}
              >
                Clear filters
              </Button>
            }
            sx={{ mb: 1 }}
          >
            No offerings match the current filters. Clear them to return to all offerings in this
            admission cycle.
          </Alert>
        )}
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <AdmissionOfferingTable
            rows={screen.offeringsQuery.data?.items ?? []}
            loading={
              screen.cyclesQuery.isLoading ||
              screen.cyclesQuery.isFetching ||
              screen.offeringsQuery.isFetching ||
              screen.loadingDetail
            }
            totalCount={screen.offeringsQuery.data?.totalCount ?? 0}
            page={screen.filters.page}
            rowsPerPage={screen.filters.rowsPerPage}
            search={screen.filters.search}
            canEdit={screen.permissions.edit}
            canClone={screen.permissions.clone}
            canActivate={screen.permissions.activate}
            canDeactivate={screen.permissions.deactivate}
            canDelete={screen.permissions.delete}
            onView={(row) => screen.openDetailed('view', row)}
            onEdit={(row) => screen.openDetailed('edit', row)}
            onClone={(row) => screen.openDetailed('clone', row)}
            onToggleActive={screen.requestAction}
            onDelete={screen.requestDelete}
            onSearch={(search) => screen.update({ search })}
            onSort={(sorting) => screen.update({ sorting })}
            onPagination={(page, rowsPerPage) => screen.update({ page: page - 1, rowsPerPage })}
          />
        </Box>
      </Box>

      {screen.cycle && screen.dialogMode && (
        <AdmissionOfferingDialog
          open
          mode={screen.dialogMode}
          cycle={screen.cycle}
          cycles={screen.cycles}
          offering={screen.selected}
          saving={screen.saving}
          onClose={screen.closeDialog}
          onSave={screen.save}
        />
      )}
      {screen.cycle && screen.bulkOpen && (
        <BulkAdmissionOfferingDialog open cycle={screen.cycle} onClose={screen.closeBulk} />
      )}
      <AdmissionOfferingDetailsDrawer
        open={screen.detailsOpen}
        offering={screen.selected}
        canManage={screen.permissions.edit}
        onClose={screen.closeDetails}
      />
      <ConfirmDialog
        open={Boolean(screen.pendingAction)}
        onClose={screen.cancelAction}
        icon={action === 'delete' ? 'error' : 'warning'}
        title={`${action === 'delete' ? 'Delete' : action === 'activate' ? 'Activate' : 'Deactivate'} Admission Offering?`}
        content={
          action && screen.pendingAction ? (
            <AdmissionOfferingActionImpact action={action} offering={screen.pendingAction.row} />
          ) : null
        }
        action={
          <Button
            variant="contained"
            size="small"
            color={action === 'delete' ? 'error' : 'primary'}
            loading={screen.commanding}
            startIcon={
              <Iconify icon={action === 'delete' ? GlobalIcons.delete : GlobalIcons.submit} />
            }
            onClick={screen.confirmAction}
          >
            {action === 'delete' ? 'Delete' : 'Confirm'}
          </Button>
        }
      />
    </Box>
  );
}
