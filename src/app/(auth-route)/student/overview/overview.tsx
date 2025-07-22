import type { ICardItem } from 'src/screens/student/enrollment/entrollment-interface';

import React, { useState } from 'react';

import { fNumber } from 'src/utils/format-number';

import { StudentEnrollmentCard } from 'src/screens/student/enrollment/dashboard/overview';

import CustomizableView from 'src/components/customizable-view';

const Overview = () => {
  const [cards, setCards] = useState<ICardItem[]>([
    {
      id: '0',
      icon: 'mdi:users', // Total Students
      title: 'Total Students',
      count: fNumber(1247),
      color: 'success.main',
      bgColor: 'success',
      href: '/student/profile',
      width: 4,
      labels: [],
    },
    {
      id: '1',
      icon: 'lucide:badge-check', // GR Numbers Generated
      title: 'GR Numbers Generated',
      count: fNumber(1189),
      color: 'info.main',
      bgColor: 'info',
      href: '/student/management/?tab=grGeneration',
      width: 4,
      labels: [],
    },
    {
      id: '2',
      icon: 'heroicons:identification', // Roll Numbers Generated
      title: 'Roll Numbers Generated',
      count: fNumber(1203),
      color: 'warning.main',
      bgColor: 'warning',
      href: '/student/management/?tab=rollGeneration',
      width: 4,
      labels: [],
    },
    {
      id: '3',
      icon: 'solar:transfer-horizontal-bold-duotone', // Division Change
      title: 'Division Change',
      count: fNumber(47),
      color: 'info.main',
      bgColor: 'info',
      href: '/student/management/?tab=changeDivision',
      width: 4,
      labels: [],
    },
    {
      id: '4',
      icon: 'solar:transfer-horizontal-broken', // Class Change This Term
      title: 'Class Change This Term',
      count: fNumber(23),
      color: 'error.main',
      bgColor: 'error',
      href: '/student/enrollment/class-change',
      width: 4,
      labels: [],
    },
    {
      id: '5',
      icon: 'tdesign:certificate-1', // Add New Card
      title: 'Certificates Generated',
      count: fNumber(120),
      color: 'success.main',
      bgColor: 'success',
      href: '/student/certificates/?tab=bonafiedCertificates',
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
