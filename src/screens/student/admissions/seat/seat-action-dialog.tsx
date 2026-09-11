import type { AdmissionSeatStage } from 'src/redux/student/admissions/admission-seat-types';

import { useState, useEffect } from 'react';
import { Button, Dialog, Checkbox, TextField, DialogTitle, DialogActions, DialogContent,
  FormControlLabel, DialogContentText } from '@mui/material';

export type SeatAction = 'reserve' | 'confirm' | 'renew' | 'release' | 'waitlist' | 'capacity' | null;
export type SeatActionValue = { expiresAt: string; reason: string; joinWaitlist: boolean;
  overrideCapacity: boolean; capacity: number; allowBelowOccupied: boolean };
type Props = { action: SeatAction; state: AdmissionSeatStage; busy: boolean;
  onClose: () => void; onSubmit: (value: SeatActionValue) => void };
const TITLES = { reserve: 'Reserve seat', confirm: 'Confirm seat', renew: 'Renew reservation',
  release: 'Release seat', waitlist: 'Add to waitlist', capacity: 'Change capacity' };

function defaultExpiry(state: AdmissionSeatStage) {
  const date = new Date();
  date.setHours(date.getHours() + (state.policy?.reservationDurationHours ?? 72));
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function SeatActionDialog({ action, state, busy, onClose, onSubmit }: Props) {
  const [value, setValue] = useState<SeatActionValue>({ expiresAt: defaultExpiry(state), reason: '',
    joinWaitlist: true, overrideCapacity: false, capacity: state.capacity, allowBelowOccupied: false });
  useEffect(() => setValue({ expiresAt: defaultExpiry(state), reason: '', joinWaitlist: true,
    overrideCapacity: false, capacity: state.capacity, allowBelowOccupied: false }), [action, state]);
  if (!action) return null;
  const expiryAction = action === 'reserve' || action === 'renew';
  const reasonRequired = action === 'capacity' || (action === 'release' && state.policy?.requireReleaseReason) ||
    (action === 'reserve' && value.overrideCapacity);
  const invalid = (expiryAction && !value.expiresAt) || (reasonRequired && !value.reason.trim()) ||
    (action === 'capacity' && (!Number.isInteger(value.capacity) || value.capacity < 1 || value.capacity > 100000));
  return (
    <Dialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{TITLES[action]}</DialogTitle>
      <DialogContent sx={{ pt: '12px !important', display: 'grid', gap: 2 }}>
        <DialogContentText>
          {action === 'capacity' ? `Current occupancy is ${state.reservedCount + state.confirmedCount} of ${state.capacity}.` :
            'This action is recorded permanently in the applicant seat history.'}
        </DialogContentText>
        {expiryAction && <TextField size="small" type="datetime-local" label="Reservation expiry *"
          value={value.expiresAt} InputLabelProps={{ shrink: true }}
          disabled={action === 'reserve' && state.policy?.allowDurationOverride === false}
          onChange={(event) => setValue({ ...value, expiresAt: event.target.value })} />}
        {action === 'reserve' && state.remainingCapacity === 0 && state.policy?.allowWaitlist &&
          <FormControlLabel label="Join the waitlist if capacity is still full" control={<Checkbox checked={value.joinWaitlist}
            onChange={(_, checked) => setValue({ ...value, joinWaitlist: checked })} />} />}
        {action === 'reserve' && state.remainingCapacity === 0 && state.policy?.allowCapacityOverride &&
          <FormControlLabel label="Use my capacity override permission" control={<Checkbox checked={value.overrideCapacity}
            onChange={(_, checked) => setValue({ ...value, overrideCapacity: checked })} />} />}
        {action === 'capacity' && <><TextField size="small" type="number" label="New capacity *" value={value.capacity}
          inputProps={{ min: 1, max: 100000 }} onChange={(event) => setValue({ ...value, capacity: Number(event.target.value) })} />
          <FormControlLabel label="Allow temporary over-capacity if current occupancy is higher" control={<Checkbox
            checked={value.allowBelowOccupied} onChange={(_, checked) => setValue({ ...value, allowBelowOccupied: checked })} />} /></>}
        <TextField size="small" multiline minRows={2} label={reasonRequired ? 'Reason *' : 'Note'}
          value={value.reason} inputProps={{ maxLength: 512 }}
          onChange={(event) => setValue({ ...value, reason: event.target.value })} />
      </DialogContent>
      <DialogActions><Button onClick={onClose} disabled={busy}>Cancel</Button>
        <Button variant="contained" color={action === 'release' ? 'warning' : 'primary'} disabled={busy || invalid}
          onClick={() => onSubmit(value)}>{busy ? 'Saving…' : TITLES[action]}</Button></DialogActions>
    </Dialog>
  );
}
