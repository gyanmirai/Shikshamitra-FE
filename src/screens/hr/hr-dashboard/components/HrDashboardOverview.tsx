import type { JSX } from 'react';
import type { ICardItem, IStudentEnrollmentCardProps } from 'src/types/dashboard';

import Link from 'next/link';
import { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';
import { Box, Card, Typography } from '@mui/material';
import CustomizableView from 'src/components/customizable-view';

// Assuming this is the correct path

export const StudentEnrollmentCard = ({
  icon,
  title,
  count,
  color,
  bgColor,
  href = '',
  labels = [],
  index,
}: IStudentEnrollmentCardProps) => (
  <Box component={Link} href={href} sx={{ textDecoration: 'none' }}>
    <Card
      sx={{
        p: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 5,
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
        <Typography variant="subtitle1">{title}</Typography>
        <Typography variant="h3">{count}</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
          {labels.map((label, idx) => (
            <Label key={idx} color={label.color}>
              {label.name}
            </Label>
          ))}
        </Box>
      </Box>
      <Iconify
        icon={icon}
        sx={{
          height: '46px',
          width: '46px',
          color,
        }}
      />
    </Card>
  </Box>
);

const HRDashboardOverview = () => {
  const [cards, setCards] = useState<ICardItem[]>([
    {
      id: '6',
      icon: 'mdi:account-group-outline',
      title: 'Total Employees',
      count: fNumber(156),
      color: 'success.main',
      bgColor: 'success',
      href: '/staff/employees',
      labels: [],
      width: 4,
    },
    {
      id: '7',
      icon: 'icon-park-outline:setting-config',
      title: 'Teaching Staff',
      count: fNumber(89),
      color: 'info.main',
      bgColor: 'info',
      href: '/staff/teaching',
      labels: [],
      width: 4,
    },
    {
      id: '8',
      icon: 'fluent:settings-32-filled',
      title: 'Non-Teaching Staff',
      count: fNumber(67),
      color: 'warning.main',
      bgColor: 'warning',
      href: '/staff/non-teaching',
      labels: [],
      width: 4,
    },
  ]);

  // Define the initial state for the cards
  const dashBoardSections = cards.reduce((acc: { [key: string]: JSX.Element }, card, index) => {
    acc[card.id] = (
      <StudentEnrollmentCard
        icon={card.icon}
        title={card.title}
        count={card.count}
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

export default HRDashboardOverview;
