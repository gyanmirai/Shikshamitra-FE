import type { LessonPlanRow } from './lessonPlanData';

const normalizeLessonTopic = (value?: string | null) =>
  value?.trim().toLowerCase().split(/\s+/).filter(Boolean).join(' ') || '';

/** Returns chapter progress for the selected division only. */
export const resolvePreviousProgress = (
  lessonPlans: ReadonlyArray<
    Pick<
      LessonPlanRow,
      | 'chapterId'
      | 'divisionId'
      | 'topic'
      | 'actualCompletionPercentage'
      | 'existingChapterProgress'
      | 'plannedCompletionPercentage'
    >
  >,
  chapterId?: string,
  divisionId?: string,
  topic?: string
) => {
  if (!chapterId || !divisionId) return 0;

  const normalizedTopic = normalizeLessonTopic(topic);
  const matchingPlans = lessonPlans.filter(
    (plan) => plan.chapterId === chapterId && plan.divisionId === divisionId
  );
  const topicMatches = normalizedTopic
    ? matchingPlans.filter((plan) => normalizeLessonTopic(plan.topic) === normalizedTopic)
    : [];
  const candidates = topicMatches.length > 0 ? topicMatches : matchingPlans;

  return candidates.reduce((progress, plan) => {
    const completedProgress =
      plan.actualCompletionPercentage ||
      plan.existingChapterProgress ||
      plan.plannedCompletionPercentage ||
      0;
    return Math.max(progress, completedProgress);
  }, 0);
};
