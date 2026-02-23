'use client';

import { Grid } from '@mui/material';
import { transportPaths } from 'src/constants/transport-menu';

import CompactKPICard from '../../../student/dashboard/principal/kpi-card-item';

const KPICardsData = [
  {
    id: 'TR_TOTAL_ROUTES',
    title: 'Total Routes',
    value: 15,
    percent: 2.5,
    chart: { data: [12, 14, 13, 15, 14, 15, 15, 15] },
    icon: 'mdi:road-variant',
    status: 'success' as const,
    tooltip: 'Total configured transport routes',
    path: transportPaths.routeManagement,
  },
  {
    id: 'TR_ACTIVE_ROUTES',
    title: 'Active Routes',
    value: 12,
    percent: 0,
    chart: { data: [10, 12, 11, 12, 12, 12, 12, 12] },
    icon: 'mdi:bus-clock',
    status: 'success' as const,
    tooltip: 'Routes currently operating today',
    path: transportPaths.routeManagement,
  },
  {
    id: 'TR_VEHICLES_AVAILABLE',
    title: 'Vehicles Available',
    value: 18,
    percent: -1.2,
    chart: { data: [20, 19, 18, 18, 19, 18, 17, 18] },
    icon: 'mdi:bus',
    status: 'success' as const,
    tooltip: 'Fleet vehicles ready for operation',
    path: transportPaths.vehicleManagement,
  },
  {
    id: 'TR_MAINTENANCE',
    title: 'Under Maintenance',
    value: 4,
    percent: 15.5,
    chart: { data: [1, 2, 1, 3, 2, 4, 3, 4] },
    icon: 'mdi:tools',
    status: 'error' as const,
    tooltip: 'Vehicles currently in service/repair',
    path: transportPaths.vehicleManagement,
  },
  {
    id: 'TR_TOTAL_DRIVERS',
    title: 'Total Drivers',
    value: 20,
    percent: 5.0,
    chart: { data: [18, 19, 19, 20, 20, 20, 20, 20] },
    icon: 'mdi:steering',
    status: 'info' as const,
    tooltip: 'Registered active drivers',
    path: transportPaths.driverManagement,
  },
  {
    id: 'TR_DRIVERS_ABSENT',
    title: 'Drivers Absent',
    value: 2,
    percent: 100,
    chart: { data: [0, 1, 0, 1, 2, 1, 0, 2] },
    icon: 'mdi:account-alert',
    status: 'error' as const,
    tooltip: 'Drivers who have not reported today',
    path: transportPaths.driverManagement,
  },
  {
    id: 'TR_STUDENTS_ASSIGNED',
    title: 'Students Assigned',
    value: 486,
    percent: 8.4,
    chart: { data: [420, 435, 450, 460, 475, 480, 486, 486] },
    icon: 'mdi:account-group',
    status: 'info' as const,
    tooltip: 'Total students enrolled in transport',
    path: transportPaths.applicationManagement,
  },
  {
    id: 'TR_PENDING_FEES',
    title: 'Pending Fees',
    value: '₹1.24L',
    percent: -5.2,
    chart: { data: [1.3, 1.28, 1.25, 1.26, 1.24, 1.24] },
    icon: 'mdi:currency-inr',
    status: 'warning' as const,
    tooltip: 'Total outstanding transport fees',
    path: transportPaths.reports,
  },
];

const SmartKPICards = () => (
  <Grid container spacing={1}>
    {KPICardsData.map((kpi) => (
      <Grid key={kpi.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <CompactKPICard
          title={kpi.title}
          value={kpi.value}
          icon={kpi.icon}
          percentChange={kpi.percent}
          trendData={kpi.chart.data}
          status={kpi.status}
          tooltip={kpi.tooltip}
          path={kpi.path}
        />
      </Grid>
    ))}
  </Grid>
);

export default SmartKPICards;
