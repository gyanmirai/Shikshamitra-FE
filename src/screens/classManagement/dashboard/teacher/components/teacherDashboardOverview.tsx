import type { ICardItem } from 'src/types/dashboard';

import { useState } from 'react';
import { Grid } from '@mui/material';
import { fNumber } from 'src/utils/format-number';

import { DashboardCard } from '../../components/dashboard-card';

const TeacherDashboardOverview = () => {
  const [cards] = useState<ICardItem[]>([
    {
      id: 'my-classes',
      icon: 'fluent:class-24-filled',
      title: 'My Classes',
      count: fNumber(5),
      color: 'primary.main',
      bgColor: 'primary.lighter',
      href: '',
      labels: [],
      width: 3,
    },
    {
      id: 'my-subjects',
      icon: 'material-symbols:menu-book-outline',
      title: 'My Subjects',
      count: fNumber(3),
      color: 'info.main',
      bgColor: 'info.lighter',
      href: '',
      labels: [],
      width: 3,
    },
    {
      id: 'chapters-completed',
      icon: 'fluent:document-checkmark-24-filled',
      title: 'Chapters Completed',
      count: fNumber(18),
      color: 'success.main',
      bgColor: 'success.lighter',
      href: '',
      labels: [],
      width: 3,
    },
    {
      id: 'pending-tasks',
      icon: 'material-symbols:pending-actions',
      title: 'Pending Tasks',
      count: fNumber(7),
      color: 'warning.main',
      bgColor: 'warning.lighter',
      href: '',
      labels: [],
      width: 3,
    },
  ]);

  return (
    <Grid container spacing={3}>
      {cards.map((card) => (
        <Grid size={{ xs: 12, md: card.width }} key={card.id}>
          <DashboardCard
            icon={card.icon}
            title={card.title}
            value={card.count}
            color={card.color}
            bgColor={card.bgColor}
            href={card.href}
            labels={card.labels}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default TeacherDashboardOverview;
