import type { ICardItem } from 'src/types/dashboard';

import { useState } from 'react';
import { Grid } from '@mui/material';
import { fNumber } from 'src/utils/format-number';
import { DashboardCard } from 'src/components/dashboard-card';

const ClassManagementDashboardOverview = () => {
  // Define the initial state for the cards
  const [cards] = useState<ICardItem[]>([
    {
      id: 'elective-assigned',
      icon: 'material-symbols:menu-book-outline', // book icon, use the closest matching
      title: 'Elective Assigned',
      count: `${fNumber(420)}/${fNumber(500)}`,
      color: 'success.main',
      bgColor: 'success.lighter',
      href: '',
      labels: [],
      width: 3,
    },
    {
      id: 'chapter-completed',
      icon: 'fluent:document-bullet-list-24-regular', // icon looks like a checklist/paper
      title: 'Chapter Completed',
      count: fNumber(20),
      color: 'info.main',
      bgColor: 'info.lighter',
      href: '',
      labels: [],
      width: 3,
    },
    {
      id: 'teachers-assigned',
      icon: 'ph:users-three-bold', // group icon, try to match purple one
      title: 'Class Teachers Assigned',
      count: `${fNumber(28)}/${fNumber(30)}`,
      color: 'secondary.main', // use a theme color similar to purple
      bgColor: 'secondary.lighter',
      href: '',
      labels: [],
      width: 3,
    },
    {
      id: 'pending-tasks',
      icon: 'material-symbols:pending-actions',
      title: 'Pending Tasks',
      count: fNumber(15),
      color: 'warning.main',
      bgColor: 'warning.lighter',
      href: '',
      labels: [],
      width: 3,
    },
  ]);

  return (
    <Grid container spacing={1}>
      {cards.map((card) => (
        <Grid size={{ xs: 12, md: 3 }} key={card.id}>
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

export default ClassManagementDashboardOverview;
