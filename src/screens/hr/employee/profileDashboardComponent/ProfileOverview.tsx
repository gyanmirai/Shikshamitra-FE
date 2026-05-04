import type { ICardItem } from 'src/screens/student/enrollment/entrollment-interface';

import { useState } from 'react';
import { Grid } from '@mui/material';
import { fNumber } from 'src/utils/format-number';
import { DashboardCard } from 'src/components/dashboard-card/dashboard-card';

// ----------------------------------------------------------------------

const EmployeeProfileOverview = () => {
  const [cards, setCards] = useState<ICardItem[]>([
    {
      id: 'today-status',
      icon: 'solar:user-check-rounded-outline',
      title: "Today's Status",
      count: 'Present',
      color: 'success.main',
      bgColor: 'success.lighter',
      href: '',
      labels: [],
      width: 2.4,
    },
    {
      id: 'attendance-percent',
      icon: 'solar:chart-square-outline',
      title: 'Attendance %',
      count: '94%',
      color: 'info.main',
      bgColor: 'info.lighter',
      href: '',
      labels: [],
      width: 2.4,
    },
    {
      id: 'leave-balance',
      icon: 'solar:calendar-outline',
      title: 'Leave Balance',
      count: fNumber(12),
      color: 'primary.main',
      bgColor: 'primary.lighter',
      href: '',
      labels: [],
      width: 2.4,
    },
    {
      id: 'pending-requests',
      icon: 'solar:bell-bing-outline',
      title: 'Pending Requests',
      count: fNumber(3),
      color: 'warning.main',
      bgColor: 'warning.lighter',
      href: '',
      labels: [],
      width: 2.4,
    },
    {
      id: 'upcoming-holiday',
      icon: 'solar:star-outline',
      title: 'Upcoming Holiday',
      count: 'Apr 14',
      color: 'secondary.main',
      bgColor: 'secondary.lighter',
      href: '',
      labels: [],
      width: 2.4,
    },
  ]);

  return (
    <Grid container spacing={2}>
      {cards.map((card) => (
        <Grid key={card.id} size={{ xs: 12, sm: 6, md: card.width }}>
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

export default EmployeeProfileOverview;
