import React, { useState } from 'react';
import CustomizableView from 'src/components/customizable-view';
import { SummaryCard } from 'src/screens/finance/dashboard/Components/FinanceDashboardOverview';

// ----------------------------------------------------------------------

interface ICardItem {
  id: string;
  icon: string;
  title: string;
  count: string;
  color: string;
  bgColor: string;
  href?: string;
  labels?: {
    name: string;
    color: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'default';
  }[];
  width?: number;
}

const SummaryCards = () => {
  const [cards, setCards] = useState<ICardItem[]>([
    {
      id: 'total_subjects',
      icon: 'fluent:book-24-regular',
      title: 'Total Subjects',
      count: '8',
      color: 'error.main',
      bgColor: 'error',
      href: '#',
      labels: [
        { name: 'Core : 6', color: 'primary' },
        { name: 'Elective : 2', color: 'secondary' },
      ],
      width: 4,
    },
    {
      id: 'overall_chapter_completion',
      icon: 'solar:checklist-minimalistic-broken',
      title: 'Overall Chapter Completion',
      count: '75%',
      color: 'success.main',
      bgColor: 'success',
      href: '#',
      labels: [
        { name: 'Completed : 75%', color: 'success' },
        { name: 'Pending : 25%', color: 'warning' },
      ],
      width: 4,
    },
    {
      id: 'overall_exam_performance',
      icon: 'solar:medal-star-bold-duotone',
      title: 'Overall Exam Performance',
      count: '88%',
      color: 'info.main',
      bgColor: 'info',
      labels: [
        { name: 'Pass : 88%', color: 'success' },
        { name: 'Fail : 12%', color: 'error' },
      ],
      href: '#',
      width: 4,
    },
  ]);

  const dashBoardSections = cards.reduce((acc: { [key: string]: React.JSX.Element }, card) => {
    acc[card.id] = <SummaryCard {...card} />;
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

export default SummaryCards;
