'use client';

import type {
  AdmissionCrmStaffLookupDto,
  AdmissionCrmOperationsSavedViewDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import dynamic from 'next/dynamic';
import { useMemo, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import CustomizableTable from 'src/components/customizabaleTable';
import BookmarkAddOutlined from '@mui/icons-material/BookmarkAddOutlined';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Paper,
  Button,
  Switch,
  Divider,
  MenuItem,
  TextField,
  Typography,
  Autocomplete,
  FormControlLabel,
} from '@mui/material';
import {
  AdmissionCrmRouteType,
  AdmissionCrmSeatOfferStatus,
  useGetAdmissionCrmStaffQuery,
  AdmissionCrmActivationStatus,
  AdmissionCrmRegistrationStatus,
  AdmissionCrmOperationsQueueType,
  AdmissionCrmServiceHandoffStatus,
  useGetAdmissionCrmSeatPoolsQuery,
  AdmissionCrmApplicantDocumentStatus,
  useGetAdmissionCrmOperationsQueueQuery,
  useGetAdmissionCrmOperationsSavedViewsQuery,
  useGetAdmissionCrmOperationsQueueSummaryQuery,
  useCreateAdmissionCrmOperationsSavedViewMutation,
  useDeleteAdmissionCrmOperationsSavedViewMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { formatEnumLabel } from './enrollment-display';
import { EnrollmentWorkspaceHeader } from './workspace-header';
import { useEnrollmentWorkspace } from './enrollment-workspace-context';
import { ApplicantWorkspaceDrawer } from './applicant-workspace-drawer';
import { IntegrationCapabilitiesPanel } from './integration-capabilities-panel';
import {
  buildOperationsQueueColumns,
  type EnrollmentQueueVariant,
} from './operations-queue-columns';
import {
  EnrollmentTableEmptyState,
  EnrollmentWorkspaceErrorState,
  EnrollmentWorkspaceFilterPanel,
} from './workspace-table-patterns';

import type { ApplicantDrawerTab } from './applicant-workspace-drawer';

const RteAllotmentImport = dynamic(() =>
  import('./rte-allotment-import').then((module) => module.RteAllotmentImport)
);
const AdmissionsDataQuality = dynamic(() =>
  import('./admissions-data-quality').then((module) => module.AdmissionsDataQuality)
);

type Props = {
  title: string;
  description: string;
  defaultQueue: AdmissionCrmOperationsQueueType;
  allowedQueues?: AdmissionCrmOperationsQueueType[];
  applicantTab?: ApplicantDrawerTab;
  variant?: EnrollmentQueueVariant;
  showOperationsUtilities?: boolean;
};

const pageSize = 50;
const queueLabels: Record<AdmissionCrmOperationsQueueType, string> = {
  [AdmissionCrmOperationsQueueType.UnassignedExam]: 'Unassigned Exams',
  [AdmissionCrmOperationsQueueType.CapacityConflict]: 'Capacity Conflicts',
  [AdmissionCrmOperationsQueueType.NoShow]: 'Exam No-shows',
  [AdmissionCrmOperationsQueueType.RegistrationInvitationPending]: 'Ready to Invite',
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

const queueDescriptions: Partial<Record<AdmissionCrmOperationsQueueType, string>> = {
  [AdmissionCrmOperationsQueueType.UnassignedExam]:
    'Exam-ready applicants who still need a slot assignment.',
  [AdmissionCrmOperationsQueueType.CapacityConflict]:
    'Exam assignments that exceed the configured slot capacity.',
  [AdmissionCrmOperationsQueueType.NoShow]: 'Absent applicants and overdue attendance decisions.',
  [AdmissionCrmOperationsQueueType.RegistrationInvitationPending]:
    'Eligible applicants who can now be issued a registration form.',
  [AdmissionCrmOperationsQueueType.ExpiringRegistrationLink]:
    'Registration links approaching their expiry date.',
  [AdmissionCrmOperationsQueueType.IncompleteRegistration]:
    'Issued forms that families have not yet completed.',
  [AdmissionCrmOperationsQueueType.RejectedDocument]:
    'Documents returned to families for correction or replacement.',
  [AdmissionCrmOperationsQueueType.DocumentVerificationBacklog]:
    'Uploaded documents awaiting staff review.',
  [AdmissionCrmOperationsQueueType.AdmissionReady]:
    'Verified registrations with all blocking requirements resolved.',
  [AdmissionCrmOperationsQueueType.FinalApproval]:
    'Admission-ready applicants awaiting the final decision.',
  [AdmissionCrmOperationsQueueType.PolicyException]:
    'Applicants with a policy exception requiring review.',
  [AdmissionCrmOperationsQueueType.PaymentCondition]:
    'Offer or activation work waiting on a manually recorded payment condition.',
  [AdmissionCrmOperationsQueueType.GovernmentAllotmentReconciliation]:
    'Imported RTE allotments that require reconciliation.',
  [AdmissionCrmOperationsQueueType.ActivationRepair]:
    'Partially completed activations that can be retried safely.',
};

const allQueues = Object.values(AdmissionCrmOperationsQueueType).filter(
  (value): value is AdmissionCrmOperationsQueueType => typeof value === 'number'
);

const enumOptions = <T extends number>(source: Record<string, string | number>) =>
  Object.entries(source)
    .filter((entry): entry is [string, T] => typeof entry[1] === 'number')
    .map(([key, value]) => ({ value, label: formatEnumLabel(key) }));

export function OperationsQueueWorkspace({
  title,
  description,
  defaultQueue,
  allowedQueues = allQueues,
  applicantTab = 'overview',
  variant = 'operations',
  showOperationsUtilities = false,
}: Props) {
  const { academicYearId, state, updateState, openApplicant, closeApplicant } =
    useEnrollmentWorkspace();
  const selectedQueue =
    state.queue != null && allowedQueues.includes(state.queue) ? state.queue : defaultQueue;
  const page = Math.max(0, state.page - 1);
  const [search, setSearch] = useState('');
  const [staffSearch, setStaffSearch] = useState('');
  const [debouncedStaffSearch, setDebouncedStaffSearch] = useState('');
  const [owner, setOwner] = useState<AdmissionCrmStaffLookupDto | null>(null);
  const [assignee, setAssignee] = useState<AdmissionCrmStaffLookupDto | null>(null);
  const [savedViewName, setSavedViewName] = useState('');
  const [showUtilities, setShowUtilities] = useState(false);
  const seatPoolsQuery = useGetAdmissionCrmSeatPoolsQuery(
    { academicYearId: academicYearId || '', maxResultCount: 100 },
    { skip: !academicYearId || variant !== 'offer' }
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedStaffSearch(staffSearch.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [staffSearch]);

  const staffQuery = useGetAdmissionCrmStaffQuery(
    {
      filter: debouncedStaffSearch || undefined,
      ids: [state.owner, state.assignee].filter(Boolean).join(',') || undefined,
      maxResultCount: 25,
    },
    { skip: !academicYearId }
  );
  const summaryQuery = useGetAdmissionCrmOperationsQueueSummaryQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId }
  );
  const queueQuery = useGetAdmissionCrmOperationsQueueQuery(
    {
      academicYearId: academicYearId || '',
      queueType: selectedQueue,
      search: search.trim() || undefined,
      ownerUserId: state.owner && state.owner !== 'me' ? state.owner : undefined,
      assignedToUserId: state.assignee,
      urgentOnly: state.urgent || undefined,
      minimumAgeDays: state.minimumAgeDays,
      registrationStatus: state.registrationStatus,
      documentStatus: state.documentStatus,
      offerStatus: state.offerStatus,
      routeType: state.routeType,
      seatPoolId: state.seatPoolId,
      activationStatus: state.activationStatus,
      serviceHandoffStatus: state.serviceHandoffStatus,
      skipCount: page * pageSize,
      maxResultCount: pageSize,
    },
    { skip: !academicYearId }
  );
  const rowOwnerIds = useMemo(
    () =>
      Array.from(
        new Set(
          (queueQuery.data?.items || [])
            .map((item) => item.ownerUserId)
            .filter((value): value is string => Boolean(value))
        )
      ).join(','),
    [queueQuery.data?.items]
  );
  const rowStaffQuery = useGetAdmissionCrmStaffQuery(
    { ids: rowOwnerIds, maxResultCount: 1 },
    { skip: !academicYearId || !rowOwnerIds }
  );
  const savedViewsQuery = useGetAdmissionCrmOperationsSavedViewsQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId }
  );
  const [createSavedView, createSavedViewState] =
    useCreateAdmissionCrmOperationsSavedViewMutation();
  const [deleteSavedView, deleteSavedViewState] =
    useDeleteAdmissionCrmOperationsSavedViewMutation();

  useEffect(() => {
    const options = staffQuery.data || [];
    setOwner(options.find((item) => item.id === state.owner) || null);
    setAssignee(options.find((item) => item.id === state.assignee) || null);
  }, [staffQuery.data, state.assignee, state.owner]);

  const queueCounts = useMemo(
    () =>
      allowedQueues.map((queueType) => {
        const summary = summaryQuery.data?.queues.find((item) => item.queueType === queueType);
        return {
          queueType,
          label: queueLabels[queueType],
          count: summary?.count || 0,
          urgentCount: summary?.urgentCount || 0,
        };
      }),
    [allowedQueues, summaryQuery.data?.queues]
  );

  const staffById = useMemo(
    () =>
      new Map(
        [...(staffQuery.data || []), ...(rowStaffQuery.data || [])].map((staff) => [
          staff.id,
          staff.displayName,
        ])
      ),
    [rowStaffQuery.data, staffQuery.data]
  );
  const columns = useMemo(
    () => buildOperationsQueueColumns({ variant, applicantTab, openApplicant, staffById }),
    [applicantTab, openApplicant, staffById, variant]
  );

  const applySavedView = (savedView: AdmissionCrmOperationsSavedViewDto) => {
    if (!allowedQueues.includes(savedView.queueType)) {
      shikshaMitraToast.error({
        message: 'This saved view belongs to another Enrollment workspace.',
      });
      return;
    }
    setSearch('');
    updateState(
      {
        queue: savedView.queueType,
        owner: savedView.filters.ownerUserId,
        assignee: savedView.filters.assignedToUserId,
        urgent: savedView.filters.urgentOnly || undefined,
        minimumAgeDays: savedView.filters.minimumAgeDays,
        registrationStatus: savedView.filters.registrationStatus,
        documentStatus: savedView.filters.documentStatus,
        offerStatus: savedView.filters.offerStatus,
        routeType: savedView.filters.routeType,
        seatPoolId: savedView.filters.seatPoolId,
        activationStatus: savedView.filters.activationStatus,
        serviceHandoffStatus: savedView.filters.serviceHandoffStatus,
        page: 1,
      },
      'push'
    );
  };

  const handleSaveView = async () => {
    if (!academicYearId || !savedViewName.trim()) return;
    try {
      await createSavedView({
        academicYearId,
        name: savedViewName.trim(),
        queueType: selectedQueue,
        filters: {
          ownerUserId: state.owner && state.owner !== 'me' ? state.owner : undefined,
          assignedToUserId: state.assignee,
          urgentOnly: state.urgent || undefined,
          minimumAgeDays: state.minimumAgeDays,
          registrationStatus: state.registrationStatus,
          documentStatus: state.documentStatus,
          offerStatus: state.offerStatus,
          routeType: state.routeType,
          seatPoolId: state.seatPoolId,
          activationStatus: state.activationStatus,
          serviceHandoffStatus: state.serviceHandoffStatus,
        },
        isShared: false,
      }).unwrap();
      setSavedViewName('');
      shikshaMitraToast.success({ message: 'Operations view saved.' });
    } catch {
      shikshaMitraToast.error({ message: 'The operations view could not be saved.' });
    }
  };

  if (!academicYearId) {
    return (
      <Alert severity="info">Select an academic year to open this Enrollment workspace.</Alert>
    );
  }

  return (
    <Stack spacing={1.5}>
      <EnrollmentWorkspaceHeader title={title} description={description} />

      <EnrollmentWorkspaceFilterPanel
        columns={{ xs: 1, sm: 2, lg: 4 }}
        clearDisabled={
          !state.owner &&
          !state.assignee &&
          !state.minimumAgeDays &&
          !state.urgent &&
          state.registrationStatus == null &&
          state.documentStatus == null &&
          state.offerStatus == null &&
          state.routeType == null &&
          !state.seatPoolId &&
          state.activationStatus == null &&
          state.serviceHandoffStatus == null
        }
        onClear={() =>
          updateState(
            {
              owner: undefined,
              assignee: undefined,
              minimumAgeDays: undefined,
              urgent: undefined,
              registrationStatus: undefined,
              documentStatus: undefined,
              offerStatus: undefined,
              routeType: undefined,
              seatPoolId: undefined,
              activationStatus: undefined,
              serviceHandoffStatus: undefined,
              page: 1,
            },
            'push'
          )
        }
        actions={
          <Stack spacing={1} sx={{ width: '100%' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} gap={1} alignItems={{ md: 'center' }}>
              <TextField
                select
                size="small"
                label="Saved view"
                value=""
                onChange={(event) => {
                  const view = savedViewsQuery.data?.find((item) => item.id === event.target.value);
                  if (view) applySavedView(view);
                }}
                sx={{ minWidth: 220 }}
              >
                {(savedViewsQuery.data || [])
                  .filter((view) => allowedQueues.includes(view.queueType))
                  .map((view) => (
                    <MenuItem key={view.id} value={view.id}>
                      {view.name}
                    </MenuItem>
                  ))}
              </TextField>
              <TextField
                size="small"
                label="New view name"
                value={savedViewName}
                onChange={(event) => setSavedViewName(event.target.value)}
                autoComplete="off"
                sx={{ minWidth: 220 }}
              />
              <LoadingButton
                size="small"
                variant="outlined"
                startIcon={<BookmarkAddOutlined />}
                loading={createSavedViewState.isLoading}
                disabled={!savedViewName.trim()}
                onClick={handleSaveView}
                sx={{ color: 'primary.darker', borderColor: 'primary.darker' }}
              >
                Save View
              </LoadingButton>
            </Stack>
            {(savedViewsQuery.data || []).some((view) => allowedQueues.includes(view.queueType)) ? (
              <Stack direction="row" gap={0.75} flexWrap="wrap">
                {(savedViewsQuery.data || [])
                  .filter((view) => allowedQueues.includes(view.queueType))
                  .map((view) => (
                    <Chip
                      key={view.id}
                      label={view.name}
                      onClick={() => applySavedView(view)}
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
              </Stack>
            ) : null}
          </Stack>
        }
      >
        <TextField
          select
          size="small"
          label="Work queue"
          value={selectedQueue}
          helperText={queueDescriptions[selectedQueue] || 'Applicants requiring staff action.'}
          onChange={(event) =>
            updateState(
              { queue: Number(event.target.value) as AdmissionCrmOperationsQueueType, page: 1 },
              'push'
            )
          }
        >
          {queueCounts.map((queue) => (
            <MenuItem key={queue.queueType} value={queue.queueType}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                gap={1}
                sx={{ width: '100%' }}
              >
                <span>{queue.label}</span>
                <Stack direction="row" gap={0.5} alignItems="center">
                  <Chip size="small" variant="outlined" label={queue.count} />
                  {queue.urgentCount > 0 ? (
                    <Chip size="small" color="warning" label={`${queue.urgentCount} urgent`} />
                  ) : null}
                </Stack>
              </Stack>
            </MenuItem>
          ))}
        </TextField>
        {variant === 'registration' ? (
          <>
            <TextField
              select
              size="small"
              label="Registration status"
              value={state.registrationStatus ?? ''}
              onChange={(event) =>
                updateState({
                  registrationStatus:
                    event.target.value === ''
                      ? undefined
                      : (Number(event.target.value) as AdmissionCrmRegistrationStatus),
                  page: 1,
                })
              }
            >
              <MenuItem value="">All statuses</MenuItem>
              {enumOptions<AdmissionCrmRegistrationStatus>(AdmissionCrmRegistrationStatus).map(
                (option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                )
              )}
            </TextField>
            <TextField
              select
              size="small"
              label="Document status"
              value={state.documentStatus ?? ''}
              onChange={(event) =>
                updateState({
                  documentStatus:
                    event.target.value === ''
                      ? undefined
                      : (Number(event.target.value) as AdmissionCrmApplicantDocumentStatus),
                  page: 1,
                })
              }
            >
              <MenuItem value="">All documents</MenuItem>
              {enumOptions<AdmissionCrmApplicantDocumentStatus>(
                AdmissionCrmApplicantDocumentStatus
              ).map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </>
        ) : null}
        {variant === 'offer' ? (
          <>
            <TextField
              select
              size="small"
              label="Offer status"
              value={state.offerStatus ?? ''}
              onChange={(event) =>
                updateState({
                  offerStatus:
                    event.target.value === ''
                      ? undefined
                      : (Number(event.target.value) as AdmissionCrmSeatOfferStatus),
                  page: 1,
                })
              }
            >
              <MenuItem value="">All offers</MenuItem>
              {enumOptions<AdmissionCrmSeatOfferStatus>(AdmissionCrmSeatOfferStatus).map(
                (option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                )
              )}
            </TextField>
            <TextField
              select
              size="small"
              label="Admission route"
              value={state.routeType ?? ''}
              onChange={(event) =>
                updateState({
                  routeType:
                    event.target.value === ''
                      ? undefined
                      : (Number(event.target.value) as AdmissionCrmRouteType),
                  page: 1,
                })
              }
            >
              <MenuItem value="">All routes</MenuItem>
              {enumOptions<AdmissionCrmRouteType>(AdmissionCrmRouteType).map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Seat pool"
              value={state.seatPoolId || ''}
              onChange={(event) =>
                updateState({ seatPoolId: event.target.value || undefined, page: 1 })
              }
            >
              <MenuItem value="">All seat pools</MenuItem>
              {(seatPoolsQuery.data?.items || []).map((pool) => (
                <MenuItem key={pool.id} value={pool.id}>
                  {pool.name}
                </MenuItem>
              ))}
            </TextField>
          </>
        ) : null}
        {variant === 'activation' ? (
          <TextField
            select
            size="small"
            label="Activation status"
            value={state.activationStatus ?? ''}
            onChange={(event) =>
              updateState({
                activationStatus:
                  event.target.value === ''
                    ? undefined
                    : (Number(event.target.value) as AdmissionCrmActivationStatus),
                page: 1,
              })
            }
          >
            <MenuItem value="">All statuses</MenuItem>
            {enumOptions<AdmissionCrmActivationStatus>(AdmissionCrmActivationStatus).map(
              (option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              )
            )}
          </TextField>
        ) : null}
        {variant === 'operations' ? (
          <TextField
            select
            size="small"
            label="Handoff status"
            value={state.serviceHandoffStatus ?? ''}
            onChange={(event) =>
              updateState({
                serviceHandoffStatus:
                  event.target.value === ''
                    ? undefined
                    : (Number(event.target.value) as AdmissionCrmServiceHandoffStatus),
                page: 1,
              })
            }
          >
            <MenuItem value="">All handoff states</MenuItem>
            {enumOptions<AdmissionCrmServiceHandoffStatus>(AdmissionCrmServiceHandoffStatus).map(
              (option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              )
            )}
          </TextField>
        ) : null}
        <Autocomplete
          size="small"
          options={staffQuery.data || []}
          value={owner}
          inputValue={staffSearch}
          onInputChange={(_, value) => setStaffSearch(value)}
          onChange={(_, value) => updateState({ owner: value?.id, page: 1 })}
          getOptionLabel={(option) => `${option.displayName} (${option.userName})`}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={(params) => <TextField {...params} label="Lead owner" />}
          sx={{ minWidth: { lg: 240 } }}
        />
        <Autocomplete
          size="small"
          options={staffQuery.data || []}
          value={assignee}
          onChange={(_, value) => updateState({ assignee: value?.id, page: 1 })}
          getOptionLabel={(option) => `${option.displayName} (${option.userName})`}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={(params) => <TextField {...params} label="Assigned staff" />}
          sx={{ minWidth: { lg: 240 } }}
        />
        <TextField
          size="small"
          type="number"
          label="Minimum age (days)"
          value={state.minimumAgeDays || ''}
          onChange={(event) =>
            updateState({
              minimumAgeDays: event.target.value ? Number(event.target.value) : undefined,
              page: 1,
            })
          }
          inputProps={{ min: 1, max: 3650 }}
          sx={{ width: { lg: 170 } }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(state.urgent)}
              onChange={(_, checked) => updateState({ urgent: checked || undefined, page: 1 })}
            />
          }
          label="Urgent only"
        />
      </EnrollmentWorkspaceFilterPanel>

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
          serverSideFilter
          searchTerm={search}
          defaultSearchTerm={search}
          searchFieldProps={{
            placeholder: 'Search this queue',
            inputProps: { 'aria-label': 'Search this admissions queue' },
          }}
          totalCount={queueQuery.data?.totalCount || 0}
          page={page}
          rowsPerPage={pageSize}
          defaultRowsPerPage={pageSize}
          rowsPerPageOptions={[pageSize]}
          onServerSearch={setSearch}
          onServerPagination={(nextPage) => updateState({ page: nextPage }, 'push')}
          noDataText={
            <EnrollmentTableEmptyState
              title="Queue cleared"
              description="No applicants currently need action in this queue."
            />
          }
          rowProps={(row) => ({
            'data-testid': 'student-enrollment-operations-row',
            'data-queue-key': row.key,
          })}
          tableContainerProps={{ sx: { minHeight: 360 } }}
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

      <ApplicantWorkspaceDrawer
        leadId={state.applicant}
        academicYearId={academicYearId}
        initialTab={(state.applicantTab as ApplicantDrawerTab | undefined) || applicantTab}
        onTabChange={(tab) => updateState({ applicantTab: tab }, 'replace')}
        onClose={closeApplicant}
      />
    </Stack>
  );
}
