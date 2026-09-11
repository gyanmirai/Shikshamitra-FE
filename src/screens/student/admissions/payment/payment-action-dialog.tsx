import type { AdmissionPaymentStage } from 'src/redux/student/admissions/admission-payment-types';
import type { AdmissionPaymentMethod } from 'src/redux/student/admissions/admission-payment-policy';

import { useState, useEffect } from 'react';
import { STAFF_PAYMENT_METHODS } from 'src/redux/student/admissions/admission-payment-policy';
import { Button, Dialog, MenuItem, TextField, DialogTitle, DialogActions, DialogContent, DialogContentText } from '@mui/material';

export type PaymentAction = 'record' | 'waive' | 'verify' | 'reject' | 'reverse' | null;
export type PaymentActionValue = { amount: number; method: AdmissionPaymentMethod; reference: string; reason: string };
type Props = { action: PaymentAction; state: AdmissionPaymentStage; busy: boolean; onClose: () => void; onSubmit: (value: PaymentActionValue) => void };

const titles = { record: 'Record payment', waive: 'Waive payment', verify: 'Verify payment', reject: 'Reject payment', reverse: 'Reverse payment' };
export function PaymentActionDialog({ action, state, busy, onClose, onSubmit }: Props) {
  const allowed = STAFF_PAYMENT_METHODS.filter((item) => state.policy?.acceptedMethods.includes(item.value));
  const availableAmount = state.outstandingAmount - state.pendingAmount;
  const defaultMethod = allowed[0]?.value ?? 'cash';
  const [value, setValue] = useState<PaymentActionValue>({ amount: availableAmount,
    method: defaultMethod, reference: '', reason: '' });
  useEffect(() => setValue({ amount: availableAmount, method: defaultMethod, reference: '', reason: '' }),
    [action, availableAmount, defaultMethod]);
  if (!action) return null;
  const record = action === 'record';
  const reasonRequired = action === 'waive' || action === 'reject' || action === 'reverse';
  const referenceRequired = record && value.method !== 'cash';
  const invalid = record ? value.amount <= 0 || value.amount > availableAmount || (referenceRequired && !value.reference.trim())
    : reasonRequired && !value.reason.trim();
  return (
    <Dialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>{titles[action]}</DialogTitle>
      <DialogContent sx={{ pt: '12px !important', display: 'grid', gap: 2 }}>
        {record ? <>
          <DialogContentText>Record money already received by the school. A receipt number is generated automatically.</DialogContentText>
          <TextField size="small" type="number" label={`Amount (${state.currency}) *`} value={value.amount}
            inputProps={{ min: 0.01, max: availableAmount, step: 0.01 }}
            onChange={(event) => setValue({ ...value, amount: Number(event.target.value) })} />
          <TextField select size="small" label="Payment method *" value={value.method}
            onChange={(event) => setValue({ ...value, method: event.target.value as AdmissionPaymentMethod })}>
            {allowed.map((item) => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}
          </TextField>
          {value.method !== 'cash' && <TextField size="small" label="Transaction reference *" value={value.reference}
            onChange={(event) => setValue({ ...value, reference: event.target.value })} />}
          <TextField size="small" multiline minRows={2} label="Notes" value={value.reason}
            onChange={(event) => setValue({ ...value, reason: event.target.value })} />
        </> : <>
          <DialogContentText>{action === 'verify' ? 'Confirm that the payment evidence matches the school record.' : 'This creates a permanent financial control record.'}</DialogContentText>
          <TextField size="small" multiline minRows={3} label={reasonRequired ? 'Reason *' : 'Verification note'} value={value.reason}
            inputProps={{ maxLength: 1024 }} onChange={(event) => setValue({ ...value, reason: event.target.value })} />
        </>}
      </DialogContent>
      <DialogActions><Button onClick={onClose} disabled={busy}>Cancel</Button>
        <Button variant="contained" color={action === 'reject' || action === 'reverse' ? 'error' : 'primary'}
          disabled={busy || invalid} onClick={() => onSubmit(value)}>{busy ? 'Saving…' : titles[action]}</Button></DialogActions>
    </Dialog>
  );
}
