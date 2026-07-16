import { Box, Alert, Typography } from '@mui/material';

interface Props {
  blockers: number;
  warnings: number;
  allocationProgress: number;
}

export default function SeatingReadinessBanner({ blockers, warnings, allocationProgress }: Props) {
  let severity: 'success' | 'warning' | 'error' = 'success';
  let title = 'Ready to Finalize';

  if (blockers > 0) {
    severity = 'error';
    title = 'Needs Attention';
  } else if (allocationProgress < 100) {
    severity = 'warning';
    title = 'Incomplete';
  }

  return (
    <Alert severity={severity} variant="filled" sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="body2">
          {allocationProgress}% allocated · {blockers} blocker{blockers === 1 ? '' : 's'} · {warnings} warning
          {warnings === 1 ? '' : 's'}
        </Typography>
      </Box>
    </Alert>
  );
}
