'use client';

import React from 'react';
import dayjs from 'dayjs';
import { Box, Card, Stack, Typography } from '@mui/material';

import { todayIso, weekStartIso } from '../lessonPlanData';

import type { LessonPlanRow, TeacherDiaryRow } from '../lessonPlanData';

type KpiCard = {
  key: string;
  label: string;
  value: number | string;
  microCopy: string;
  onClick?: () => void;
};

type Props = {
  lessonPlans: LessonPlanRow[];
  diaryEntries: TeacherDiaryRow[];
  onCardClick: (key: string) => void;
};

const TeachingKpiCards = ({ lessonPlans, diaryEntries, onCardClick }: Props) => {
  const weekStart = dayjs(weekStartIso).format('YYYY-MM-DD');
  const weekEnd = dayjs(weekStartIso).add(6, 'day').format('YYYY-MM-DD');

  const thisWeekPlans = lessonPlans.filter(
    (p) => p.plannedDate >= weekStart && p.plannedDate <= weekEnd
  );
  const approvedThisWeek = thisWeekPlans.filter((p) => p.planStatus === 'Approved').length;
  const pendingThisWeek = thisWeekPlans.filter((p) => p.planStatus === 'Submitted').length;

  const submittedToday = diaryEntries.filter(
    (e) => e.actualDate === todayIso && e.diaryStatus === 'Submitted'
  ).length;
  const lastSubmitted = diaryEntries.find((e) => e.submittedAt)?.submittedAt;

  const pendingDiaries = lessonPlans.filter((p) => p.diaryStatus === 'NotSubmitted').length;
  const pendingApprovals = lessonPlans.filter((p) => p.planStatus === 'Submitted').length;

  const oldestPending = (() => {
    const submitted = lessonPlans
      .filter((p) => p.planStatus === 'Submitted')
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
    },
    {
      key: 'diaries_submitted',
      label: 'Diaries Submitted',
      value: submittedToday,
      microCopy: lastSubmitted
        ? `Last submitted ${dayjs(lastSubmitted).format('hh:mm A')}`
        : 'None submitted today',
    },
    {
      key: 'pending_diaries',
      label: 'Pending Diaries',
      value: pendingDiaries,
      microCopy: 'Requires submission before 6 PM',
    },
    {
      key: 'pending_approvals',
      label: 'Pending Approvals',
      value: pendingApprovals,
      microCopy:
        oldestPending > 0 ? `Oldest pending: ${oldestPending} day(s)` : 'No pending approvals',
    },
    {
      key: 'missed_lessons',
      label: 'Missed Lessons',
      value: missedLessons,
      microCopy: missedLessons > 0 ? 'Needs reschedule' : 'No missed lessons',
    },
    {
      key: 'syllabus_delay',
      label: 'Syllabus Delay',
      value: syllabusDelayed,
      microCopy: syllabusDelayed > 0 ? `Highest delay: ${highestDelaySubject}` : 'All on track',
    },
  ];

  return (
    <Stack spacing={1} sx={{ mb: 1 }}>
      <Box
        sx={{
          display: 'grid',
          gap: 1,
          gridTemplateColumns: {
            xs: '1fr 1fr',
            md: 'repeat(6, 1fr)',
          },
        }}
      >
        {cards.map((card) => (
          <Card
            key={card.key}
            onClick={() => onCardClick(card.key)}
            sx={{
              p: 1.5,
              borderRadius: 1,
              cursor: 'pointer',
              minHeight: 92,
              transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
              '&:hover': { boxShadow: 4 },
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {card.label}
            </Typography>
            <Typography variant="h5">{card.value}</Typography>
            <Typography variant="caption" color="text.secondary">
              {card.microCopy}
            </Typography>
          </Card>
        ))}
      </Box>
    </Stack>
  );
};

export default TeachingKpiCards;
