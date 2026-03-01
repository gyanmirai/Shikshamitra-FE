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
  },
  {
    id: 'TOTAL_STAFF',
    title: 'Total Staff',
    value: '185',
    icon: 'clarity:employee-group-solid',
    status: 'info' as const,
    path: hrPaths.employee.list,
  },
  {
    id: 'TODAY_ATTENDANCE',
    title: 'Today Attendance',
    value: '94.2%',
    icon: 'solar:user-check-bold',
    status: 'success' as const,
    path: hrPaths.attendance.attendanceTracking,
  },
  {
    id: 'PENDING_FEE',
    title: 'Pending Fee',
    value: '₹12.5L',
    icon: 'solar:wad-of-money-bold',
    status: 'error' as const,
    path: financePaths.feeCollection,
  },
  {
    id: 'ACTIVE_ROUTES',
    title: 'Active Routes',
    value: '16',
    icon: 'solar:bus-bold',
    status: 'warning' as const,
    path: transportPaths.routeManagement,
  },
  {
    id: 'PENDING_ADMISSIONS',
    title: 'Pending Admissions',
    value: '42',
    icon: 'solar:document-add-bold',
    status: 'secondary' as const,
    path: studentPaths.enrollment.admission,
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
        />
      </Grid>
    ))}
  </Grid>
);

export default AdminKpiCards;
