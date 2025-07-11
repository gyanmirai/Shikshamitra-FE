import Link from 'next/link';
import { useState } from 'react';

import { Box, Card, Typography } from '@mui/material';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
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

const Overview = () => {
  // Define the initial state for the cards
  const [cards, setCards] = useState<ICardItem[]>([
    {
      id: '0',
      icon: 'wpf:inspection',
      title: 'Total Inquiries',
      count: 120,
      color: 'primary.main',
      bgColor: 'primary',
      href: '/student/enrollment/inquiry',
      labels: [
        { name: 'Male 500', color: 'success' },
        { name: 'Female 200', color: 'warning' },
      ],
      width: 4,
    },
    {
      id: '1',
      icon: 'medical-icon:i-registration',
      title: 'Total Registration',
      count: 78,
      color: 'info.main',
      bgColor: 'info',
      href: '/student/enrollment/registration',
      labels: [
        { name: 'Male 500', color: 'success' },
        { name: 'Female 200', color: 'warning' },
      ],
      width: 4,
    },
    {
      id: '2',
      icon: 'fluent-mdl2:open-enrollment',
      title: 'Total Admission',
      count: 45,
      color: 'secondary.main',
      bgColor: 'secondary',
      href: '/student/enrollment/admission',
      labels: [
        { name: 'Male 500', color: 'success' },
        { name: 'Female 200', color: 'warning' },
      ],
      width: 4,
    },
    // {
    //   id: '3',
    //   icon: 'healthicons:i-exam-multiple-choice',
    //   title: 'Entrance Exam Status',
    //   count: 10,
    //   color: 'info.main',
    //   bgColor: 'info',
    //   href: '/student/enrollment/entrance-exam',
    //   labels: [
    //     { name: 'Ongoing 2', color: 'success' },
    //     { name: 'Upcoming 5', color: 'info' },
    //   ],
    //   width: 4,
    // },
    // {
    //   id: '4',
    //   icon: 'bi:pass-fill',
    //   title: 'Pass-Fail Ratio',
    //   count: 17,
    //   color: 'error.main',
    //   bgColor: 'error',
    //   href: '/student/enrollment/entrance-exam/?view=table',
    //   labels: [
    //     { name: 'Passed 15', color: 'success' },
    //     { name: 'Failed 2', color: 'error' },
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
