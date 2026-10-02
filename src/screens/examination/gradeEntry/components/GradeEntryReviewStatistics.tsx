import { Box, Typography } from '@mui/material';
import { TimetableSettingsSummaryCards } from 'src/components/timetable-settings-summary-cards/TimetableSettingsSummaryCards';

import { GradeEntryPassFailDistribution } from './GradeEntryPassFailDistribution';

import type { GradeEntryReviewStats } from '../types/grade-entry-review';

export function GradeEntryReviewStatistics({ stats }: { stats: GradeEntryReviewStats }) {
  const passPercentage =
    stats.gradedCount > 0 ? Math.round((stats.passCount / stats.gradedCount) * 100) : 0;
  const failPercentage =
    stats.gradedCount > 0 ? Math.round((stats.failCount / stats.gradedCount) * 100) : 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1 }}>
      <Typography variant="overline" color="text.secondary" sx={{ mb: 1 }}>
        Marks Summary KPIs
      </Typography>
      <TimetableSettingsSummaryCards
        tone="neutral"
        cardsPerRow={2}
        cards={[
          { label: 'Highest Marks', value: stats.highestMarks, icon: 'solar:arrow-up-bold' },
          { label: 'Lowest Marks', value: stats.lowestMarks, icon: 'solar:arrow-down-bold' },
          { label: 'Average Marks', value: stats.averageMarks, icon: 'solar:graph-new-bold' },
          { label: 'Total Present', value: stats.gradedCount, icon: 'solar:user-bold' },
        ]}
      />
      <Box
        sx={{
          mt: 0.5,
          p: 1.5,
          bgcolor: 'background.paper',
          borderRadius: 1.5,
          border: 1,
          borderColor: 'divider',
          flexGrow: 1,
        }}
      >
        <GradeEntryPassFailDistribution
          passCount={stats.passCount}
          failCount={stats.failCount}
          passPercentage={passPercentage}
          failPercentage={failPercentage}
        />
      </Box>
    </Box>
  );
}
