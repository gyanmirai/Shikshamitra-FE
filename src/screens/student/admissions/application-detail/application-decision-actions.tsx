import { Stack, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';

import type { AdmissionDecisionAction } from './use-admission-application-decisions';

type Props = {
  actions: AdmissionDecisionAction[];
  busy: boolean;
  onSelect: (action: AdmissionDecisionAction) => void;
};

const ACTION_LABELS: Record<AdmissionDecisionAction, string> = {
  review: 'Start review',
  approve: 'Approve',
  waitlist: 'Waitlist',
  reject: 'Reject',
  offer: 'Issue offer',
  accept: 'Accept offer',
  decline: 'Decline offer',
};

export function ApplicationDecisionActions({ actions, busy, onSelect }: Props) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
      {actions.map((item) => (
        <Button
          key={item}
          size="small"
          variant={item === 'reject' || item === 'decline' ? 'outlined' : 'contained'}
          color={item === 'reject' || item === 'decline' ? 'warning' : 'primary'}
          disabled={busy}
          startIcon={
            <Iconify
              icon={item === 'offer' ? 'mdi:email-fast-outline' : 'mdi:check-circle-outline'}
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

