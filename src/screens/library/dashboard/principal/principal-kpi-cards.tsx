import React from 'react';
import { Grid } from '@mui/material';
import { fNumber } from 'src/utils/format-number';
import { DashboardCard } from 'src/components/dashboard-card';

// Mock data for Principal KPI cards
const kpiData = [
  {
    id: 'LIB_PRINCIPAL_CARD_TOTAL_BOOKS',
    title: 'Total Books',
    value: fNumber(2500),
    icon: 'ix:library',
    color: 'primary.main',
    bgColor: 'primary.lighter',
    href: '/library/book-management',
    labels: [
      { name: `Categories ${fNumber(28)}`, color: 'primary' as const },
      { name: `Sections ${fNumber(12)}`, color: 'info' as const },
    ],
  },
  {
    id: 'LIB_PRINCIPAL_CARD_TOTAL_MEMBERS',
    title: 'Active Members',
    value: fNumber(1180),
    icon: 'heroicons:user-group',
    color: 'success.main',
    bgColor: 'success.lighter',
    href: '/library/member-management',
    labels: [
      { name: `Students ${fNumber(930)}`, color: 'success' as const },
      { name: `Employees ${fNumber(250)}`, color: 'warning' as const },
    ],
  },
  {
    id: 'LIB_PRINCIPAL_CARD_PENDING_CHARGES',
    title: 'Pending Charges',
    value: `₹ ${fNumber(3450)}`,
    icon: 'mdi:currency-inr',
    color: 'error.main',
    bgColor: 'error.lighter',
    href: '/library/charges',
  },
];

const PrincipalKPICards = () => (
  <Grid container spacing={3}>
    {kpiData.map((card) => (
      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={card.id}>
        <DashboardCard
          title={card.title}
          value={card.value}
          icon={card.icon}
          color={card.color}
          bgColor={card.bgColor}
          labels={card.labels}
        />
      </Grid>
    ))}
  </Grid>
);

export default PrincipalKPICards;
