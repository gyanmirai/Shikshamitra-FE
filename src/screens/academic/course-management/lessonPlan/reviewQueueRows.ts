import type { LessonPlanRow } from './lessonPlanData';
import type { ReviewItem } from './components/review-queue/ReviewCard';

export const lessonPlansToReviewRows = (plans: LessonPlanRow[]): ReviewItem[] => plans
  .filter(plan => ['Submitted', 'Approved', 'NeedsChanges', 'Rejected'].includes(plan.planStatus))
  .map(plan => ({
    id: plan.id, targetType: 'plan', teacherId: plan.teacherId, teacherName: plan.teacherName,
    submittedDate: plan.plannedDate, pendingSince: plan.plannedDate, classDivision: `${plan.className}-${plan.divisionName}`,
    subjectName: plan.subjectName, chapterName: plan.chapterName, topic: plan.topic, learningObjective: plan.learningObjective,
    lessonType: 'Lesson Plan', plannedPct: plan.plannedCompletionPercentage ?? 0, actualPct: plan.actualCompletionPercentage ?? '-',
    progressGap: typeof plan.actualCompletionPercentage === 'number' ? plan.actualCompletionPercentage - (plan.plannedCompletionPercentage ?? 0) : '-',
    evidenceCount: 0, submittedAt: plan.plannedDate,
    status: plan.planStatus === 'Approved' ? 'approved' : plan.planStatus === 'NeedsChanges' ? 'changes' : plan.planStatus === 'Rejected' ? 'rejected' : 'pending',
    reviewRemarks: plan.reviewRemarks, reviewedByName: plan.reviewedByName, reviewedAt: plan.reviewedAt,
  }));
