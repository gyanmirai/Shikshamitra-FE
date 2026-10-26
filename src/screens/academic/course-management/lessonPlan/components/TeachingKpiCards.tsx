'use client';

import type { AcademicInsightMetric } from 'src/screens/academic/components/academic-insights';

import dayjs from 'dayjs';
import { AcademicInsights } from 'src/screens/academic/components/academic-insights';

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
  const lessonsPlanned = lessonPlans.filter(
    (plan) => plan.plannedDate >= weekStart && plan.plannedDate <= weekEnd
  ).length;
  const diariesSubmitted = diaryEntries.filter(
    (entry) => entry.actualDate === todayIso && entry.diaryStatus === 'Submitted'
  ).length;
  const pendingDiaries = lessonPlans.filter((plan) => plan.diaryStatus === 'NotSubmitted').length;
  const pendingApprovals = lessonPlans.filter((plan) => plan.planStatus === 'Submitted').length;
  const missedLessons = diaryEntries.filter((entry) => !entry.classConducted).length;
  const syllabusDelayed = lessonPlans.filter(
    (plan) => plan.plannedCompletionPercentage - plan.actualCompletionPercentage > 10
  ).length;

  const metrics: AcademicInsightMetric[] = [
    {
      id: 'lessons_planned',
      label: 'Lessons planned',
      value: lessonsPlanned,
      helper: 'Scheduled this week',
      icon: 'solar:book-bookmark-outline',
      onClick: () => onCardClick('lessons_planned'),
    },
    {
      id: 'diaries_submitted',
      label: 'Diaries submitted',
      value: diariesSubmitted,
      helper: 'Submitted today',
      icon: 'solar:notebook-bookmark-outline',
      onClick: () => onCardClick('diaries_submitted'),
    },
    {
      id: 'pending_diaries',
      label: 'Pending diaries',
      value: pendingDiaries,
      helper: 'Teaching records still due',
      icon: 'solar:clock-circle-outline',
      onClick: () => onCardClick('pending_diaries'),
    },
    {
      id: 'pending_approvals',
      label: 'Pending approvals',
      value: pendingApprovals,
      helper: 'Waiting for review',
      icon: 'solar:shield-warning-outline',
      onClick: () => onCardClick('pending_approvals'),
    },
    {
      id: 'missed_lessons',
      label: 'Missed lessons',
      value: missedLessons,
      helper: 'Class not conducted',
      icon: 'solar:calendar-minimalistic-outline',
      onClick: () => onCardClick('missed_lessons'),
    },
    {
      id: 'syllabus_delay',
      label: 'Syllabus delay',
      value: syllabusDelayed,
      helper: 'More than 10% behind plan',
      icon: 'solar:graph-down-outline',
      onClick: () => onCardClick('syllabus_delay'),
    },
  ];

  const followUpCount = pendingDiaries + pendingApprovals + missedLessons + syllabusDelayed;

  return (
    <AcademicInsights
      title="Teaching Insights"
      description="Weekly planning, diary completion and delivery exceptions in one focused view."
      metrics={metrics}
      chart={{
        title: 'Teaching Workflow',
        description: 'Compare current planning activity with items that need follow-up.',
        categories: ['Planned', 'Submitted', 'Diaries due', 'Approvals', 'Missed', 'Delayed'],
        values: [
          lessonsPlanned,
          diariesSubmitted,
          pendingDiaries,
          pendingApprovals,
          missedLessons,
          syllabusDelayed,
        ],
        seriesName: 'Lessons',
      }}
      focus={{
        title:
          followUpCount > 0
            ? `${followUpCount} items need follow-up`
            : 'Teaching workflow is clear',
        description:
          followUpCount > 0
            ? 'Prioritize missed lessons and delayed syllabus progress, then clear diaries and approvals.'
            : 'There are no current diary, approval or delivery exceptions in this view.',
      }}
      buttonSx={{ mb: 0, flexShrink: 0 }}
    />
  );
};

export default TeachingKpiCards;
