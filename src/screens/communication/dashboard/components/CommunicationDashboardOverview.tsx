import React, { useMemo, useState, useEffect } from 'react';
import CustomizableView from 'src/components/customizable-view';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetCommunicationDashboardQuery } from 'src/redux/communication/communicationApi';
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

const formatCount = (value?: number) => new Intl.NumberFormat('en-IN').format(value || 0);

const buildCards = (dashboard?: any): ICardItem[] => [
  {
    id: 'CARD_TOTAL_ANNOUNCEMENTS',
    icon: 'mdi:bullhorn',
    title: 'Total Campaigns',
    count: formatCount(dashboard?.totalCampaigns),
    color: 'primary.main',
    bgColor: 'primary',
    href: '/communication/notification-history',
    labels: [
      { name: `Draft ${formatCount(dashboard?.draftCampaigns)}`, color: 'info' },
      {
        name: `Pending ${formatCount(dashboard?.pendingApprovalCampaigns)}`,
        color: 'warning',
      },
    ],
    width: 4,
  },
  {
    id: 'CARD_ACTIVE_ANNOUNCEMENTS',
    icon: 'mdi:broadcast',
    title: 'Delivery Attempts',
    count: formatCount(dashboard?.deliveryAttemptCount),
    color: 'info.main',
    bgColor: 'info',
    href: '/communication/notification-history',
    labels: [
      { name: `Sent ${formatCount(dashboard?.sentCampaigns)}`, color: 'success' },
      { name: `Failed ${formatCount(dashboard?.deliveryFailureCount)}`, color: 'error' },
    ],
    width: 4,
  },
  {
    id: 'CARD_NOTIFICATIONS_SENT',
    icon: 'mdi:message-cog-outline',
    title: 'Operational Status',
    count: formatCount(dashboard?.enabledProviders),
    color: 'success.main',
    bgColor: 'success',
    href: '/communication/settings/deliveryChannelType',
    labels: [
      { name: `Replies ${formatCount(dashboard?.openReplies)}`, color: 'secondary' },
      { name: `Opt-outs ${formatCount(dashboard?.consentOptOutCount)}`, color: 'warning' },
    ],
    width: 4,
  },
];

const CommunicationDashboardOverview = () => {
  const { data: dashboard } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCommunicationDashboardQuery,
  });
  const dashboardCards = useMemo(() => buildCards(dashboard), [dashboard]);
  const [cards, setCards] = useState<ICardItem[]>(dashboardCards);

  useEffect(() => {
    setCards(dashboardCards);
  }, [dashboardCards]);

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
