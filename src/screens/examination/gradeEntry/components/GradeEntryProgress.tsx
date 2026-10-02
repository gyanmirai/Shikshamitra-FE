import { Box, Stack, Typography, LinearProgress } from '@mui/material';

interface GradeEntryProgressProps {
  totalCount: number;
  gradedCount: number;
}

export function GradeEntryProgress({ totalCount, gradedCount }: GradeEntryProgressProps) {
  const completionPct = totalCount > 0 ? Math.round((gradedCount / totalCount) * 100) : 0;

  return (
    <Box
      sx={{
        mb: 2,
        p: 1.5,
        bgcolor: 'background.paper',
        borderRadius: 1.5,
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        spacing={0.5}
        sx={{ mb: 1 }}
      >
        <Typography variant="subtitle2">Grade Entry Progress</Typography>
        <Typography variant="body2" color="text.secondary">
          {completionPct}% Complete ({gradedCount} Graded / {totalCount} Total)
        </Typography>
      </Stack>
      <LinearProgress
        aria-label="Grade entry completion"
        variant="determinate"
        value={completionPct}
        color="primary"
        sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover' }}
      />
    </Box>
  );
}
