import type { AdmissionOfferStage } from 'src/redux/student/admissions/admission-offer-types';

import { useState, useEffect } from 'react';
import { Button, Dialog, Checkbox, TextField, DialogTitle, DialogActions, DialogContent, FormControlLabel, DialogContentText } from '@mui/material';

export type OfferAction = 'issue' | 'accept' | 'decline' | 'extend' | 'withdraw' | 'reissue' | null;
export type OfferActionValue = { expiresAt: string; reason: string; confirmTerms: boolean; confirmConditions: boolean };
type Props = { action: OfferAction; state: AdmissionOfferStage; busy: boolean;
  onClose: () => void; onSubmit: (value: OfferActionValue) => void };
const TITLES = { issue: 'Issue offer', accept: 'Accept offer', decline: 'Decline offer',
  extend: 'Extend offer', withdraw: 'Withdraw offer', reissue: 'Reissue offer' };

function defaultExpiry(state: AdmissionOfferStage) {
  const date = new Date();
  date.setDate(date.getDate() + (state.policy?.validityDays ?? 14));
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function OfferActionDialog({ action, state, busy, onClose, onSubmit }: Props) {
  const [value, setValue] = useState<OfferActionValue>({ expiresAt: defaultExpiry(state), reason: '',
    confirmTerms: false, confirmConditions: false });
  useEffect(() => setValue({ expiresAt: defaultExpiry(state), reason: '', confirmTerms: false,
    confirmConditions: false }), [action, state]);
  if (!action) return null;
  const expiryAction = action === 'issue' || action === 'extend' || action === 'reissue';
  const reasonRequired = action === 'withdraw' || (action === 'decline' && state.policy?.requireDeclineReason);
  const confirmationsMissing = action === 'accept' &&
    ((state.policy?.requireTermsAcceptance && !value.confirmTerms) ||
      (state.policy?.requireConditionsConfirmation && !value.confirmConditions));
  const invalid = (expiryAction && !value.expiresAt) || (reasonRequired && !value.reason.trim()) || confirmationsMissing;
  return (
    <Dialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{TITLES[action]}</DialogTitle>
      <DialogContent sx={{ pt: '12px !important', display: 'grid', gap: 2 }}>
        <DialogContentText>
          {action === 'accept' ? 'Record the response only after confirming it with the applicant or guardian.' :
            'This action is added permanently to the admission offer history.'}
        </DialogContentText>
        {expiryAction && <TextField size="small" type="datetime-local" label="Offer expiry *"
          value={value.expiresAt} InputLabelProps={{ shrink: true }}
          disabled={action === 'issue' && state.policy?.allowExpiryOverride === false}
          onChange={(event) => setValue({ ...value, expiresAt: event.target.value })} />}
        {action === 'accept' && state.policy?.requireTermsAcceptance &&
          <FormControlLabel label="I confirm the offer terms were accepted" control={<Checkbox checked={value.confirmTerms}
            onChange={(_, checked) => setValue({ ...value, confirmTerms: checked })} />} />}
        {action === 'accept' && state.policy?.requireConditionsConfirmation &&
          <FormControlLabel label="I confirm the offer conditions were satisfied" control={<Checkbox checked={value.confirmConditions}
            onChange={(_, checked) => setValue({ ...value, confirmConditions: checked })} />} />}
        <TextField size="small" multiline minRows={2} label={reasonRequired ? 'Reason *' : 'Note'}
          value={value.reason} inputProps={{ maxLength: 512 }}
          onChange={(event) => setValue({ ...value, reason: event.target.value })} />
      </DialogContent>
      <DialogActions><Button onClick={onClose} disabled={busy}>Cancel</Button>
        <Button variant="contained" color={action === 'decline' || action === 'withdraw' ? 'warning' : 'primary'}
          disabled={busy || invalid} onClick={() => onSubmit(value)}>{busy ? 'Saving…' : TITLES[action]}</Button></DialogActions>
    </Dialog>
  );
}
