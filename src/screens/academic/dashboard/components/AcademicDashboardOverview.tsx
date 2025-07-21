import type {
  ICardItem,
  IStudentEnrollmentCardProps,
} from 'src/screens/student/enrollment/entrollment-interface';

import Link from 'next/link';
import { useState } from 'react';

import { Box, Card, Typography } from '@mui/material';

import { fNumber } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
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

const AcademicDashboardOverview = () => {
  // Define the initial state for the cards
  const [cards, setCards] = useState<ICardItem[]>([
    {
      id: '0',
      icon: 'hugeicons:book-edit',
      title: 'Total Subjects',
      count: fNumber(20),
      color: 'success.main',
      bgColor: 'success',
      href: '/subjects',
      labels: [
        { name: 'Core - 10', color: 'success' },
        { name: 'Elective - 10', color: 'error' },
      ],
      width: 4,
    },
    {
      id: '1',
      icon: 'healthicons:i-exam-qualification-outline',
      title: 'Total Exams',
      count: fNumber(20),
      color: 'info.main',
      bgColor: 'info',
      href: '/exams',
      labels: [
        { name: 'Completed - 10', color: 'success' },
        { name: 'Upcoming - 10', color: 'warning' },
      ],
      width: 4,
    },
    {
      id: '2',
      icon: 'fluent-emoji-high-contrast:page-with-curl',
      title: 'Total Assignment',
      count: fNumber(20),
      color: 'secondary.main',
      bgColor: 'secondary',
      href: '/assignments',
      labels: [
        { name: 'Completed - 10', color: 'success' },
        { name: 'Upcoming - 10', color: 'warning' },
      ],
      width: 4,
    },
    {
      id: '3',
      icon: 'streamline-freehand:book-flip-page',
      title: 'Total Homework',
      count: fNumber(20),
      color: 'info.main',
      bgColor: 'info',
      href: '/homework',
      labels: [
        { name: 'Completed - 10', color: 'success' },
        { name: 'Pending - 10', color: 'warning' },
      ],
      width: 4,
    },
    {
      id: '4',
      icon: 'hugeicons:quiz-05',
      title: 'Total Quiz',
      count: fNumber(20),
      color: 'success.main',
      bgColor: 'success',
      href: '/quiz',
      labels: [
        { name: 'Completed - 10', color: 'success' },
        { name: 'Scheduled - 10', color: 'warning' },
      ],
      width: 4,
    },
    {
      id: '5',
      icon: 'ion:document',
      title: 'Total Learning Resources',
      count: fNumber(10000),
      color: 'warning.main',
      bgColor: 'warning',
      href: '/resources',
      labels: [],
      width: 4,
    },
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

export default AcademicDashboardOverview;
