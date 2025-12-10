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
    {
      id: 'TR_PRINCIPAL_CARD_STUDENTS_ASSIGNED',
      icon: 'mdi:account-school',
      title: 'Total Students Using Transport',
      count: '520',
      color: 'info.main',
      bgColor: 'info.lighter',
      href: '#',
      width: 4,
    },
    {
      id: 'TR_PRINCIPAL_CARD_PENDING_APPLICATIONS',
      icon: 'mdi:file-clock',
      title: 'Pending Applications',
      count: '14',
      color: 'warning.main',
      bgColor: 'warning.lighter',
      href: '#',
      width: 4,
    },
    {
      id: 'TR_PRINCIPAL_CARD_ACTIVE_ROUTES',
      icon: 'mdi:routes',
      title: 'Active Routes',
      count: '24',
      color: 'success.main',
      bgColor: 'success.lighter',
      href: '#',
      width: 4,
    },
    {
      id: 'TR_PRINCIPAL_CARD_VEHICLE_HEALTH',
      icon: 'mdi:shield-check',
      title: 'Vehicles in Good Status',
      count: '18',
      color: 'primary.main',
      bgColor: 'primary.lighter',
      href: '#',
      width: 4,
    },
    {
      id: 'TR_PRINCIPAL_CARD_STAFF_COUNT',
      icon: 'mdi:account-multiple',
      title: 'Drivers + Conductors',
      count: '42',
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
