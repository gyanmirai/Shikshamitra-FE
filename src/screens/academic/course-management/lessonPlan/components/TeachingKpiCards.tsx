'use client';

import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { Box } from '@mui/material';
import { TimetableSettingsSummaryCards } from 'src/components/timetable-settings-summary-cards/TimetableSettingsSummaryCards';
import type { ITimetableSummaryCard } from 'src/components/timetable-settings-summary-cards/TimetableSettingsSummaryCards';

import { todayIso, weekStartIso } from '../lessonPlanData';
import type { LessonPlanRow, TeacherDiaryRow } from '../lessonPlanData';

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

  const submittedToday = diaryEntries.filter(
    (e) => e.actualDate === todayIso && e.diaryStatus === 'Submitted'
  ).length;

  const pendingDiaries = lessonPlans.filter((p) => p.diaryStatus === 'NotSubmitted').length;
  const pendingApprovals = lessonPlans.filter((p) => p.planStatus === 'Submitted').length;

  const missedLessons = diaryEntries.filter((e) => !e.classConducted).length;

  const syllabusDelayed = lessonPlans.filter(
    (p) => p.plannedCompletionPercentage - p.actualCompletionPercentage > 10
  ).length;

  const summaryCards: ITimetableSummaryCard[] = useMemo(
    () => [
      {
        label: 'Lessons Planned',
        value: thisWeekPlans.length,
        icon: 'solar:book-bookmark-bold-duotone',
        color: 'primary',
        onClick: () => onCardClick('lessons_planned'),
      },
      {
        label: 'Diaries Submitted',
        value: submittedToday,
        icon: 'solar:notebook-bookmark-bold-duotone',
        color: 'info',
        onClick: () => onCardClick('diaries_submitted'),
      },
      {
        label: 'Pending Diaries',
        value: pendingDiaries,
        icon: 'solar:clock-circle-bold-duotone',
        color: 'warning',
        onClick: () => onCardClick('pending_diaries'),
      },
      {
        label: 'Pending Approvals',
        value: pendingApprovals,
        icon: 'solar:shield-warning-bold-duotone',
        color: 'info',
        onClick: () => onCardClick('pending_approvals'),
      },
      {
        label: 'Missed Lessons',
        value: missedLessons,
        icon: 'solar:calendar-minimalistic-bold-duotone',
        color: 'error',
        onClick: () => onCardClick('missed_lessons'),
      },
      {
        label: 'Syllabus Delay',
        value: syllabusDelayed,
        icon: 'solar:graph-down-bold-duotone',
        color: 'error',
        onClick: () => onCardClick('syllabus_delay'),
      },
    ],
    [
      thisWeekPlans.length,
      submittedToday,
      pendingDiaries,
      pendingApprovals,
      missedLessons,
      syllabusDelayed,
      onCardClick,
    ]
  );

  return (
    <Box sx={{ mb: 2 }}>
      <TimetableSettingsSummaryCards cards={summaryCards} />
    </Box>
  );
};

export default React.memo(TeachingKpiCards);
