import type { JSX } from 'react';

import React, { useState } from 'react';
import { fNumber } from 'src/utils/format-number';
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
      count: fNumber(10000),
      color: 'success.main',
      bgColor: 'success',
      href: '/fees',
      width: 4,
      labels: [
        {
          name: `Paid: ₹${fNumber(1000)}`,
          color: 'success',
        },
        {
          name: `Pending: ₹${fNumber(1000)}`,
          color: 'warning',
        },
      ],
    },
    {
      id: 'document',
      icon: 'ion:document',
      title: 'Document',
      count: fNumber(8),
      color: 'warning.main',
      bgColor: 'warning',
      href: '/documents',
      width: 6,
      labels: [
        {
          name: `Uploaded: ${fNumber(5)}`,
          color: 'success',
        },
        {
          name: `Pending: ${fNumber(3)}`,
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
