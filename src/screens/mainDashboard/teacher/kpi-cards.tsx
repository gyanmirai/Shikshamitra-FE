'use client';

import { Grid } from '@mui/material';
import { academicPaths } from 'src/constants/academic-menu';
import CompactKPICard from 'src/screens/student/dashboard/principal/kpi-card-item';

// ----------------------------------------------------------------------

const kpiData = [
  {
    id: 'TODAYS_CLASSES',
    title: "Today's Classes",
    value: '6',
    status: 'primary' as const,
    tooltip: '6 periods scheduled for today',
    path: academicPaths.timetable.management,
  },
  {
    id: 'PENDING_ASSIGNMENT',
    title: 'Pending Assignment Review',
    value: '7',
    status: 'info' as const,
    tooltip: '7 assignments pending review',
    path: academicPaths.homework.assessment,
  },
  {
    id: 'PENDING_EXAMS_REVIEW',
    title: 'Pending Exam Evaluation',
    value: '3',
    tooltip: '3 exams pending evaluation',
    status: 'success' as const,
    path: academicPaths.examination.recordMarks,
  },
  {
    id: 'PENDING_HOMEWORK',
    title: 'Pending HW Review',
    value: '18',
    status: 'warning' as const,
    tooltip: '18 homework submissions pending review',
    path: academicPaths.homework.assessment,
  },
  {
    id: 'PENDING_CHAPTERS',
    title: 'Pending Chapter Updates',
    value: '5',
    status: 'secondary' as const,
    tooltip: '5 chapters pending updates',
    path: academicPaths.curriculum.chaptersManagement,
  },
];

// ----------------------------------------------------------------------

const TeacherKpiCards = () => (
  <Grid container spacing={1}>
    {kpiData.map((kpi) => (
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={kpi.id}>
        <CompactKPICard
          title={kpi.title}
          value={kpi.value}
          status={kpi.status}
          path={kpi.path}
          tooltip={kpi.tooltip}
        />
      </Grid>
    ))}
  </Grid>
);

export default TeacherKpiCards;
