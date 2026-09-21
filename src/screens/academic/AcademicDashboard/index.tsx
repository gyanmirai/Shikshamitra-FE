'use client';

import { Box, Grid, LinearProgress } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { TimetablePulseCard } from './Components/TimetablePulseCard';
import { GradingReadinessCard } from './Components/GradingReadinessCard';
import { DashboardSectionState } from './Components/DashboardSectionState';
import { CurriculumSnapshotCard } from './Components/CurriculumSnapshotCard';
import { AdminDashboardOverview } from './Components/AdminDashboardOverview';
import { AdminDashboardDataScope } from './Components/AdminDashboardDataScope';
import { SmartAcademicInsightsCard } from './Components/SmartAcademicInsightsCard';
import { AcademicDashboardHeaderActions } from './Components/AcademicDashboardHeaderActions';
import { useAdminAcademicDashboardSections } from './hooks/useAdminAcademicDashboardSections';
import { DeferredAcademicDashboardAnalytics } from './Components/DeferredAcademicDashboardCharts';

const AcademicDashboardScreen = () => {
  const { curriculum, timetable, assessment, refetchAll, isFetching } =
    useAdminAcademicDashboardSections();
  const insights = [
    ...(curriculum.data?.insights ?? []),
    ...(timetable.data?.insights ?? []),
    ...(assessment.data?.insights ?? []),
  ];
  const configurationStatus = [
    ...(curriculum.data?.configurationStatus ?? []),
    ...(timetable.data?.configurationStatus ?? []),
  ];
  const operationalStatus = [
    ...(timetable.data?.operationalStatus ?? []),
    ...(assessment.data?.operationalStatus ?? []),
  ];
  const hasAnyPrimaryData = Boolean(curriculum.data || timetable.data || assessment.data);
  const isAnyPrimaryLoading = curriculum.isLoading || timetable.isLoading || assessment.isLoading;
  const didAllPrimaryFail = curriculum.isError && timetable.isError && assessment.isError;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pb: 2 }}>
      <CustomBreadcrumbs
        heading="Academic Dashboard"
        description="School-wide overview of every configured class and division. Use class-level views for individual class details."
        links={[{ name: 'Academics' }, { name: 'Dashboard' }]}
        action={<AcademicDashboardHeaderActions isFetching={isFetching} onRefresh={refetchAll} />}
      />

      <AdminDashboardDataScope />

      {isFetching ? <LinearProgress /> : null}

      <AdminDashboardOverview
        curriculum={curriculum.data}
        timetable={timetable.data}
        assessment={assessment.data}
      />

      <Grid container spacing={1}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <DashboardSectionState
            dataAvailable={Boolean(curriculum.data)}
            isLoading={curriculum.isLoading}
            isError={curriculum.isError}
            onRetry={curriculum.refetch}
            height={430}
          >
            {curriculum.data ? <CurriculumSnapshotCard data={curriculum.data} /> : null}
          </DashboardSectionState>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <DashboardSectionState
            dataAvailable={Boolean(timetable.data)}
            isLoading={timetable.isLoading}
            isError={timetable.isError}
            onRetry={timetable.refetch}
            height={430}
          >
            {timetable.data ? <TimetablePulseCard data={timetable.data} /> : null}
          </DashboardSectionState>
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <DashboardSectionState
            dataAvailable={Boolean(assessment.data)}
            isLoading={assessment.isLoading}
            isError={assessment.isError}
            onRetry={assessment.refetch}
            height={430}
          >
            {assessment.data ? <GradingReadinessCard data={assessment.data} /> : null}
          </DashboardSectionState>
        </Grid>
      </Grid>

      <DashboardSectionState
        dataAvailable={hasAnyPrimaryData}
        isLoading={isAnyPrimaryLoading}
        isError={didAllPrimaryFail}
        onRetry={refetchAll}
        height={220}
      >
        <SmartAcademicInsightsCard insights={insights} />
      </DashboardSectionState>

      <DeferredAcademicDashboardAnalytics
        configurationStatus={configurationStatus}
        operationalStatus={operationalStatus}
      />
    </Box>
  );
};

export default AcademicDashboardScreen;
