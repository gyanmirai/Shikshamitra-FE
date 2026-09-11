import type { ReviewRecord } from 'src/redux/student/admissions/admission-review-types';

import dayjs from 'dayjs';
import { Chip, Stack, Typography } from '@mui/material';

import { ReviewEvidence } from './review-evidence';
import { recommendationLabels } from './review-model';

export function ReviewRecordDetails({
  record,
  showEvidence = false,
}: {
  record: ReviewRecord;
  showEvidence?: boolean;
}) {
  return (
    <Stack spacing={1} sx={{ overflowWrap: 'anywhere' }}>
      <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
        <Typography variant="subtitle2">
          Record {record.sequenceNumber} ·{' '}
          {record.status === 'assignment'
            ? 'Assignment updated'
            : record.status === 'submitted'
              ? 'Recommendation submitted'
              : 'Draft saved'}
        </Typography>
        {record.isStale && <Chip size="small" color="warning" label="Evidence changed" />}
      </Stack>
      <Typography variant="caption" color="text.secondary">
        Recorded {dayjs(record.recordedAt).format('DD MMM YYYY, h:mm A')} · By {record.recordedBy}
      </Typography>
      {record.recommendation && (
        <Typography variant="body2">
          Recommendation: {recommendationLabels[record.recommendation]}
        </Typography>
      )}
      {record.reason && (
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          Reason: {record.reason}
        </Typography>
      )}
      {record.notes && (
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          Notes: {record.notes}
        </Typography>
      )}
      {record.checklist.map((item) => (
        <Typography key={item.code} variant="body2">
          {item.checked ? 'Confirmed' : 'Not confirmed'} · {item.name}
          {item.required ? ' (required)' : ''}
          {item.notes ? ` · ${item.notes}` : ''}
        </Typography>
      ))}
      <Typography variant="body2" color="text.secondary">
        Assigned to {record.assignedReviewerName || 'Unassigned'} ·{' '}
        {record.dueAt ? `Due ${dayjs(record.dueAt).format('DD MMM YYYY, h:mm A')}` : 'No deadline'}
      </Typography>
      {record.decision && (
        <Stack spacing={0.5} sx={{ borderLeft: 3, borderColor: 'primary.main', pl: 1.5 }}>
          <Typography variant="subtitle2">
            Decision:{' '}
            {record.decision.decision === 'requestCorrection'
              ? 'Corrections requested'
              : record.decision.decision === 'approve'
                ? 'Approved'
                : record.decision.decision === 'reject'
                  ? 'Rejected'
                  : 'Waitlisted'}
          </Typography>
          <Typography variant="caption">
            {dayjs(record.decision.decidedAt).format('DD MMM YYYY, h:mm A')} · By{' '}
            {record.decision.decidedBy}
          </Typography>
          {record.decision.reason && (
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {record.decision.reason}
            </Typography>
          )}
        </Stack>
      )}
      {showEvidence && <ReviewEvidence items={record.prerequisites} />}
    </Stack>
  );
}
