import type { ReviewDecisionCapabilities } from 'src/redux/student/admissions/admission-review-types';

import { Stack, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';

import { managedReviewAllowsDecision } from '../review/review-model';

import type { AdmissionDecisionAction } from './use-admission-application-decisions';

type Props = {
  actions: AdmissionDecisionAction[];
  busy: boolean;
  reviewDecision?: ReviewDecisionCapabilities | null;
  reaffirmApproval?: boolean;
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

export function ApplicationDecisionActions({
  actions,
  busy,
  onSelect,
  reviewDecision,
  reaffirmApproval,
}: Props) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
      {actions.map((item) => (
        <Button
          key={item}
          size="small"
          variant={item === 'reject' || item === 'decline' ? 'outlined' : 'contained'}
          color={item === 'reject' || item === 'decline' ? 'warning' : 'primary'}
          disabled={busy || !managedReviewAllowsDecision(reviewDecision, item)}
          startIcon={
            <Iconify
              icon={item === 'offer' ? 'mdi:email-fast-outline' : 'mdi:check-circle-outline'}
            />
          }
          onClick={() => onSelect(item)}
        >
          {item === 'approve' && reaffirmApproval ? 'Reaffirm approval' : ACTION_LABELS[item]}
        </Button>
      ))}
    </Stack>
  );
}
