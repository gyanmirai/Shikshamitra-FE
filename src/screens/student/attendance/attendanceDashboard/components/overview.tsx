import type { ICardItem } from 'src/screens/student/enrollment/entrollment-interface';

import React, { useState } from 'react';

import { StudentEnrollmentCard } from 'src/screens/student/enrollment/dashboard/overview';

import CustomizableView from 'src/components/customizable-view';

const Overview = () => {
  const [cards, setCards] = useState<ICardItem[]>([
    {
      id: '0',
      icon: 'mdi:user-tick-outline', // Students Present
      title: 'Students Present Today',
      count: 1247,
      color: 'success.main',
      bgColor: 'success',
      href: '/student/attendance/take-attendance/',
      width: 4,
      labels: [],
    },
    {
      id: '1',
      icon: 'ci:user-remove', // Students Absent
      title: 'Students Absent Today',
      count: 1189,
      color: 'info.main',
      bgColor: 'info',
      href: '/student/attendance/take-attendance/',
      width: 4,
      labels: [],
    },
    {
      id: '2',
      icon: 'mdi:clock-outline', // Pending Leave Requests
      title: 'Pending Leave Requests',
      count: 1203,
      color: 'warning.main',
      bgColor: 'warning',
      href: '/student/attendance/leave-absent/',
      width: 4,
      labels: [],
    },
  ]);

  const dashBoardSections = cards.reduce((acc: { [key: string]: JSX.Element }, card, index) => {
    acc[card.id] = (
      <StudentEnrollmentCard
        icon={card.icon}
        title={card.title}
        count={card.count}
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

export default Overview;
