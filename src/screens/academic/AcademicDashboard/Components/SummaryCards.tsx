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
      id: 'total_students',
      icon: 'solar:users-group-two-rounded-bold',
      title: 'Total Students',
      value: '1,248',
      status: 'primary',
      width: 3,
      chart: {
        type: 'bar',
        series: [210, 198, 225, 215, 200, 200],
        labels: ['Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
      },
    },
    {
      id: 'total_teachers',
      icon: 'solar:graduation-cap-bold',
      title: 'Total Teachers',
      value: '64',
      status: 'success',
      width: 3,
      chart: {
        type: 'donut',
        series: [48, 16],
        width: 48,
        height: 48,
        colors: ['#22C55E', '#FFA500'],
        labels: ['Active', 'On Leave'],
      },
    },
    {
      id: 'active_timetables',
      icon: 'solar:calendar-bold',
      title: 'Active Timetables',
      value: '18',
      status: 'info',
      path: academicPaths.timetable.management,
      width: 3,
      chart: {
        type: 'donut',
        series: [18, 3],
        width: 48,
        height: 48,
        colors: ['#3B82F6', '#FFA500'],
        labels: ['Active', 'Pending'],
      },
    },
    {
      id: 'pending_grade_entries',
      icon: 'solar:document-text-bold',
      title: 'Pending Grade Entries',
      value: '18',
      status: 'error',
      path: academicPaths.examination.recordMarks,
      width: 3,
      chart: {
        type: 'bar',
        series: [5, 8, 3, 2],
        labels: ['Class 7', 'Class 8', 'Class 9', 'Class 10'],
      },
    },
    {
      id: 'pending_evaluations',
      icon: 'solar:notebook-bold',
      title: 'Pending Evaluations',
      value: '24',
      status: 'warning',
      path: academicPaths.homework.assessment,
      width: 3,
      chart: {
        type: 'bar',
        series: [10, 14],
        labels: ['Homework', 'Assignment'],
      },
    },
    {
      id: 'upcoming_exams',
      icon: 'solar:medal-star-linear',
      title: 'Upcoming Exams',
      value: '6',
      status: 'secondary',
      path: academicPaths.examination.schedule,
      width: 3,
      chart: {
        type: 'bar',
        series: [1, 2, 3],
        labels: ['This Week', 'Next Week', 'This Month'],
      },
    },
    {
      id: 'curriculum_completion',
      icon: 'solar:checklist-minimalistic-broken',
      title: 'Curriculum Completion',
      value: '75%',
      status: 'success',
      path: academicPaths.curriculum.chaptersManagement,
      width: 3,
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
      id: 'system_alerts',
      icon: 'solar:bell-bing-bold',
      title: 'System Alerts',
      value: '6',
      status: 'error',
      width: 3,
      chart: {
        type: 'donut',
        series: [2, 3, 1],
        width: 48,
        height: 48,
        colors: ['#EF4444', '#F59E0B', '#3B82F6'],
        labels: ['Critical', 'Warning', 'Info'],
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
