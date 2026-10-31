'use client';

import type { RootState } from 'src/redux/store';
import type {
  ApplyFeeWaiverInput,
  FeeWaiverSourceType,
} from 'src/redux/feeCollection/feeCollection';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';
import { financePermissions } from 'src/constants/finance-menu';
import { Switch, Tooltip, FormControlLabel } from '@mui/material';

import FeeWaiverDialog from './FeeWaiverDialog';

export interface FeeWaiverToggleProps {
  sourceType: FeeWaiverSourceType;
  sourceId: string;
  sourceName?: string;
  remainingAmount: number;
  canWaive?: boolean;
  onApplied?: () => void;
}

export default function FeeWaiverToggle({
  canWaive = true,
  onApplied,
  ...source
}: FeeWaiverToggleProps) {
  const [open, setOpen] = useState(false);
  const [pendingInput, setPendingInput] = useState<ApplyFeeWaiverInput | null>(null);
  const authorized = useSelector((state: RootState) => {
    const { auth } = state;
    return (
      auth?.permissionsInitialized &&
      !auth.loading &&
      hasGrantedPermission(auth.permissions, financePermissions.fees.collectionActions.applyWaiver)
    );
  });
  const label = source.sourceType === 'LateFee' ? 'late fee' : 'charge';
  if (
    !authorized ||
    !canWaive ||
    !source.sourceId ||
    !Number.isFinite(source.remainingAmount) ||
    source.remainingAmount <= 0
  )
    return null;

  return (
    <>
      <Tooltip title={`Waive the full remaining ${label}`} arrow>
        <FormControlLabel
          onClick={(event) => event.stopPropagation()}
          control={
            <Switch
              size="small"
              checked={open}
              onChange={(_event, checked) => {
                if (checked) setOpen(true);
              }}
              inputProps={{ 'aria-label': `Waive ${source.sourceName || label}` }}
            />
          }
          label="Waiver"
          sx={{
            m: 0,
            whiteSpace: 'nowrap',
            '& .MuiFormControlLabel-label': { typography: 'body2' },
          }}
        />
      </Tooltip>
      {open && (
        <FeeWaiverDialog
          key={`${source.sourceType}:${source.sourceId}`}
          {...source}
          pendingInput={
            pendingInput?.sourceType === source.sourceType &&
            pendingInput.sourceId === source.sourceId
              ? pendingInput
              : null
          }
          onUnconfirmed={setPendingInput}
          onClose={() => setOpen(false)}
          onApplied={() => {
            setPendingInput(null);
            setOpen(false);
            onApplied?.();
          }}
        />
      )}
    </>
  );
}
