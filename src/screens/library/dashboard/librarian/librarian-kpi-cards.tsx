import React from 'react';
import { Grid } from '@mui/material';
import { fNumber } from 'src/utils/format-number';

import { LibraryCard } from '../components/library-card';

// Mock data for KPI cards
const kpiData = [
  {
    id: 'LIB_LIBRARIAN_CARD_TOTAL_BOOKS',
    title: 'Total Books',
    value: fNumber(2500),
    icon: 'ix:library',
    color: 'primary.main',
    bgColor: 'primary.lighter',
    href: '/library/book-management',
  },
  {
    id: 'LIB_LIBRARIAN_CARD_TOTAL_MEMBERS',
    title: 'Total Library Members',
    value: fNumber(1250),
    icon: 'heroicons:user-group',
    color: 'info.main',
    bgColor: 'info.lighter',
    href: '/library/member-management',
    labels: [
      { name: `Students ${fNumber(1000)}`, color: 'success' as const },
      { name: `Employees ${fNumber(250)}`, color: 'warning' as const },
    ],
  },
  {
    id: 'LIB_LIBRARIAN_CARD_ISSUED_TODAY',
    title: 'Books Issued Today',
    value: fNumber(45),
    icon: 'map:library',
    color: 'success.main',
    bgColor: 'success.lighter',
    href: '/library/circulation/?tab=issued-books',
  },
  {
    id: 'LIB_LIBRARIAN_CARD_DUE_TODAY',
    title: 'Books Due Today',
    value: fNumber(23),
    icon: 'tabler:calendar-due',
    color: 'warning.main',
    bgColor: 'warning.lighter',
    href: '/library/circulation/?tab=due-books',
  },
  {
    id: 'LIB_LIBRARIAN_CARD_OVERDUE',
    title: 'Overdue Books',
    value: fNumber(12),
    icon: 'carbon:warning-alt',
    color: 'error.main',
    bgColor: 'error.lighter',
    href: '/library/circulation/?tab=overdue-books',
  },
  {
    id: 'LIB_LIBRARIAN_CARD_PENDING_CHARGES',
    title: 'Pending Charges',
    value: `₹ ${fNumber(3450)}`,
    icon: 'mdi:currency-inr',
    color: 'secondary.main',
    bgColor: 'secondary.lighter',
    href: '/library/charges',
  },
];

const LibrarianKPICards = () => (
  <Grid container spacing={3}>
    {kpiData.map((card) => (
      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={card.id}>
        <LibraryCard
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

export default LibrarianKPICards;
