import { Box, Typography } from '@mui/material';

type HrReportsSummaryCardsProps = {
  activeExports: number;
  completedExports: number;
  draftTemplates: number;
  activeSchedules: number;
};

export function HrReportsSummaryCards({
  activeExports,
  completedExports,
  draftTemplates,
  activeSchedules,
}: HrReportsSummaryCardsProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1.5,
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, minmax(0, 1fr))' },
      }}
    >
      {[
        ['Queued / Running', activeExports],
        ['Completed Exports', completedExports],
        ['Draft Templates', draftTemplates],
        ['Active Schedules', activeSchedules],
      ].map(([label, value]) => (
        <Box
          key={label}
          sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5 }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
