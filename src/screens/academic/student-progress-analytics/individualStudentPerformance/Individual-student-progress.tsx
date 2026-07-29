'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import { Box, Grid, Card, Alert, Typography } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { AcademicInsightSections } from 'src/screens/academic/student-academic-360/components/AcademicInsightSections';

import { buildInsightCards } from './insightCards';
import { Student360FilterBar } from './components/Student360FilterBar';
import { Student360ActionPanels } from './components/Student360ActionPanels';
import { Student360InsightCards } from './components/Student360InsightCards';
import { SubjectPerformancePanel } from './components/SubjectPerformancePanel';
import { StudentAnalyticsSkeleton } from './components/StudentAnalyticsSkeleton';
import { Student360AnalyticsProfile } from './components/Student360AnalyticsProfile';
import { useIndividualStudent360Analytics } from './hooks/useIndividualStudent360Analytics';

const IndividualStudentProgress = (props: Partial<TabComponentType>) => {
  const analytics = useIndividualStudent360Analytics(props);
  const {
    classItems,
    selectedClassId,
    divisionOptions,
    selectedDivisionId,
    selectedStudentId,
    studentOptions,
    selectedStudent,
    academic360,
    isStudentsLoading,
    isStudentsError,
    isAcademic360Loading,
    isAcademic360Error,
    handleClassChange,
    handleDivisionChange,
    handleStudentChange,
  } = analytics;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <CustomBreadcrumbs
        sx={{ mb: 1 }}
        heading="Individual Student Progress"
        description="Analytics powered by Student Academic 360 data for attendance, learning, subject progress, alerts and readiness."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Student Progress Analytics' },
          { name: 'Individual Student Progress' },
        ]}
      />

      <Student360FilterBar
        classItems={classItems}
        selectedClassId={selectedClassId}
        divisionOptions={divisionOptions}
        selectedDivisionId={selectedDivisionId}
        studentOptions={studentOptions}
        selectedStudentId={selectedStudentId}
        isStudentsLoading={isStudentsLoading}
        onClassChange={handleClassChange}
        onDivisionChange={handleDivisionChange}
        onStudentChange={handleStudentChange}
      />

      {isStudentsError && (
        <Alert severity="error" variant="outlined">
          Unable to load students for the selected division. Please refresh or choose another
          division.
        </Alert>
      )}

      {selectedStudentId && isAcademic360Error && (
        <Alert severity="error" variant="outlined">
          Unable to load Student Academic 360 analytics for the selected student.
        </Alert>
      )}

      {!selectedStudentId && !isStudentsLoading ? (
        <Card variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="subtitle1">
            Select a student to view Academic 360 analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The analytics view will show health score, attendance, learning tasks, subject trends,
            alerts and upcoming work.
          </Typography>
        </Card>
      ) : isAcademic360Loading ? (
        <StudentAnalyticsSkeleton />
      ) : (
        <Grid container spacing={1}>
          <Grid size={{ xs: 12 }}>
            <Student360AnalyticsProfile
              student={academic360?.student || selectedStudent}
              health={academic360?.academicHealth}
              completeness={academic360?.dataCompleteness}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Student360InsightCards cards={buildInsightCards(academic360)} />
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <SubjectPerformancePanel subjects={academic360?.subjectPerformance} />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Student360ActionPanels
              alerts={academic360?.alerts}
              upcomingItems={academic360?.upcomingItems}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <AcademicInsightSections
              learningTasks={academic360?.learningTasks}
              subjectPerformance={academic360?.subjectPerformance}
              alerts={academic360?.alerts}
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default IndividualStudentProgress;
