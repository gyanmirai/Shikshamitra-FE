import type { JSX } from 'react';

import Link from 'next/link';
import { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';
import { Box, Card, Typography } from '@mui/material';
import CustomizableView from 'src/components/customizable-view';

import type { ICardItem, IStudentEnrollmentCardProps } from '../entrollment-interface';
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
  <Box
    component={Link}
    href={href}
    sx={{ textDecoration: 'none', height: '100%', display: 'block' }}
  >
    <Card
      sx={{
        p: 3,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '100%',
        borderRadius: 2,
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: (theme) => theme.customShadows?.z8 || 4,
          borderColor: 'transparent',
          transform: 'translateY(-4px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5, fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: -1 }}>
          {count}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
          {labels.map((label, idx) => (
            <Label key={idx} color={label.color} variant="soft">
              {label.name}
            </Label>
          ))}
        </Box>
      </Box>
      <Box
        sx={{
          width: 64,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 64, // Prevent shrinking
          borderRadius: '50%',
          bgcolor: (theme) => (color ? `${color.split('.')[0]}.lighter` : 'action.selected'), // approximation if palette logic exists
          color: color || 'text.primary',
        }}
      >
        <Iconify
          icon={icon}
          sx={{
            width: 32,
            height: 32,
          }}
        />
      </Box>
    </Card>
  </Box>
);

const Overview = () => {
  // Define the initial state for the cards
  const [cards, setCards] = useState<ICardItem[]>([
    {
      id: '0',
      icon: 'wpf:inspection',
      title: 'Total Inquiries',
      count: fNumber(1120),
      color: 'primary.main',
      bgColor: 'primary',
      href: '/student/enrollment/inquiry',
      labels: [
        { name: `Male ${fNumber(500)}`, color: 'success' },
        { name: `Female ${fNumber(200)}`, color: 'warning' },
      ],
      width: 4,
    },
    {
      id: '1',
      icon: 'medical-icon:i-registration',
      title: 'Total Registration',
      count: fNumber(78),
      color: 'info.main',
      bgColor: 'info',
      href: '/student/enrollment/registration',
      labels: [
        { name: `Male ${fNumber(500)}`, color: 'success' },
        { name: `Female ${fNumber(200)}`, color: 'warning' },
      ],
      width: 4,
    },
    {
      id: '2',
      icon: 'fluent-mdl2:open-enrollment',
      title: 'Total Admission',
      count: fNumber(45),
      color: 'secondary.main',
      bgColor: 'secondary',
      href: '/student/enrollment/admission',
      labels: [
        { name: `Male ${fNumber(500)}`, color: 'success' },
        { name: `Female ${fNumber(200)}`, color: 'warning' },
      ],
      width: 4,
    },
    // {
    //   id: '3',
    //   icon: 'healthicons:i-exam-multiple-choice',
    //   title: 'Entrance Exam Status',
    //   count: fNumber(10),
    //   color: 'info.main',
    //   bgColor: 'info',
    //   href: '/student/enrollment/entrance-exam',
    //   labels: [
    //     { name: `Ongoing ${fNumber(2)}`, color: 'success' },
    //     { name: `Upcoming ${fNumber(5)}`, color: 'info' },
    //   ],
    //   width: 4,
    // },
    // {
    //   id: '4',
    //   icon: 'bi:pass-fill',
    //   title: 'Pass-Fail Ratio',
    //   count: fNumber(17),
    //   color: 'error.main',
    //   bgColor: 'error',
    //   href: '/student/enrollment/entrance-exam/?view=table',
    //   labels: [
    //     { name: `Passed ${fNumber(15)}`, color: 'success' },
    //     { name: `Failed ${fNumber(2)}`, color: 'error' },
    //   ],
    //   width: 4,
    // },
    // {
    //   id: '5',
    //   icon: 'mingcute:performance-fill',
    //   title: 'Top 3 Performers',
    //   count: '89 %',
    //   color: 'success.main',
    //   bgColor: 'success',
    //   href: '/student/enrollment/entrance-exam',
    //   labels: [
    //     { name: 'Herbert Clark', color: 'success' },
    //     { name: 'John Doe', color: 'error' },
    //     { name: 'John Loe', color: 'warning' },
    //   ],
    //   width: 4,
    // },
  ]);
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

export default Overview;
