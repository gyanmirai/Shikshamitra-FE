import { Box, Alert, Skeleton, Stack, Typography } from '@mui/material';

import { getValidationIssueLabel } from '../../utils/validationIssueLabels';

import type { SeatingValidationIssue } from '../../types';

export default function AllocationConflictPanel({
  blockers,
  warnings,
  isLoading = false,
}: {
  blockers: SeatingValidationIssue[];
  warnings: SeatingValidationIssue[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <Stack spacing={1}>
        {[1, 2, 3].map((i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Skeleton key={i} variant="rounded" height={48} sx={{ borderRadius: 1 }} />
        ))}
      </Stack>
    );
  }

  if (blockers.length === 0 && warnings.length === 0) {
    return (
      <Alert severity="success" variant="outlined" sx={{ fontSize: '0.8rem' }}>
        No conflicts detected.
      </Alert>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {blockers.map((issue, idx) => (
        // eslint-disable-next-line react/no-array-index-key
        <Alert key={`b-${idx}`} severity="error" variant="outlined" sx={{ fontSize: '0.78rem' }}>
          <Typography variant="caption" fontWeight={700} display="block">
            {getValidationIssueLabel(issue.code)}
          </Typography>
          {issue.message}
        </Alert>
      ))}
      {warnings.map((issue, idx) => (
        // eslint-disable-next-line react/no-array-index-key
        <Alert key={`w-${idx}`} severity="warning" variant="outlined" sx={{ fontSize: '0.78rem' }}>
          <Typography variant="caption" fontWeight={700} display="block">
            {getValidationIssueLabel(issue.code)}
          </Typography>
          {issue.message}
        </Alert>
      ))}
    </Box>
  );
}
