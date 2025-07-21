import type { ICardItem } from 'src/screens/student/enrollment/entrollment-interface';

import { useState } from 'react';

import { fNumber } from 'src/utils/format-number';

import { StudentEnrollmentCard } from 'src/screens/student/enrollment/dashboard/overview';

import CustomizableView from 'src/components/customizable-view';

const EmployeeProfileOverview = () => {
  // Define the initial state for the cards
  const [cards, setCards] = useState<ICardItem[]>([
    {
      id: 'class-handle',
      icon: 'icon-park-outline:classroom', // adjust this icon as per your library
      title: 'Class Handle',
      count: fNumber(8),
      color: 'success.main',
      bgColor: 'success',
      href: '', // add if you want it clickable
      labels: [],
      width: 4,
    },
    {
      id: 'attendance-rate',
      icon: 'iconoir:stats-report', // or 'fluent:person-info-20-regular'
      title: 'Attendance Rate',
      count: '94%',
      color: 'info.main',
      bgColor: 'info',
      href: '',
      labels: [],
      width: 4,
    },
    {
      id: 'leave-taken',
      icon: 'solar:clock-bold', // match the clock icon shown in your screenshot
      title: 'Leave Taken',
      count: fNumber(3),
      color: 'warning.main',
      bgColor: 'warning',
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

export default EmployeeProfileOverview;
