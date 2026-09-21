import type {
  AdminAcademicDashboardTimetableData,
  AdminAcademicDashboardCurriculumData,
  AdminAcademicDashboardAssessmentData,
} from 'src/redux/academicAPI/academicDashboardApi';

import { Grid, Skeleton } from '@mui/material';

import { getActionQueue, getModuleHealth } from './admin-dashboard-overview-data';
import { AcademicActionQueue } from '../../components/command-center/AcademicActionQueue';
import { AcademicHealthScoreCard } from '../../components/command-center/AcademicHealthScoreCard';
import { AcademicModuleHealthGrid } from '../../components/command-center/AcademicModuleHealthGrid';

type AdminDashboardOverviewProps = {
  curriculum?: AdminAcademicDashboardCurriculumData;
  timetable?: AdminAcademicDashboardTimetableData;
  assessment?: AdminAcademicDashboardAssessmentData;
};

export function AdminDashboardOverview({
  curriculum,
  timetable,
  assessment,
}: AdminDashboardOverviewProps) {
  const overviewData = { curriculum, timetable, assessment };
  const isHealthReady = Boolean(curriculum && timetable && assessment);

  return (
    <Grid container spacing={1} alignItems="stretch">
      <Grid size={{ xs: 12, lg: 4 }}>
        {isHealthReady && curriculum && timetable && assessment ? (
          <AcademicHealthScoreCard
            title="Academic Health"
            score={Math.round(
              (curriculum.curriculumCompletion +
                timetable.timetableRate +
                assessment.readinessRate) /
                3
            )}
            status={
              timetable.conflictsCount > 0 || assessment.pendingGradeEntries > 0
                ? 'Needs Attention'
                : 'Healthy'
            }
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
        ) : (
          <Skeleton variant="rounded" height={300} />
        )}
      </Grid>
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
