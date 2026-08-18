'use client';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Alert, Stack, Button } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AdmissionQueryError } from './admission-query-error';
import { AdmissionOfferingTable } from './admission-offering-table';
import { AdmissionOfferingDialog } from './admission-offering-dialog';
import { AdmissionOfferingFilters } from './admission-offering-filters';
import { useAdmissionOfferingsScreen } from './use-admission-offerings-screen';
import { BulkAdmissionOfferingDialog } from './bulk-admission-offering-dialog';
import { AdmissionOfferingDetailsDialog } from './admission-offering-details-dialog';

export default function AdmissionOfferingsScreen() {
  const screen = useAdmissionOfferingsScreen();
  const action = screen.pendingAction?.type;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Admission Offerings"
        description="Configure the standards, admission windows, workflows, and forms available in each cycle."
        links={[
          { name: 'Students', href: '/student/dashboard' },
          { name: 'Enrollment', href: '/student/admissions' },
          { name: 'Admission Offerings' },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            {screen.permissions.bulkCreate && (
              <Button variant="outlined" size="small" startIcon={<Iconify icon={GlobalIcons.copy} />} disabled={!screen.cycle} onClick={screen.openBulk}>Bulk create</Button>
            )}
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon={GlobalIcons.addIcon} />}
              disabled={!screen.permissions.create || !screen.cycle}
              onClick={screen.openCreate}
            >
              Add offering
            </Button>
          </Stack>
        }
      />

      {screen.cycles.length === 0 && !screen.offeringsQuery.isLoading && (
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
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <AdmissionOfferingTable
          rows={screen.offeringsQuery.data?.items ?? []}
          loading={screen.offeringsQuery.isFetching || screen.loadingDetail}
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

      {screen.cycle && screen.dialogMode && (
        <AdmissionOfferingDialog
          open
          mode={screen.dialogMode}
          cycle={screen.cycle}
          offering={screen.selected}
          saving={screen.saving}
          onClose={screen.closeDialog}
          onSave={screen.save}
        />
      )}
      {screen.cycle && screen.bulkOpen && (
        <BulkAdmissionOfferingDialog open cycle={screen.cycle} onClose={screen.closeBulk} />
      )}
      <AdmissionOfferingDetailsDialog
        open={screen.detailsOpen}
        offering={screen.selected}
        onClose={screen.closeDetails}
      />
      <ConfirmDialog
        open={Boolean(screen.pendingAction)}
        onClose={screen.cancelAction}
        icon={action === 'delete' ? 'error' : 'warning'}
        title={`${action === 'delete' ? 'Delete' : action === 'activate' ? 'Activate' : 'Deactivate'} Admission Offering?`}
        content={
          action === 'delete'
            ? 'This is allowed only while no applications reference the offering. This action cannot be undone.'
            : `This will ${action} the offering for new inquiries and applications. Historical applications remain unchanged.`
        }
        action={
          <Button
            variant="contained"
            color={action === 'delete' ? 'error' : 'primary'}
            loading={screen.commanding}
            startIcon={<Iconify icon={action === 'delete' ? GlobalIcons.delete : GlobalIcons.submit} />}
            onClick={screen.confirmAction}
          >
            {action === 'delete' ? 'Delete' : 'Confirm'}
          </Button>
        }
      />
    </Box>
  );
}
