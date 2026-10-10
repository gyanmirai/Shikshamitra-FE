import { Iconify } from 'src/components/iconify';
import { Button, DialogActions } from '@mui/material';
import { LoadingButton } from 'src/components/loading-button';

import {
  isDangerousAdmissionDecision,
  ADMISSION_DECISION_ACTION_LABELS,
} from './application-decision-model';

import type { AdmissionDecisionAction } from './use-admission-application-decisions';

export function ApplicationDecisionDialogActions({
  action,
  busy,
  concurrencyUnavailable,
  onCancel,
  onConfirm,
}: {
  action: AdmissionDecisionAction;
  busy: boolean;
  concurrencyUnavailable: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
      <Button
        variant="outlined"
        size="small"
        disabled={busy}
        startIcon={<Iconify icon="mdi:close" />}
        onClick={onCancel}
      >
        Cancel
      </Button>
      <LoadingButton
        variant="contained"
        size="small"
        disabled={busy || concurrencyUnavailable}
        color={isDangerousAdmissionDecision(action) ? 'warning' : 'inherit'}
        loading={busy}
        startIcon={<Iconify icon="mdi:check-circle-outline" />}
        onClick={onConfirm}
      >
        {ADMISSION_DECISION_ACTION_LABELS[action]}
      </LoadingButton>
    </DialogActions>
  );
}
