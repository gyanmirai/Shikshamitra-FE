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
      id: 'overall_chapter_completion',
      icon: 'solar:checklist-minimalistic-broken',
      title: 'Overall Chapter Completion',
      count: '75%',
      color: 'success.main',
      bgColor: 'success',
      href: '#',
      labels: [
        { name: 'Completed : 75%', color: 'success' },
        { name: 'Pending : 25%', color: 'warning' },
      ],
      width: 4,
    },
    {
      id: 'overall_exam_performance',
      icon: 'solar:medal-star-bold-duotone',
      title: 'Overall Exam Performance %',
      count: '88%',
      color: 'info.main',
      bgColor: 'info',
      labels: [
        { name: 'Pass : 88%', color: 'success' },
        { name: 'Fail : 12%', color: 'error' },
      ],
      href: '#',
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
