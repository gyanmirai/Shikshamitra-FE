import React from 'react';
import { Grid } from '@mui/material';
import { fNumber } from 'src/utils/format-number';
import { DashboardCard } from 'src/components/dashboard-card';

const kpiData = [
  {
    id: 'TC_CLASS_STRENGTH',
    title: 'Class Strength',
    value: fNumber(45),
    labels: [
      { name: `Male ${fNumber(23)}`, color: 'success' as const },
      { name: `Female ${fNumber(22)}`, color: 'warning' as const },
    ],
    icon: 'mdi:google-classroom',
    color: 'primary.main',
    bgColor: 'primary.lighter',
  },
  {
    id: 'TC_PRESENT',
    title: 'Present Today',
    value: fNumber(42),
    labels: [
      { name: '93% Attendance', color: 'success' as const },
      { name: `Absent ${fNumber(3)}`, color: 'error' as const },
    ],
    icon: 'mdi:account-check-outline',
    color: 'success.main',
    bgColor: 'success.lighter',
  },
  {
    id: 'TC_HOMEWORK_PENDING',
    title: 'Assignment Pending',
    value: fNumber(12),
    labels: [
      { name: `Submitted ${fNumber(33)}`, color: 'success' as const },
      { name: 'Due Today', color: 'warning' as const },
    ],
    icon: 'mdi:book-open-page-variant-outline',
    color: 'warning.main',
    bgColor: 'warning.lighter',
  },
];

const TeacherKPICards = () => (
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

export default TeacherKPICards;
