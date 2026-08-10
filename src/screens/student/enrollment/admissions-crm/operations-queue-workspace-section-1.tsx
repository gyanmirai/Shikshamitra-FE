'use client';

import { LoadingButton } from 'src/components/loading-button';

import BookmarkAddOutlined from '@mui/icons-material/BookmarkAddOutlined';

import {
  Chip,
  Alert,
  Stack,
  Paper,
  Button,
  Switch,
  Dialog,
  MenuItem,
  TextField,
  DialogTitle,
  Autocomplete,
  DialogContent,
  DialogActions,
  FormControlLabel,
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

import { formatEnumLabel } from './enrollment-display';

import { EnrollmentWorkspaceHeader } from './workspace-header';

import { EnrollmentWorkspaceFilterPanel } from './workspace-table-patterns';

import { useOperationsQueueWorkspace } from './operations-queue-workspace-context';

const enumOptions = <T extends number>(source: Record<string, string | number>) =>
  Object.entries(source)
    .filter((entry): entry is [string, T] => typeof entry[1] === 'number')
    .map(([key, value]) => ({ value, label: formatEnumLabel(key) }));

export function OperationsQueueSection1() {
  const { state: controllerState, actions, meta } = useOperationsQueueWorkspace();
  const {
    assignee,
    assigneeSearch,
    assigneeStaffQuery,
    bulkAction,
    bulkAssignOwnersState,
    bulkCreateOffersState,
    bulkCreateTasksState,
    bulkOfferValidUntil,
    bulkSeatPoolId,
    bulkStaff,
    bulkStaffQuery,
    bulkStaffSearch,
    bulkTaskDueAt,
    bulkTaskTitle,
    canBulkOperate,
    closeBulkDialog,
    columnFilters,
    description,
    handleBulkAction,
    headerActions,
    items,
    owner,
    ownerSearch,
    ownerStaffQuery,
    page,
    queueCounts,
    seatPoolsQuery,
    selectedLeadIds,
    selectedQueue,
    setAssigneeSearch,
    setBulkAction,
    setBulkOfferValidUntil,
    setBulkSeatPoolId,
    setBulkStaff,
    setBulkStaffSearch,
    setBulkTaskDueAt,
    setBulkTaskTitle,
    setColumnFilters,
    setOwnerSearch,
    setSavedViewsOpen,
    setSelectedLeadIds,
    state,
    title,
    updateState,
    variant,
  } = { ...controllerState, ...actions, ...meta };

  return (
    <>
      <EnrollmentWorkspaceHeader title={title} description={description} actions={headerActions} />
      <EnrollmentWorkspaceFilterPanel
        clearDisabled={
          columnFilters.length === 0 &&
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
        onClear={() => {
          setColumnFilters([]);
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
          );
        }}
        actions={
          <Button
            size="small"
            variant="outlined"
            startIcon={<BookmarkAddOutlined />}
            onClick={() => setSavedViewsOpen(true)}
          >
            Saved views
          </Button>
        }
      >
        <TextField
          select
          size="small"
          label="Queue"
          value={selectedQueue}
          onChange={(event) =>
            updateState(
              {
                queue: Number(event.target.value) as AdmissionCrmOperationsQueueType,
                sorting: undefined,
                page: 1,
              },
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
              label="Class Placement Plan"
              value={state.seatPoolId || ''}
              onChange={(event) =>
                updateState({ seatPoolId: event.target.value || undefined, page: 1 })
              }
            >
              <MenuItem value="">All class placement plans</MenuItem>
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
          options={ownerStaffQuery.data || []}
          value={owner}
          inputValue={ownerSearch}
          onInputChange={(_, value) => setOwnerSearch(value)}
          onChange={(_, value) => updateState({ owner: value?.id, page: 1 })}
          getOptionLabel={(option) => `${option.displayName} (${option.employeeCode})`}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          loading={ownerStaffQuery.isFetching}
          renderInput={(params) => <TextField {...params} label="Owner" />}
          sx={{ minWidth: 0, width: '100%' }}
        />
        <Autocomplete
          size="small"
          options={assigneeStaffQuery.data || []}
          value={assignee}
          inputValue={assigneeSearch}
          onInputChange={(_, value) => setAssigneeSearch(value)}
          onChange={(_, value) => updateState({ assignee: value?.id, page: 1 })}
          getOptionLabel={(option) => `${option.displayName} (${option.employeeCode})`}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          loading={assigneeStaffQuery.isFetching}
          renderInput={(params) => <TextField {...params} label="Assignee" />}
          sx={{ minWidth: 0, width: '100%' }}
        />
        <TextField
          size="small"
          type="number"
          name="minimumAgeDays"
          autoComplete="off"
          label="Minimum age (days)"
          value={state.minimumAgeDays || ''}
          onChange={(event) =>
            updateState({
              minimumAgeDays: event.target.value ? Number(event.target.value) : undefined,
              page: 1,
            })
          }
          inputProps={{ min: 1, max: 3650 }}
          sx={{ minWidth: 0, width: '100%' }}
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
      {selectedLeadIds.length > 0 ? (
        <Paper
          variant="outlined"
          role="region"
          aria-label="Bulk enrollment actions"
          sx={{ p: 1, position: 'sticky', top: 8, zIndex: 2 }}
        >
          <Stack direction="row" gap={0.75} flexWrap="wrap" alignItems="center">
            <Chip color="primary" label={`${selectedLeadIds.length} selected`} />
            {canBulkOperate ? (
              <>
                <Button size="small" onClick={() => setBulkAction('owner')}>
                  Assign owner
                </Button>
                <Button size="small" onClick={() => setBulkAction('task')}>
                  Create task
                </Button>
                {(variant === 'registration' || variant === 'offer') && (
                  <Button size="small" variant="contained" onClick={() => setBulkAction('offer')}>
                    Create offers
                  </Button>
                )}
              </>
            ) : null}
            <Button size="small" color="inherit" onClick={() => setSelectedLeadIds([])}>
              Clear selection
            </Button>
          </Stack>
        </Paper>
      ) : null}
      <Dialog open={Boolean(bulkAction)} onClose={closeBulkDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {bulkAction === 'owner'
            ? 'Assign owner'
            : bulkAction === 'task'
              ? 'Create tasks'
              : 'Create offers'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <Alert severity="info">{selectedLeadIds.length} selected applicants</Alert>
            {(bulkAction === 'owner' || bulkAction === 'task') && (
              <Autocomplete
                options={bulkStaffQuery.data || []}
                value={bulkStaff}
                inputValue={bulkStaffSearch}
                onInputChange={(_event, value) => setBulkStaffSearch(value)}
                onChange={(_event, value) => setBulkStaff(value)}
                getOptionLabel={(option) => `${option.displayName} (${option.employeeCode})`}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                loading={bulkStaffQuery.isFetching}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={bulkAction === 'owner' ? 'Owner' : 'Task assignee'}
                  />
                )}
              />
            )}
            {bulkAction === 'task' ? (
              <>
                <TextField
                  label="Task title"
                  value={bulkTaskTitle}
                  onChange={(event) => setBulkTaskTitle(event.target.value)}
                />
                <TextField
                  type="datetime-local"
                  label="Due at"
                  value={bulkTaskDueAt}
                  onChange={(event) => setBulkTaskDueAt(event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </>
            ) : null}
            {bulkAction === 'offer' ? (
              <>
                <TextField
                  select
                  label="Class Placement Plan"
                  value={bulkSeatPoolId}
                  onChange={(event) => setBulkSeatPoolId(event.target.value)}
                >
                  {(seatPoolsQuery.data?.items || []).map((pool) => (
                    <MenuItem key={pool.id} value={pool.id}>
                      {pool.name} ({pool.remainingCapacity} seats available)
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  type="date"
                  label="Offer valid until"
                  value={bulkOfferValidUntil}
                  onChange={(event) => setBulkOfferValidUntil(event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <Alert severity="warning">
                  Admission criteria are checked for every applicant. Applicants with missing
                  registration, documents, payment, or capacity remain unchanged.
                </Alert>
              </>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeBulkDialog}>Cancel</Button>
          <LoadingButton
            variant="contained"
            loading={
              bulkAssignOwnersState.isLoading ||
              bulkCreateTasksState.isLoading ||
              bulkCreateOffersState.isLoading
            }
            disabled={
              (bulkAction === 'owner' && !bulkStaff) ||
              (bulkAction === 'task' && (!bulkStaff || !bulkTaskTitle.trim() || !bulkTaskDueAt)) ||
              (bulkAction === 'offer' && (!bulkSeatPoolId || !bulkOfferValidUntil))
            }
            onClick={handleBulkAction}
          >
            {bulkAction === 'owner'
              ? 'Assign'
              : bulkAction === 'task'
                ? 'Create tasks'
                : 'Create eligible offers'}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
