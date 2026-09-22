'use client';

import dynamic from 'next/dynamic';
import { Box, Grid, Alert, Button, Skeleton } from '@mui/material';
import {
  type AdminAcademicDashboardData,
  useGetAdminAcademicDashboardAnalyticsQuery,
} from 'src/redux/academicAPI/academicDashboardApi';

import RecentActivities from './RecentActivities';
import OperationalStatus from './OperationalStatus';
import ConfigurationStatus from './ConfigurationStatus';
import { useDeferredRender } from '../hooks/useDeferredRender';

const ChartSkeleton = () => <Skeleton variant="rounded" height={390} />;

const SubjectPassFailChart = dynamic(() => import('./SubjectPassFailChart'), {
  loading: ChartSkeleton,
});
const ClassSyllabusProgressChart = dynamic(() => import('./ClassSyllabusProgressChart'), {
  loading: ChartSkeleton,
});

const emptyClassSyllabusProgressChart = {
  classNames: [],
  completionPercentages: [],
};

type DeferredAcademicDashboardAnalyticsProps = Pick<
  AdminAcademicDashboardData,
  'configurationStatus' | 'operationalStatus'
>;

export function DeferredAcademicDashboardAnalytics({
  configurationStatus,
  operationalStatus,
}: DeferredAcademicDashboardAnalyticsProps) {
  const { targetRef, shouldRender } = useDeferredRender();
  const { data, isLoading, isError, refetch } = useGetAdminAcademicDashboardAnalyticsQuery(
    undefined,
    { skip: !shouldRender }
  );

  const content = (() => {
    if (!shouldRender || isLoading) {
      return (
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, md: 6 }}>
            <ChartSkeleton />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <ChartSkeleton />
          </Grid>
        </Grid>
      );
    }

    if (isError || !data) {
      return (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Academic analytics could not be loaded.
        </Alert>
      );
    }

    return (
      <>
        <Grid container spacing={1} alignItems="stretch">
          <Grid size={{ xs: 12, md: 6 }}>
            <SubjectPassFailChart chartData={data.subjectPassFailChart} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <ClassSyllabusProgressChart
              chartData={data.classSyllabusProgressChart ?? emptyClassSyllabusProgressChart}
            />
          </Grid>
        </Grid>
        <Grid container spacing={1} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <RecentActivities activities={data.recentActivities} />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <ConfigurationStatus items={configurationStatus} />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <OperationalStatus items={operationalStatus} />
          </Grid>
        </Grid>
      </>
    );
  })();

  return (
    <Box
      ref={targetRef}
      sx={{
        minHeight: 390,
        contentVisibility: 'auto',
        containIntrinsicSize: '390px',
      }}
    >
      {content}
    </Box>
  );
}
