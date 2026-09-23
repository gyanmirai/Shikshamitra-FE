'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { financePermissions } from 'src/constants/finance-menu';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useApplyLateFeeWaiverMutation } from 'src/redux/feeCollection/lateFeeWaiver';
import {
  Box,
  Button,
  Dialog,
  Tooltip,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

interface LateFeeWaiverButtonProps {
  dueFeeId: string;
  computedLateFeeAmount: number;
}

/**
 * Self-contained waiver trigger: icon button + dialog + mutation, so it can be dropped
 * into FeeRow without threading dialog state through FeeLedgerList/ByMonthView/MonthGroup.
 * Enforces a mandatory reason client-side, matching the backend's LateFeeWaiverErrorCodes.ReasonRequired.
 */
const LateFeeWaiverButton = ({ dueFeeId, computedLateFeeAmount }: LateFeeWaiverButtonProps) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(computedLateFeeAmount));
  const [reason, setReason] = useState('');
  const [applyWaiver, { isLoading }] = useApplyLateFeeWaiverMutation();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canRequest = hasGrantedPermission(
    permissions,
    financePermissions.fees.waiverActions.request
  );

  if (!canRequest) return null;

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAmount(String(computedLateFeeAmount));
    setReason('');
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    const requestedAmount = Number(amount);
    if (!reason.trim()) {
      shikshaMitraToast.error({ message: 'A reason is required to waive a late fee.' });
      return;
    }
    if (!(requestedAmount > 0)) {
      shikshaMitraToast.error({ message: 'Waiver amount must be greater than zero.' });
      return;
    }

    try {
      const result = await applyWaiver({
        dueFeeId,
        requestedAmount,
        reason: reason.trim(),
      }).unwrap();
      shikshaMitraToast.success({
        message:
          result.status === 'PendingApproval'
            ? `Waiver of ₹${result.effectiveAmount} submitted for approval.`
            : `Waived ₹${result.effectiveAmount} late fee.`,
      });
      setOpen(false);
    } catch (err) {
      const parsed = parseApiProblemDetail(err);
      shikshaMitraToast.error({ message: parsed.detail || 'Failed to apply waiver.' });
    }
  };

  return (
    <>
      <Tooltip arrow title="Waive late fee">
        <Box
          component="span"
          onClick={handleOpen}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 18,
            height: 18,
            borderRadius: '50%',
            cursor: 'pointer',
            color: 'text.secondary',
            flexShrink: 0,
            '&:hover': { color: 'primary.main' },
          }}
        >
          <Iconify icon="solar:hand-money-bold" width={14} />
        </Box>
      </Tooltip>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle>Waive Late Fee</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Computed late fee: ₹{computedLateFeeAmount}
          </Typography>
          <TextField
            fullWidth
            type="number"
            label="Waiver amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            minRows={2}
            label="Reason (required)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <LoadingButton variant="contained" loading={isLoading} onClick={handleSubmit}>
            Apply Waiver
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LateFeeWaiverButton;
