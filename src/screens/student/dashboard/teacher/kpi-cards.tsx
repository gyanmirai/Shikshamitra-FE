import { Grid } from '@mui/material';
import { studentPaths } from 'src/constants/student-menu';
import { academicPaths } from 'src/constants/academic-menu';

import CompactKPICard from '../principal/kpi-card-item';

type KpiStatus = 'info' | 'success' | 'warning' | 'primary' | 'error' | 'secondary';

const items: {
  id: string;
  title: string;
  value: string;
  status: KpiStatus;
  path?: string;
  tooltip?: string;
}[] = [
  {
    id: 'CLASS_STRENGTH',
    title: 'Class Strength',
    value: '-',
    tooltip: 'Total number of students in the class.',
    status: 'info',
    path: studentPaths.records.studentList,
  },
  {
    id: 'PRESENT_TODAY',
    title: 'Present Today',
    value: '-',
    tooltip: "Today's attendance status for the class.",
    status: 'success',
    path: studentPaths.attendance.markAttendance,
  },
  {
    id: 'ASSIGNMENT_STATUS',
    title: 'Pending Assignments',
    value: '-',
    tooltip: 'Assignments pending submission from students.',
    status: 'warning',
    path: academicPaths.homework.learningTasks,
  },
  {
    id: 'CLASS_PERFORMANCE',
    title: 'Class Performance',
    value: '-',
    tooltip: 'Average academic performance of the class.',
    status: 'primary',
    path: academicPaths.examination.recordMarks,
  },
];

const TeacherKPICards = () => (
  <Grid container spacing={1}>
    {items.map((kpi) => (
      <Grid size={{ xs: 12, sm: 6, md: 3 }} key={kpi.id}>
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

export default TeacherKPICards;
