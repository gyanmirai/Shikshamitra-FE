import { Stack, Typography } from '@mui/material';

interface GradeEntryPassFailDistributionProps {
  passCount: number;
  failCount: number;
  passPercentage: number;
  failPercentage: number;
}

export function GradeEntryPassFailDistribution({
  passCount,
  failCount,
  passPercentage,
  failPercentage,
}: GradeEntryPassFailDistributionProps) {
  return (
    <Stack spacing={1} aria-label="Pass / Fail Distribution">
      <Typography variant="subtitle2">Pass / Fail Distribution</Typography>
      {[
        { label: 'Passed Students', count: passCount, percentage: passPercentage },
        { label: 'Failed Students', count: failCount, percentage: failPercentage },
      ].map(({ label, count, percentage }) => (
        <Stack key={label} direction="row" justifyContent="space-between" spacing={1}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {count} ({percentage}%)
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
