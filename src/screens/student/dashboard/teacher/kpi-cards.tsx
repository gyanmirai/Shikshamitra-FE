import { Grid } from '@mui/material';
import { studentPaths } from 'src/constants/student-menu';
import { academicPaths } from 'src/constants/academic-menu';

import CompactKPICard from '../principal/kpi-card-item';

interface KPIItem {
  id: string;
  title: string;
  value: string;
  percent: number;
  chart: { data: number[] };
  fullChart?: {
    type?: 'line' | 'bar' | 'area' | 'donut' | 'pie' | 'radialBar';
    series?: any[];
    colors?: string[];
    options?: any;
  };
  icon: string;
  status: 'info' | 'success' | 'warning' | 'primary';
  path?: string;
}

const kpiData: KPIItem[] = [
  {
    id: 'CLASS_STRENGTH',
    title: 'Class Strength',
    value: '45',
    percent: 0, // No change usually
    chart: { data: [45, 45, 45, 45, 45, 45, 45, 45, 45, 45] },
    fullChart: {
      type: 'bar',
      series: [
        { name: 'Boys', data: [20] },
        { name: 'Girls', data: [25] },
      ],
      colors: ['#00B8D9', '#FF5630'], // Info (blue), Error (red/orange)
      options: {
        tooltip: {
          x: { show: false },
          y: { formatter: (val: number) => `${val} Students` },
        },
        xaxis: {
          categories: ['Strength'],
          labels: { show: false },
        },
        plotOptions: {
          bar: {
            columnWidth: '40%',
            borderRadius: 2,
            distributed: false,
          },
        },
      },
    },
    icon: 'mdi:account-group-outline',
    status: 'info' as const,
    path: studentPaths.records.studentList,
  },
  {
    id: 'PRESENT_TODAY',
    title: 'Present Today',
    value: '42',
    percent: 2.4, // Comparison vs yesterday
    chart: { data: [40, 41, 42, 38, 39, 42, 41, 40, 41, 42] },
    icon: 'mdi:account-check-outline',
    status: 'success' as const,
    path: studentPaths.attendance.markAttendance,
  },
  {
    id: 'ASSIGNMENT_STATUS',
    title: 'Pending Assignments',
    value: '12',
    percent: -5.0,
    chart: { data: [15, 14, 18, 12, 10, 12, 8, 14, 15, 12] },
    icon: 'mdi:clipboard-clock-outline',
    status: 'warning' as const,
    path: academicPaths.homework.learningTasks,
  },
  {
    id: 'CLASS_PERFORMANCE',
    title: 'Class Performance',
    value: '78%',
    percent: 3.5, // Improved
    chart: { data: [65, 68, 70, 72, 74, 75, 76, 75, 77, 78] },
    icon: 'mdi:chart-line',
    status: 'primary' as const,
    path: academicPaths.examination.recordMarks,
  },
];

const getComparisonLabel = (title: string) => {
  switch (title) {
    case 'Present Today':
    case 'Pending Assignments':
      return 'vs Yesterday';
    case 'Class Strength':
    case 'Class Performance':
    default:
      return 'vs last year';
  }
};

const TeacherKPICards = () => (
  <Grid container spacing={1}>
    {kpiData.map((kpi) => (
      <Grid size={{ xs: 12, sm: 6, md: 3 }} key={kpi.id}>
        <CompactKPICard
          title={kpi.title}
          value={kpi.value}
          icon={kpi.icon}
          percentChange={kpi.percent}
          trendData={kpi.chart.data}
          status={kpi.status}
          path={kpi.path}
          comparisonLabel={getComparisonLabel(kpi.title)}
          chart={kpi.fullChart}
        />
      </Grid>
    ))}
  </Grid>
);

export default TeacherKPICards;
