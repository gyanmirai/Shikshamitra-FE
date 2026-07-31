'use client';

import React from 'react';
import dayjs from 'dayjs';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Stack, Typography } from '@mui/material';

import { todayIso, weekStartIso } from '../lessonPlanData';

import type { LessonPlanRow, TeacherDiaryRow } from '../lessonPlanData';

type KpiCardConfig = {
  key: string;
  label: string;
  value: number | string;
  microCopy: string;
  icon: string;
  color: 'primary' | 'info' | 'warning' | 'secondary' | 'error' | 'success';
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

  const cards: KpiCardConfig[] = [
    {
      key: 'lessons_planned',
      label: 'Lessons Planned',
      value: thisWeekPlans.length,
      microCopy: `${approvedThisWeek} approved, ${pendingThisWeek} pending`,
      icon: 'solar:book-bookmark-bold-duotone',
      color: 'primary',
    },
    {
      key: 'diaries_submitted',
      label: 'Diaries Submitted',
      value: submittedToday,
      microCopy: lastSubmitted
        ? `Last: ${dayjs(lastSubmitted).format('hh:mm A')}`
        : 'None today',
      icon: 'solar:notebook-bookmark-bold-duotone',
      color: 'info',
    },
    {
      key: 'pending_diaries',
      label: 'Pending Diaries',
      value: pendingDiaries,
      microCopy: 'Due before 6 PM',
      icon: 'solar:clock-circle-bold-duotone',
      color: 'warning',
    },
    {
      key: 'pending_approvals',
      label: 'Pending Approvals',
      value: pendingApprovals,
      microCopy:
        oldestPending > 0 ? `Oldest: ${oldestPending} day(s)` : 'All reviewed',
      icon: 'solar:shield-warning-bold-duotone',
      color: 'secondary',
    },
    {
      key: 'missed_lessons',
      label: 'Missed Lessons',
      value: missedLessons,
      microCopy: missedLessons > 0 ? 'Needs reschedule' : 'No missed lessons',
      icon: 'solar:calendar-minimalistic-bold-duotone',
      color: 'error',
    },
    {
      key: 'syllabus_delay',
      label: 'Syllabus Delay',
      value: syllabusDelayed,
      microCopy: syllabusDelayed > 0 ? `Delay: ${highestDelaySubject}` : 'All on track',
      icon: 'solar:graph-down-bold-duotone',
      color: 'error',
    },
  ];

  return (
    <Stack spacing={1} sx={{ mb: 2 }}>
      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: {
            xs: '1fr 1fr',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(6, 1fr)',
          },
        }}
      >
        {cards.map((card) => (
          <Card
            key={card.key}
            onClick={() => onCardClick(card.key)}
            sx={{
              p: 1.75,
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.background.paper, 0.8)
                  : 'background.paper',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 2px 8px rgba(0,0,0,0.3)'
                  : '0 2px 8px rgba(145, 158, 171, 0.08)',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 104,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '0 6px 16px rgba(0,0,0,0.5)'
                    : '0 6px 16px rgba(145, 158, 171, 0.16)',
                borderColor: `${card.color}.main`,
              },
            }}
          >
            {/* Header: Label & Icon */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.72rem',
                    lineHeight: 1.2,
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {card.label}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    lineHeight: 1.2,
                    mt: 0.5,
                    color: 'text.primary',
                    fontSize: '1.4rem',
                  }}
                >
                  {card.value}
                </Typography>
              </Box>

              {/* Icon Container */}
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1.25,
                  bgcolor: (theme) => alpha(theme.palette[card.color].main, 0.12),
                  color: `${card.color}.main`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Iconify icon={card.icon} width={22} height={22} />
              </Box>
            </Box>

            {/* Subtitle Microcopy */}
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 1 }}>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: `${card.color}.main`,
                  flexShrink: 0,
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {card.microCopy}
              </Typography>
            </Stack>
          </Card>
        ))}
      </Box>
    </Stack>
  );
};

export default TeachingKpiCards;
