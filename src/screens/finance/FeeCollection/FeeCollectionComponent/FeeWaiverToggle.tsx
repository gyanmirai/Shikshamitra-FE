'use client';

import type { FeeWaiverSourceType } from 'src/redux/feeCollection/feeCollection';

import { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useApplyFeeWaiverMutation } from 'src/redux/feeCollection/feeCollection';
import {
  Box,
  Button,
  Dialog,
  Switch,
  Tooltip,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

interface FeeWaiverToggleProps {
  sourceType: FeeWaiverSourceType;
  sourceId: string;
  remainingAmount: number;
  onApplied?: () => void;
}

export default function FeeWaiverToggle({
  sourceType,
  sourceId,
  remainingAmount,
  onApplied,
}: FeeWaiverToggleProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [applyWaiver, { isLoading }] = useApplyFeeWaiverMutation();
  const label = sourceType === 'LateFee' ? 'late fee' : 'charge';

  // Positive balances in the collect form are the visible waiver candidates. The API
  // remains authoritative for permission, scope, source status, and live balance.
  if (remainingAmount <= 0) return null;

  const close = () => {
    if (!isLoading) setOpen(false);
  };

  const submit = async () => {
    if (!reason.trim()) {
      shikshaMitraToast.error({ message: 'A waiver reason is required.' });
      return;
    }

    try {
      const result = await applyWaiver({
        sourceType,
        sourceId,
        reason: reason.trim(),
        idempotencyKey,
      }).unwrap();
      shikshaMitraToast.success({
        message: `Waived ₹${result.waivedAmount.toLocaleString('en-IN')} from the ${label}.`,
      });
      onApplied?.();
      setReason('');
      setOpen(false);
    } catch (error) {
      const parsed = parseApiProblemDetail(error);
      shikshaMitraToast.error({ message: parsed.detail || 'Failed to apply waiver.' });
    }
  };

  return (
    <>
      <Tooltip title={`Waive full remaining ${label}`} arrow>
        <FormControlLabel
          onClick={(event) => event.stopPropagation()}
          control={
            <Switch
              size="small"
              checked={false}
              onChange={(_event, checked) => {
                if (checked) {
                  setReason('');
                  setIdempotencyKey(crypto.randomUUID());
                  setOpen(true);
                }
              }}
              inputProps={{ 'aria-label': `Waive ${label}` }}
            />
          }
          label="Waiver"
          sx={{ m: 0, '& .MuiFormControlLabel-label': { fontSize: '0.7rem' } }}
        />
      </Tooltip>

      <Dialog open={open} onClose={close} maxWidth="xs" fullWidth onClick={(e) => e.stopPropagation()}>
        <DialogTitle>Waive {sourceType === 'LateFee' ? 'Late Fee' : 'Charge'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, p: 1.5, borderRadius: 1, bgcolor: 'action.hover' }}>
            <Typography variant="caption" color="text.secondary">
              Full remaining amount
            </Typography>
            <Typography variant="h6">₹{remainingAmount.toLocaleString('en-IN')}</Typography>
          </Box>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            label="Reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            inputProps={{ maxLength: 500 }}
            helperText={`${reason.length}/500 · This immediately waives the full remaining amount.`}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={close} color="inherit" disabled={isLoading}>Cancel</Button>
          <LoadingButton variant="contained" loading={isLoading} onClick={submit}>
            Confirm waiver
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
