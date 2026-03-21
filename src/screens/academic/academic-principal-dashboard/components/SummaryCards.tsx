import Link from 'next/link';
import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
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

const SummaryCards = () => {
  const [cards, setCards] = useState<ICardItem[]>([
    {
      id: 'CARD_ACADEMIC_HEALTH',
      icon: 'healthicons:health-worker-outline',
      title: 'Academic Health Score',
      count: '85%',
      color: 'success.main',
      bgColor: 'success',
      width: 3,
    },
    {
      id: 'CARD_OVERALL_PASS_PERCENT',
      icon: 'mdi:percent-circle-outline',
      title: 'Overall Pass %',
      count: '92%',
      color: 'info.main',
      bgColor: 'info',
      width: 3,
    },
    {
      id: 'CARD_ATTENDANCE_HEALTH',
      icon: 'mdi:calendar-check',
      title: 'Attendance Health',
      count: '88%',
      color: 'warning.main',
      bgColor: 'warning',
      width: 3,
    },
    {
      id: 'CARD_TEACHER_EFFECTIVENESS',
      icon: 'mdi:teach',
      title: 'Teacher Effectiveness',
      count: '4.2/5',
      color: 'primary.main',
      bgColor: 'primary',
      width: 3,
    },
    {
      id: 'CARD_SYLLABUS_COMPLETION',
      icon: 'mdi:book-open-page-variant',
      title: 'Syllabus Completion',
      count: '75%',
      color: 'info.main',
      bgColor: 'info',
      width: 3,
    },
    {
      id: 'CARD_STUDENTS_AT_RISK',
      icon: 'mdi:alert-circle-outline',
      title: 'Students at Risk',
      count: '45',
      color: 'error.main',
      bgColor: 'error',
      width: 3,
    },
    {
      id: 'CARD_WEAK_SUBJECTS',
      icon: 'mdi:book-alert-outline',
      title: 'Weak Subjects',
      count: '3',
      color: 'warning.main',
      bgColor: 'warning',
      width: 3,
    },
    {
      id: 'CARD_BEST_CLASS',
      icon: 'mdi:star-circle-outline',
      title: 'Best Class',
      count: 'Class 10-A',
      color: 'success.main',
      bgColor: 'success',
      width: 3,
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

export default SummaryCards;
