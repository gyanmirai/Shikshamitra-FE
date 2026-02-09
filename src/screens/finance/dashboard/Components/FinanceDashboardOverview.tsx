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
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        bgcolor: 'background.paper',
        boxShadow: 'var(--shadows-1)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary" mb={1}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {count}
          </Typography>
        </Box>

        <Box
          sx={{
            p: 1,
            borderRadius: '50%',
            display: 'flex',
            color: (theme) =>
              theme.palette[
                bgColor as 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
              ].main,
            bgcolor: (theme) =>
              theme.palette[
                bgColor as 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
              ].lighter,
          }}
        >
          <Iconify icon={icon} width={32} />
        </Box>
      </Box>

      {labels && labels.length > 0 && (
        <Box sx={{ mt: 0.5 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {labels.map((label, idx) => (
              <Label key={idx} color={label.color} variant="soft">
                {label.name}
              </Label>
            ))}
          </Box>
        </Box>
      )}
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
        { name: 'Paid - 700k', color: 'success' }, // Example value
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
      // labels: [
      //   { name: 'Salaries - 70%', color: 'warning' },
      //   { name: 'Maintenance - 30%', color: 'info' },
      // ],
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
      // labels: [{ name: 'Healthy', color: 'success' }],
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
