'use client';

import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import DialogActions from '@mui/material/DialogActions';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { ReviewAndLockSummary } from './ReviewAndLockSummary';

import type { SubjectCapacityRow } from '../types';

interface ReviewAndLockDialogProps {
  open: boolean;
  onClose: () => void;
  total: number;
  assigned: number;
  unassigned: number;
  subjectCapacity: SubjectCapacityRow[];
  preferenceMatchPct: number | null;
  canLock: boolean;
  hasUnsavedChanges: boolean;
  isLocked: boolean;
  isLocking: boolean;
  onConfirmLock: () => void;
}

export default function ReviewAndLockDialog({
  open,
  onClose,
  total,
  assigned,
  unassigned,
  subjectCapacity,
  preferenceMatchPct,
  canLock,
  hasUnsavedChanges,
  isLocked,
  isLocking,
  onConfirmLock,
}: ReviewAndLockDialogProps) {
  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      title="Review and Lock"
      maxWidth="sm"
      hasForm={false}
      disableClose={isLocking}
    >
      <DialogScrollContent sx={{ px: { xs: 2, sm: 2.5 }, py: 2.5 }}>
        <ReviewAndLockSummary
          total={total}
          assigned={assigned}
          unassigned={unassigned}
          subjectCapacity={subjectCapacity}
          preferenceMatchPct={preferenceMatchPct}
        />
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        {isLocked ? (
          <Button onClick={onClose} variant="contained" size="small">
            Done
          </Button>
        ) : (
          <>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={onClose}
              variant="outlined"
              size="small"
              disabled={isLocking}
            >
              Keep Editing
            </Button>
            <LoadingButton
              variant="contained"
              size="small"
              disabled={!canLock || hasUnsavedChanges || isLocking}
              loading={isLocking}
              startIcon={<Iconify icon={GlobalIcons.lockIcon} />}
              onClick={onConfirmLock}
            >
              Lock Assignments
            </LoadingButton>
          </>
        )}
      </DialogActions>
    </CustomDialog>
  );
}
