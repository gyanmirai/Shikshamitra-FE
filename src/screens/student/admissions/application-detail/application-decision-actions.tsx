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
    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: compact ? 1 : 2 }}>
      {actions.map((item) => (
        <Button
          key={item}
          size="small"
          variant={item === 'approve' ? 'contained' : 'outlined'}
          color={item === 'reject' ? 'error' : 'inherit'}
          disabled={busy}
          startIcon={
            <Iconify
              icon={
                item === 'approve'
                  ? 'mdi:check'
                  : item === 'waitlist'
                    ? 'mdi:clock-outline'
                    : 'mdi:close'
              }
            />
          }
          onClick={() => onSelect(item)}
        >
          {ACTION_LABELS[item]}
        </Button>
      ))}
    </Stack>
  );
}
