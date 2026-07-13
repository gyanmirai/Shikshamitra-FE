'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  AdmissionCrmStaffLookupDto,
  AdmissionCrmOperationsQueueItemDto,
  AdmissionCrmOperationsSavedViewDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import dynamic from 'next/dynamic';
import { useMemo, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import ThreeDotsActions from 'src/components/three-dots-actions';
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
  useGetAdmissionCrmStaffQuery,
  AdmissionCrmOperationsQueueType,
  useGetAdmissionCrmOperationsQueueQuery,
  useGetAdmissionCrmOperationsSavedViewsQuery,
  useGetAdmissionCrmOperationsQueueSummaryQuery,
  useCreateAdmissionCrmOperationsSavedViewMutation,
  useDeleteAdmissionCrmOperationsSavedViewMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { EnrollmentWorkspaceHeader } from './workspace-header';
import { useEnrollmentWorkspace } from './enrollment-workspace-context';
import { ApplicantWorkspaceDrawer } from './applicant-workspace-drawer';
import { IntegrationCapabilitiesPanel } from './integration-capabilities-panel';

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
  showOperationsUtilities?: boolean;
};

const pageSize = 50;
const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const formatQueueDate = (value: unknown) => {
  if (!value) return '—';

  const date = new Date(value as string | number | Date);
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
};

const queueLabels: Record<AdmissionCrmOperationsQueueType, string> = {
  [AdmissionCrmOperationsQueueType.UnassignedExam]: 'Unassigned Exams',
  [AdmissionCrmOperationsQueueType.CapacityConflict]: 'Capacity Conflicts',
  [AdmissionCrmOperationsQueueType.NoShow]: 'Exam No-shows',
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

const allQueues = Object.values(AdmissionCrmOperationsQueueType).filter(
  (value): value is AdmissionCrmOperationsQueueType => typeof value === 'number'
);

export function OperationsQueueWorkspace({
  title,
  description,
  defaultQueue,
  allowedQueues = allQueues,
  applicantTab = 'overview',
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
      skipCount: page * pageSize,
      maxResultCount: pageSize,
    },
    { skip: !academicYearId }
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
          label: summary?.label || queueLabels[queueType],
          count: summary?.count || 0,
          urgentCount: summary?.urgentCount || 0,
        };
      }),
    [allowedQueues, summaryQuery.data?.queues]
  );

  const columns = useMemo<IColumn[]>(
    () => [
      {
        id: 'applicantName',
        label: 'Applicant',
        width: 230,
        minWidth: 210,
        sticky: true,
        stickyPosition: 'left',
        stickyOnMobile: false,
        isSort: false,
        isFilter: false,
        render: (value) => (
          <Typography variant="subtitle2" noWrap>
            {value}
          </Typography>
        ),
      },
      {
        id: 'title',
        label: 'Action Required',
        width: 360,
        minWidth: 280,
        isSort: false,
        isFilter: false,
        render: (value, row) => {
          const item = row as AdmissionCrmOperationsQueueItemDto;
          return (
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
              <Typography variant="body2" noWrap>
                {value}
              </Typography>
              {item.details && (
                <Typography variant="caption" color="text.secondary" noWrap>
                  {item.details}
                </Typography>
              )}
            </Stack>
          );
        },
      },
      {
        id: 'status',
        label: 'Status',
        width: 210,
        minWidth: 180,
        isSort: false,
        isFilter: false,
        render: (value, row) => {
          const item = row as AdmissionCrmOperationsQueueItemDto;
          return (
            <Stack direction="row" gap={0.5} alignItems="center">
              <Chip size="small" variant="outlined" label={value} />
              {item.isUrgent && <Chip size="small" color="warning" label="Urgent" />}
            </Stack>
          );
        },
      },
      {
        id: 'ageDays',
        label: 'Age',
        width: 100,
        minWidth: 90,
        isSort: false,
        isFilter: false,
        render: (value) => `${value} days`,
      },
      {
        id: 'dueAt',
        label: 'Due',
        width: 135,
        minWidth: 125,
        isSort: false,
        isFilter: false,
        render: formatQueueDate,
      },
      {
        id: 'actions',
        label: 'Actions',
        width: 80,
        minWidth: 72,
        sticky: true,
        stickyPosition: 'right',
        stickyOnMobile: false,
        isSort: false,
        isFilter: false,
        headerSx: { px: 1.5 },
        cellSx: { px: 1.5 },
        render: (_value, row) => {
          const item = row as AdmissionCrmOperationsQueueItemDto;
          return (
            <ThreeDotsActions
              placement="right-top"
              showViewIcon
              viewLabel="Review Applicant"
              handleViewClick={() => openApplicant(item.leadId)}
              showThreeDots={false}
            />
          );
        },
      },
    ],
    [openApplicant]
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

      <Paper variant="outlined" sx={{ p: 1, borderRadius: 1, overflowX: 'auto' }}>
        <Stack direction="row" gap={0.75} sx={{ minWidth: 'max-content' }}>
          {queueCounts.map((queue) => (
            <Button
              key={queue.queueType}
              size="small"
              variant={selectedQueue === queue.queueType ? 'contained' : 'outlined'}
              onClick={() => updateState({ queue: queue.queueType, page: 1 }, 'push')}
              sx={
                selectedQueue === queue.queueType
                  ? {
                      bgcolor: 'primary.darker',
                      color: 'common.white',
                      '&:hover': { bgcolor: 'primary.dark' },
                    }
                  : {
                      color: 'text.primary',
                      borderColor: queue.urgentCount > 0 ? 'warning.darker' : 'divider',
                    }
              }
            >
              {queue.label} ({queue.count})
            </Button>
          ))}
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
        <Stack spacing={1.25}>
          <Stack direction={{ xs: 'column', lg: 'row' }} gap={1.25} alignItems={{ lg: 'center' }}>
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
          </Stack>

          <Divider />
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
                      shikshaMitraToast.error({ message: 'The saved view could not be deleted.' });
                    }
                  }}
                  deleteIcon={<DeleteOutlineRounded />}
                  disabled={deleteSavedViewState.isLoading}
                />
              ))}
          </Stack>
        </Stack>
      </Paper>

      {queueQuery.isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => queueQuery.refetch()}>
              Retry
            </Button>
          }
        >
          This operations queue is unavailable.
        </Alert>
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
          searchFieldProps={{ placeholder: 'Search this queue...' }}
          totalCount={queueQuery.data?.totalCount || 0}
          page={page}
          rowsPerPage={pageSize}
          defaultRowsPerPage={pageSize}
          rowsPerPageOptions={[pageSize]}
          onServerSearch={setSearch}
          onServerPagination={(nextPage) => updateState({ page: nextPage }, 'push')}
          noDataText={
            <Stack spacing={0.5} alignItems="center">
              <Typography variant="subtitle2">Queue cleared</Typography>
              <Typography variant="body2" color="text.secondary">
                No applicants currently need action in this queue.
              </Typography>
            </Stack>
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
        initialTab={applicantTab}
        onClose={closeApplicant}
      />
    </Stack>
  );
}
