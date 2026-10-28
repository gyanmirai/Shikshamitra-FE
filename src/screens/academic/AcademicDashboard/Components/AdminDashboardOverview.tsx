import type {
  AdminAcademicDashboardTimetableData,
  AdminAcademicDashboardCurriculumData,
  AdminAcademicDashboardAssessmentData,
} from 'src/redux/academicAPI/academicDashboardApi';

import { Box, Grid, Alert, Button, Skeleton } from '@mui/material';

import { getAcademicHealth } from './academic-readiness';
import { getActionQueue, getModuleHealth } from './admin-dashboard-overview-data';
import { AcademicActionQueue } from '../../components/command-center/AcademicActionQueue';
import { AcademicHealthScoreCard } from '../../components/command-center/AcademicHealthScoreCard';
import { AcademicModuleHealthGrid } from '../../components/command-center/AcademicModuleHealthGrid';

type AdminDashboardOverviewProps = {
  curriculum?: AdminAcademicDashboardCurriculumData;
  timetable?: AdminAcademicDashboardTimetableData;
  assessment?: AdminAcademicDashboardAssessmentData;
  hasError?: boolean;
  onRetry?: () => void;
};

export function AdminDashboardOverview({
  curriculum,
  timetable,
  assessment,
  hasError = false,
  onRetry,
}: AdminDashboardOverviewProps) {
  const overviewData = { curriculum, timetable, assessment };
  let healthContent = <Skeleton variant="rounded" height={300} />;
  if (curriculum && timetable && assessment) {
    healthContent = (
      <AcademicHealthScoreCard
        title="Academic Health"
        {...getAcademicHealth(curriculum, timetable, assessment)}
        description="School-wide score across all classes, weighted from curriculum, timetable and grading readiness."
        factors={[
          {
            label: 'Curriculum',
            value: `${curriculum.curriculumCompletion}%`,
            tone: 'success',
          },
          { label: 'Timetable', value: `${timetable.timetableRate}%`, tone: 'info' },
          { label: 'Readiness', value: `${assessment.readinessRate}%`, tone: 'warning' },
          {
            label: 'Pending Work',
            value: `${assessment.pendingGradeEntries + assessment.pendingEvaluations}`,
            tone: 'warning',
          },
        ]}
      />
    );
  } else if (hasError) {
    healthContent = (
      <Box component="section" aria-label="Academic Health">
        <Alert
          severity="error"
          sx={{ minHeight: 300, alignItems: 'center' }}
          action={
            onRetry ? (
              <Button color="inherit" size="small" onClick={onRetry}>
                Retry
              </Button>
            ) : undefined
          }
        >
          Academic health is unavailable because a dashboard section could not be loaded.
        </Alert>
      </Box>
    );
  }

  return (
    <Grid container spacing={1} alignItems="stretch">
      <Grid size={{ xs: 12, lg: 4 }}>{healthContent}</Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <AcademicActionQueue
          title="Priority Action Queue"
          subtitle="Highest-priority school-wide issues across all classes"
          items={getActionQueue(overviewData)}
        />
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <AcademicModuleHealthGrid
          items={getModuleHealth(overviewData)}
          subtitle="School-wide setup, workload and readiness by module"
        />
      </Grid>
    </Grid>
  );
}
