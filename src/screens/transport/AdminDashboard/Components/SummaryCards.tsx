import React, { useState } from 'react';
import { DashboardCard } from 'src/components/dashboard-card';
import CustomizableView from 'src/components/customizable-view';

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
    // {
    //   id: 'TR_ADMIN_CARD_TOTAL_ROUTES',
    //   icon: 'mdi:routes',
    //   title: 'Total Routes',
    //   count: '24',
    //   color: 'info.main',
    //   bgColor: 'info.lighter',
    //   href: '#',
    //   width: 4,
    // },
    {
      id: 'TR_ADMIN_CARD_PENDING_APPLICATIONS',
      icon: 'mdi:file-document-edit',
      title: 'Pending Applications',
      count: '8',
      color: 'warning.main',
      bgColor: 'warning.lighter',
      href: '#',
      width: 4,
    },
    {
      id: 'TR_ADMIN_CARD_MAINTENANCE_VEHICLES',
      icon: 'mdi:tools',
      title: 'Vehicles Under Maintenance',
      count: '2',
      color: 'error.main',
      bgColor: 'error.lighter',
      href: '#',
      width: 4,
    },
    {
      id: 'TR_ADMIN_CARD_TOTAL_STOPS',
      icon: 'mdi:bus-stop',
      title: 'Total Stops',
      count: '45',
      color: 'primary.main',
      bgColor: 'primary.lighter',
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
