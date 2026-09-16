import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { Stack, Typography } from '@mui/material';

import type { SubstitutionRow } from '../substitutionData';
import type { DutyAction, DutyActionPayload } from '../services/duty-actions';

type Props = {
  item: SubstitutionRow;
  pendingAction: DutyActionPayload | null;
  onAction: (id: string, action: DutyAction) => void;
};

export function TeacherDutyActions({ item, pendingAction, onAction }: Props) {
  if (['Completed', 'Cancelled', 'Rejected'].includes(item.status)) {
    return (
      <Typography variant="caption" color="text.secondary">
        Duty {item.status.toLowerCase()}
      </Typography>
    );
  }
  if (!item.isResponseWindowOpen) {
    return (
      <Typography variant="caption" color="text.secondary">
        Response window closed
      </Typography>
    );
  }

  const isAccepted = item.acknowledgementStatus === 'Accepted';
  const isChangeRequested = item.acknowledgementStatus === 'Change Requested';
  const disabled =
    isAccepted || isChangeRequested || item.acknowledgementStatus === 'Rejected' || !!pendingAction;
  const pending = pendingAction?.id === item.id ? pendingAction.action : null;

  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <LoadingButton
        size="small"
        variant="contained"
        color="success"
        disabled={disabled}
        loading={pending === 'accept'}
        loadingPosition="start"
        startIcon={<Iconify icon="mdi:check" width={16} />}
        onClick={() => onAction(item.id, 'accept')}
      >
        {isAccepted ? 'Accepted' : 'Accept'}
      </LoadingButton>
      <LoadingButton
        size="small"
        variant="outlined"
        color="warning"
        disabled={disabled}
        loading={pending === 'change'}
        loadingPosition="start"
        startIcon={<Iconify icon="mdi:swap-horizontal" width={16} />}
        onClick={() => onAction(item.id, 'change')}
      >
        {isChangeRequested ? 'Requested' : 'Change'}
      </LoadingButton>
      <LoadingButton
        size="small"
        variant="outlined"
        color="error"
        disabled={disabled}
        loading={pending === 'reject'}
        loadingPosition="start"
        startIcon={<Iconify icon="mdi:close" width={16} />}
        onClick={() => onAction(item.id, 'reject')}
      >
        Reject
      </LoadingButton>
    </Stack>
  );
}
