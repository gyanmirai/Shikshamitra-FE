'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn, IParams } from 'src/components/customizabaleTable/types';
import type {
  AdmissionCrmLeadDto,
  AdmissionCrmEventDto,
  AdmissionCrmEventUpsertDto,
  AdmissionCrmStaffLookupDto,
  AdmissionCrmEventRegistrationDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useSelector } from 'react-redux';
import { useMemo, useState, useCallback } from 'react';
import AddRounded from '@mui/icons-material/AddRounded';
import { shikshaMitraToast } from 'src/components/toast';
import EditRounded from '@mui/icons-material/EditRounded';
import { hasGrantedPermission } from 'src/utils/permissions';
import { LoadingButton } from 'src/components/loading-button';
import PublishRounded from '@mui/icons-material/PublishRounded';
import HowToRegRounded from '@mui/icons-material/HowToRegRounded';
import CustomizableTable from 'src/components/customizabaleTable';
import EventBusyRounded from '@mui/icons-material/EventBusyRounded';
import PersonOffRounded from '@mui/icons-material/PersonOffRounded';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Paper,
  Switch,
  Button,
  Dialog,
  Divider,
  MenuItem,
  TextField,
  Typography,
  DialogTitle,
  Autocomplete,
  DialogContent,
  DialogActions,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';
import {
  AdmissionCrmEventType,
  AdmissionCrmEventStatus,
  useGetAdmissionCrmLeadsQuery,
  useGetAdmissionCrmStaffQuery,
  useGetAdmissionCrmEventQuery,
  useGetAdmissionCrmEventsQuery,
  useCreateAdmissionCrmEventMutation,
  useUpdateAdmissionCrmEventMutation,
  useCancelAdmissionCrmEventMutation,
  AdmissionCrmEventRegistrationStatus,
  usePublishAdmissionCrmEventMutation,
  useReserveAdmissionCrmEventMutation,
  useCompleteAdmissionCrmEventMutation,
  useCancelAdmissionCrmEventRegistrationMutation,
  useCheckInAdmissionCrmEventRegistrationMutation,
  useMarkNoShowAdmissionCrmEventRegistrationMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { EnrollmentWorkspaceHeader } from './workspace-header';
import { getEnrollmentApiErrorMessage } from './enrollment-api-errors';
import { useEnrollmentWorkspace } from './enrollment-workspace-context';
import { useWorkspaceTableSessionState } from './workspace-table-session-state';
import { formatEnrollmentDate, formatApplicantContact } from './enrollment-display';
import { parseEnrollmentTableSorts, serializeEnrollmentTableSort } from './workspace-table-sorting';
import {
  enrollmentActionsColumn,
  enrollmentTableWrapperSx,
  EnrollmentTableEmptyState,
  enrollmentWorkspaceRootSx,
  enrollmentTableContainerSx,
  EnrollmentWorkspaceErrorState,
} from './workspace-table-patterns';

const eventTypeLabels: Record<AdmissionCrmEventType, string> = {
  [AdmissionCrmEventType.CampusVisit]: 'Campus visit',
  [AdmissionCrmEventType.OpenHouse]: 'Open house',
  [AdmissionCrmEventType.Counselling]: 'Counselling',
  [AdmissionCrmEventType.Orientation]: 'Orientation',
  [AdmissionCrmEventType.Other]: 'Other',
};

const eventStatusLabels: Record<AdmissionCrmEventStatus, string> = {
  [AdmissionCrmEventStatus.Draft]: 'Draft',
  [AdmissionCrmEventStatus.Published]: 'Published',
  [AdmissionCrmEventStatus.Cancelled]: 'Cancelled',
  [AdmissionCrmEventStatus.Completed]: 'Completed',
};

const registrationStatusLabels: Record<AdmissionCrmEventRegistrationStatus, string> = {
  [AdmissionCrmEventRegistrationStatus.Reserved]: 'Reserved',
  [AdmissionCrmEventRegistrationStatus.CheckedIn]: 'Checked in',
  [AdmissionCrmEventRegistrationStatus.Cancelled]: 'Cancelled',
  [AdmissionCrmEventRegistrationStatus.NoShow]: 'No-show',
};

const eventTypeOptions = Object.entries(eventTypeLabels).map(([value, label]) => ({
  value: Number(value),
  label,
}));
const eventStatusOptions = Object.entries(eventStatusLabels).map(([value, label]) => ({
  value: Number(value),
  label,
}));

const applicantName = (lead: AdmissionCrmLeadDto) =>
  [lead.firstName, lead.middleName, lead.lastName].filter(Boolean).join(' ') || 'Unnamed applicant';

const pad = (value: number) => String(value).padStart(2, '0');
const toLocalDateTimeInput = (value: string | Date) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const createInitialEvent = (): AdmissionCrmEventUpsertDto => {
  const starts = new Date(Date.now() + 24 * 60 * 60 * 1000);
  starts.setMinutes(0, 0, 0);
  const ends = new Date(starts.getTime() + 60 * 60 * 1000);
  return {
    title: '',
    eventType: AdmissionCrmEventType.CampusVisit,
    startsAt: toLocalDateTimeInput(starts),
    endsAt: toLocalDateTimeInput(ends),
    location: '',
    capacity: 25,
    instructions: '',
    allowFamilySelfScheduling: false,
  };
};

function EventEditorDialog({
  open,
  event,
  academicYearId,
  onClose,
}: {
  open: boolean;
  event?: AdmissionCrmEventDto;
  academicYearId: string;
  onClose: () => void;
}) {
  const [values, setValues] = useState<AdmissionCrmEventUpsertDto>(() =>
    event
      ? {
          title: event.title,
          eventType: event.eventType,
          startsAt: toLocalDateTimeInput(event.startsAt),
          endsAt: toLocalDateTimeInput(event.endsAt),
          location: event.location,
          capacity: event.capacity,
          ownerUserId: event.ownerUserId || undefined,
          instructions: event.instructions || '',
          allowFamilySelfScheduling: event.allowFamilySelfScheduling,
        }
      : createInitialEvent()
  );
  const [submitted, setSubmitted] = useState(false);
  const [createEvent, createState] = useCreateAdmissionCrmEventMutation();
  const [updateEvent, updateState] = useUpdateAdmissionCrmEventMutation();
  const staffQuery = useGetAdmissionCrmStaffQuery({
    academicYearId,
    ownerOnly: true,
    maxResultCount: 250,
  });
  const staffOptions = staffQuery.data || [];
  const selectedOwner = staffOptions.find((staff) => staff.id === values.ownerUserId) || null;
  const isSaving = createState.isLoading || updateState.isLoading;
  const startsAt = new Date(values.startsAt);
  const endsAt = new Date(values.endsAt);
  const minimumCapacity = Math.max(1, event?.reservedCount || 1);
  const hasValidSchedule =
    Number.isFinite(startsAt.getTime()) &&
    Number.isFinite(endsAt.getTime()) &&
    endsAt > startsAt;
  const hasValidCapacity =
    Number.isFinite(values.capacity) &&
    values.capacity >= minimumCapacity &&
    values.capacity <= 5000;
  const valid =
    values.title.trim().length > 0 &&
    values.location.trim().length > 0 &&
    hasValidCapacity &&
    hasValidSchedule;

  const save = async () => {
    setSubmitted(true);
    if (!valid) return;
    const body = {
      ...values,
      title: values.title.trim(),
      location: values.location.trim(),
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      instructions: values.instructions?.trim() || undefined,
    };
    try {
      if (event) await updateEvent({ eventId: event.id, body }).unwrap();
      else await createEvent({ academicYearId, body }).unwrap();
      shikshaMitraToast.success({
        message: event ? 'Event updated.' : 'Event created as a draft.',
      });
      onClose();
    } catch (error) {
      shikshaMitraToast.error({
        message: getEnrollmentApiErrorMessage(error, 'The event could not be saved.'),
      });
    }
  };

  return (
    <Dialog open={open} onClose={isSaving ? undefined : onClose} fullWidth maxWidth="sm">
      <Box
        component="form"
        onSubmit={(submitEvent) => {
          submitEvent.preventDefault();
          save();
        }}
      >
        <DialogTitle>{event ? `Edit ${event.title}` : 'Create admissions event'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Event title"
              name="eventTitle"
              required
              value={values.title}
              error={submitted && !values.title.trim()}
              helperText={
                submitted && !values.title.trim() ? 'Enter a clear event title.' : undefined
              }
              onChange={(e) => setValues((current) => ({ ...current, title: e.target.value }))}
            />
          <TextField
            select
            label="Event type"
            value={values.eventType}
            onChange={(e) =>
              setValues((current) => ({ ...current, eventType: Number(e.target.value) }))
            }
          >
            {eventTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Starts"
              name="startsAt"
              type="datetime-local"
              required
              value={values.startsAt}
              error={submitted && !Number.isFinite(startsAt.getTime())}
              helperText={
                submitted && !Number.isFinite(startsAt.getTime())
                  ? 'Choose when the event starts.'
                  : undefined
              }
              onChange={(e) => setValues((current) => ({ ...current, startsAt: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              label="Ends"
              name="endsAt"
              type="datetime-local"
              required
              value={values.endsAt}
              error={submitted && !hasValidSchedule}
              helperText={
                submitted && !hasValidSchedule
                  ? 'Choose an end time after the start time.'
                  : undefined
              }
              onChange={(e) => setValues((current) => ({ ...current, endsAt: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          </Stack>
          <TextField
            label="Location or meeting point"
            name="eventLocation"
            required
            value={values.location}
            error={submitted && !values.location.trim()}
            helperText={
              submitted && !values.location.trim()
                ? 'Enter the campus location or online meeting point.'
                : undefined
            }
            onChange={(e) => setValues((current) => ({ ...current, location: e.target.value }))}
          />
          <TextField
            label="Capacity"
            name="capacity"
            type="number"
            required
            value={values.capacity}
            error={submitted && !hasValidCapacity}
            slotProps={{ htmlInput: { min: minimumCapacity, max: 5000 } }}
            helperText={
              submitted && !hasValidCapacity
                ? `Enter a capacity from ${minimumCapacity.toLocaleString('en-IN')} to 5,000.`
                : event?.reservedCount
                ? `${event.reservedCount} places are already reserved.`
                : undefined
            }
            onChange={(e) =>
              setValues((current) => ({ ...current, capacity: Number(e.target.value) }))
            }
          />
          <Autocomplete<AdmissionCrmStaffLookupDto>
            options={staffOptions}
            value={selectedOwner}
            loading={staffQuery.isFetching}
            onChange={(_event, value) =>
              setValues((current) => ({ ...current, ownerUserId: value?.id }))
            }
            getOptionLabel={(option) => option.displayName}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Event owner"
                helperText="Optional staff owner for event coordination."
              />
            )}
          />
          <TextField
            label="Instructions for families"
            name="familyInstructions"
            multiline
            minRows={3}
            value={values.instructions}
            onChange={(e) => setValues((current) => ({ ...current, instructions: e.target.value }))}
          />
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(values.allowFamilySelfScheduling)}
                onChange={(eventChange) =>
                  setValues((current) => ({
                    ...current,
                    allowFamilySelfScheduling: eventChange.target.checked,
                  }))
                }
              />
            }
            label="Allow verified families to reserve this event"
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: -1 }}>
            Families see this event only after it is published and they verify their admission
            access. Capacity limits still apply.
          </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSaving}>
            {event ? 'Save changes' : 'Create draft'}
          </LoadingButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

function RegistrationCard({
  registration,
  event,
  canCheckIn,
  canManage,
}: {
  registration: AdmissionCrmEventRegistrationDto;
  event: AdmissionCrmEventDto;
  canCheckIn: boolean;
  canManage: boolean;
}) {
  const [checkIn, checkInState] = useCheckInAdmissionCrmEventRegistrationMutation();
  const [markNoShow, noShowState] = useMarkNoShowAdmissionCrmEventRegistrationMutation();
  const [cancelRegistration, cancelState] = useCancelAdmissionCrmEventRegistrationMutation();
  const run = async (action: 'check-in' | 'no-show' | 'cancel') => {
    try {
      if (action === 'check-in')
        await checkIn({ eventId: event.id, registrationId: registration.id }).unwrap();
      if (action === 'no-show')
        await markNoShow({ eventId: event.id, registrationId: registration.id }).unwrap();
      if (action === 'cancel')
        await cancelRegistration({ eventId: event.id, registrationId: registration.id }).unwrap();
      shikshaMitraToast.success({ message: 'Roster updated.' });
    } catch (error) {
      shikshaMitraToast.error({
        message: getEnrollmentApiErrorMessage(error, 'The roster could not be updated.'),
      });
    }
  };
  const isReserved = registration.status === AdmissionCrmEventRegistrationStatus.Reserved;
  const busy = checkInState.isLoading || noShowState.isLoading || cancelState.isLoading;

  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5} justifyContent="space-between">
        <Stack spacing={0.25} minWidth={0}>
          <Typography variant="subtitle2">{registration.applicantName}</Typography>
          <Typography variant="body2" color="text.secondary">
            {formatApplicantContact(registration.primaryContactNo, undefined)}
            {registration.parentGuardianName ? ` · ${registration.parentGuardianName}` : ''}
          </Typography>
          <Chip
            size="small"
            label={registrationStatusLabels[registration.status]}
            color={
              registration.status === AdmissionCrmEventRegistrationStatus.CheckedIn
                ? 'success'
                : 'default'
            }
            sx={{ alignSelf: 'flex-start' }}
          />
        </Stack>
        {isReserved ? (
          <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
            {canCheckIn ? (
              <>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<HowToRegRounded />}
                  disabled={busy}
                  onClick={() => run('check-in')}
                >
                  Check in
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<PersonOffRounded />}
                  disabled={busy || new Date() < new Date(event.startsAt)}
                  onClick={() => run('no-show')}
                >
                  No-show
                </Button>
              </>
            ) : null}
            {canManage ? (
              <Button size="small" color="error" disabled={busy} onClick={() => run('cancel')}>
                Cancel reservation
              </Button>
            ) : null}
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  );
}

function EventDetailsDialog({
  eventId,
  academicYearId,
  canManage,
  canCheckIn,
  onClose,
  onEdit,
}: {
  eventId: string;
  academicYearId: string;
  canManage: boolean;
  canCheckIn: boolean;
  onClose: () => void;
  onEdit: (event: AdmissionCrmEventDto) => void;
}) {
  const eventQuery = useGetAdmissionCrmEventQuery({ eventId });
  const event = eventQuery.data;
  const [applicantSearch, setApplicantSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<AdmissionCrmLeadDto | null>(null);
  const leadQuery = useGetAdmissionCrmLeadsQuery(
    { academicYearId, filterText: applicantSearch || undefined, maxResultCount: 20 },
    { skip: !canManage || !event || event.status !== AdmissionCrmEventStatus.Published }
  );
  const [reserve, reserveState] = useReserveAdmissionCrmEventMutation();
  const [publish, publishState] = usePublishAdmissionCrmEventMutation();
  const [cancelEvent, cancelState] = useCancelAdmissionCrmEventMutation();
  const [complete, completeState] = useCompleteAdmissionCrmEventMutation();
  const [cancelReason, setCancelReason] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);

  const mutate = async (action: 'publish' | 'cancel' | 'complete') => {
    if (!event) return;
    try {
      if (action === 'publish') await publish({ eventId: event.id }).unwrap();
      if (action === 'cancel')
        await cancelEvent({ eventId: event.id, reason: cancelReason }).unwrap();
      if (action === 'complete') await complete({ eventId: event.id }).unwrap();
      setConfirmCancel(false);
      setCancelReason('');
      shikshaMitraToast.success({
        message: `Event ${action === 'publish' ? 'published' : action === 'cancel' ? 'cancelled' : 'completed'}.`,
      });
    } catch (error) {
      shikshaMitraToast.error({
        message: getEnrollmentApiErrorMessage(error, 'The event status could not be changed.'),
      });
    }
  };

  const addApplicant = async () => {
    if (!event || !selectedLead) return;
    try {
      await reserve({ eventId: event.id, leadId: selectedLead.id }).unwrap();
      setSelectedLead(null);
      setApplicantSearch('');
      shikshaMitraToast.success({ message: 'Applicant added to the event.' });
    } catch (error) {
      shikshaMitraToast.error({
        message: getEnrollmentApiErrorMessage(error, 'The applicant could not be added.'),
      });
    }
  };

  const lifecycleBusy = publishState.isLoading || cancelState.isLoading || completeState.isLoading;
  return (
    <Dialog open onClose={lifecycleBusy ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>{event?.title || 'Admissions event'}</DialogTitle>
      <DialogContent>
        {eventQuery.isLoading ? <LinearProgress aria-label="Loading event details" /> : null}
        {eventQuery.isError ? (
          <Alert
            severity="error"
            action={<Button onClick={() => eventQuery.refetch()}>Retry</Button>}
          >
            Event details could not be loaded.
          </Alert>
        ) : null}
        {event ? (
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} flexWrap="wrap">
              <Chip label={eventTypeLabels[event.eventType]} />
              <Chip label={eventStatusLabels[event.status]} variant="outlined" />
              <Chip
                label={`${event.reservedCount} of ${event.capacity} places reserved`}
                variant="outlined"
              />
            </Stack>
            <Box>
              <Typography variant="body2">
                <strong>When:</strong> {formatEnrollmentDate(event.startsAt, true)} –{' '}
                {formatEnrollmentDate(event.endsAt, true)}
              </Typography>
              <Typography variant="body2">
                <strong>Where:</strong> {event.location}
              </Typography>
              {event.instructions ? (
                <Typography variant="body2">
                  <strong>Family instructions:</strong> {event.instructions}
                </Typography>
              ) : null}
            </Box>
            {canManage &&
            event.status === AdmissionCrmEventStatus.Published &&
            event.availableCount > 0 ? (
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Add an applicant
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
                  <Autocomplete
                    fullWidth
                    options={leadQuery.data?.items || []}
                    value={selectedLead}
                    loading={leadQuery.isFetching}
                    inputValue={applicantSearch}
                    onInputChange={(_event, value) => setApplicantSearch(value)}
                    onChange={(_event, value) => setSelectedLead(value)}
                    getOptionLabel={(option) =>
                      `${applicantName(option)} · ${formatApplicantContact(option.primaryContactNo, option.email)}`
                    }
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => <TextField {...params} label="Search applicants" />}
                  />
                  <LoadingButton
                    variant="contained"
                    disabled={!selectedLead}
                    loading={reserveState.isLoading}
                    onClick={addApplicant}
                    sx={{ minWidth: 130 }}
                  >
                    Add to event
                  </LoadingButton>
                </Stack>
              </Paper>
            ) : null}
            <Divider />
            <Stack spacing={1}>
              <Typography variant="h6" component="h2">
                Roster
              </Typography>
              {event.registrations.length ? (
                event.registrations.map((registration) => (
                  <RegistrationCard
                    key={registration.id}
                    registration={registration}
                    event={event}
                    canCheckIn={canCheckIn}
                    canManage={canManage}
                  />
                ))
              ) : (
                <Alert severity="info">No applicants are registered for this event yet.</Alert>
              )}
            </Stack>
            {confirmCancel ? (
              <Alert severity="warning">
                <Stack spacing={1}>
                  <Typography variant="body2">
                    Cancelling {event.title} also cancels every active reservation.
                  </Typography>
                  <TextField
                    label="Cancellation reason"
                    required
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                  <Stack direction="row" gap={1}>
                    <LoadingButton
                      color="error"
                      variant="contained"
                      disabled={!cancelReason.trim()}
                      loading={cancelState.isLoading}
                      onClick={() => mutate('cancel')}
                    >
                      Cancel event
                    </LoadingButton>
                    <Button onClick={() => setConfirmCancel(false)}>Keep event</Button>
                  </Stack>
                </Stack>
              </Alert>
            ) : null}
          </Stack>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ flexWrap: 'wrap' }}>
        {event && canManage ? (
          <>
            {event.status !== AdmissionCrmEventStatus.Cancelled &&
            event.status !== AdmissionCrmEventStatus.Completed ? (
              <Button startIcon={<EditRounded />} onClick={() => onEdit(event)}>
                Edit
              </Button>
            ) : null}
            {event.status === AdmissionCrmEventStatus.Draft ? (
              <LoadingButton
                startIcon={<PublishRounded />}
                loading={publishState.isLoading}
                onClick={() => mutate('publish')}
              >
                Publish
              </LoadingButton>
            ) : null}
            {event.status === AdmissionCrmEventStatus.Published &&
            new Date() >= new Date(event.endsAt) ? (
              <LoadingButton loading={completeState.isLoading} onClick={() => mutate('complete')}>
                Mark completed
              </LoadingButton>
            ) : null}
            {event.status !== AdmissionCrmEventStatus.Cancelled &&
            event.status !== AdmissionCrmEventStatus.Completed ? (
              <Button
                color="error"
                startIcon={<EventBusyRounded />}
                onClick={() => setConfirmCancel(true)}
              >
                Cancel event
              </Button>
            ) : null}
          </>
        ) : null}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

const latestEnumFilter = (filters: IParams['filters'], column: string) => {
  const filter = [...filters].reverse().find((item) => item.column === column);
  return filter ? Number(filter.value) : undefined;
};

export function EventsWorkspace() {
  const { academicYearId, sessionIdentity, state, updateState } = useEnrollmentWorkspace();
  const permissions = useSelector((root: RootState) => root.auth.permissions);
  const canManage = hasGrantedPermission(
    permissions,
    'Students.Enrollment.AdmissionsCrm.ManageEvents'
  );
  const canCheckIn = hasGrantedPermission(
    permissions,
    'Students.Enrollment.AdmissionsCrm.CheckInEvents'
  );
  const [editorEvent, setEditorEvent] = useState<AdmissionCrmEventDto | 'new' | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const { search, setSearch } = useWorkspaceTableSessionState(
    `events:${academicYearId || 'none'}:${sessionIdentity}`
  );
  const page = Math.max(0, state.page - 1);
  const pageSize = state.pageSize || 25;
  const sorting = state.sorting || 'startsAt asc';
  const query = useGetAdmissionCrmEventsQuery(
    {
      academicYearId: academicYearId || '',
      filterText: search || undefined,
      eventType: state.eventType,
      status: state.eventStatus,
      sorting,
      skipCount: page * pageSize,
      maxResultCount: pageSize,
    },
    { skip: !academicYearId }
  );

  const openEvent = useCallback((event: AdmissionCrmEventDto) => setSelectedEventId(event.id), []);
  const columns = useMemo<IColumn[]>(
    () => [
      {
        id: 'title',
        label: 'Event',
        minWidth: 230,
        width: 270,
        isSort: true,
        isFilter: false,
        sticky: true,
        stickyPosition: 'left',
        render: (_value, row) => {
          const event = row as AdmissionCrmEventDto;
          return (
            <Button
              variant="text"
              onClick={() => openEvent(event)}
              sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
            >
              {event.title}
            </Button>
          );
        },
      },
      {
        id: 'eventType',
        label: 'Type',
        width: 150,
        isSort: false,
        isFilter: true,
        filterType: 'enum',
        enumOptions: eventTypeOptions,
        render: (value) => eventTypeLabels[value as AdmissionCrmEventType],
      },
      {
        id: 'startsAt',
        label: 'Starts',
        width: 185,
        isSort: true,
        isFilter: false,
        render: (value) => formatEnrollmentDate(value as string, true),
      },
      {
        id: 'location',
        label: 'Location',
        minWidth: 180,
        width: 220,
        isSort: false,
        isFilter: false,
      },
      {
        id: 'reservedCount',
        label: 'Capacity',
        width: 140,
        align: 'right',
        isSort: false,
        isFilter: false,
        render: (_value, row) => {
          const event = row as AdmissionCrmEventDto;
          return `${event.reservedCount} / ${event.capacity}`;
        },
      },
      {
        id: 'status',
        label: 'Status',
        width: 145,
        isSort: false,
        isFilter: true,
        filterType: 'enum',
        enumOptions: eventStatusOptions,
        render: (value) => (
          <Chip
            size="small"
            variant="outlined"
            label={eventStatusLabels[value as AdmissionCrmEventStatus]}
          />
        ),
      },
      {
        id: 'actions',
        label: '',
        ...enrollmentActionsColumn,
        isSort: false,
        isFilter: false,
        excludeFromExport: true,
        render: (_value, row) => {
          const event = row as AdmissionCrmEventDto;
          return (
            <Stack direction="row" gap={0.5}>
              <Button size="small" variant="outlined" onClick={() => openEvent(event)}>
                Open
              </Button>
              {canManage &&
              event.status !== AdmissionCrmEventStatus.Cancelled &&
              event.status !== AdmissionCrmEventStatus.Completed ? (
                <Button
                  size="small"
                  aria-label={`Edit ${event.title}`}
                  onClick={() => setEditorEvent(event)}
                >
                  <EditRounded fontSize="small" />
                </Button>
              ) : null}
            </Stack>
          );
        },
      },
    ],
    [canManage, openEvent]
  );

  if (!academicYearId) {
    return (
      <Stack spacing={1.5} sx={enrollmentWorkspaceRootSx}>
        <EnrollmentWorkspaceHeader
          title="Visits & Events"
          description="Plan campus visits, open houses, counselling sessions, and orientations."
        />
        <Alert severity="info">Select an academic year to open Visits & Events.</Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={1.5} sx={enrollmentWorkspaceRootSx}>
      <EnrollmentWorkspaceHeader
        title="Visits & Events"
        description="Plan family-facing events, manage capacity, and keep an auditable attendance roster."
        actions={
          canManage ? (
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={() => setEditorEvent('new')}
            >
              Create Event
            </Button>
          ) : undefined
        }
      />
      {query.isError ? (
        <EnrollmentWorkspaceErrorState
          message="Admissions events could not be loaded."
          onRetry={() => query.refetch()}
        />
      ) : (
        <>
          {query.isFetching && !query.isLoading ? (
            <LinearProgress aria-label="Refreshing admissions events" />
          ) : null}
          <CustomizableTable
            tableId="student-enrollment-events"
            tableTitle="Admissions events"
            columns={columns}
            data={query.data?.items || []}
            isLoading={query.isLoading}
            serverSide
            serverSidePagination
            serverSideSearch
            serverSideFilter
            serverSideSort
            serverSideSortMode="single"
            totalCount={query.data?.totalCount || 0}
            page={page}
            rowsPerPage={pageSize}
            searchTerm={search}
            filters={[
              ...(state.eventType == null
                ? []
                : [
                    {
                      column: 'eventType',
                      type: 'equals',
                      value: state.eventType,
                      valueType: 'enum',
                      displayValue: eventTypeLabels[state.eventType],
                    },
                  ]),
              ...(state.eventStatus == null
                ? []
                : [
                    {
                      column: 'status',
                      type: 'equals',
                      value: state.eventStatus,
                      valueType: 'enum',
                      displayValue: eventStatusLabels[state.eventStatus],
                    },
                  ]),
            ]}
            sorts={parseEnrollmentTableSorts(sorting, columns)}
            defaultRowsPerPage={25}
            rowsPerPageOptions={[10, 25, 50, 100]}
            onServerPagination={(nextPage, nextPageSize) =>
              updateState({ page: nextPage, pageSize: nextPageSize }, 'push')
            }
            onServerSearch={(value) => {
              setSearch(value);
              updateState({ page: 1 }, 'replace');
            }}
            onServerFilter={(filters) =>
              updateState(
                {
                  eventType: latestEnumFilter(filters, 'eventType') as
                    AdmissionCrmEventType | undefined,
                  eventStatus: latestEnumFilter(filters, 'status') as
                    AdmissionCrmEventStatus | undefined,
                  page: 1,
                },
                'push'
              )
            }
            onServerSort={(_column, sorts) =>
              updateState(
                { sorting: serializeEnrollmentTableSort(sorts) || undefined, page: 1 },
                'push'
              )
            }
            noDataText={
              <EnrollmentTableEmptyState
                title="No admissions events"
                description={
                  search || state.eventType != null || state.eventStatus != null
                    ? 'No events match the current filters.'
                    : 'Create the first campus visit, open house, counselling session, or orientation.'
                }
              />
            }
            wrapperProps={{ sx: enrollmentTableWrapperSx }}
            tableContainerProps={{ sx: enrollmentTableContainerSx }}
          />
        </>
      )}
      {editorEvent ? (
        <EventEditorDialog
          key={editorEvent === 'new' ? 'new' : editorEvent.id}
          open
          event={editorEvent === 'new' ? undefined : editorEvent}
          academicYearId={academicYearId}
          onClose={() => setEditorEvent(null)}
        />
      ) : null}
      {selectedEventId ? (
        <EventDetailsDialog
          eventId={selectedEventId}
          academicYearId={academicYearId}
          canManage={canManage}
          canCheckIn={canCheckIn}
          onClose={() => setSelectedEventId(null)}
          onEdit={(event) => {
            setSelectedEventId(null);
            setEditorEvent(event);
          }}
        />
      ) : null}
    </Stack>
  );
}
