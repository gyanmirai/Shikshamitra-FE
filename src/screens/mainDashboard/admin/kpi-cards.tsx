'use client';

import { Grid } from '@mui/material';
import { hrPaths } from 'src/constants/hr-menus';
import { financePaths } from 'src/constants/finance-menu';
import { studentPaths } from 'src/constants/student-menu';
import { transportPaths } from 'src/constants/transport-menu';
import CompactKPICard from 'src/screens/student/dashboard/principal/kpi-card-item';

// ----------------------------------------------------------------------

const kpiData = [
  {
    id: 'TOTAL_STUDENTS',
    title: 'Total Students',
    value: '2,450',
    icon: 'hugeicons:students',
    status: 'primary' as const,
    path: studentPaths.records.studentList,
    tooltip: 'Current Academic Year · 1,260 boys · 1,190 girls',
    chart: {
      type: 'bar' as const,
      series: [1190, 1260] as any,
      colors: ['#FF6B9D', '#4FC3F7'],
      labels: ['Girls', 'Boys'],
      width: 30,
      height: 40,
      options: {
        plotOptions: { bar: { distributed: true, borderRadius: 2, columnWidth: '55%' } },
      },
    },
  },
  {
    id: 'TOTAL_STAFF',
    title: 'Total Staff',
    value: '185',
    icon: 'clarity:employee-group-solid',
    status: 'info' as const,
    path: hrPaths.employee.list,
    tooltip: 'Current Academic Year · 103 male · 82 female',
    chart: {
      type: 'bar' as const,
      series: [82, 103] as any,
      colors: ['#FF6B9D', '#4FC3F7'],
      labels: ['Female', 'Male'],
      width: 30,
      height: 40,
      options: {
        plotOptions: { bar: { distributed: true, borderRadius: 2, columnWidth: '55%' } },
      },
    },
  },
  {
    id: 'TODAY_ATTENDANCE',
    title: 'Student Attendance',
    value: '70.2%',
    icon: 'solar:user-check-bold',
    status: 'success' as const,
    path: hrPaths.attendance.attendanceTracking,
    tooltip: 'Today · 145 students absent',
    chart: {
      type: 'bar' as const,
      series: [239, 145] as any,
      colors: ['#00A76F', '#FF5630'],
      labels: ['Present', 'Absent'],
      width: 30,
      height: 40,
      options: {
        plotOptions: { bar: { distributed: true, borderRadius: 2, columnWidth: '55%' } },
      },
    },
  },
  {
    id: 'PENDING_FEE',
    title: 'Total Fees',
    value: '₹12.5L',
    icon: 'solar:wad-of-money-bold',
    status: 'error' as const,
    path: financePaths.feeCollection,
    tooltip: 'Current Academic Year · 320 students pending',
    chart: {
      type: 'bar' as const,
      series: [2130, 620] as any,
      colors: ['#00A76F', '#FFAB00'],
      labels: ['Paid', 'Pending'],
      width: 30,
      height: 40,
      options: {
        plotOptions: { bar: { distributed: true, borderRadius: 2, columnWidth: '55%' } },
      },
    },
  },
  {
    id: 'ACTIVE_ROUTES',
    title: 'Transport Routes',
    value: '26',
    icon: 'solar:bus-bold',
    status: 'warning' as const,
    path: transportPaths.routeManagement,
    tooltip: 'Today · 5 buses at full capacity',
    chart: {
      type: 'bar' as const,
      series: [16, 10] as any,
      colors: ['#1877F2', '#919EAB'],
      labels: ['Active', 'Inactive'],
      width: 30,
      height: 40,
      options: {
        plotOptions: { bar: { distributed: true, borderRadius: 2, columnWidth: '55%' } },
      },
    },
  },
  {
    id: 'PENDING_ADMISSIONS',
    title: 'Pending Admissions',
    value: '42',
    icon: 'solar:document-add-bold',
    status: 'secondary' as const,
    path: studentPaths.enrollment.admission,
    tooltip: 'This Session · 5 applications waiting > 3 days',
    chart: {
      type: 'bar' as const,
      series: [158, 42] as any,
      colors: ['#00A76F', '#FFAB00'],
      labels: ['Approved', 'Pending'],
      width: 30,
      height: 40,
      options: {
        plotOptions: { bar: { distributed: true, borderRadius: 2, columnWidth: '55%' } },
      },
    },
  },
];

// ----------------------------------------------------------------------

const AdminKpiCards = () => (
  <Grid container spacing={1}>
    {kpiData.map((kpi) => (
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={kpi.id}>
        <CompactKPICard
          title={kpi.title}
          value={kpi.value}
          icon={kpi.icon}
          status={kpi.status}
          path={kpi.path}
          tooltip={kpi.tooltip}
          chart={kpi.chart}
        />
      </Grid>
    ))}
  </Grid>
);

export default AdminKpiCards;
