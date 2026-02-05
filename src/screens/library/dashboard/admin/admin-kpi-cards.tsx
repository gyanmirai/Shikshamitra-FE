import React from 'react';
import { Grid } from '@mui/material';
import { fNumber } from 'src/utils/format-number';
import { DashboardCard } from 'src/components/dashboard-card';

// Mock data for Admin KPI cards
const kpiData = [
  {
    id: 'LIB_ADMIN_CARD_TOTAL_BOOKS',
    title: 'Total Books',
    value: fNumber(2500),
    icon: 'solar:book-bookmark-bold-duotone',
    color: 'info.main',
    bgColor: 'info.lighter',
    href: '/library/book-list',
    labels: [
      { name: `Categories ${fNumber(28)}`, color: 'info' as const },
      { name: `Sections ${fNumber(12)}`, color: 'primary' as const },
    ],
  },
  {
    id: 'LIB_ADMIN_CARD_ACTIVE_MEMBERS',
    title: 'Active Members',
    value: fNumber(1180),
    icon: 'solar:users-group-rounded-bold-duotone',
    color: 'success.main',
    bgColor: 'success.lighter',
    href: '/library/member-management',
    labels: [
      { name: `Students ${fNumber(930)}`, color: 'success' as const },
      { name: `Staff ${fNumber(250)}`, color: 'warning' as const },
    ],
  },
  {
    id: 'LIB_ADMIN_CARD_CIRCULATION',
    title: 'Circulation Today',
    value: fNumber(80),
    icon: 'solar:transfer-horizontal-bold-duotone',
    color: 'warning.main',
    bgColor: 'warning.lighter',
    href: '/library/issued-books',
    labels: [
      { name: `Issued ${fNumber(45)}`, color: 'success' as const },
      { name: `Overdue ${fNumber(12)}`, color: 'error' as const },
    ],
  },
  {
    id: 'LIB_ADMIN_CARD_PENDING_CHARGES',
    title: 'Pending Charges',
    value: `₹ ${fNumber(3450)}`,
    icon: 'solar:wallet-money-bold-duotone',
    color: 'error.main',
    bgColor: 'error.lighter',
    href: '/library/charges-management',
    labels: [{ name: `Collected This Week ₹ ${fNumber(1200)}`, color: 'success' as const }],
  },
];

const AdminKPICards = () => (
  <Grid container spacing={1}>
    {kpiData.map((card) => (
      <Grid size={{ xs: 12, md: 3 }} key={card.id}>
        <DashboardCard
          title={card.title}
          value={card.value}
          icon={card.icon}
          color={card.color}
          bgColor={card.bgColor}
          href={card.href}
          labels={card.labels}
        />
      </Grid>
    ))}
  </Grid>
);

export default AdminKPICards;
