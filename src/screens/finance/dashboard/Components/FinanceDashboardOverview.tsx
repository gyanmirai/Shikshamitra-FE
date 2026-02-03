import Link from 'next/link';
import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fCurrency } from 'src/utils/format-number';
import { Box, Card, Typography } from '@mui/material';
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
  width = 4,
}: ICardItem) => (
  <Box component={Link} href={href} sx={{ textDecoration: 'none', height: '100%' }}>
    <Card
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        transition: (theme) =>
          theme.transitions.create(['box-shadow', 'transform'], {
            duration: theme.transitions.duration.short,
          }),
        '&:hover': {
          boxShadow: (theme) => theme.customShadows.z16,
          transform: 'translateY(-4px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
          {title}
        </Typography>
        <Iconify
          icon={icon}
          sx={{
            height: 40,
            width: 40,
            color,
            p: 0.75,
            borderRadius: '50%',
            bgcolor: (theme) =>
              theme.palette[
                bgColor as 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
              ].lighter,
          }}
        />
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="h3">{count}</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
          {labels.map((label, idx) => (
            <Label key={idx} color={label.color} variant="soft">
              {label.name}
            </Label>
          ))}
        </Box>
      </Box>
    </Card>
  </Box>
);

const FinanceDashboardOverview = () => {
  const [cards, setCards] = useState<ICardItem[]>([
    {
      id: 'CARD_TOTAL_FEES',
      icon: 'hugeicons:money-bag-02',
      title: 'Total Fees (Month)',
      count: fCurrency(1250000), // This would be the sum of outstanding, pending, and overdue
      color: 'success.main',
      bgColor: 'success',
      href: '#',
      labels: [
        { name: 'Outstanding - 700k', color: 'info' }, // Example value
        { name: 'Pending - 300k', color: 'warning' }, // Example value
        { name: 'Overdue - 250k', color: 'error' }, // Example value
      ],
      width: 4,
    },
    {
      id: 'CARD_TOTAL_EXPENSES',
      icon: 'hugeicons:wallet-02',
      title: 'Total Expenses (Month)',
      count: fCurrency(320000),
      color: 'warning.main',
      bgColor: 'warning',
      href: '#',
      labels: [
        { name: 'Salaries - 70%', color: 'warning' },
        { name: 'Maintenance - 30%', color: 'info' },
      ],
      width: 4,
    },
    {
      id: 'CARD_NET_BALANCE',
      icon: 'hugeicons:bank',
      title: 'Net Balance',
      count: fCurrency(930000),
      color: 'info.main',
      bgColor: 'info',
      href: '#',
      labels: [{ name: 'Healthy', color: 'success' }],
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

export default FinanceDashboardOverview;
