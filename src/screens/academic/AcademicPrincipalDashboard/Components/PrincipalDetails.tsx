import { Grid, Alert, Button, Skeleton } from '@mui/material';
import {
  type PrincipalAcademicDashboardAnalyticsData,
  useGetPrincipalAcademicDashboardAnalyticsQuery,
} from 'src/redux/academicAPI/academicDashboardApi';

import { PerformersList } from '../../AcademicDashboard/Components/Performers';
import AcademicDashboardExams from '../../dashboard/components/AcademicDashboardExams';
import SubjectPassFailChart from '../../AcademicDashboard/Components/SubjectPassFailChart';
import ChapterCompletionChart from '../../AcademicDashboard/Components/ChapterCompletionChart';
import TeacherPerformanceComparisonChart from '../../AcademicDashboard/Components/TeacherPerformanceComparisonChart';

export default function PrincipalDetails({
  legacyAnalytics,
}: {
  legacyAnalytics?: PrincipalAcademicDashboardAnalyticsData;
}) {
  const {
    data: sectionData,
    isLoading,
    isError,
    refetch,
  } = useGetPrincipalAcademicDashboardAnalyticsQuery(undefined, { skip: Boolean(legacyAnalytics) });
  const data = legacyAnalytics ?? sectionData;

  if (isLoading) {
    return <Skeleton variant="rounded" height={390} />;
  }

  if (isError || !data) {
    return (
      <Alert severity="error" action={<Button onClick={() => refetch()}>Retry</Button>}>
        Principal dashboard details could not be loaded.
      </Alert>
    );
  }

  return (
    <Grid container spacing={1}>
      <Grid size={{ xs: 12, md: 6 }}>
        <ChapterCompletionChart chartData={data.chapterCompletionChart} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <SubjectPassFailChart chartData={data.subjectPassFailChart} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TeacherPerformanceComparisonChart chartData={data.teacherPerformanceComparison} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <AcademicDashboardExams list={data.upcomingExamsList} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <PerformersList
          title="Top Performers"
          list={data.topPerformers}
          type="top"
          sx={{ height: '100%' }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <PerformersList
          title="Bottom Performers"
          list={data.bottomPerformers}
          type="bottom"
          sx={{ height: '100%' }}
        />
      </Grid>
    </Grid>
  );
}
