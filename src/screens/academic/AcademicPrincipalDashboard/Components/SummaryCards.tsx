import React from 'react';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { Box, Card, Grid, Typography } from '@mui/material';

// ----------------------------------------------------------------------

const metricColor = {
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  primary: '#2563EB',
  secondary: '#8B5CF6',
};

interface ICardItem {
  icon: string;
  title: string;
  value: string;
  status: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  helper?: string;
  path?: string;
}

interface IDashboardCardItem extends ICardItem {
  id: string;
  width?: number;
}

const SummaryCard = ({ title, value, icon, status = 'info', path, helper }: ICardItem) => (
  <Card
    component={path ? RouterLink : 'div'}
    href={path || undefined}
    sx={{
      p: 0,
      minHeight: 92,
      textDecoration: 'none',
      color: 'text.primary',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      border: (theme) => `1px solid ${theme.palette.divider}`,
      boxShadow: 'none',
      transition: (theme) =>
        theme.transitions.create(['border-color', 'box-shadow', 'transform'], {
          duration: theme.transitions.duration.shorter,
        }),
      '&:hover': path
        ? {
            transform: 'translateY(-2px)',
            borderColor: metricColor[status],
            boxShadow: (theme) => theme.shadows[4],
          }
        : undefined,
    }}
  >
    <Box sx={{ width: 4, alignSelf: 'stretch', bgcolor: metricColor[status], flexShrink: 0 }} />
    <Box
      sx={{
        p: 1.5,
        gap: 1.25,
        flex: 1,
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 700, lineHeight: 1.2, display: 'block' }}
          noWrap
        >
          {title}
        </Typography>
        <Typography variant="h4" sx={{ mt: 0.25, mb: 0.25, lineHeight: 1.05 }}>
          {value}
        </Typography>
        {helper ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
            {helper}
          </Typography>
        ) : null}
      </Box>

      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1,
          display: 'grid',
          placeItems: 'center',
          color: metricColor[status],
          bgcolor: `${metricColor[status]}14`,
          flexShrink: 0,
        }}
      >
        <Iconify icon={icon} width={22} />
      </Box>
    </Box>
  </Card>
);

const SummaryCards = () => {
  const cards: IDashboardCardItem[] = [
    {
      id: 'CARD_ACADEMIC_HEALTH',
      icon: 'healthicons:health-worker-outline',
      title: 'Academic Health Score',
      value: '85%',
      status: 'success',
      helper: 'Strong outcomes overall',
      width: 3,
    },
    {
      id: 'CARD_OVERALL_PASS_PERCENT',
      icon: 'mdi:percent-circle-outline',
      title: 'Overall Pass %',
      value: '92%',
      status: 'info',
      helper: 'Improved this term',
      width: 3,
    },
    {
      id: 'CARD_ATTENDANCE_HEALTH',
      icon: 'mdi:calendar-check',
      title: 'Attendance Health',
      value: '88%',
      status: 'warning',
      helper: 'Needs close monitoring',
      width: 3,
    },
    {
      id: 'CARD_TEACHER_EFFECTIVENESS',
      icon: 'mdi:teach',
      title: 'Teacher Effectiveness',
      value: '4.2/5',
      status: 'primary',
      helper: '48 teachers rated',
      width: 3,
    },
    {
      id: 'CARD_SYLLABUS_COMPLETION',
      icon: 'mdi:book-open-page-variant',
      title: 'Syllabus Completion',
      value: '75%',
      status: 'info',
      helper: '25% remaining',
      width: 3,
    },
    {
      id: 'CARD_STUDENTS_AT_RISK',
      icon: 'mdi:alert-circle-outline',
      title: 'Students at Risk',
      value: '45',
      status: 'error',
      helper: 'Across senior classes',
      width: 3,
    },
    {
      id: 'CARD_WEAK_SUBJECTS',
      icon: 'mdi:book-alert-outline',
      title: 'Weak Subjects',
      value: '3',
      status: 'warning',
      helper: 'Math, Science, English',
      width: 3,
    },
    {
      id: 'CARD_BEST_CLASS',
      icon: 'mdi:star-circle-outline',
      title: 'Best Class',
      value: 'Class 10-A',
      status: 'success',
      helper: 'Highest avg performance',
      width: 3,
    },
  ];

  return (
    <Grid container spacing={1}>
      {cards.map((card) => (
        <Grid key={card.id} size={{ xs: 12, md: card.width ?? 3 }}>
          <SummaryCard {...card} />
        </Grid>
      ))}
    </Grid>
  );
};

export default SummaryCards;
