export interface LessonPlanReadDto {
  id: string; academicYear?: string; teacherId?: string; teacherName?: string;
  standardId?: string; classId?: string; standardName?: string; className?: string;
  divisionId?: string; divisionName?: string; subjectId?: string; subjectName?: string;
  chapterId?: string; chapterName?: string; plannedDate?: string; timetableSlotId?: string;
  periodName?: string; slotName?: string; timeSlotName?: string; startTime?: string; endTime?: string;
  slotStartTime?: string; slotEndTime?: string; topic?: string; learningObjective?: string;
  teachingMethod?: string; resourcesRequired?: string; status?: number | string;
  diaryStatus?: number | string; teacherDiaryId?: string; plannedCompletionPercentage?: number;
  actualCompletionPercentage?: number; existingChapterProgress?: number; isAiGenerated?: boolean;
  reviewRemarks?: string; reviewedByName?: string; reviewedAt?: string; insightType?: string;
  insightSeverity?: string; insightMessage?: string; isPlanCreationBlocked?: boolean;
  timetableSlot?: { startTime?: string; endTime?: string; slotStartTime?: string; slotEndTime?: string; periodName?: string; slotName?: string };
}

export interface TeacherDiaryReadDto {
  id: string; lessonPlanId: string; teacherId: string; actualDate?: string;
  actualCompletionPercentage?: number; actualTopicCovered?: string; teachingMethodUsed?: string;
  studentResponse?: string; classUnderstandingLevel?: 'High' | 'Medium' | 'Low' | 'Mixed';
  studentEngagementLevel?: 'High' | 'Medium' | 'Low'; needRevision?: boolean; reflection?: string;
  whatWentWell?: string; whatWasDifficult?: string; studentsNeedingSupport?: string;
  nextClassFollowUp?: string; remedialActionRequired?: string; homeworkAssigned?: string;
  diaryStatus?: number | string; status?: number | string; isBackdated?: boolean;
  backdatedReason?: string; isSubstituteDiary?: boolean; submittedAt?: string; classConducted?: boolean;
  actualTopicTaught?: string; actualContentSummary?: string; completionPercentage?: number;
  resourcesUsed?: string; missedReason?: string; rescheduledToDate?: string; teacherRemarks?: string;
}

export interface LessonWorkspaceInput {
  academicYearId?: string; academicMediumId?: string; teacherId?: string;
  view: string; status?: number; uiCriteria?: string; searchTerm?: string;
  searchColumns?: string[]; filters?: string; sorts?: string;
  skipCount: number; maxResultCount: number;
}

export interface TeachingQuickCounts {
  lessonsPlanned: number; diariesSubmitted: number; pendingDiaries: number;
  pendingApprovals: number; missedLessons: number; syllabusDelayed: number;
}

export interface LessonWorkspaceSummary {
  reviewStatusCounts?: Record<'pending' | 'approved' | 'rejected' | 'changes' | 'all', number>;
  options?: Partial<Record<'teachers' | 'classes' | 'divisions' | 'subjects' | 'chapters' | 'reviewClasses' | 'reviewSubjects' | 'reviewers', string[]>>;
  quickCounts?: TeachingQuickCounts;
}

export interface LessonWorkspacePage {
  totalCount: number; items: LessonPlanReadDto[]; diaries: TeacherDiaryReadDto[];
  summary: LessonWorkspaceSummary;
}

export function lessonWorkspaceUrl(input: LessonWorkspaceInput) {
  const params = new URLSearchParams();
  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined) return;
    if (Array.isArray(value)) value.forEach(item => params.append(key, item));
    else params.set(key, String(value));
  });
  return `/academic/curriculum/lesson-plans/workspace?${params}`;
}
