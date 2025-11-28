import React from 'react';
import { Grid } from '@mui/material';
import { fNumber } from 'src/utils/format-number';
import { DashboardCard } from 'src/components/dashboard-card';

const kpiData = [
  {
    id: 'PR_TOTAL_STUDENTS',
    title: 'Total Students',
    value: fNumber(2018),
    labels: [
      { name: `Male ${fNumber(1018)}`, color: 'success' as const },
      { name: `Female ${fNumber(1000)}`, color: 'warning' as const },
    ],
    icon: 'mdi:school-outline',
    color: 'primary.main',
    bgColor: 'primary.lighter',
  },
  {
    id: 'PR_ATTENDANCE_OVERVIEW',
    title: 'Avg Attendance',
    value: '92%',
    labels: [{ name: 'School-wide', color: 'success' as const }],
    icon: 'mdi:calendar-check-outline',
    color: 'success.main',
    bgColor: 'success.lighter',
  },
  {
    id: 'PR_ENROLL_YEARLY',
    title: 'New Admissions',
    value: fNumber(450),
    labels: [{ name: 'This Year', color: 'primary' as const }],
    icon: 'mdi:account-school-outline',
    color: 'info.main',
    bgColor: 'info.lighter',
  },
  {
    id: 'PR_EXAM_PERFORMANCE',
    title: 'Exam Performance',
    value: '88%',
    labels: [{ name: 'Pass Rate', color: 'success' as const }],
    icon: 'mdi:trophy-outline',
    color: 'success.main',
    bgColor: 'success.lighter',
  },
  {
    id: 'PR_RTE_STUDENTS',
    title: 'RTE Students',
    value: fNumber(200),
    labels: [
      { name: `Male ${fNumber(120)}`, color: 'success' as const },
      { name: `Female ${fNumber(80)}`, color: 'warning' as const },
    ],
    icon: 'mdi:account-check-outline',
    color: 'secondary.main',
    bgColor: 'secondary.lighter',
  },
];

const PrincipalKPICards = () => (
  <Grid container spacing={3}>
    {kpiData.map((kpi) => (
      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={kpi.id}>
        <DashboardCard
          title={kpi.title}
          value={kpi.value}
          icon={kpi.icon}
          color={kpi.color}
          bgColor={kpi.bgColor}
          labels={kpi.labels}
        />
      </Grid>
    ))}
  </Grid>
);

export default PrincipalKPICards;
