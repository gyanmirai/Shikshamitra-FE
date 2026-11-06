'use client';

import type {
  AdmissionOffering,
  AdmissionRoomChoice,
} from 'src/redux/student/admissions/admission-offerings-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { formatDateOnly } from 'src/utils/date-only';
import { shikshaMitraToast } from 'src/components/toast';
import { StudentFeedback } from 'src/components/student-feedback';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { renderUnsavedConfirmation } from 'src/components/confirm-dialog/render-unsaved-confirmation';
import {
  Box,
  Grid,
  Stack,
  Button,
  Drawer,
  Divider,
  TextField,
  IconButton,
  Typography,
  Autocomplete,
} from '@mui/material';
import {
  useGetAdmissionRoomChoicesQuery,
  useGetAdmissionClassCapacityQuery,
  useUpdateAdmissionClassRoomsMutation,
} from 'src/redux/student/admissions/admission-offerings-api';

import { AdmissionDialogTitle } from './admission-dialog-title';
import { ADMISSION_DATE_FORMAT } from './admission-date-formats';
import { AdmissionOfferingReadiness } from './admission-offering-readiness';
import { admissionTrackLabels, admissionEntryModeLabels } from './admission-offering-model';

type Props = {
  open: boolean;
  offering: AdmissionOffering | null;
  canManage: boolean;
  onClose: () => void;
};

function DetailItem({ label, value }: { label: string; value: string | number }) {
  return (
    <Stack spacing={0.5} sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
        {value}
      </Typography>
    </Stack>
  );
}

export function AdmissionOfferingDetailsDrawer({ open, offering, canManage, onClose }: Props) {
  const [editingRooms, setEditingRooms] = useState(false);
  const [roomSearch, setRoomSearch] = useState('');
  const [selectedRooms, setSelectedRooms] = useState<AdmissionRoomChoice[]>([]);
  const [discardTarget, setDiscardTarget] = useState<'close' | 'cancel' | null>(null);
  const id = offering?.id ?? '';
  const capacityQuery = useGetAdmissionClassCapacityQuery(id, {
    skip: !open || !id,
    refetchOnMountOrArgChange: true,
  });
  const roomsQuery = useGetAdmissionRoomChoicesQuery(
    { id, search: roomSearch },
    { skip: !open || !id || !editingRooms }
  );
  const [updateRooms, updateState] = useUpdateAdmissionClassRoomsMutation();
  const capacity = capacityQuery.data ?? offering?.classCapacity;
  const options = useMemo(
    () =>
      Array.from(
        new Map(
          [...selectedRooms, ...(roomsQuery.data ?? [])].map((room) => [room.roomId, room])
        ).values()
      ),
    [roomsQuery.data, selectedRooms]
  );
  const currentRoomIds = (capacity?.rooms ?? [])
    .map((room) => room.roomId)
    .sort()
    .join('|');
  const selectedRoomIds = selectedRooms
    .map((room) => room.roomId)
    .sort()
    .join('|');
  const roomsDirty = editingRooms && currentRoomIds !== selectedRoomIds;

  useEffect(() => {
    setEditingRooms(false);
    setRoomSearch('');
    setSelectedRooms([]);
    setDiscardTarget(null);
  }, [open, id]);

  const startEditing = () => {
    setSelectedRooms(
      (capacity?.rooms ?? []).map((room) => ({
        ...room,
        isAllocatedToAnotherClass: false,
      }))
    );
    setRoomSearch('');
    setEditingRooms(true);
  };

  const requestClose = () => {
    if (updateState.isLoading) return;
    if (roomsDirty) {
      setDiscardTarget('close');
      return;
    }
    setEditingRooms(false);
    onClose();
  };

  const requestCancelEdit = () => {
    if (updateState.isLoading) return;
    if (roomsDirty) {
      setDiscardTarget('cancel');
      return;
    }
    setEditingRooms(false);
  };

  const discardChanges = () => {
    const target = discardTarget;
    setDiscardTarget(null);
    setEditingRooms(false);
    if (target === 'close') onClose();
  };

  const saveRooms = async () => {
    if (!id || updateState.isLoading) return;
    try {
      await updateRooms({ id, roomIds: selectedRooms.map((room) => room.roomId) }).unwrap();
      setEditingRooms(false);
      shikshaMitraToast.success({ message: 'Class rooms updated. Capacity was recalculated.' });
    } catch (error) {
      shikshaMitraToast.error({
        message: parseApiProblemDetail(error).detail || 'Unable to update class rooms.',
      });
    }
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={requestClose}
        PaperProps={{
          'aria-labelledby': 'admission-offering-details-title',
          sx: {
            width: { xs: 1, sm: 720 },
            maxWidth: 1,
            height: '100dvh',
            display: 'flex',
            overflow: 'hidden',
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="flex-start"
          spacing={2}
          sx={{ px: { xs: 2, sm: 3 }, py: 2, flexShrink: 0 }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="overline" color="text.secondary">
              Admission Offering
            </Typography>
            <Typography id="admission-offering-details-title" variant="h6" component="h2">
              <AdmissionDialogTitle
                title={offering?.name || offering?.code || 'Offering Details'}
                helpText="Review this offering’s class, admission dates, published forms, capacity and readiness."
                helpLabel="Admission offering details information"
              />
            </Typography>
            {offering && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {offering.admissionCycleName}
                {offering.name && offering.name !== offering.code ? ` · ${offering.code}` : ''}
              </Typography>
            )}
            {offering && (
              <Label color={offering.isActive ? 'success' : 'default'} sx={{ mt: 1 }}>
                {offering.isActive ? 'Active' : 'Inactive'}
              </Label>
            )}
          </Box>
          <IconButton
            aria-label="Close Admission Offering Details"
            onClick={requestClose}
            disabled={updateState.isLoading}
            sx={{ width: 44, height: 44, mt: -0.5, mr: -1 }}
          >
            <Iconify icon="mdi:close" width={22} />
          </IconButton>
        </Stack>
        <Divider />

        <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
          {offering && (
            <Stack spacing={3} sx={{ px: { xs: 2, sm: 3 }, py: 2.5 }}>
              <Box component="section" aria-label="Academic Scope">
                <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                  Academic Scope
                </Typography>
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 6 }}>
                    <DetailItem label="Class" value={offering.standardName} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <DetailItem
                      label="Admission Track"
                      value={admissionTrackLabels[offering.track]}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <DetailItem label="Board" value={offering.boardName} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <DetailItem label="Medium" value={offering.mediumName} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <DetailItem label="School Level" value={offering.stageName} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <DetailItem
                      label="Entry Mode"
                      value={admissionEntryModeLabels[offering.entryMode]}
                    />
                  </Grid>
                  {offering.campusName && (
                    <Grid size={{ xs: 12 }}>
                      <DetailItem label="Campus" value={offering.campusName} />
                    </Grid>
                  )}
                </Grid>
              </Box>

              <Divider />
              <Box component="section" aria-label="Admission Window">
                <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                  Admission Window
                </Typography>
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 6 }}>
                    <DetailItem
                      label="Opens"
                      value={formatDateOnly(offering.effectiveOpenDate, ADMISSION_DATE_FORMAT)}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <DetailItem
                      label="Closes"
                      value={formatDateOnly(offering.effectiveCloseDate, ADMISSION_DATE_FORMAT)}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <DetailItem label="Applications" value={offering.applicationCount} />
                  </Grid>
                </Grid>
              </Box>

              <Divider />
              <Box component="section" aria-label="Process and Forms">
                <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                  Process and Forms
                </Typography>
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12 }}>
                    <DetailItem
                      label="Workflow"
                      value={
                        offering.workflowName
                          ? `${offering.workflowName} v${offering.workflowVersion}`
                          : 'Not Configured'
                      }
                    />
                  </Grid>
                  {offering.entryMode === 0 && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <DetailItem
                        label="Inquiry Form"
                        value={
                          offering.inquiryFormName
                            ? `${offering.inquiryFormName} v${offering.inquiryFormVersion}`
                            : 'Not Configured'
                        }
                      />
                    </Grid>
                  )}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <DetailItem
                      label="Application Form"
                      value={
                        offering.applicationFormName
                          ? `${offering.applicationFormName} v${offering.applicationFormVersion}`
                          : 'Not Configured'
                      }
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider />
              <Box component="section" aria-label="Admission Capacity">
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  alignItems={{ sm: 'center' }}
                  justifyContent="space-between"
                  spacing={1}
                  sx={{ mb: 1.5 }}
                >
                  <Box>
                    <Typography variant="subtitle1">Admission Capacity</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Room seats are shared across admission tracks.
                    </Typography>
                  </Box>
                  {canManage && !editingRooms && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Iconify icon="mdi:door-open" />}
                      onClick={startEditing}
                      disabled={!capacity && (capacityQuery.isLoading || capacityQuery.isError)}
                      sx={{ flexShrink: 0 }}
                    >
                      Assign Class Rooms
                    </Button>
                  )}
                </Stack>
                {capacityQuery.isError && (
                  <StudentFeedback
                    notificationKey="STU-0113"
                    presentation="toast"
                    severity="error"
                    toastAction={
                      <Button size="small" onClick={() => capacityQuery.refetch()}>
                        Retry
                      </Button>
                    }
                    sx={{ mb: 1.5 }}
                  >
                    Current room capacity could not be refreshed.
                  </StudentFeedback>
                )}
                {!capacity && capacityQuery.isError ? null : capacity?.capacity == null ? (
                  <StudentFeedback notificationKey="STU-0114" presentation="inline" severity="info">
                    No rooms are assigned for admission capacity. Division seat limits are checked
                    separately during onboarding.
                  </StudentFeedback>
                ) : (
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 4 }}>
                      <DetailItem label="Available" value={capacity.remainingSeats ?? '—'} />
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <DetailItem label="Occupied" value={capacity.occupiedCount} />
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <DetailItem label="Total Seats" value={capacity.capacity} />
                    </Grid>
                  </Grid>
                )}
                {capacity?.rooms.length ? (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Assigned Rooms
                    </Typography>
                    <Stack
                      component="ul"
                      spacing={1}
                      sx={{ mt: 1, mb: 0, pl: 0, listStyle: 'none' }}
                    >
                      {capacity.rooms.map((room) => (
                        <Stack
                          component="li"
                          key={room.roomId}
                          direction="row"
                          justifyContent="space-between"
                          spacing={2}
                        >
                          <Typography variant="body2">{room.roomName}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                            {room.capacity} Seats
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>
                ) : null}
                {capacity?.isFull && (
                  <StudentFeedback
                    notificationKey="STU-0115"
                    presentation="persistent"
                    severity="warning"
                    sx={{ mt: 2 }}
                  >
                    Admission room capacity is full. New inquiries and registrations remain allowed
                    with a warning.
                  </StudentFeedback>
                )}
                {canManage && editingRooms && (
                  <Stack spacing={1.5} sx={{ mt: 2 }}>
                    {roomsQuery.isError && (
                      <StudentFeedback
                        notificationKey="STU-0116"
                        presentation="toast"
                        severity="error"
                        toastAction={
                          <Button size="small" onClick={() => roomsQuery.refetch()}>
                            Retry
                          </Button>
                        }
                      >
                        Room choices could not be loaded.
                      </StudentFeedback>
                    )}
                    <Autocomplete
                      multiple
                      options={options}
                      value={selectedRooms}
                      loading={roomsQuery.isFetching}
                      disabled={roomsQuery.isError || updateState.isLoading}
                      getOptionLabel={(room) => `${room.roomName} · ${room.capacity} seats`}
                      getOptionDisabled={(room) => room.isAllocatedToAnotherClass}
                      isOptionEqualToValue={(option, value) => option.roomId === value.roomId}
                      filterOptions={(items) => items}
                      onInputChange={(_event, value) => setRoomSearch(value)}
                      onChange={(_event, value) => setSelectedRooms(value)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Rooms for This Class"
                          size="small"
                          helperText="Capacity is calculated from these rooms. The same rooms serve General and RTE offerings."
                        />
                      )}
                    />
                  </Stack>
                )}
              </Box>

              <Divider />
              <Box component="section" aria-label="Configuration Readiness">
                <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                  Configuration Readiness
                </Typography>
                <AdmissionOfferingReadiness result={offering.configuration} />
              </Box>
            </Stack>
          )}
        </Scrollbar>

        <Divider />
        <Stack
          direction="row"
          justifyContent="flex-end"
          spacing={1}
          sx={{ px: { xs: 2, sm: 3 }, py: 1.5, flexShrink: 0 }}
        >
          {editingRooms ? (
            <>
              <Button
                variant="outlined"
                size="small"
                disabled={updateState.isLoading}
                onClick={requestCancelEdit}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                size="small"
                loading={updateState.isLoading}
                disabled={!roomsDirty || roomsQuery.isError}
                startIcon={<Iconify icon="mdi:content-save-outline" />}
                onClick={saveRooms}
              >
                Save Rooms
              </Button>
            </>
          ) : (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Iconify icon="mdi:close" />}
              onClick={requestClose}
            >
              Close
            </Button>
          )}
        </Stack>
      </Drawer>
      {discardTarget &&
        renderUnsavedConfirmation(
          () => setDiscardTarget(null),
          () => {
            if (!updateState.isLoading) discardChanges();
          },
          {
            busy: updateState.isLoading,
            title: 'Discard Room Changes?',
            description: 'Your changes to the assigned rooms have not been saved.',
          }
        )}
    </>
  );
}
