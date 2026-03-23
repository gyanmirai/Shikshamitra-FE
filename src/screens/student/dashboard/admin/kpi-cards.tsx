import { Grid } from '@mui/material';
import { studentPaths } from 'src/constants/student-menu';

import CompactKPICard from '../principal/kpi-card-item';

const kpiData = [
  {
    id: 'ENQ_TOTAL',
    title: 'Total Inquiries',
    value: '1,250',
    tooltip:
      'Total number of admission inquiries received from parents via walk-in or online channels.',
    status: 'success' as const,
    path: studentPaths.enrollment.inquiry,
    chart: {
      type: 'bar' as const,
      series: [820, 430],
      labels: ['Walk-in', 'Online'],
      width: 30,
    },
  },
  {
    id: 'REG_TOTAL',
    title: 'Total Registration',
    value: '980',
    tooltip: 'Total number of students who have completed or started the registration process.',
    status: 'info' as const,
    path: studentPaths.enrollment.registration,
    chart: {
      type: 'donut' as const,
      series: [780, 200],
      width: 56,
      height: 56,
      colors: ['#22C55E', '#FFA500'],
      labels: ['Completed', 'Pending'],
    },
  },
  {
    id: 'ADM_TOTAL',
    title: 'Total Admission',
    value: '850',
    tooltip:
      'Number of students whose admission applications have been processed (approved, rejected, or pending).',
    status: 'warning' as const,
    path: studentPaths.enrollment.admission,
    chart: {
      type: 'donut' as const,
      series: [680, 120, 50],
      width: 56,
      height: 56,
      colors: ['#22C55E', '#EF4444', '#FFA500'],
      labels: ['Approved', 'Rejected', 'Pending'],
    },
  },
  {
    id: 'STU_TOTAL',
    title: 'Total Students',
    value: '3,500',
    tooltip: 'Total number of currently enrolled students in the school.',
    status: 'primary' as const,
    path: studentPaths.records.studentList,
    chart: {
      type: 'bar' as const,
      series: [1800, 1700],
      labels: ['Boys', 'Girls'],
      colors: ['#00B8D9', '#FF5630'],
      width: 30,
    },
  },
  {
    id: 'STU_LEFT',
    title: 'Students Left',
    value: '45',
    tooltip:
      'Students who left the school during the selected period, including transfers and dropouts.',
    status: 'error' as const,
    path: studentPaths.records.studentList,
    chart: {
      type: 'donut' as const,
      series: [28, 17],
      width: 56,
      height: 56,
      colors: ['#FF5630', '#FFAB00'],
      labels: ['Transferred', 'Dropped-out'],
    },
  },
  {
    id: 'RTE_STUDENTS',
    title: 'RTE Students',
    value: '120',
    tooltip: 'Students admitted under the Right to Education (RTE) scheme.',
    status: 'info' as const,
    path: studentPaths.records.studentList,
    chart: {
      type: 'donut' as const,
      series: [120, 3380],
      width: 56,
      height: 56,
      colors: ['#00B8D9', '#E5E7EB'],
      labels: ['RTE', 'General'],
    },
  },
];

const AdminKPICards = () => (
  <Grid container spacing={1}>
    {kpiData.map((kpi) => (
      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={kpi.id}>
        <CompactKPICard
          title={kpi.title}
          value={kpi.value}
          path={kpi.path}
          tooltip={(kpi as any).tooltip}
          status={kpi.status}
          chart={kpi.chart}
        />
      </Grid>
    ))}
  </Grid>
);

export default AdminKPICards;
