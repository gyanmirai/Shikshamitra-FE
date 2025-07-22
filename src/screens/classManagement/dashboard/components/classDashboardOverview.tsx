'use client';

import type { ICardItem } from 'src/screens/student/enrollment/entrollment-interface';

import { useState } from 'react';

import { fNumber } from 'src/utils/format-number';

import { StudentEnrollmentCard } from 'src/screens/student/enrollment/dashboard/overview';

import CustomizableView from 'src/components/customizable-view';

const ClassManagementDashboardOverview = () => {
  // Define the initial state for the cards
  const [cards, setCards] = useState<ICardItem[]>([
    {
      id: 'elective-assigned',
      icon: 'material-symbols:menu-book-outline', // book icon, use the closest matching
      title: 'Elective Assigned',
      count: `${fNumber(420)}/${fNumber(500)}`,
      color: 'success.main',
      bgColor: 'success',
      href: '',
      labels: [],
      width: 4,
    },
    {
      id: 'chapter-completed',
      icon: 'fluent:document-bullet-list-24-regular', // icon looks like a checklist/paper
      title: 'Chapter Completed',
      count: fNumber(20),
      color: 'info.main',
      bgColor: 'info',
      href: '',
      labels: [],
      width: 4,
    },
    {
      id: 'teachers-assigned',
      icon: 'ph:users-three-bold', // group icon, try to match purple one
      title: 'Class Teachers Assigned',
      count: `${fNumber(28)}/${fNumber(30)}`,
      color: 'secondary.main', // use a theme color similar to purple
      bgColor: 'secondary',
      href: '',
      labels: [],
      width: 4,
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

export default ClassManagementDashboardOverview;
