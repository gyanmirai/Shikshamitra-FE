import type { LessonPlanReadDto } from 'src/redux/academicAPI/CurriculumManagementApi/LessonPlanApi/lesson-plan-workspace-contracts';

import dayjs from 'dayjs';

import { todayIso } from './lessonPlanData';
import { toPlanStatus, toDiaryStatus } from './lessonPlanStatuses';

import type { LessonPlanRow } from './lessonPlanData';

const guid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const time = (value?: string) => {
  if (!value) return '';
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([AP]M)?$/i);
  if (!match) return value.trim();
  const hour = Number(match[1]);
  return `${String(match[3] ? hour : hour % 12 || 12).padStart(2, '0')}:${match[2]} ${match[3]?.toUpperCase() || (hour >= 12 ? 'PM' : 'AM')}`;
};

export function lessonPlanRead(plan: LessonPlanReadDto): LessonPlanRow {
  const start = time(plan.startTime || plan.slotStartTime || plan.timetableSlot?.startTime || plan.timetableSlot?.slotStartTime);
  const end = time(plan.endTime || plan.slotEndTime || plan.timetableSlot?.endTime || plan.timetableSlot?.slotEndTime);
  const period = plan.periodName || plan.slotName || plan.timeSlotName || plan.timetableSlot?.periodName || plan.timetableSlot?.slotName;
  const status = toPlanStatus(plan.status);
  return {
    id: plan.id, academicYear: plan.academicYear || '2026-27', teacherName: plan.teacherName || '', teacherId: plan.teacherId || '',
    standardId: plan.standardId || plan.classId, classId: plan.standardId || plan.classId || '', className: plan.standardName || plan.className || '',
    divisionId: plan.divisionId || '', divisionName: plan.divisionName || '', subjectId: plan.subjectId || '', subjectName: plan.subjectName || '',
    chapterId: plan.chapterId || '', chapterName: plan.chapterName || '', plannedDate: plan.plannedDate ? dayjs(plan.plannedDate).format('YYYY-MM-DD') : todayIso,
    periodId: plan.timetableSlotId || 'Manual', period: period && !guid.test(period) ? period : plan.timetableSlotId ? 'Scheduled' : 'Manual',
    plannedTime: start && end ? `${start} - ${end}` : '', topic: plan.topic || '', learningObjective: plan.learningObjective || '',
    teachingMethod: plan.teachingMethod || 'ExplanationBoardWork', resourcesRequired: plan.resourcesRequired || '', planStatus: status,
    diaryStatus: toDiaryStatus(plan.diaryStatus, Boolean(plan.teacherDiaryId)), status, approvalStatus: status === 'Approved' ? 'Approved' : 'Pending',
    plannedCompletionPercentage: plan.plannedCompletionPercentage || 0, actualCompletionPercentage: plan.actualCompletionPercentage || 0,
    existingChapterProgress: plan.existingChapterProgress || 0, source: plan.isAiGenerated ? 'AiGenerated' : 'Manual', isAiGenerated: !!plan.isAiGenerated,
    executionStatus: 'OnTrack', reviewStatus: plan.status === 'Approved' ? 'Plan Approved' : 'Draft', reviewRemarks: plan.reviewRemarks,
    reviewedByName: plan.reviewedByName, reviewedAt: plan.reviewedAt, timetableSlotId: plan.timetableSlotId, teacherDiaryId: plan.teacherDiaryId,
    insightType: plan.insightType, insightSeverity: plan.insightSeverity, insightMessage: plan.insightMessage, isPlanCreationBlocked: Boolean(plan.isPlanCreationBlocked),
  };
}
