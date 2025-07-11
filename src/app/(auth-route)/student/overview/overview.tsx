import type { ICardItem } from 'src/screens/student/enrollment/entrollment-interface';

import React, { useState } from 'react';

import { StudentEnrollmentCard } from 'src/screens/student/enrollment/dashboard/overview';

import CustomizableView from 'src/components/customizable-view';

const Overview = () => {
  const [cards, setCards] = useState<ICardItem[]>([
    {
      id: '0',
      icon: 'mdi:graduation-cap', // Total Students
      title: 'Total Students',
      count: 1247,
      color: 'success.main',
      bgColor: 'success',
      href: '/student/enrollment/students',
      width: 4,
      labels: [],
    },
    {
      id: '1',
      icon: 'fluent:document-bullet-list-24-filled', // GR Numbers Generated
      title: 'GR Numbers Generated',
      count: 1189,
      color: 'info.main',
      bgColor: 'info',
      href: '/student/enrollment/gr-numbers',
      width: 4,
      labels: [],
    },
    {
      id: '2',
      icon: 'material-symbols:bookmark-outline', // Roll Numbers Generated
      title: 'Roll Numbers Generated',
      count: 1203,
      color: 'warning.main',
      bgColor: 'warning',
      href: '/student/enrollment/roll-numbers',
      width: 4,
      labels: [],
    },
    {
      id: '3',
      icon: 'tabler:arrows-exchange-2', // Division Change
      title: 'Division Change',
      count: 47,
      color: 'info.main',
      bgColor: 'info',
      href: '/student/enrollment/division-change',
      width: 4,
      labels: [],
    },
    {
      id: '4',
      icon: 'icon-park-outline:exchange', // Class Change This Term
      title: 'Class Change This Term',
      count: 23,
      color: 'error.main',
      bgColor: 'error',
      href: '/student/enrollment/class-change',
      width: 4,
      labels: [],
    },
    {
      id: '5',
      icon: 'iconoir:add-square', // Add New Card
      title: 'Add New Card',
      count: 560,
      color: 'success.main',
      bgColor: 'success',
      href: '/student/enrollment/add-card',
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
