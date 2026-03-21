import type { JSX } from 'react';
import type { ICardItem } from 'src/screens/student/enrollment/entrollment-interface';

import { useState } from 'react';
import { fNumber } from 'src/utils/format-number';
import CustomizableView from 'src/components/customizable-view';
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

  const dashBoardSections = cards.reduce((acc: { [key: string]: JSX.Element }, card) => {
    acc[card.id] = (
      <DashboardCard
        icon={card.icon}
        title={card.title}
        value={card.count}
        color={card.color}
        bgColor={card.bgColor}
        href={card.href}
        labels={card.labels}
      />
    );
    return acc;
  }, {});

  return (
    <CustomizableView
      sections={cards}
      setSections={setCards}
      dashBoardSections={dashBoardSections}
    />
  );
};

export default EmployeeProfileOverview;
