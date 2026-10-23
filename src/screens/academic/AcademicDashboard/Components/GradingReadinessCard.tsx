import type { AdminAcademicDashboardAssessmentData } from 'src/redux/academicAPI/academicDashboardApi';

import Link from 'next/link';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { academicPaths } from 'src/constants/academic-menu';
import { Box, Grid, Chip, Stack, Typography } from '@mui/material';

import { TopMetricTile } from './TopMetricTile';
import { getGradingStatus } from './academic-readiness';
import { DashboardSectionCard } from './DashboardSectionCard';

const formatCount = (value?: number | null) => new Intl.NumberFormat('en-IN').format(value || 0);

export function GradingReadinessCard({ data }: { data: AdminAcademicDashboardAssessmentData }) {
  const gradingStatus = getGradingStatus(data);
  const requiresAction = gradingStatus !== 'Compiled';

  return (
    <DashboardSectionCard
      title="Grading & Exam Readiness"
      subheader="School-wide assessment status across all classes"
      height="100%"
      minHeight={236}
      action={
        <Chip
          size="small"
          variant="outlined"
          label={requiresAction ? 'Action Needed' : 'Ready'}
          sx={{
            color: requiresAction ? 'error.main' : 'success.main',
            borderColor: (theme) =>
              alpha(requiresAction ? theme.palette.error.main : theme.palette.success.main, 0.32),
            bgcolor: (theme) =>
              alpha(requiresAction ? theme.palette.error.main : theme.palette.success.main, 0.06),
            fontWeight: 700,
          }}
        />
      }
    >
      <Stack spacing={1}>
        <Box
          component={Link}
          href={academicPaths.examination.recordMarks}
          sx={{
            p: 1.5,
            borderRadius: 1,
            color: 'text.primary',
            textDecoration: 'none',
            bgcolor: (theme) =>
              alpha(requiresAction ? theme.palette.error.main : theme.palette.success.main, 0.06),
            border: (theme) =>
              `1px solid ${alpha(requiresAction ? theme.palette.error.main : theme.palette.success.main, 0.18)}`,
          }}
        >
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" spacing={1}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Assessment Cycle
                </Typography>
                <Typography variant="h3" sx={{ lineHeight: 1.05 }}>
                  {gradingStatus}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 1,
                  display: 'grid',
                  placeItems: 'center',
                  color: requiresAction ? 'error.main' : 'success.main',
                  bgcolor: (theme) =>
                    alpha(
                      requiresAction ? theme.palette.error.main : theme.palette.success.main,
                      0.1
                    ),
                }}
              >
                <Iconify icon="solar:wallet-money-bold" width={24} />
              </Box>
            </Stack>
            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Grade Compilation Progress
                </Typography>
                <Typography variant="caption" fontWeight={700}>
                  {data.readinessRate}%
                </Typography>
              </Stack>
              <Box
                sx={{
                  height: 8,
                  borderRadius: 1,
                  bgcolor: (theme) =>
                    alpha(
                      requiresAction ? theme.palette.error.main : theme.palette.success.main,
                      0.13
                    ),
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: `${data.readinessRate}%`,
                    height: 1,
                    bgcolor: requiresAction ? 'error.main' : 'success.main',
                  }}
                />
              </Box>
            </Box>
          </Stack>
        </Box>
        <Grid container spacing={1}>
          <Grid size={{ xs: 6 }}>
            <TopMetricTile
              label="Pending Grade"
              value={formatCount(data.pendingGradeEntries)}
              icon="solar:document-text-bold"
              tone="error"
              href={academicPaths.examination.recordMarks}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TopMetricTile
              label="Pending Homework"
              value={formatCount(data.pendingEvaluations)}
              icon="solar:notebook-bold"
              tone="warning"
              href={academicPaths.homework.assessment}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TopMetricTile
              label="Upcoming Exams"
              value={formatCount(data.upcomingExams)}
              helper="Starting this week"
              icon="solar:medal-star-linear"
              tone="info"
              href={academicPaths.examination.schedule}
            />
          </Grid>
        </Grid>
      </Stack>
    </DashboardSectionCard>
  );
}
