'use client';

import React from 'react';
import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Stack, Typography, CardContent, CardActionArea } from '@mui/material';

import { todayIso, weekStartIso } from '../lessonPlanData';

import type { LessonPlanRow, TeacherDiaryRow, TeachingHealthScore } from '../lessonPlanData';

type KpiCard = {
  key: string;
  label: string;
  value: number | string;
  microCopy: string;
  icon: string;
  color: string;
  bgColor: string;
  onClick?: () => void;
  badge?: { label: string; color: 'error' | 'warning' | 'success' | 'default' };
};

type Props = {
  lessonPlans: LessonPlanRow[];
  diaryEntries: TeacherDiaryRow[];
  healthScore: TeachingHealthScore;
  onCardClick: (key: string) => void;
};

const TeachingKpiCards = ({ lessonPlans, diaryEntries, healthScore, onCardClick }: Props) => {
  const weekStart = dayjs(weekStartIso).format('YYYY-MM-DD');
  const weekEnd = dayjs(weekStartIso).add(6, 'day').format('YYYY-MM-DD');

  const thisWeekPlans = lessonPlans.filter(
    (p) => p.plannedDate >= weekStart && p.plannedDate <= weekEnd
  );
  const approvedThisWeek = thisWeekPlans.filter((p) => p.planStatus === 'Approved').length;
  const pendingThisWeek = thisWeekPlans.filter((p) => p.planStatus === 'Submitted').length;

  const submittedToday = diaryEntries.filter(
    (e) => e.actualDate === todayIso && ['Submitted', 'Approved'].includes(e.diaryStatus)
  ).length;
  const lastSubmitted = diaryEntries.find((e) => e.submittedAt)?.submittedAt;

  const pendingDiaries = lessonPlans.filter((p) => p.diaryStatus === 'NotSubmitted').length;
  const pendingApprovals = lessonPlans.filter(
    (p) => p.planStatus === 'Submitted' || p.diaryStatus === 'Submitted'
  ).length;

  const oldestPending = (() => {
    const submitted = lessonPlans
      .filter((p) => p.planStatus === 'Submitted' || p.diaryStatus === 'Submitted')
      .map((p) => dayjs(p.plannedDate).diff(dayjs(), 'day'));
    return submitted.length ? Math.abs(Math.min(...submitted)) : 0;
  })();

  const missedLessons = diaryEntries.filter((e) => !e.classConducted).length;

  const syllabusDelayed = lessonPlans.filter(
    (p) => p.plannedCompletionPercentage - p.actualCompletionPercentage > 10
  ).length;
  const highestDelaySubject =
    lessonPlans.reduce(
      (acc, p) => {
        const gap = p.plannedCompletionPercentage - p.actualCompletionPercentage;
        return gap > acc.gap ? { subject: p.subjectName, gap } : acc;
      },
      { subject: '', gap: 0 }
    ).subject || '-';

  const cards: KpiCard[] = [
    {
      key: 'lessons_planned',
      label: 'Lessons Planned',
      value: thisWeekPlans.length,
      microCopy: `${approvedThisWeek} approved, ${pendingThisWeek} pending`,
      icon: 'mdi:calendar-week-outline',
      color: 'primary.main',
      bgColor: 'primary.lighter',
    },
    {
      key: 'diaries_submitted',
      label: 'Diaries Submitted',
      value: submittedToday,
      microCopy: lastSubmitted
        ? `Last submitted ${dayjs(lastSubmitted).format('hh:mm A')}`
        : 'None submitted today',
      icon: 'mdi:notebook-check-outline',
      color: 'success.main',
      bgColor: 'success.lighter',
    },
    {
      key: 'pending_diaries',
      label: 'Pending Diaries',
      value: pendingDiaries,
      microCopy: 'Requires submission before 6 PM',
      icon: 'mdi:book-clock-outline',
      color: 'warning.main',
      bgColor: 'warning.lighter',
      badge: pendingDiaries > 0 ? { label: 'Action Needed', color: 'warning' } : undefined,
    },
    {
      key: 'pending_approvals',
      label: 'Pending Approvals',
      value: pendingApprovals,
      microCopy:
        oldestPending > 0 ? `Oldest pending: ${oldestPending} day(s)` : 'No pending approvals',
      icon: 'mdi:account-clock-outline',
      color: 'info.main',
      bgColor: 'info.lighter',
      badge:
        pendingApprovals > 0 ? { label: `${pendingApprovals} Pending`, color: 'error' } : undefined,
    },
    {
      key: 'missed_lessons',
      label: 'Missed Lessons',
      value: missedLessons,
      microCopy: missedLessons > 0 ? 'Needs reschedule' : 'No missed lessons',
      icon: 'mdi:calendar-remove-outline',
      color: 'error.main',
      bgColor: 'error.lighter',
      badge: missedLessons > 0 ? { label: 'Needs Reschedule', color: 'error' } : undefined,
    },
    {
      key: 'syllabus_delay',
      label: 'Syllabus Delay',
      value: syllabusDelayed,
      microCopy: syllabusDelayed > 0 ? `Highest delay: ${highestDelaySubject}` : 'All on track',
      icon: 'mdi:chart-timeline-variant-shimmer',
      color: 'secondary.main',
      bgColor: 'secondary.lighter',
      badge:
        syllabusDelayed > 0 ? { label: `${syllabusDelayed} Delayed`, color: 'warning' } : undefined,
    },
  ];

  const healthColor =
    healthScore.overall >= 80 ? 'success' : healthScore.overall >= 60 ? 'warning' : 'error';

  return (
    <Stack spacing={2}>
      {/* Main KPI Row */}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            xl: 'repeat(6, 1fr)',
          },
        }}
      >
        {cards.map((card) => (
          <Card
            key={card.key}
            sx={{ borderRadius: 2, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 4 } }}
          >
            <CardActionArea onClick={() => onCardClick(card.key)}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1.5,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: card.bgColor,
                      color: card.color,
                      flexShrink: 0,
                    }}
                  >
                    <Iconify icon={card.icon} width={22} />
                  </Box>
                  {card.badge && (
                    <Label color={card.badge.color} variant="soft">
                      {card.badge.label}
                    </Label>
                  )}
                </Stack>
                <Typography variant="h4" sx={{ mt: 1.5, mb: 0.25 }}>
                  {card.value}
                </Typography>
                <Typography variant="subtitle2" color="text.primary">
                  {card.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {card.microCopy}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Stack>
  );
};

export default TeachingKpiCards;
