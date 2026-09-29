import dynamic from 'next/dynamic';
import { Grid, Alert, Button, Skeleton } from '@mui/material';
import { HomeworkStatus } from 'src/screens/student/dashboard/teacher/charts';
import { UpcomingExams } from 'src/screens/student/dashboard/teacher/OperationsTasks';
import {
  type TeacherAcademicDashboardOverviewData,
  type TeacherAcademicDashboardAnalyticsData,
  useGetTeacherAcademicDashboardAnalyticsQuery,
} from 'src/redux/academicAPI/academicDashboardApi';

import { QuickActionsPanel } from './QuickActionsPanel';
import { PendingTaskCenter } from './PendingTaskCenter';
import { StudentsAttentionPanel } from './StudentsAttentionPanel';

const ChartSkeleton = () => <Skeleton variant="rounded" height={320} />;

const AcademicDashbordAnalysisChart = dynamic(() => import('./AcademicDashbordAnalysisChart'), {
  loading: ChartSkeleton,
});
const AcademicDashboardChapterProgress = dynamic(
  () => import('./AcademicDashboardChapterProgress'),
  {
    loading: ChartSkeleton,
  }
);

export default function DeferredTeacherDetails({
  data,
  legacyAnalytics,
}: {
  data: TeacherAcademicDashboardOverviewData;
  legacyAnalytics?: TeacherAcademicDashboardAnalyticsData;
}) {
  const {
    data: sectionAnalytics,
    isLoading,
    isError,
    refetch,
  } = useGetTeacherAcademicDashboardAnalyticsQuery(undefined, { skip: Boolean(legacyAnalytics) });
  const analytics = legacyAnalytics ?? sectionAnalytics;

  return (
    <Grid container spacing={1}>
      <Grid size={{ xs: 12 }}>
        <QuickActionsPanel />
      </Grid>
      <Grid size={{ xs: 12 }}>
        {analytics ? (
          <AcademicDashbordAnalysisChart chartData={analytics.performanceDistribution} />
        ) : isLoading ? (
          <ChartSkeleton />
        ) : null}
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        {analytics ? (
          <AcademicDashboardChapterProgress chartData={analytics.chapterProgressChart} />
        ) : isLoading ? (
          <ChartSkeleton />
        ) : null}
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <PendingTaskCenter tasks={data.pendingTasks} />
      </Grid>
      {isError ? (
        <Grid size={{ xs: 12 }}>
          <Alert severity="error" action={<Button onClick={() => refetch()}>Retry</Button>}>
            Teacher dashboard charts could not be loaded.
          </Alert>
        </Grid>
      ) : null}
      <Grid size={{ xs: 12, md: 6 }}>
        <HomeworkStatus data={data.homeworkStatus} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <UpcomingExams exams={data.upcomingExamsList} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <StudentsAttentionPanel students={data.studentsAttention} />
      </Grid>
    </Grid>
  );
}
