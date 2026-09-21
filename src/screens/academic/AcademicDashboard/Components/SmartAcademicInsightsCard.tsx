import type { AdminAcademicDashboardData } from 'src/redux/academicAPI/academicDashboardApi';

import Link from 'next/link';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { Box, Stack, Button, Typography } from '@mui/material';

import { DashboardSectionCard } from './DashboardSectionCard';

const insightIcon = (severity: string) => {
  if (severity === 'critical') return 'solar:danger-triangle-bold';
  if (severity === 'warning') return 'solar:info-circle-bold';
  return 'solar:lightbulb-bold';
};

export function SmartAcademicInsightsCard({
  insights,
}: {
  insights: AdminAcademicDashboardData['insights'];
}) {
  return (
    <DashboardSectionCard
      title="Smart Academic Insights & System Alerts"
      subheader="School-wide alerts across curriculum, timetable, grading and lesson plans"
      height="100%"
      minHeight={220}
    >
      {insights.length === 0 ? (
        <EmptyContent
          title="No academic insights"
          description="There are no school-wide alerts requiring attention right now."
          sx={{ minHeight: 130, py: 1 }}
          slotProps={{ img: { maxWidth: 110 } }}
        />
      ) : (
        <Stack spacing={1}>
          {insights.map((insight, index) => (
            <Box
              key={`${insight.source}-${index}`}
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: 'background.neutral',
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'stretch', sm: 'flex-start' }}
                justifyContent="space-between"
                spacing={1}
              >
                <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ minWidth: 0 }}>
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: 1,
                      display: 'grid',
                      placeItems: 'center',
                      color: (theme) =>
                        insight.severity === 'critical'
                          ? theme.palette.error.main
                          : theme.palette.warning.main,
                      bgcolor: (theme) =>
                        alpha(
                          insight.severity === 'critical'
                            ? theme.palette.error.main
                            : theme.palette.warning.main,
                          0.08
                        ),
                    }}
                  >
                    <Iconify icon={insightIcon(insight.severity)} width={18} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2">{insight.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {insight.summary}
                    </Typography>
                  </Box>
                </Stack>
                {insight.actionHref ? (
                  <Button component={Link} href={insight.actionHref} size="small" variant="text">
                    {insight.actionLabel || 'Open'}
                  </Button>
                ) : null}
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </DashboardSectionCard>
  );
}
