'use client';

import { Box, Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { studentPaths } from 'src/constants/student-menu';
import { StudentFeedback } from 'src/components/student-feedback';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AdmissionQueryError } from './admission-query-error';
import { AdmissionOfferingTable } from './admission-offering-table';
import { AdmissionOfferingDialog } from './admission-offering-dialog';
import { AdmissionOfferingFilters } from './admission-offering-filters';
import { useAdmissionOfferingsScreen } from './use-admission-offerings-screen';
import { BulkAdmissionOfferingDialog } from './bulk-admission-offering-dialog';
import { AdmissionOfferingMoreFilters } from './admission-offering-more-filters';
import { AdmissionOfferingActionDialog } from './admission-offering-action-dialog';
import { AdmissionOfferingDetailsDrawer } from './admission-offering-details-drawer';
import { BulkAdmissionOfferingActivation } from './bulk-admission-offering-activation';

export default function AdmissionOfferingsScreen() {
  const screen = useAdmissionOfferingsScreen();
  const hasActiveFilters = Boolean(
    screen.filters.campusId ||
    screen.filters.stageId ||
    screen.filters.standardId ||
    screen.filters.isActive ||
    screen.filters.availabilityStatus ||
    screen.filters.configurationStatus ||
    screen.filters.search ||
    screen.filters.columnFilters
  );
  const filteredEmpty =
    hasActiveFilters &&
    !screen.cyclesQuery.isFetching &&
    !screen.offeringsQuery.isFetching &&
    !screen.offeringsQuery.isError &&
    screen.currentData?.totalCount === 0;
  const hasSafeRows = Boolean(screen.rows?.length);
  const listError = screen.offeringsQuery.isError || screen.cyclesQuery.isError;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        height: { xs: 'auto', sm: 1 },
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <CustomBreadcrumbs
        heading="Admission offerings"
        description="Connect classes, admission periods, processes, and forms before accepting applications."
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.root },
          { name: 'Settings', href: studentPaths.enrollment.settings.root },
          { name: 'Admission offerings' },
        ]}
        slotProps={{
          action: { alignSelf: { xs: 'flex-end', md: 'center' }, maxWidth: '100%' },
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
              disabled={!screen.cycle || screen.bulkActivation.busy}
              onClick={screen.openBulk}
            >
              Add offering
            </Button>
          ) : null
        }
      />

      {screen.cycles.length === 0 &&
        !screen.cyclesQuery.isLoading &&
        !screen.cyclesQuery.isFetching &&
        !screen.cyclesQuery.isError && (
          <StudentFeedback notificationKey="STU-0132" presentation="inline" severity="info">
            Create a non-archived Admission Cycle before configuring offerings.
          </StudentFeedback>
        )}
      {listError && hasSafeRows && (
        <AdmissionQueryError
          onRetry={() =>
            screen.cyclesQuery.isError
              ? screen.cyclesQuery.refetch()
              : screen.offeringsQuery.refetch()
          }
        />
      )}
      <AdmissionOfferingFilters
        cycle={screen.cycle}
        cycles={screen.cycles}
        cyclesLoading={screen.cyclesQuery.isFetching}
        values={screen.filters}
        onChange={screen.update}
        filterAction={
          <AdmissionOfferingMoreFilters
            cycle={screen.cycle}
            values={screen.filters}
            onChange={screen.update}
          />
        }
      />
      <Box
        sx={{
          flex: 1,
          minHeight: { xs: 400, sm: 0 },
          minWidth: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <BulkAdmissionOfferingActivation
          activation={screen.bulkActivation}
          disabled={screen.bulkActivationDisabled}
        />
        <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
          <AdmissionOfferingTable
            rows={screen.rows ?? []}
            filters={screen.tableFilters}
            columnOptions={screen.columnOptions}
            onFilters={screen.applyTableFilters}
            sorting={screen.filters.sorting}
            filteredEmpty={filteredEmpty}
            prerequisite={
              !screen.cycle
                ? 'Create an admission period to configure offerings.'
                : !screen.filters.boardId || !screen.filters.mediumId
                  ? 'Select a board and medium to view admission offerings.'
                  : undefined
            }
            onClearFilters={screen.clearFilters}
            loading={
              screen.cyclesQuery.isLoading ||
              (screen.cyclesQuery.isFetching && !screen.cycles.length) ||
              (screen.offeringsQuery.isFetching && !screen.currentData)
            }
            refreshing={screen.offeringsQuery.isFetching && Boolean(screen.currentData)}
            errorContent={
              listError && !hasSafeRows ? (
                <AdmissionQueryError
                  onRetry={() =>
                    screen.cyclesQuery.isError
                      ? screen.cyclesQuery.refetch()
                      : screen.offeringsQuery.refetch()
                  }
                />
              ) : undefined
            }
            totalCount={screen.currentData?.totalCount ?? 0}
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
          onClose={screen.closeBulk}
          onCreated={screen.showCreatedOfferings}
          onCycleChange={screen.selectCycle}
        />
      )}
      <AdmissionOfferingDetailsDrawer
        open={screen.detailsOpen}
        offering={screen.selected}
        canManage={screen.permissions.edit}
        onClose={screen.closeDetails}
      />
      <AdmissionOfferingActionDialog
        pendingAction={screen.pendingAction}
        commanding={screen.commanding}
        onClose={screen.cancelAction}
        onConfirm={screen.confirmAction}
      />
    </Box>
  );
}
