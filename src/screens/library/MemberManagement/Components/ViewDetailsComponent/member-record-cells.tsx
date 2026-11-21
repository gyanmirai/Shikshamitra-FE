import type { MemberBookRecord } from 'src/redux/library/libraryMembers/member-record-types';

import { Stack, Typography } from '@mui/material';
import { Label } from 'src/components/label';

export function MemberRecordTitle({ row }: { row: MemberBookRecord }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="body2">{row.bookTitle || 'Title unavailable'}</Typography>
      {(row.requiresCopyReconciliation || row.copyLinkSource === 'LegacyAccessionCandidate') && (
        <Typography variant="caption" color="warning.main">
          Copy link needs review
        </Typography>
      )}
    </Stack>
  );
}

export function MemberLoanState({ status }: { status?: number | null }) {
  const states = ['Issued', 'Returned', 'Overdue (recorded)'];
  const colors = ['info', 'success', 'error'] as const;
  const known = status != null && [0, 1, 2].includes(status);
  return (
    <Label color={known ? colors[status] : 'default'}>
      {known ? states[status] : 'State unavailable'}
    </Label>
  );
}
