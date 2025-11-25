import React from 'react';
import { Grid } from '@mui/material';
import { fNumber } from 'src/utils/format-number';

import { LibraryCard } from '../components/library-card';

// Mock data for Principal KPI cards
const kpiData = [
  {
    id: 'LIB_PRINCIPAL_CARD_TOTAL_BOOKS',
    title: 'Total Books in Library',
    value: fNumber(2500),
    icon: 'ix:library',
    color: 'primary.main',
    bgColor: 'primary.lighter',
    href: '/library/book-management',
  },
  {
    id: 'LIB_PRINCIPAL_CARD_TOTAL_MEMBERS',
    title: 'Total Members',
    value: fNumber(1250),
    icon: 'heroicons:user-group',
    color: 'success.main',
    bgColor: 'success.lighter',
    href: '/library/member-management',
    labels: [
      { name: `Students ${fNumber(1000)}`, color: 'success' as const },
      { name: `Staff ${fNumber(250)}`, color: 'warning' as const },
    ],
  },
  {
    id: 'LIB_PRINCIPAL_CARD_OVERDUE_COUNT',
    title: 'Total Overdue Books',
    value: fNumber(12),
    icon: 'carbon:warning-alt',
    color: 'error.main',
    bgColor: 'error.lighter',
    href: '/library/circulation/?tab=overdue-books',
  },
  {
    id: 'LIB_PRINCIPAL_CARD_MONTHLY_ACTIVITY',
    title: 'Books Issued This Month',
    value: fNumber(856),
    icon: 'map:library',
    color: 'info.main',
    bgColor: 'info.lighter',
    href: '/library/circulation/?tab=issued-books',
  },
];

const PrincipalKPICards = () => (
  <Grid container spacing={3}>
    {kpiData.map((card) => (
      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={card.id}>
        <LibraryCard
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
