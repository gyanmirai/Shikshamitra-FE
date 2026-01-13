import type { JSX } from 'react';
import type {
  ICardItem,
  IStudentEnrollmentCardProps,
} from 'src/screens/student/enrollment/entrollment-interface';

import Link from 'next/link';
import { useState } from 'react';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';
import { Box, Card, Typography } from '@mui/material';
import CustomizableView from 'src/components/customizable-view';

// ----------------------------------------------------------------------

const ModernStatCard = ({
  icon,
  title,
  count,
  color,
  bgColor,
  href = '',
  labels = [],
}: IStudentEnrollmentCardProps) => (
  // Visual modernisation: Premium card look
  <Box component={Link} href={href} sx={{ textDecoration: 'none', width: '100%' }}>
    <Card
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 2,
        transition: 'all 0.3s ease-in-out',
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) =>
            `0 12px 24px -4px ${alpha((theme.palette as any)[bgColor || 'primary'].main, 0.12)}`,
          borderColor: (theme) => (theme.palette as any)[bgColor || 'primary'].main,
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 1.1 }}
        >
          {title}
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 800 }}>
          {count}
        </Typography>
      </Box>

      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (theme) => alpha((theme.palette as any)[bgColor || 'primary'].main, 0.08),
          color: (theme) => (theme.palette as any)[bgColor || 'primary'].main,
        }}
      >
        <Iconify icon={icon} width={28} />
      </Box>
    </Card>
  </Box>
);

const EmployeeProfileOverview = () => {
  // Define the initial state for the cards
  const [cards, setCards] = useState<ICardItem[]>([
    {
      id: 'class-handle',
      icon: 'icon-park-outline:classroom', // adjust this icon as per your library
      title: 'Class Handle',
      count: fNumber(8),
      color: 'success.main',
      bgColor: 'success',
      href: '', // add if you want it clickable
      labels: [],
      width: 4,
    },
    {
      id: 'attendance-rate',
      icon: 'iconoir:stats-report', // or 'fluent:person-info-20-regular'
      title: 'Attendance Rate',
      count: '94%',
      color: 'info.main',
      bgColor: 'info',
      href: '',
      labels: [],
      width: 4,
    },
    {
      id: 'leave-taken',
      icon: 'solar:clock-bold', // match the clock icon shown in your screenshot
      title: 'Leave Taken',
      count: fNumber(3),
      color: 'warning.main',
      bgColor: 'warning',
      href: '',
      labels: [],
      width: 4,
    },
  ]);

  const dashBoardSections = cards.reduce((acc: { [key: string]: JSX.Element }, card, index) => {
    acc[card.id] = (
      <ModernStatCard
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

export default EmployeeProfileOverview;
