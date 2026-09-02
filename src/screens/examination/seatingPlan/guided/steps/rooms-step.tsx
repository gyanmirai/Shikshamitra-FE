import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import type { GuidedStepProps } from '../types';

export function RoomsStep({ workflow }: GuidedStepProps) {
  const plan = workflow.selectedPlan;
  if (!plan) return <Alert severity="warning">Choose a seating plan before selecting rooms.</Alert>;

  const selectedCapacity = plan.availableRooms
    .filter((room) => workflow.formik.values.selectedRoomIds.includes(room.roomId))
    .reduce((total, room) => total + room.usableCapacity, 0);
  const remaining = Math.max(0, plan.totalStudents - selectedCapacity);

  return (
    <Stack spacing={1.5}>
      <Stack spacing={0.75}>
        <Typography variant="h6">Rooms and usable capacity</Typography>
        <Typography color="text.secondary">
          Disabled seats are already removed. Choose enough usable seats for all{' '}
          {plan.totalStudents} students in this plan.
        </Typography>
      </Stack>

      <Alert severity={remaining === 0 && selectedCapacity > 0 ? 'success' : 'warning'}>
        {selectedCapacity} usable seats selected ·{' '}
        {remaining === 0
          ? `${selectedCapacity - plan.totalStudents} spare`
          : `${remaining} more needed`}
      </Alert>

      {plan.availableRooms.length === 0 ? (
        <Alert severity="error">No rooms are assigned to the subjects in this plan.</Alert>
      ) : (
        <Stack spacing={1}>
          {plan.availableRooms.map((room) => {
            const checked = workflow.formik.values.selectedRoomIds.includes(room.roomId);
            return (
              <FormControlLabel
                key={room.roomId}
                control={
                  <Checkbox
                    checked={checked}
                    onChange={() => {
                      const roomIds = checked
                        ? workflow.formik.values.selectedRoomIds.filter((id) => id !== room.roomId)
                        : [...workflow.formik.values.selectedRoomIds, room.roomId];
                      workflow.formik.setFieldValue('selectedRoomIds', roomIds);
                    }}
                  />
                }
                label={
                  <Stack>
                    <Typography variant="subtitle2">{room.roomName}</Typography>
                    <Typography
                      variant="caption"
                      color={checked ? 'text.primary' : 'text.secondary'}
                    >
                      {room.usableCapacity} usable of {room.capacity} seats
                      {room.disabledSeats ? ` · ${room.disabledSeats} disabled` : ''}
                    </Typography>
                  </Stack>
                }
                sx={{
                  m: 0,
                  px: 1.5,
                  py: 0.75,
                  minHeight: 64,
                  border: '1px solid',
                  borderColor: checked ? 'primary.main' : 'divider',
                  borderRadius: 1.5,
                  bgcolor: checked ? 'action.selected' : 'background.paper',
                }}
              />
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
