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

const CommunicationDashboardOverview = () => {
  const [cards, setCards] = useState<ICardItem[]>([
    {
      id: 'CARD_TOTAL_ANNOUNCEMENTS',
      icon: 'mdi:bullhorn',
      title: 'Total Announcements',
      count: '1,250',
      color: 'primary.main',
      bgColor: 'primary',
      href: '#',
      labels: [
        { name: 'School 10', color: 'info' },
        { name: 'Class 25', color: 'secondary' },
      ],
      width: 4,
    },
    {
      id: 'CARD_ACTIVE_ANNOUNCEMENTS',
      icon: 'mdi:broadcast',
      title: 'Active Announcements',
      count: '45',
      color: 'info.main',
      bgColor: 'info',
      href: '#',
      labels: [
        { name: 'Academic 20', color: 'success' },
        { name: 'Events 15', color: 'warning' },
      ],
      width: 4,
    },
    {
      id: 'CARD_NOTIFICATIONS_SENT',
      icon: 'mdi:send-circle',
      title: 'Notifications Sent Today',
      count: '320',
      color: 'success.main',
      bgColor: 'success',
      href: '#',
      labels: [
        { name: 'sent 200', color: 'success' },
        { name: 'failed 120', color: 'error' },
      ],
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

export default CommunicationDashboardOverview;
