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
  width = 4,
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
      id: 'ACD_CARD_ACADEMIC_HEALTH',
      icon: 'healthicons:health-worker-outline',
      title: 'Academic Progress %',
      count: '85%',
      color: 'success.main',
      bgColor: 'success',
      href: '#',
      width: 4,
    },
    {
      id: 'ACD_CARD_CHAPTER_PROGRESS',
      icon: 'carbon:chart-line-smooth',
      title: 'Chapter Coverage %',
      count: '65%',
      color: 'info.main',
      bgColor: 'info',
      href: '#',
      width: 4,
    },
    {
      id: 'ACD_CARD_OVERALL_SUBMISSION',
      icon: 'material-symbols:check-circle-outline',
      title: 'Overall Submission %',
      count: '90%', // Example avg(92%, 88%)
      color: 'info.main',
      bgColor: 'info',
      href: '#',
      labels: [
        { name: 'Homework : 92%', color: 'warning' },
        { name: 'Assignment : 88%', color: 'secondary' },
      ],
      width: 4,
    },
    {
      id: 'ACD_CARD_QUIZ_COMPLETED',
      icon: 'mdi:checkbox-marked-circle-outline',
      title: 'Quiz Completed',
      count: '120', // example
      color: 'success.main',
      bgColor: 'success',
      href: '#',
      labels: [{ name: 'Completed : 120', color: 'success' }],
      width: 4,
    },
    {
      id: 'total_subjects',
      icon: 'fluent:book-24-regular',
      title: 'Total Subjects',
      count: '8',
      color: 'error.main',
      bgColor: 'error',
      href: '#',
      labels: [
        { name: 'Core : 6', color: 'primary' },
        { name: 'Elective : 2', color: 'secondary' },
      ],
      width: 4,
    },
    {
      id: 'ACD_CARD_TOTAL_EXAMS',
      icon: 'ph:exam',
      title: 'Total Exams',
      count: '10',
      color: 'primary.main',
      bgColor: 'primary',
      href: '#',
      labels: [
        { name: 'Completed : 5', color: 'success' },
        { name: 'Ongoing : 2', color: 'info' },
        { name: 'Upcoming : 3', color: 'warning' },
      ],
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

export default SummaryCards;
