import { Stack, Typography } from '@mui/material';

import type { LibraryLoanRow } from './loan-types';

export function LoanMemberCell({ row }: { row: LibraryLoanRow }) {
  const source =
    row.memberDisplaySource === 'LoanSnapshot'
      ? 'Saved loan snapshot'
      : row.memberDisplaySource === 'CurrentAuthorizedRecord'
        ? 'Current authorized record'
        : 'Display source unavailable';
  return (
    <Stack spacing={0.25} sx={{ overflowWrap: 'anywhere' }}>
      <Typography variant="body2">
        {row.memberName || row.memberIdentifier || row.memberId || 'Unavailable'}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {source}
      </Typography>
    </Stack>
  );
}
