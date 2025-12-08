import Link from 'next/link';
import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Typography } from '@mui/material';
import { fNumber, fCurrency } from 'src/utils/format-number';
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

export const SummaryCard = ({
  id,
  icon,
  title,
  count,
  color,
  bgColor,
  href = '',
  labels = [],
  width = 3,
}: ICardItem) => (
  <Box component={Link} href={href} sx={{ textDecoration: 'none', height: '100%' }}>
    <Card
      sx={{
        p: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2,
        flexGrow: 1,
        cursor: 'pointer',
        height: '100%',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 'var(--shadows-8)',
          scale: 1.03,
        },
      }}
    >
      <Box>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="h4">{count}</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
          {labels.map((label, idx) => (
            <Label key={idx} color={label.color} variant="soft">
              {label.name}
            </Label>
          ))}
        </Box>
      </Box>
      <Iconify
        icon={icon}
        sx={{
          height: 48,
          width: 48,
          color,
          p: 1,
          borderRadius: '50%',
          bgcolor: (theme) =>
            theme.palette[
              bgColor as 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
            ].lighter,
        }}
      />
    </Card>
  </Box>
);

const FinancePrincipalOverview = () => {
  const [cards, setCards] = useState<ICardItem[]>([
    {
      id: 'CARD_TOTAL_ANNUAL_COLLECTION',
      icon: 'hugeicons:money-bag-02',
      title: 'Total Annual Collection',
      count: fCurrency(12500000),
      color: 'success.main',
      bgColor: 'success',
      href: '/finance/fee-collection/',
      width: 2,
    },
    {
      id: 'CARD_OUTSTANDING_FEES_SUMMARY',
      icon: 'hugeicons:invoice-01',
      title: 'Outstanding Fees',
      count: fCurrency(2500000),
      color: 'error.main',
      bgColor: 'error',
      href: '/finance/fee-collection/',
      width: 2,
    },
    {
      id: 'CARD_PENDING_CONCESSION',
      icon: 'hugeicons:discount',
      title: 'Pending Concession Requests',
      count: fNumber(8),
      color: 'info.main',
      bgColor: 'info',
      href: '/finance/concession',
      width: 2,
    },
    {
      id: 'CARD_TODAY_FEES_COLLECTION',
      icon: 'hugeicons:money-bag-02',
      title: 'Today Fees Collection',
      count: fCurrency(12500000),
      color: 'success.main',
      bgColor: 'success',
      href: '/finance/fee-collection/',
      width: 2,
    },
    {
      id: 'CARD_APPROVAL_REQUIRED',
      icon: 'hugeicons:validation-approval',
      title: 'Approvals Needed',
      count: '15',
      color: 'warning.main',
      bgColor: 'warning',
      href: '/finance/fee-collection/',
      labels: [
        { name: 'Charges: 8', color: 'warning' },
        { name: 'Concessions: 7', color: 'info' },
      ],
      width: 2,
    },
    {
      id: 'CARD_NET_PROFITABILITY',
      icon: 'hugeicons:analytics-up',
      title: 'Net Surplus',
      count: fCurrency(4500000),
      color: 'info.main',
      bgColor: 'info',
      href: '/finance/fee-collection/',
      labels: [
        { name: `Income: ${fCurrency(12500000)}`, color: 'success' },
        { name: `Expense: ${fCurrency(8000000)}`, color: 'error' },
      ],
      width: 2,
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
