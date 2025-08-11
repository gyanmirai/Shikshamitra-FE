import type { ICardItem } from 'src/screens/student/enrollment/entrollment-interface';

import React, { useState } from 'react';

import { fNumber } from 'src/utils/format-number';

import { StudentEnrollmentCard } from 'src/screens/student/enrollment/dashboard/overview';

import CustomizableView from 'src/components/customizable-view';

const OverviewCard = () => {
  const [cards, setCards] = useState<ICardItem[]>([
    {
      id: '0',
      icon: 'mdi:users', // Total Students
      title: 'Total Students',
      count: fNumber(10000),
      color: 'success.main',
      bgColor: 'success',
      href: '/student/profile',
      width: 4,
      labels: [
        { name: `Male - ${fNumber(5000)}`, color: 'success' },
        { name: `Female - ${fNumber(5000)}`, color: 'error' },
      ],
    },
    {
      id: '1',
      icon: 'ph:student-bold', // Total Primary Students
      title: 'Total Primary Students',
      count: fNumber(1000),
      color: 'info.main',
      bgColor: 'info',
      href: '', // will add later
      width: 4,
      labels: [
        { name: `Male - ${fNumber(600)}`, color: 'success' },
        { name: `Female - ${fNumber(400)}`, color: 'error' },
      ],
    },
    {
      id: '2',
      icon: 'ph:student-fill', // Total Secondary Students
      title: 'Total Secondary Students',
      count: fNumber(247),
      color: 'warning.main',
      bgColor: 'warning',
      href: '', // will add later
      width: 4,
      labels: [
        { name: `Male - ${fNumber(120)}`, color: 'success' },
        { name: `Female - ${fNumber(127)}`, color: 'error' },
      ],
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

export default OverviewCard;
