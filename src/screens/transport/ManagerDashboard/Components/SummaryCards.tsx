import React, { useState } from 'react';
import { DashboardCard } from 'src/components/dashboard-card';
import CustomizableView from 'src/components/customizable-view';

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
      id: 'TR_MGR_CARD_TOTAL_STOPS',
      icon: 'mdi:bus-stop',
      title: 'Total Stops',
      count: '45',
      color: 'primary.main',
      bgColor: 'primary.lighter',
      href: '#',
      labels: [
        { name: 'Active : 40', color: 'success' },
        { name: 'Inactive : 5', color: 'error' },
      ],
      width: 4,
    },
    {
      id: 'TR_MGR_CARD_ACTIVE_ROUTES',
      icon: 'mdi:routes',
      title: 'Active Routes',
      count: '12',
      color: 'info.main',
      bgColor: 'info.lighter',
      href: '#',
      labels: [
        { name: 'Pickup : 5', color: 'info' },
        { name: 'Drop : 5', color: 'warning' },
        { name: 'Both : 2', color: 'success' },
      ],
      width: 4,
    },
    {
      id: 'TR_MGR_CARD_STAFF_COUNT',
      icon: 'mdi:account-tie-hat',
      title: 'Total Transport Staff',
      count: '25',
      color: 'info.dark',
      bgColor: 'info.lighter',
      href: '#',
      labels: [
        { name: 'Drivers : 15', color: 'primary' },
        { name: 'Conductors : 10', color: 'secondary' },
      ],
      width: 4,
    },
    {
      id: 'TR_MGR_CARD_ACTIVE_VEHICLES',
      icon: 'mdi:bus',
      title: 'Vehicles Available',
      count: '18',
      color: 'success.main',
      bgColor: 'success.lighter',
      href: '#',
      width: 4,
    },
    {
      id: 'TR_MGR_CARD_PENDING_APPLICATIONS',
      icon: 'mdi:file-document-edit',
      title: 'Pending Applications',
      count: '8',
      color: 'warning.main',
      bgColor: 'warning.lighter',
      href: '#',
      width: 4,
    },
    {
      id: 'TR_MGR_CARD_ASSIGNED_STUDENTS',
      icon: 'mdi:account-school',
      title: 'Students Assigned',
      count: '450',
      color: 'secondary.main',
      bgColor: 'secondary.lighter',
      href: '#',
      width: 4,
    },
  ]);

  const dashBoardSections = cards.reduce((acc: { [key: string]: React.JSX.Element }, card) => {
    acc[card.id] = (
      <DashboardCard
        icon={card.icon}
        title={card.title}
        value={card.count}
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

export default SummaryCards;
