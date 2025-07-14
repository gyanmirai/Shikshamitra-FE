import React, { useState } from 'react';

import CustomizableView from 'src/components/customizable-view';

import { StudentEnrollmentCard } from '../../enrollment/dashboard/overview';

import type { ICardItem } from '../../enrollment/entrollment-interface';

const Overview = () => {
  const [cards, setCards] = useState<ICardItem[]>([
    {
      id: 'attendance-today',
      icon: 'lucide:user-round-check',
      title: 'Today Attendance',
      count: 'Present',
      color: 'success.main',
      bgColor: 'success',
      href: '/attendance',
      width: 4,
      labels: [],
    },
    {
      id: 'academic-performance',
      icon: 'hugeicons:chart-evaluation',
      title: 'Current Academic Performance',
      count: '86%',
      color: 'info.main',
      bgColor: 'info',
      href: '/performance',
      width: 4,
      labels: [
        {
          name: '+2% Higher than previous term',
          color: 'success',
        },
      ],
    },
    {
      id: 'fee-status',
      icon: 'streamline-plump:payment-recieve-7-remix',
      title: 'Fee Status',
      count: '10,000',
      color: 'success.main',
      bgColor: 'success',
      href: '/fees',
      width: 4,
      labels: [
        {
          name: 'Paid: ₹1,000',
          color: 'success',
        },
        {
          name: 'Pending: ₹1,000',
          color: 'warning',
        },
      ],
    },
    {
      id: 'document',
      icon: 'ion:document',
      title: 'Document',
      count: '08',
      color: 'warning.main',
      bgColor: 'warning',
      href: '/documents',
      width: 6,
      labels: [
        {
          name: 'Uploaded: 05',
          color: 'success',
        },
        {
          name: 'Pending: 03',
          color: 'warning',
        },
      ],
    },
    {
      id: 'class-teacher',
      icon: 'mdi:user-outline',
      title: 'Class Teacher',
      count: 'Dharmik Jinjala',
      color: 'info.main',
      bgColor: 'info',
      href: '/teachers/class',
      width: 6,
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
