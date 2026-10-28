import type { TeacherDiaryReadDto } from 'src/redux/academicAPI/CurriculumManagementApi/LessonPlanApi/lesson-plan-workspace-contracts';

import dayjs from 'dayjs';

import { todayIso } from './lessonPlanData';
import { toDiaryStatus } from './lessonPlanStatuses';

import type { TeacherDiaryRow } from './lessonPlanData';

export function teacherDiaryRead(diary: TeacherDiaryReadDto): TeacherDiaryRow {
  const diaryStatus = toDiaryStatus(diary.diaryStatus ?? diary.status);
  return {
    id: diary.id, lessonPlanId: diary.lessonPlanId, teacherId: diary.teacherId,
    actualDate: diary.actualDate ? dayjs(diary.actualDate).format('YYYY-MM-DD') : todayIso,
    actualCompletionPercentage: diary.actualCompletionPercentage || 0, actualTopicCovered: diary.actualTopicCovered || '',
    teachingMethodUsed: diary.teachingMethodUsed || 'ExplanationBoardWork', studentResponse: diary.studentResponse || '',
    classUnderstandingLevel: diary.classUnderstandingLevel || 'Medium', studentEngagementLevel: diary.studentEngagementLevel || 'Medium',
    needRevision: Boolean(diary.needRevision), reflection: diary.reflection || '', whatWentWell: diary.whatWentWell || '',
    whatWasDifficult: diary.whatWasDifficult || '', studentsNeedingSupport: diary.studentsNeedingSupport || '',
    nextClassFollowUp: diary.nextClassFollowUp || '', remedialActionRequired: diary.remedialActionRequired || '',
    homeworkAssigned: diary.homeworkAssigned || '', diaryStatus, isBackdated: Boolean(diary.isBackdated), backdatedReason: diary.backdatedReason,
    isSubstituteDiary: Boolean(diary.isSubstituteDiary), submittedAt: diary.submittedAt, classConducted: Boolean(diary.classConducted),
    actualTopicTaught: diary.actualTopicTaught || diary.actualTopicCovered || '', actualContentSummary: diary.actualContentSummary || '',
    completionPercentage: diary.completionPercentage || diary.actualCompletionPercentage || 0, resourcesUsed: diary.resourcesUsed || '',
    missedReason: diary.missedReason as TeacherDiaryRow['missedReason'],
    rescheduledToDate: diary.rescheduledToDate ? dayjs(diary.rescheduledToDate).format('YYYY-MM-DD') : undefined,
    teacherRemarks: diary.teacherRemarks || '', status: diaryStatus as TeacherDiaryRow['status'],
  };
}
