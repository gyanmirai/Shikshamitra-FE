import { Grid } from '@mui/material';
import { studentPaths } from 'src/constants/student-menu';
import { academicPaths } from 'src/constants/academic-menu';

import CompactKPICard from '../principal/kpi-card-item';

interface KPIItem {
  id: string;
  title: string;
  value: string;
  chart: {
    type?: 'line' | 'bar' | 'area' | 'donut' | 'pie' | 'radialBar';
    series?: any[];
    colors?: string[];
    width?: number;
    height?: number;
    labels?: string[];
  };
  status: 'info' | 'success' | 'warning' | 'primary' | 'error' | 'secondary';
  path?: string;
  tooltip?: string;
}

const kpiData: KPIItem[] = [
  {
    id: 'CLASS_STRENGTH',
    title: 'Class Strength',
    value: '45',
    tooltip: 'Total number of students in the class, including boys and girls.',
    status: 'info' as const,
    chart: {
      type: 'bar' as const,
      series: [20, 25],
      labels: ['Boys', 'Girls'],
      colors: ['#00B8D9', '#FF5630'],
      width: 30,
    },
    path: studentPaths.records.studentList,
  },
  {
    id: 'PRESENT_TODAY',
    title: 'Present Today',
    value: '42',
    tooltip: "Shows today's attendance status for the class. View present and absent students.",
    status: 'success' as const,
    chart: {
      type: 'donut' as const,
      series: [42, 3],
      labels: ['Present', 'Absent'],
      colors: ['#22C55E', '#EF4444'],
      width: 56,
      height: 56,
    },
    path: studentPaths.attendance.markAttendance,
  },
  {
    id: 'ASSIGNMENT_STATUS',
    title: 'Pending Assignments',
    value: '12',
    tooltip: 'Number of assignments that are still pending submission from students.',
    status: 'success' as const,
    chart: {
      type: 'donut' as const,
      series: [12, 30],
      labels: ['Pending', 'Completed'],
      colors: ['#FF5630', '#22C55E'],
      width: 56,
      height: 56,
    },
    path: academicPaths.homework.learningTasks,
  },
  {
    id: 'CLASS_PERFORMANCE',
    title: 'Class Performance',
    value: '78%',
    tooltip: 'Average academic performance of the class based on recorded exam marks.',
    status: 'primary' as const,
    chart: {
      type: 'donut' as const,
      series: [78, 22],
      labels: ['Score', 'Remaining'],
      colors: ['#22C55E', '#FF5630'],
      width: 56,
      height: 56,
    },
    path: academicPaths.examination.recordMarks,
  },
];

const TeacherKPICards = () => (
  <Grid container spacing={1}>
    {kpiData.map((kpi) => (
      <Grid size={{ xs: 12, sm: 6, md: 3 }} key={kpi.id}>
        <CompactKPICard
          title={kpi.title}
          value={kpi.value}
          status={kpi.status}
          path={kpi.path}
          tooltip={kpi.tooltip}
          chart={kpi.chart}
        />
      </Grid>
    ))}
  </Grid>
);

export default TeacherKPICards;
