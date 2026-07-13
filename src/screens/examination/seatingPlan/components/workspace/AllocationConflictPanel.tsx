import { Box, Alert, Typography } from '@mui/material';

import type { SeatingValidationIssue } from '../../types';

export default function AllocationConflictPanel({
  blockers,
  warnings,
}: {
  blockers: SeatingValidationIssue[];
  warnings: SeatingValidationIssue[];
}) {
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
            {issue.code}
          </Typography>
          {issue.message}
        </Alert>
      ))}
      {warnings.map((issue, idx) => (
        // eslint-disable-next-line react/no-array-index-key
        <Alert key={`w-${idx}`} severity="warning" variant="outlined" sx={{ fontSize: '0.78rem' }}>
          <Typography variant="caption" fontWeight={700} display="block">
            {issue.code}
          </Typography>
          {issue.message}
        </Alert>
      ))}
    </Box>
  );
}
