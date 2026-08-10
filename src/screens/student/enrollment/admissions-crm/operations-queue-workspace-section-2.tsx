'use client';

import type { IParams } from 'src/components/customizabaleTable/types';

import dynamic from 'next/dynamic';

import { shikshaMitraToast } from 'src/components/toast';

import { LoadingButton } from 'src/components/loading-button';

import CustomizableTable from 'src/components/customizabaleTable';

import BookmarkAddOutlined from '@mui/icons-material/BookmarkAddOutlined';

import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';

import {
  Box,
  Chip,
  Stack,
  Paper,
  Button,
  Dialog,
  Divider,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import {
  AdmissionCrmRouteType,
  AdmissionCrmSeatOfferStatus,
  AdmissionCrmActivationStatus,
} from 'src/redux/student/admissions-crm/final-admission-contracts';

import {
  AdmissionCrmRegistrationStatus,
  AdmissionCrmApplicantDocumentStatus,
} from 'src/redux/student/admissions-crm/registration-documents-contracts';

import { AdmissionCrmOperationsQueueType } from 'src/redux/student/admissions-crm/operations-governance-contracts';

import { AdmissionCrmServiceHandoffStatus } from 'src/redux/student/admissions-crm/core-leads-contracts';

import { createApplicantRowNavigationProps } from './applicant-row-navigation';

import { IntegrationCapabilitiesPanel } from './integration-capabilities-panel';

import { parseEnrollmentTableSorts, serializeEnrollmentTableSort } from './workspace-table-sorting';

import {
  enrollmentTableWrapperSx,
  EnrollmentTableEmptyState,
  enrollmentTableContainerSx,
  EnrollmentWorkspaceErrorState,
} from './workspace-table-patterns';

import { useOperationsQueueWorkspace } from './operations-queue-workspace-context';

const RteAllotmentImport = dynamic(() =>
  import('./rte-allotment-import').then((module) => module.RteAllotmentImport)
);

const AdmissionsDataQuality = dynamic(() =>
  import('./admissions-data-quality').then((module) => module.AdmissionsDataQuality)
);

const pageSize = 50;

const queueLabels: Record<AdmissionCrmOperationsQueueType, string> = {
  [AdmissionCrmOperationsQueueType.UnassignedExam]: 'Unassigned Exams',
  [AdmissionCrmOperationsQueueType.CapacityConflict]: 'Capacity Conflicts',
  [AdmissionCrmOperationsQueueType.NoShow]: 'Exam No-shows',
  [AdmissionCrmOperationsQueueType.RegistrationInvitationPending]: 'Ready to Invite',
  [AdmissionCrmOperationsQueueType.PendingPaperEntry]: 'Paper Entry',
  [AdmissionCrmOperationsQueueType.ExpiringRegistrationLink]: 'Expiring Links',
  [AdmissionCrmOperationsQueueType.IncompleteRegistration]: 'Incomplete Registrations',
  [AdmissionCrmOperationsQueueType.RejectedDocument]: 'Rejected Documents',
  [AdmissionCrmOperationsQueueType.DocumentVerificationBacklog]: 'Document Verification',
  [AdmissionCrmOperationsQueueType.AdmissionReady]: 'Admission Ready',
  [AdmissionCrmOperationsQueueType.PolicyException]: 'Policy Exceptions',
  [AdmissionCrmOperationsQueueType.PaymentCondition]: 'Payment Conditions',
  [AdmissionCrmOperationsQueueType.HouseholdResolution]: 'Household Resolution',
  [AdmissionCrmOperationsQueueType.IdentityConflict]: 'Identity Conflicts',
  [AdmissionCrmOperationsQueueType.FinalApproval]: 'Final Approval',
  [AdmissionCrmOperationsQueueType.ActivationRepair]: 'Activation Repair',
  [AdmissionCrmOperationsQueueType.RouteEligibilityReview]: 'Route Eligibility',
  [AdmissionCrmOperationsQueueType.GovernmentAllotmentReconciliation]: 'RTE Reconciliation',
  [AdmissionCrmOperationsQueueType.TransferEvidencePending]: 'Transfer Evidence',
  [AdmissionCrmOperationsQueueType.ReturningIdentityMatch]: 'Returning Identity Match',
  [AdmissionCrmOperationsQueueType.CancellationReview]: 'Cancellation Review',
  [AdmissionCrmOperationsQueueType.RouteAppealReview]: 'Route Appeals',
  [AdmissionCrmOperationsQueueType.ServiceHandoffException]: 'Service Handoff Exceptions',
};

const getLatestFilter = (filters: IParams['filters'], column: string) =>
  [...filters].reverse().find((filter) => filter.column === column)?.value;

const getLatestEnumFilter = <T extends number>(filters: IParams['filters'], column: string) => {
  const value = getLatestFilter(filters, column);
  return value === undefined || value === null || value === '' ? undefined : (Number(value) as T);
};

const getLatestNumberFilter = (filters: IParams['filters'], column: string) => {
  const value = getLatestFilter(filters, column);
  return value === undefined || value === null || value === '' ? undefined : Number(value);
};

const getLatestStringFilter = (filters: IParams['filters'], column: string) => {
  const value = getLatestFilter(filters, column);
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
};

export function OperationsQueueSection2() {
  const { state: controllerState, actions, meta } = useOperationsQueueWorkspace();
  const {
    academicYearId,
    allowedQueues,
    applicantTab,
    applySavedView,
    columnFilters,
    columns,
    createSavedViewState,
    deleteSavedView,
    deleteSavedViewState,
    description,
    handleSaveView,
    items,
    openApplicant,
    owner,
    page,
    queueQuery,
    savedViewName,
    savedViewsOpen,
    savedViewsQuery,
    search,
    selectedQueue,
    setColumnFilters,
    setSavedViewName,
    setSavedViewsOpen,
    setSearch,
    setShowUtilities,
    showOperationsUtilities,
    showUtilities,
    state,
    tableFilters,
    title,
    updateState,
    variant,
  } = { ...controllerState, ...actions, ...meta };

  if (!academicYearId) return null;

  return (
    <>
      <Dialog
        open={savedViewsOpen}
        onClose={() => setSavedViewsOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Saved Views</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
              <TextField
                fullWidth
                size="small"
                label="View name"
                value={savedViewName}
                onChange={(event) => setSavedViewName(event.target.value)}
                autoComplete="off"
              />
              <LoadingButton
                variant="contained"
                startIcon={<BookmarkAddOutlined />}
                loading={createSavedViewState.isLoading}
                disabled={!savedViewName.trim()}
                onClick={handleSaveView}
              >
                Save Current
              </LoadingButton>
            </Stack>
            <Divider />
            <Stack direction="row" gap={0.75} flexWrap="wrap">
              {(savedViewsQuery.data || [])
                .filter((view) => allowedQueues.includes(view.queueType))
                .map((view) => (
                  <Chip
                    key={view.id}
                    label={view.name}
                    onClick={() => {
                      applySavedView(view);
                      setSavedViewsOpen(false);
                    }}
                    onDelete={async () => {
                      try {
                        await deleteSavedView({ viewId: view.id }).unwrap();
                        shikshaMitraToast.success({ message: 'Saved view deleted.' });
                      } catch {
                        shikshaMitraToast.error({
                          message: 'The saved view could not be deleted.',
                        });
                      }
                    }}
                    deleteIcon={<DeleteOutlineRounded />}
                    disabled={deleteSavedViewState.isLoading}
                  />
                ))}
              {!(savedViewsQuery.data || []).some((view) =>
                allowedQueues.includes(view.queueType)
              ) ? (
                <Typography variant="body2" color="text.secondary">
                  No saved views for this workspace.
                </Typography>
              ) : null}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSavedViewsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      {queueQuery.isError ? (
        <EnrollmentWorkspaceErrorState
          message="This operations queue is unavailable."
          onRetry={() => queueQuery.refetch()}
        />
      ) : (
        <CustomizableTable
          tableId={`student-enrollment-operations-${selectedQueue}`}
          tableTitle={queueLabels[selectedQueue]}
          columns={columns}
          data={queueQuery.data?.items || []}
          isLoading={queueQuery.isLoading}
          serverSide
          serverSidePagination
          serverSideSearch
          serverSideSort
          serverSideSortMode="single"
          serverSideFilter
          searchTerm={search}
          defaultSearchTerm={search}
          searchFieldProps={{
            placeholder: 'Search this queue',
            inputProps: { 'aria-label': 'Search this admissions queue' },
          }}
          totalCount={queueQuery.data?.totalCount || 0}
          filters={[...tableFilters, ...columnFilters]}
          sorts={parseEnrollmentTableSorts(state.sorting, columns)}
          page={page}
          rowsPerPage={pageSize}
          defaultRowsPerPage={pageSize}
          rowsPerPageOptions={[pageSize]}
          onServerSearch={setSearch}
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
            const stateFilterColumns = new Set([
              'registration',
              'documents',
              'decision',
              'route',
              'activationStatus',
              'retry',
              'due',
              'severity',
              'owner',
              'assignment',
              'seatPool',
            ]);
            setColumnFilters(filters.filter((filter) => !stateFilterColumns.has(filter.column)));
            updateState(
              {
                registrationStatus: getLatestEnumFilter<AdmissionCrmRegistrationStatus>(
                  filters,
                  'registration'
                ),
                documentStatus: getLatestEnumFilter<AdmissionCrmApplicantDocumentStatus>(
                  filters,
                  'documents'
                ),
                offerStatus: getLatestEnumFilter<AdmissionCrmSeatOfferStatus>(filters, 'decision'),
                routeType: getLatestEnumFilter<AdmissionCrmRouteType>(filters, 'route'),
                activationStatus: getLatestEnumFilter<AdmissionCrmActivationStatus>(
                  filters,
                  'activationStatus'
                ),
                serviceHandoffStatus: getLatestEnumFilter<AdmissionCrmServiceHandoffStatus>(
                  filters,
                  'retry'
                ),
                minimumAgeDays: getLatestNumberFilter(filters, 'due'),
                urgent: getLatestFilter(filters, 'severity') === true || undefined,
                owner:
                  getLatestStringFilter(filters, 'owner') ||
                  getLatestStringFilter(filters, 'assignment'),
                seatPoolId: getLatestStringFilter(filters, 'seatPool'),
                page: 1,
              },
              'push'
            );
          }}
          noDataText={
            <EnrollmentTableEmptyState
              title="Queue cleared"
              description="No applicants currently need action in this queue."
            />
          }
          rowProps={(row) => ({
            ...createApplicantRowNavigationProps({
              applicantName: row.applicantName,
              onOpen: () => openApplicant(row.leadId, applicantTab),
            }),
            'data-testid': 'student-enrollment-operations-row',
            'data-queue-key': row.key,
          })}
          wrapperProps={showOperationsUtilities ? undefined : { sx: enrollmentTableWrapperSx }}
          tableContainerProps={{ sx: enrollmentTableContainerSx }}
        />
      )}
      {showOperationsUtilities && (
        <Stack spacing={1.5}>
          <IntegrationCapabilitiesPanel academicYearId={academicYearId} />
          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                <Box>
                  <Typography variant="subtitle2">Operations Utilities</Typography>
                  <Typography variant="body2" color="text.secondary">
                    RTE allotment reconciliation and data-quality exception handling.
                  </Typography>
                </Box>
                <Button size="small" onClick={() => setShowUtilities((current) => !current)}>
                  {showUtilities ? 'Hide' : 'Open'}
                </Button>
              </Stack>
              {showUtilities && (
                <Stack spacing={2}>
                  <Divider />
                  <RteAllotmentImport academicYearId={academicYearId} />
                  <AdmissionsDataQuality academicYearId={academicYearId} />
                </Stack>
              )}
            </Stack>
          </Paper>
        </Stack>
      )}
    </>
  );
}
