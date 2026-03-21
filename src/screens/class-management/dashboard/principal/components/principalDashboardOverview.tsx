import type { ICardItem } from 'src/screens/student/enrollment/entrollment-interface';

import { useState } from 'react';
import { Grid } from '@mui/material';
import { fNumber, fPercent } from 'src/utils/format-number';
import { DashboardCard } from 'src/components/dashboard-card';

const PrincipalDashboardOverview = () => {
  const [cards] = useState<ICardItem[]>([
    {
      id: 'total-classes',
      icon: 'fluent:class-24-filled',
      title: 'Total Classes',
      count: fNumber(45),
      color: 'primary.main',
      bgColor: 'primary.lighter',
      href: '',
      labels: [
        { name: `Primary ${fNumber(25)}`, color: 'primary' as const },
        { name: `Secondary ${fNumber(20)}`, color: 'info' as const },
      ],
      width: 0,
    },
    {
      id: 'total-students',
      icon: 'ph:student-bold',
      title: 'Total Students',
      count: fNumber(2500),
      color: 'info.main',
      bgColor: 'info.lighter',
      href: '',
      labels: [
        { name: `RTE ${fNumber(250)}`, color: 'warning' as const },
        { name: `Regular ${fNumber(2250)}`, color: 'success' as const },
      ],
      width: 0,
    },
    {
      id: 'total-teachers',
      icon: 'ph:chalkboard-teacher-bold',
      title: 'Total Teachers',
      count: fNumber(120),
      color: 'warning.main',
      bgColor: 'warning.lighter',
      href: '',
      labels: [
        { name: `Primary ${fNumber(70)}`, color: 'warning' as const },
        { name: `Secondary ${fNumber(50)}`, color: 'error' as const },
      ],
      width: 0,
    },
    {
      id: 'avg-attendance',
      icon: 'material-symbols:person-check-outline',
      title: 'Avg. Attendance',
      count: fPercent(92),
      color: 'success.main',
      bgColor: 'success.lighter',
      href: '',
      labels: [
        { name: `Students ${fPercent(95)}`, color: 'success' as const },
        { name: `Teachers ${fPercent(88)}`, color: 'info' as const },
      ],
      width: 0,
    },
  ]);

  return (
    <Grid container spacing={3}>
      {cards.map((card) => (
        <Grid size={{ xs: 12, md: 4 }} key={card.id}>
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

export default PrincipalDashboardOverview;
