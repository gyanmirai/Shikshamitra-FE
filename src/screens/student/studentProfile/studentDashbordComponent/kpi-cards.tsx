import { Grid } from '@mui/material';

import CompactKPICard from '../../dashboard/principal/kpi-card-item';

// ----------------------------------------------------------------------

const studentKpiData = [
  {
    id: 'ACADEMIC_PERF',
    title: 'Academic Performance',
    value: '86%',
    status: 'success' as const,
    tooltip: 'Class Rank: 5 / 45. Last Exam: 83%',
    chart: {
      type: 'donut' as const,
      series: [86, 14],
      labels: ['Score', 'Remaining'],
      colors: ['#22C55E', '#EF4444'],
      width: 56,
      height: 56,
    },
  },
  {
    id: 'ATTENDANCE_SUM',
    title: 'Attendance Summary',
    value: '92%',
    status: 'success' as const,
    tooltip: 'Total Present: 200, Absent: 18. Warning: Keep above 75%.',
    chart: {
      type: 'donut' as const,
      series: [92, 8],
      labels: ['Present', 'Absent'],
      colors: ['#22C55E', '#EF4444'],
      width: 56,
      height: 56,
    },
  },
  {
    id: 'FEE_STATUS',
    title: 'Fee Status - Pending',
    value: '₹2,500',
    status: 'warning' as const,
    tooltip: 'Total: ₹12,000 | Paid: ₹9,500 | Due Date: 15 Aug 2025',
    chart: {
      type: 'donut' as const,
      series: [9500, 2500],
      labels: ['Paid', 'Pending'],
      colors: ['#22C55E', '#FF5630'],
      width: 56,
      height: 56,
    },
  },
  {
    id: 'HOMEWORK_STATUS',
    title: 'Homework Completion',
    value: '95%',
    status: 'success' as const,
    tooltip: 'Total: 50 | Completed: 47 | Pending: 3 | Overdue: 0',
    chart: {
      type: 'donut' as const,
      series: [47, 3],
      labels: ['Completed', 'Pending'],
      colors: ['#22C55E', '#FF5630'],
      width: 56,
      height: 56,
    },
  },
];

export const StudentProfileKPICards = () => (
  <Grid container spacing={1}>
    {studentKpiData.map((kpi) => (
      <Grid size={{ xs: 12, sm: 6, md: 3 }} key={kpi.id}>
        <CompactKPICard
          title={kpi.title}
          value={kpi.value}
          status={kpi.status}
          tooltip={kpi.tooltip}
          chart={kpi.chart}
        />
      </Grid>
    ))}
  </Grid>
);

export default StudentProfileKPICards;
