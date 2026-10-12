'use client';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Alert, Button } from '@mui/material';
import { studentPaths } from 'src/constants/student-menu';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AdmissionQueryError } from './admission-query-error';
import { AdmissionOfferingTable } from './admission-offering-table';
import { AdmissionOfferingDialog } from './admission-offering-dialog';
import { AdmissionOfferingFilters } from './admission-offering-filters';
import { useAdmissionOfferingsScreen } from './use-admission-offerings-screen';
import { BulkAdmissionOfferingDialog } from './bulk-admission-offering-dialog';
import { AdmissionOfferingMoreFilters } from './admission-offering-more-filters';
import { AdmissionOfferingActionImpact } from './admission-offering-action-impact';
import { AdmissionOfferingDetailsDrawer } from './admission-offering-details-drawer';
import { BulkAdmissionOfferingActivation } from './bulk-admission-offering-activation';

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
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: 'Settings', href: studentPaths.enrollment.settings.root },
          { name: 'Admission Offering' },
        ]}
        slotProps={{
          action: { alignSelf: 'flex-end' },
          heading: {},
          moreLink: {},
          breadcrumbs: {},
        }}
        action={
          screen.permissions.bulkCreate ? (
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon={GlobalIcons.addIcon} />}
              sx={{ minWidth: 140 }}
              disabled={!screen.cycle || screen.bulkActivation.busy}
              onClick={screen.openBulk}
            >
              Add Offering
            </Button>
          ) : null
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
        cycle={screen.cycle}
        values={screen.filters}
        onChange={screen.update}
        filterAction={
          <AdmissionOfferingMoreFilters
            cycles={screen.cycles}
            cycle={screen.cycle}
            values={screen.filters}
            onChange={screen.update}
          />
        }
      />
      <Box
        sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        <BulkAdmissionOfferingActivation
          activation={screen.bulkActivation}
          disabled={screen.bulkActivationDisabled}
        />
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
              screen.offeringsQuery.isFetching
            }
            totalCount={screen.offeringsQuery.data?.totalCount ?? 0}
            page={screen.filters.page}
            rowsPerPage={screen.filters.rowsPerPage}
            search={screen.filters.search}
            canEdit={screen.permissions.edit && !screen.bulkActivation.busy}
            canClone={screen.permissions.clone && !screen.bulkActivation.busy}
            canActivate={screen.permissions.activate && !screen.bulkActivation.busy}
            canDeactivate={screen.permissions.deactivate && !screen.bulkActivation.busy}
            canDelete={screen.permissions.delete && !screen.bulkActivation.busy}
            onView={(row) => {
              if (!screen.bulkActivation.busy) screen.openDetailed('view', row);
            }}
            onEdit={(row) => screen.openDetailed('edit', row)}
            onClone={(row) => screen.openDetailed('clone', row)}
            onToggleActive={screen.requestAction}
            onDelete={screen.requestDelete}
            onSearch={(search) => screen.update({ search })}
            onSort={(sorting) => screen.update({ sorting })}
            onPagination={(page, rowsPerPage) => screen.update({ page: page - 1, rowsPerPage })}
            selection={
              screen.permissions.activate
                ? {
                    selectedIds: screen.bulkActivation.selectedIds,
                    eligibleIds: screen.bulkActivation.eligibleRows.map((row) => row.id),
                    disabled: screen.bulkActivationDisabled || screen.bulkActivation.busy,
                    onToggle: screen.bulkActivation.toggleSelection,
                    onToggleAll: screen.bulkActivation.toggleAll,
                  }
                : undefined
            }
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
          loadingDetail={screen.loadingDetail}
          detailError={screen.detailError}
          onRetryDetail={screen.retryDetail}
          saving={screen.saving}
          onClose={screen.closeDialog}
          onSave={screen.save}
        />
      )}
      {screen.cycle && screen.bulkOpen && (
        <BulkAdmissionOfferingDialog
          open
          cycle={screen.cycle}
          initialIntakeSetupId={screen.initialIntakeSetupId}
          onClose={screen.closeBulk}
        />
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
        icon={action === 'activate' ? null : action === 'delete' ? 'error' : 'warning'}
        title={`${action === 'delete' ? 'Delete' : action === 'activate' ? 'Activate' : 'Deactivate'} Admission Offering?`}
        aria-label={`${action === 'delete' ? 'Delete' : action === 'activate' ? 'Activate' : 'Deactivate'} Admission Offering?`}
        aria-describedby="offering-action-description"
        disableBackdropClick
        disableCancel={screen.commanding}
        disableEscapeKeyDown={screen.commanding}
        content={
          action && screen.pendingAction ? (
            <Box id="offering-action-description">
              <AdmissionOfferingActionImpact action={action} offering={screen.pendingAction.row} />
            </Box>
          ) : null
        }
        action={
          <Button
            variant="contained"
            size="small"
            color={action === 'delete' ? 'error' : 'primary'}
            loading={screen.commanding}
            startIcon={
              <Iconify
                icon={action === 'delete' ? 'mdi:delete-outline' : 'mdi:check-circle-outline'}
              />
            }
            onClick={screen.confirmAction}
            sx={
              action === 'activate'
                ? { bgcolor: 'text.primary', color: 'background.paper' }
                : undefined
            }
          >
            {action === 'delete' ? 'Delete' : action === 'activate' ? 'Activate' : 'Deactivate'}
          </Button>
        }
      />
    </Box>
  );
}
