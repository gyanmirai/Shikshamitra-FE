import type { AdminAcademicDashboardCurriculumData } from 'src/redux/academicAPI/academicDashboardApi';

import Link from 'next/link';
import { alpha } from '@mui/material/styles';
import { academicPaths } from 'src/constants/academic-menu';
import { Box, Grid, Stack, Button, Typography } from '@mui/material';

import { TopMetricTile } from './TopMetricTile';
import { CommandMetricRow } from './CommandMetricRow';
import { DashboardSectionCard } from './DashboardSectionCard';

const formatCount = (value?: number | null) => new Intl.NumberFormat('en-IN').format(value || 0);

export function CurriculumSnapshotCard({ data }: { data: AdminAcademicDashboardCurriculumData }) {
  const curriculumPercentage = data.curriculumCompletion;

  return (
    <DashboardSectionCard
      title="Curriculum & Class Composition"
      subheader="School-wide syllabus and student totals across all classes"
      height="100%"
      minHeight={236}
      action={
        <Button component={Link} href={academicPaths.curriculum.chaptersManagement} size="small">
          Curriculum
        </Button>
      }
    >
      <Stack spacing={1}>
        <Stack
          direction={{ xs: 'column', sm: 'row', lg: 'column', xl: 'row' }}
          spacing={1}
          alignItems="center"
        >
          <Box
            sx={{
              width: { xs: '100%', sm: 170, lg: '100%', xl: 170 },
              height: 158,
              position: 'relative',
              display: 'grid',
              placeItems: 'center',
              borderRadius: 1,
              bgcolor: (theme) => alpha(theme.palette.success.main, 0.035),
              border: (theme) => `1px solid ${alpha(theme.palette.success.main, 0.14)}`,
            }}
          >
            <Box
              role="img"
              aria-label={`${curriculumPercentage}% curriculum completed`}
              sx={{
                width: 138,
                height: 138,
                borderRadius: '50%',
                background: (theme) =>
                  `conic-gradient(${theme.palette.success.main} 0 ${curriculumPercentage}%, ${alpha(theme.palette.warning.main, 0.22)} ${curriculumPercentage}% 100%)`,
                display: 'grid',
                placeItems: 'center',
                '&::after': {
                  content: '""',
                  width: 102,
                  height: 102,
                  borderRadius: '50%',
                  bgcolor: 'background.paper',
                },
              }}
            />
            <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ lineHeight: 1 }}>
                  {curriculumPercentage}%
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Completed
                </Typography>
              </Box>
            </Box>
          </Box>
          <Stack spacing={1} sx={{ width: 1, minWidth: 0 }}>
            <CommandMetricRow
              label="Total Students"
              value={formatCount(data.totalStudents)}
              helper="Across configured classes"
              icon="solar:users-group-two-rounded-bold"
            />
            <CommandMetricRow
              label="Total Teachers"
              value={formatCount(data.totalTeachers)}
              helper="Teaching staff"
              icon="solar:graduation-cap-bold"
              tone="success"
            />
          </Stack>
        </Stack>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TopMetricTile
              label="Assigned Subjects"
              value={formatCount(data.assignedSubjects)}
              helper="Core & electives"
              icon="solar:book-bookmark-bold"
              tone="info"
              href={academicPaths.curriculum.subjectsAssignment}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TopMetricTile
              label="Elective Groups"
              value={formatCount(data.electiveGroups)}
              helper={`${formatCount(data.pendingElectiveGroups)} pending setup`}
              icon="solar:users-group-two-rounded-bold"
              tone="warning"
              href={academicPaths.curriculum.settings.electiveGroupCreation}
            />
          </Grid>
        </Grid>
      </Stack>
    </DashboardSectionCard>
  );
}
