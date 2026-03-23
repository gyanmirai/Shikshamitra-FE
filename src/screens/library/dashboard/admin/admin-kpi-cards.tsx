import React from 'react';
import { Grid } from '@mui/material';
import { fNumber } from 'src/utils/format-number';

import CompactKPICard from '../../../student/dashboard/principal/kpi-card-item';

// Mock data for Admin KPI cards
const kpiData = [
  {
    id: 'LIB_TOTAL_BOOKS',
    title: 'Total Books',
    value: fNumber(2540),
    percent: 4.8,
    chart: { data: [20, 41, 63, 33, 28, 35, 50, 46, 11, 26] },
    icon: 'solar:book-bookmark-bold-duotone',
    status: 'primary' as const,
    path: '/library/book-list',
    tooltip: 'Total inventory count including books added this month.',
  },
  {
    id: 'LIB_ACTIVE_MEMBERS',
    title: 'Active Members',
    value: fNumber(1180),
    percent: 12.5,
    chart: { data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35] },
    icon: 'solar:users-group-rounded-bold-duotone',
    status: 'secondary' as const,
    path: '/library/member-management',
    tooltip: 'Total active students and staff members.',
  },
  {
    id: 'LIB_CIRCULATION',
    title: 'Circulation Today',
    value: fNumber(80),
    percent: 8.2,
    chart: { data: [100, 40, 30, 70, 40, 20, 80, 40, 10, 20] },
    icon: 'solar:transfer-horizontal-bold-duotone',
    status: 'info' as const,
    path: '/library/issued-books',
    tooltip: 'Total books issued and returned today.',
  },
  {
    id: 'LIB_OVERDUE',
    title: 'Overdue Books',
    value: fNumber(12),
    percent: 15.1,
    chart: { data: [5, 10, 5, 15, 8, 12, 10, 15, 18, 20] },
    icon: 'solar:alarm-add-bold-duotone',
    status: 'error' as const, // Danger/Critical
    path: '/library/issued-books',
    tooltip: 'Books kept beyond the due date.',
  },
  {
    id: 'LIB_PENDING_CHARGES',
    title: 'Pending Charges',
    value: `₹ ${fNumber(3450)}`,
    percent: -2.4,
    chart: { data: [15, 35, 50, 40, 60, 45, 80, 70, 90, 100] },
    icon: 'solar:wallet-money-bold-duotone',
    status: 'warning' as const,
    path: '/library/charges-management',
    tooltip: 'Total outstanding fines and charges.',
  },
  {
    id: 'LIB_AVAILABLE_BOOKS',
    title: 'Available Books',
    value: fNumber(2380),
    percent: 6.3,
    chart: { data: [80, 90, 70, 85, 75, 95, 88, 92, 78, 85] },
    icon: 'solar:book-2-bold-duotone',
    status: 'success' as const,
    path: '/library/book-list',
    tooltip: 'Books currently in stock and ready for lending.',
  },
];

const AdminKPICards = () => (
  <Grid container spacing={1}>
    {kpiData.map((kpi) => (
      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={kpi.id}>
        <CompactKPICard
          title={kpi.title}
          value={kpi.value}
          icon={kpi.icon}
          trendData={kpi.chart.data}
          path={kpi.path}
          tooltip={kpi.tooltip}
          status={kpi.status}
        />
      </Grid>
    ))}
  </Grid>
);

export default AdminKPICards;
