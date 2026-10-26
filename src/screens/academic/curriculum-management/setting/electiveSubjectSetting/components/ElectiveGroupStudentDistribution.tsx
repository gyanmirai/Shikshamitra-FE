import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { EmptyContent } from 'src/components/empty-content';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Stack, Button, Typography, LinearProgress } from '@mui/material';

export function ElectiveGroupStudentDistribution({
  distribution,
  totalStudents,
}: {
  distribution: Array<{ subject: string; count: number }>;
  totalStudents: number;
}) {
  const [showAll, setShowAll] = useState(false);
  const displayedDistribution = showAll ? distribution : distribution.slice(0, 5);
  const maximum =
    distribution.length === 0 ? 1 : Math.max(...distribution.map((item) => item.count || 0));
  const maxStudentCount = maximum > 0 ? maximum : 1;

  return (
    <FormSectionCard
      icon={GlobalIcons.usage}
      title="Student Distribution"
      descriptionTooltip="Recorded student selections by subject. Each bar is relative to the largest subject count."
      action={
        <Typography variant="body2" color="text.secondary">
          {totalStudents} total {totalStudents === 1 ? 'student' : 'students'}
        </Typography>
      }
    >
      {distribution.length > 0 ? (
        <Stack spacing={2}>
          {displayedDistribution.map((item, index) => {
            const percent = Math.round(((item.count || 0) / maxStudentCount) * 100);
            return (
              <Box key={`${item.subject}-${index}`}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="flex-start"
                  justifyContent="space-between"
                  sx={{ mb: 1 }}
                >
                  <Typography variant="body2" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                    {item.subject}
                  </Typography>
                  <Typography variant="body2" sx={{ flexShrink: 0 }}>
                    {item.count} {item.count === 1 ? 'student' : 'students'}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={percent}
                  color={index % 3 === 0 ? 'primary' : index % 3 === 1 ? 'info' : 'success'}
                  aria-label={`${item.subject} relative student count`}
                  sx={{ height: 7, borderRadius: 1 }}
                />
              </Box>
            );
          })}
          {distribution.length > 5 && (
            <Button
              size="small"
              variant="text"
              onClick={() => setShowAll(!showAll)}
              sx={{ alignSelf: 'flex-start' }}
            >
              {showAll ? 'Show less' : `View all (${distribution.length} subjects)`}
            </Button>
          )}
        </Stack>
      ) : (
        <EmptyContent
          title="No student distribution recorded yet"
          description="Student selections by subject will appear here when available for this group."
          sx={{ py: 2, height: 'auto' }}
          slotProps={{ img: { maxWidth: 120 } }}
        />
      )}
    </FormSectionCard>
  );
}
