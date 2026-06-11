import type { JSX } from 'react';
import type { ICardItem } from 'src/screens/student/enrollment/entrollment-interface';

import { fNumber } from 'src/utils/format-number';
import React, { useState, useEffect } from 'react';
import CustomizableView from 'src/components/customizable-view';
import { StudentEnrollmentCard } from 'src/screens/student/enrollment/dashboard/overview';

const OverviewCard = ({ summary = {} }: { summary?: any }) => {
  const totalStudents = summary.totalStudents || 0;
  const maleStudents = summary.maleStudents || 0;
  const femaleStudents = summary.femaleStudents || 0;
  const [cards, setCards] = useState<ICardItem[]>([
    {
      id: '0',
      icon: 'mdi:users', // Total Students
      title: 'Total Students',
      count: fNumber(totalStudents),
      color: 'success.main',
      bgColor: 'success',
      href: '/student/profile',
      width: 4,
      labels: [
        { name: `Male - ${fNumber(maleStudents)}`, color: 'success' },
        { name: `Female - ${fNumber(femaleStudents)}`, color: 'error' },
      ],
    },
    {
      id: '1',
      icon: 'ph:student-bold', // Total Primary Students
      title: 'Total Primary Students',
      count: fNumber(0),
      color: 'info.main',
      bgColor: 'info',
      href: '/student/primary',
      width: 4,
      labels: [
        { name: `Male - ${fNumber(0)}`, color: 'success' },
        { name: `Female - ${fNumber(0)}`, color: 'error' },
      ],
    },
    {
      id: '2',
      icon: 'ph:student-fill', // Total Secondary Students
      title: 'Total Secondary Students',
      count: fNumber(0),
      color: 'warning.main',
      bgColor: 'warning',
      href: '/student/secondary',
      width: 4,
      labels: [
        { name: `Male - ${fNumber(0)}`, color: 'success' },
        { name: `Female - ${fNumber(0)}`, color: 'error' },
      ],
    },
  ]);

  useEffect(() => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === '0'
          ? {
              ...card,
              count: fNumber(totalStudents),
              labels: [
                { name: `Male - ${fNumber(maleStudents)}`, color: 'success' },
                { name: `Female - ${fNumber(femaleStudents)}`, color: 'error' },
              ],
            }
          : card
      )
    );
  }, [femaleStudents, maleStudents, totalStudents]);

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
