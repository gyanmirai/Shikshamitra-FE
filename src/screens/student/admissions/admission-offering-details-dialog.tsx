import type {
  AdmissionOffering,
  AdmissionRoomChoice,
} from 'src/redux/student/admissions/admission-offerings-api';

import { useMemo, useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { formatDateOnly } from 'src/utils/date-only';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Stack,
  Alert,
  Button,
  Divider,
  TextField,
  Typography,
  Autocomplete,
  DialogActions,
} from '@mui/material';
import {
  useGetAdmissionRoomChoicesQuery,
  useGetAdmissionClassCapacityQuery,
  useUpdateAdmissionClassRoomsMutation,
} from 'src/redux/student/admissions/admission-offerings-api';

import { AdmissionOfferingReadiness } from './admission-offering-readiness';
import { admissionTrackLabels, admissionEntryModeLabels } from './admission-offering-model';

type Props = {
  open: boolean;
  offering: AdmissionOffering | null;
  canManage: boolean;
  onClose: () => void;
};

const Detail = ({ label, value }: { label: string; value: string }) => (
  <Stack spacing={0.25}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2">{value}</Typography>
  </Stack>
);

export function AdmissionOfferingDetailsDialog({ open, offering, canManage, onClose }: Props) {
  const [editingRooms, setEditingRooms] = useState(false);
  const [roomSearch, setRoomSearch] = useState('');
  const [selectedRooms, setSelectedRooms] = useState<AdmissionRoomChoice[]>([]);
  const id = offering?.id ?? '';
  const { data: liveCapacity } = useGetAdmissionClassCapacityQuery(id, {
    skip: !open || !id,
    refetchOnMountOrArgChange: true,
  });
  const { data: roomChoices = [], isFetching: roomsLoading } = useGetAdmissionRoomChoicesQuery(
    { id, search: roomSearch },
    { skip: !open || !id || !editingRooms }
  );
  const [updateRooms, updateState] = useUpdateAdmissionClassRoomsMutation();
  const capacity = liveCapacity ?? offering?.classCapacity;
  const options = useMemo(
    () =>
      Array.from(
        new Map([...selectedRooms, ...roomChoices].map((room) => [room.roomId, room])).values()
      ),
    [roomChoices, selectedRooms]
  );

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

  const saveRooms = async () => {
    if (!id) return;
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
    <CustomDialog
      open={open}
      handleClose={onClose}
      title="Admission Offering Details"
      maxWidth="sm"
    >
      <DialogScrollContent dividers sx={{ display: 'grid', gap: 1.5 }}>
        {offering && (
          <>
            <Typography variant="body2" color="text.secondary">
              Review the effective academic identity, admission window, frozen configuration
              defaults, and current readiness.
            </Typography>
            <Detail label="Cycle" value={offering.admissionCycleName} />
            <Detail label="Offering name" value={offering.name || offering.code} />
            <Detail label="Offering code" value={offering.code} />
            <Detail label="Admission track" value={admissionTrackLabels[offering.track]} />
            <Detail label="Entry mode" value={admissionEntryModeLabels[offering.entryMode]} />
            <Detail
              label="Academic hierarchy"
              value={`${offering.boardName} · ${offering.mediumName} · ${offering.stageName}`}
            />
            <Detail
              label="Effective window"
              value={`${formatDateOnly(offering.effectiveOpenDate, 'DD MMM YYYY')} – ${formatDateOnly(offering.effectiveCloseDate, 'DD MMM YYYY')}`}
            />
            <Divider />
            <Detail
              label="Workflow"
              value={
                offering.workflowName
                  ? `${offering.workflowName} v${offering.workflowVersion}`
                  : 'Not configured'
              }
            />
            {offering.entryMode === 0 && (
              <Detail
                label="Inquiry form"
                value={
                  offering.inquiryFormName
                    ? `${offering.inquiryFormName} v${offering.inquiryFormVersion}`
                    : 'Not configured'
                }
              />
            )}
            <Detail
              label="Application form"
              value={
                offering.applicationFormName
                  ? `${offering.applicationFormName} v${offering.applicationFormVersion}`
                  : 'Not configured'
              }
            />
            <Detail label="Applications" value={String(offering.applicationCount)} />
            <Detail
              label="Admission room seats (shared across tracks)"
              value={
                capacity?.capacity == null
                  ? 'Rooms not assigned'
                  : `${capacity.remainingSeats} available · ${capacity.occupiedCount} occupied · ${capacity.capacity} capacity`
              }
            />
            {capacity?.capacity == null && (
              <Alert severity="info">
                No rooms are assigned for admission capacity. Division seat limits are configured
                separately and checked during onboarding.
              </Alert>
            )}
            {capacity?.rooms.length ? (
              <Detail
                label="Assigned rooms"
                value={capacity.rooms
                  .map((room) => `${room.roomName} (${room.capacity})`)
                  .join(', ')}
              />
            ) : null}
            {capacity?.isFull && (
              <Alert severity="warning">
                Admission room capacity is full. New inquiries and registrations remain allowed with a
                warning.
              </Alert>
            )}
            {canManage && !editingRooms && (
              <Button
                variant="outlined"
                size="small"
                onClick={startEditing}
                sx={{ justifySelf: 'start' }}
              >
                Assign class rooms
              </Button>
            )}
            {canManage && editingRooms && (
              <Stack spacing={1.5}>
                <Autocomplete
                  multiple
                  options={options}
                  value={selectedRooms}
                  loading={roomsLoading}
                  getOptionLabel={(room) => `${room.roomName} · ${room.capacity} seats`}
                  getOptionDisabled={(room) => room.isAllocatedToAnotherClass}
                  isOptionEqualToValue={(option, value) => option.roomId === value.roomId}
                  filterOptions={(items) => items}
                  onInputChange={(_event, value) => setRoomSearch(value)}
                  onChange={(_event, value) => setSelectedRooms(value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Rooms for this class"
                      size="small"
                      helperText="Capacity is calculated from these rooms. The same rooms serve General and RTE offerings."
                    />
                  )}
                />
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    size="small"
                    loading={updateState.isLoading}
                    onClick={saveRooms}
                  >
                    Save rooms
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    disabled={updateState.isLoading}
                    onClick={() => setEditingRooms(false)}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            )}
            <AdmissionOfferingReadiness result={offering.configuration} />
          </>
        )}
      </DialogScrollContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={onClose}
        >
          Close
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
