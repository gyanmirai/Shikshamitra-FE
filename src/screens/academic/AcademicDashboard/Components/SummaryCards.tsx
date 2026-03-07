import React, { useState } from 'react';
import { academicPaths } from 'src/constants/academic-menu';
import CustomizableView from 'src/components/customizable-view';
import CompactKPICard from 'src/screens/student/dashboard/principal/kpi-card-item';

// ----------------------------------------------------------------------

interface ICardItem {
  id: string;
  icon: string;
  title: string;
  value: string;
  status: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  path?: string;
  width?: number;
  chart?: {
    type?: 'line' | 'bar' | 'area' | 'donut' | 'pie' | 'radialBar';
    series?: any[];
    colors?: string[];
    options?: any;
    width?: number;
    height?: number;
    labels?: string[];
  };
}

const SummaryCards = () => {
  const [cards, setCards] = useState<ICardItem[]>([
    {
      id: 'total_subjects',
      icon: 'fluent:book-24-regular',
      title: 'Total Subjects',
      value: '8',
      status: 'error',
      path: academicPaths.curriculum.settings.subjectsCreation,
      width: 4,
      // Core: 6, Elective: 2
      chart: {
        type: 'bar',
        series: [6, 2],
        labels: ['Core', 'Elective'],
      },
    },
    {
      id: 'overall_chapter_completion',
      icon: 'solar:checklist-minimalistic-broken',
      title: 'Overall Chapter Completion',
      value: '75%',
      status: 'success',
      path: academicPaths.curriculum.chaptersManagement,
      width: 4,
      // Completed: 75%, Pending: 25%
      chart: {
        type: 'donut',
        series: [75, 25],
        width: 48,
        height: 48,
        colors: ['#22C55E', '#FFA500'],
        labels: ['Completed', 'Pending'],
      },
    },
    {
      id: 'overall_exam_performance',
      icon: 'solar:medal-star-linear',
      title: 'Overall Exam Performance',
      value: '88%',
      status: 'info',
      path: academicPaths.examination.recordMarks,
      width: 4,
      // Pass: 88%, Fail: 12%
      chart: {
        type: 'donut',
        series: [88, 12],
        width: 48,
        height: 48,
        colors: ['#22C55E', '#EF4444'],
        labels: ['Pass', 'Fail'],
      },
    },
  ]);

  const dashBoardSections = cards.reduce((acc: { [key: string]: React.JSX.Element }, card) => {
    acc[card.id] = <CompactKPICard {...card} />;
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
