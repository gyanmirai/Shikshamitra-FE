import React from 'react';
import { Grid } from '@mui/material';
import { fNumber } from 'src/utils/format-number';

import { LibraryCard } from '../components/library-card';

// Mock data for Admin KPI cards
const kpiData = [
  {
    id: 'LIB_ADMIN_CARD_TOTAL_BOOKS',
    title: 'Total Books',
    value: fNumber(2500),
    icon: 'ix:library',
    color: 'primary.main',
    bgColor: 'primary.lighter',
    href: '/library/book-management',
  },
  {
    id: 'LIB_ADMIN_CARD_ACTIVE_MEMBERS',
    title: 'Active Library Members',
    value: fNumber(1180),
    icon: 'heroicons:user-group',
    color: 'success.main',
    bgColor: 'success.lighter',
    href: '/library/member-management',
  },
  {
    id: 'LIB_ADMIN_CARD_TOTAL_CATEGORIES',
    title: 'Total Book Categories',
    value: fNumber(28),
    icon: 'carbon:category',
    color: 'info.main',
    bgColor: 'info.lighter',
    href: '/library/book-management',
  },
  {
    id: 'LIB_ADMIN_CARD_TOTAL_SECTIONS',
    title: 'Total Sections',
    value: fNumber(12),
    icon: 'mdi:bookshelf',
    color: 'warning.main',
    bgColor: 'warning.lighter',
    href: '/library/settings',
  },
];

const AdminKPICards = () => (
  <Grid container spacing={3}>
    {kpiData.map((card) => (
      <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.id}>
        <LibraryCard
          title={card.title}
          value={card.value}
          icon={card.icon}
          color={card.color}
          bgColor={card.bgColor}
          href={card.href}
        />
      </Grid>
    ))}
  </Grid>
);

export default AdminKPICards;
