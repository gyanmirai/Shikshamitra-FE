import React from 'react';
import { Grid } from '@mui/material';
import { fNumber } from 'src/utils/format-number';
import { DashboardCard } from 'src/components/dashboard-card';

const kpiData = [
  {
    id: 'ENQ_TOTAL',
    title: 'Total Inquiries',
    value: '100',
    labels: [
      { name: `Male ${fNumber(50)}`, color: 'success' as const },
      { name: `Female ${fNumber(50)}`, color: 'warning' as const },
    ],
    icon: 'mdi:clipboard-text-outline',
    color: 'success.main',
    bgColor: 'success.lighter',
  },
  {
    id: 'REG_TOTAL',
    title: 'Total Registration',
    value: '100',
    labels: [
      { name: `Male ${fNumber(50)}`, color: 'success' as const },
      { name: `Female ${fNumber(50)}`, color: 'warning' as const },
    ],
    icon: 'mdi:account-plus-outline',
    color: 'info.main',
    bgColor: 'info.lighter',
  },
  {
    id: 'ADM_TOTAL',
    title: 'Total Admission',
    value: '100',
    labels: [
      { name: `Male ${fNumber(50)}`, color: 'success' as const },
      { name: `Female ${fNumber(50)}`, color: 'warning' as const },
    ],
    icon: 'mdi:file-document-edit-outline',
    color: 'warning.main',
    bgColor: 'warning.lighter',
  },
  {
    id: 'STU_TOTAL',
    title: 'Total Students',
    value: '100',
    labels: [
      { name: `Male ${fNumber(50)}`, color: 'success' as const },
      { name: `Female ${fNumber(50)}`, color: 'warning' as const },
    ],
    icon: 'mdi:school-outline',
    color: 'primary.main',
    bgColor: 'primary.lighter',
  },
  {
    id: 'STU_LEFT',
    title: 'Students Left',
    value: '100',
    labels: [
      { name: `Transferred ${fNumber(50)}`, color: 'warning' as const },
      { name: `Dropped Out ${fNumber(50)}`, color: 'error' as const },
    ],
    icon: 'mdi:account-minus-outline',
    color: 'error.main',
    bgColor: 'error.lighter',
  },
  {
    id: 'RTE_STUDENTS',
    title: 'RTE Students',
    value: '100',
    labels: [
      { name: `Male ${fNumber(50)}`, color: 'success' as const },
      { name: `Female ${fNumber(50)}`, color: 'error' as const },
    ],
    icon: 'mdi:account-check-outline',
    color: 'info.dark',
    bgColor: 'info.light',
  },
];

const AdminKPICards = () => (
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

export default AdminKPICards;
