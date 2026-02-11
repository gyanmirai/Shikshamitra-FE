import React, { useState } from 'react';
import { fCurrency } from 'src/utils/format-number';
import { financePaths } from 'src/constants/finance-menu';
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

const FinancePrincipalOverview = () => {
  const [cards, setCards] = useState<ICardItem[]>([
    {
      id: 'CARD_TOTAL_ANNUAL_COLLECTION',
      icon: 'hugeicons:money-bag-02',
      title: 'Total Fees',
      count: fCurrency(12500000),
      color: 'success.main',
      bgColor: 'success',
      href: financePaths.feeCollection,
      width: 4,
      labels: [
        { name: 'Paid - 700k', color: 'success' }, // Example value
        { name: 'Pending - 300k', color: 'warning' }, // Example value
        { name: 'Overdue - 250k', color: 'error' }, // Example value
      ],
    },
    {
      id: 'CARD_APPROVAL_REQUIRED',
      icon: 'hugeicons:validation-approval',
      title: 'Approvals Needed',
      count: '15',
      color: 'warning.main',
      bgColor: 'warning',
      href: financePaths.concession,
      labels: [{ name: 'Concessions: 7', color: 'info' }],
      width: 4,
    },
    {
      id: 'CARD_NET_PROFITABILITY',
      icon: 'hugeicons:analytics-up',
      title: 'Net Surplus',
      count: fCurrency(4500000),
      color: 'info.main',
      bgColor: 'info',
      href: financePaths.incomeTracking,
      labels: [
        { name: `Income: ${fCurrency(12500000)}`, color: 'success' },
        { name: `Expense: ${fCurrency(8000000)}`, color: 'error' },
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

export default FinancePrincipalOverview;
