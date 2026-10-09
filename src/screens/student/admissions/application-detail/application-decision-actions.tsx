import { Stack, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';

import type { AdmissionDecisionAction } from './use-admission-application-decisions';

type Props = {
  actions: AdmissionDecisionAction[];
  busy: boolean;
  onSelect: (action: AdmissionDecisionAction) => void;
  compact?: boolean;
};

const ACTION_LABELS: Record<AdmissionDecisionAction, string> = {
  approve: 'Approve',
  waitlist: 'Waitlist',
  reject: 'Reject',
};

export function ApplicationDecisionActions({ actions, busy, onSelect, compact = false }: Props) {
  return (
    <Stack
      direction={compact ? 'row' : { xs: 'column', sm: 'row' }}
      flexWrap="wrap"
      gap={1}
      sx={{ mt: compact ? 1 : 2 }}
    >
      {actions.map((item) => (
        <Button
          key={item}
          size="small"
          variant={
            compact
              ? item === 'approve'
                ? 'contained'
                : 'outlined'
              : item === 'reject'
                ? 'outlined'
                : 'contained'
          }
          color={
            item === 'reject' ? (compact ? 'error' : 'warning') : compact ? 'inherit' : 'primary'
          }
          disabled={busy}
          startIcon={compact ? undefined : <Iconify icon="mdi:check-circle-outline" />}
          onClick={() => onSelect(item)}
        >
          {ACTION_LABELS[item]}
        </Button>
      ))}
    </Stack>
  );
}
