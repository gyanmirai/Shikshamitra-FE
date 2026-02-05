import React, { useState } from 'react';
import { fNumber, fCurrency } from 'src/utils/format-number';
import CustomizableView from 'src/components/customizable-view';

import { SummaryCard } from '../../dashboard/Components/FinanceDashboardOverview';

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

const FinanceAdminDashboardOverview = () => {
  const [cards, setCards] = useState<ICardItem[]>([
    {
      id: 'CARD_PENDING_CONCESSION',
      icon: 'hugeicons:discount',
      title: 'Pending Concession Requests',
      count: fNumber(8),
      color: 'info.main',
      bgColor: 'info',
      href: '#',
      width: 4,
    },
    {
      id: 'CARD_TOTAL_COLLECTION',
      icon: 'hugeicons:money-bag-02',
      title: 'Total Collection (YTD)',
      count: fCurrency(12500000),
      color: 'success.main',
      bgColor: 'success',
      href: '#',
      width: 4,
    },
    {
      id: 'CARD_TOTAL_EXPENSE',
      icon: 'hugeicons:wallet-02',
      title: 'Total Expenses (YTD)',
      count: fCurrency(8500000),
      color: 'error.main',
      bgColor: 'error',
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

export default FinanceAdminDashboardOverview;
