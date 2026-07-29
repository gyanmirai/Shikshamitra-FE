import dayjs from 'dayjs';

// ─── Enums ────────────────────────────────────────────────────────────────────

export type PlanStatus =
  | 'Draft'
  | 'Submitted'
  | 'Approved'
  | 'Rejected'
  | 'NeedsChanges'
  | 'Missed'
  | 'Rescheduled'
  | 'Cancelled'
  | 'AutoCreated'
  | 'AiGenerated';

export type DiaryStatus = 'NotSubmitted' | 'Draft' | 'Submitted' | 'Backdated' | 'EvidenceMissing';

export type ApprovalStatus =
  'Pending' | 'Approved' | 'Rejected' | 'ChangesRequested' | 'AutoApproved';

export type LessonSource =
  | 'Manual'
  | 'Timetable'
  | 'CopiedFromPreviousWeek'
  | 'AiGenerated'
  | 'Rescheduled'
  | 'Substitution';

export type TeachingMethod =
  | 'ExplanationBoardWork'
  | 'ActivityBased'
  | 'LabPractical'
  | 'GroupDiscussion'
  | 'WorksheetPractice'
  | 'ProjectWork'
  | 'Revision'
  | 'TestPreparation'
  | 'OralPractice'
  | 'Storytelling'
  | 'Demonstration';

export type UnderstandingLevel = 'High' | 'Medium' | 'Low' | 'Mixed';
export type EngagementLevel = 'High' | 'Medium' | 'Low';

export type EvidenceType =
  | 'ClassPhoto'
  | 'BoardWorkPhoto'
  | 'Worksheet'
  | 'StudentActivityImage'
  | 'PdfNotes'
  | 'Audio'
  | 'Video'
  | 'AttendanceReference'
  | 'LabRecord'
  | 'StudentWorkSample'
  | 'Other';

export type MissedReason =
  | 'TeacherAbsent'
  | 'Holiday'
  | 'SchoolEvent'
  | 'Exam'
  | 'Substitution'
  | 'ClassCancelled'
  | 'TechnicalIssue'
  | 'Other';

export type RescheduleStatus =
  'NotRequired' | 'Pending' | 'Suggested' | 'Approved' | 'Rejected' | 'Completed';

export type ApprovalMode =
  'NoApproval' | 'HodApproval' | 'PrincipalApproval' | 'HodAndPrincipalApproval';

export type ExecutionStatus =
  'OnTrack' | 'Delayed' | 'Missed' | 'Rescheduled' | 'ProgressUpdated' | 'NeedsReview';

export type ReviewType = 'Plan' | 'Diary';

// ─── Core Models ──────────────────────────────────────────────────────────────

export type LessonPlanRow = {
  id: string;
  academicYear: string;
  teacherId: string;
  teacherName: string;
  standardId?: string;
  classId: string;
  className: string;
  divisionId: string;
  divisionName: string;
  subjectId: string;
  subjectName: string;
  chapterId: string;
  chapterName: string;
  plannedDate: string;
  timetableSlotId?: string;
  periodId: string;
  period: string;
  plannedTime: string;
  topic: string;
  learningObjective: string;
  teachingMethod: TeachingMethod | string;
  plannedCompletionPercentage: number;
  resourcesRequired: string;
  planStatus: PlanStatus;
  diaryStatus: DiaryStatus;
  approvalStatus: ApprovalStatus;
  actualCompletionPercentage: number;
  existingChapterProgress: number;
  source: LessonSource;
  isAiGenerated: boolean;
  aiQualityScore?: number;
  executionStatus: ExecutionStatus;
  reviewRemarks?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  teacherDiaryId?: string;
  insightType?: string | null;
  insightSeverity?: string | null;
  insightMessage?: string | null;
  isPlanCreationBlocked?: boolean;
  // legacy fields for backward compat
  status: PlanStatus;
  reviewStatus: string;
};

export type TeacherDiaryRow = {
  id: string;
  lessonPlanId: string;
  teacherId: string;
  actualDate: string;
  actualCompletionPercentage: number;
  actualTopicCovered: string;
  teachingMethodUsed: TeachingMethod | string;
  studentResponse: string;
  classUnderstandingLevel: UnderstandingLevel;
  studentEngagementLevel: EngagementLevel;
  needRevision: boolean;
  reflection: string;
  whatWentWell: string;
  whatWasDifficult: string;
  studentsNeedingSupport: string;
  nextClassFollowUp: string;
  remedialActionRequired: string;
  homeworkAssigned: string;
  diaryStatus: DiaryStatus;
  isBackdated: boolean;
  backdatedReason?: string;
  isSubstituteDiary: boolean;
  submittedAt?: string;
  evidence?: DiaryEvidence[];
  // legacy fields
  classConducted: boolean;
  actualTopicTaught: string;
  actualContentSummary: string;
  completionPercentage: number;
  resourcesUsed: string;
  missedReason?: MissedReason;
  rescheduledToDate?: string;
  teacherRemarks: string;
  status: Exclude<DiaryStatus, 'NotSubmitted'>;
};

export type DiaryEvidence = {
  id: string;
  teacherDiaryId: string;
  evidenceType: EvidenceType;
  fileUrl: string;
  fileName: string;
  remarks?: string;
  uploadedBy: string;
  uploadedAt: string;
};

export type LessonPlanReview = {
  id: string;
  lessonPlanId?: string;
  teacherDiaryId?: string;
  reviewerId: string;
  reviewerName: string;
  reviewType: ReviewType;
  status: ApprovalStatus;
  comment: string;
  aiRecommendation?: string;
  reviewedAt: string;
  pendingSince: string;
};

export type MissedLesson = {
  id: string;
  lessonPlanId: string;
  missedDate: string;
  reason: MissedReason;
  remarks: string;
  rescheduleStatus: RescheduleStatus;
  suggestedDate?: string;
  suggestedPeriod?: string;
  approvedBy?: string;
};

export type LessonPlanSettings = {
  academicYear: string;
  approvalMode: ApprovalMode;
  allowBackdatedDiary: boolean;
  maxBackdateDays: number;
  requireBackdateReason: boolean;
  requireEvidenceForBackdate: boolean;
  allowProgressDecreaseWithOverride: boolean;
  autoUpdateChapterProgressAfterApprovedDiary: boolean;
  requireDiaryForEveryPlannedLesson: boolean;
  allowSubstituteDiary: boolean;
  allowDiaryWithoutLessonPlan: boolean;
  requireEvidenceForProgressOverride: boolean;
  maxProgressUpdatePerDiary: number;
  requireReasonIfActualDiffersFromPlanned: boolean;
  autoDetectSyllabusDelay: boolean;
  diaryPendingReminderTime: string;
  approvalPendingReminderDays: number;
  enableMissedLessonReminder: boolean;
  enableSyllabusDelayAlert: boolean;
  weeklyPrincipalSummary: boolean;
  enableParentUpdate: boolean;
  allowAiLessonPlanGeneration: boolean;
  allowAiDiarySummary: boolean;
  allowAiReviewAssistant: boolean;
  allowAiParentUpdate: boolean;
  requireHumanReviewForAiContent: boolean;
  storeAiSuggestionHistory: boolean;
  autoApprovalForLowRiskDiary: boolean;
  escalationAfterPendingDays: number;
  settingsActive: boolean;
};

export type CoverageRow = {
  subject: string;
  chapter: string;
  plannedPercentage: number;
  actualPercentage: number;
  gap: number;
  status: 'OnTrack' | 'Delayed' | 'Critical';
  teacher: string;
  totalLessons: number;
  completedLessons: number;
  missedLessons: number;
};

export type TeachingHealthScore = {
  overall: number;
  lessonPlansOnTime: number;
  diarySubmittedOnTime: number;
  diaryApproved: number;
  syllabusProgressUpdated: number;
  missedLessonsRescheduled: number;
  resourcesAttached: number;
  teacherReflectionAdded: number;
  studentEngagementNoted: number;
  evidenceAttached: number;
  aiQualityReviewPassed: number;
};

// ─── Constants ────────────────────────────────────────────────────────────────

export const todayIso = dayjs().format('YYYY-MM-DD');
export const weekStartIso = dayjs().startOf('week').add(1, 'day').format('YYYY-MM-DD');
export const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ─── Option Arrays ────────────────────────────────────────────────────────────

export const academicYearOptions = [
  { value: '2026-27', label: '2026-27' },
  { value: '2025-26', label: '2025-26' },
];

export const classOptions = [
  { value: '7', label: 'Class 7' },
  { value: '8', label: 'Class 8' },
  { value: '9', label: 'Class 9' },
  { value: '10', label: 'Class 10' },
];

export const divisionOptions = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
];

export const subjectOptions = [
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'Science', label: 'Science' },
  { value: 'English', label: 'English' },
  { value: 'Social Studies', label: 'Social Studies' },
  { value: 'ICT', label: 'ICT' },
];

export const teacherOptions = [
  { value: 'Rohit Mehta', label: 'Rohit Mehta' },
  { value: 'Anita Sharma', label: 'Anita Sharma' },
  { value: 'Farah Khan', label: 'Farah Khan' },
  { value: 'Kiran Patel', label: 'Kiran Patel' },
  { value: 'Nisha Rao', label: 'Nisha Rao' },
];

export const chapterOptions = [
  { value: 'Fractions', label: 'Fractions' },
  { value: 'Linear Equations', label: 'Linear Equations' },
  { value: 'Light', label: 'Light' },
  { value: 'Grammar: Tenses', label: 'Grammar: Tenses' },
  { value: 'Indian Constitution', label: 'Indian Constitution' },
  { value: 'Internet Safety', label: 'Internet Safety' },
];

export const periodOptions = [
  { value: 'Period 1', label: 'Period 1 - 09:00 to 09:45' },
  { value: 'Period 2', label: 'Period 2 - 10:00 to 10:45' },
  { value: 'Period 3', label: 'Period 3 - 11:00 to 11:45' },
  { value: 'Period 4', label: 'Period 4 - 12:00 to 12:45' },
  { value: 'Period 5', label: 'Period 5 - 13:30 to 14:15' },
];

export const periodTimeMap: Record<string, string> = {
  'Period 1': '09:00 - 09:45',
  'Period 2': '10:00 - 10:45',
  'Period 3': '11:00 - 11:45',
  'Period 4': '12:00 - 12:45',
  'Period 5': '13:30 - 14:15',
};

export const teachingMethodOptions = [
  { value: 'ExplanationBoardWork', label: 'Explanation + Board Work' },
  { value: 'ActivityBased', label: 'Activity Based' },
  { value: 'LabPractical', label: 'Lab Practical' },
  { value: 'GroupDiscussion', label: 'Group Discussion' },
  { value: 'WorksheetPractice', label: 'Worksheet Practice' },
  { value: 'ProjectWork', label: 'Project Work' },
  { value: 'Revision', label: 'Revision' },
  { value: 'TestPreparation', label: 'Test Preparation' },
  { value: 'OralPractice', label: 'Oral Practice' },
  { value: 'Storytelling', label: 'Storytelling' },
  { value: 'Demonstration', label: 'Demonstration' },
];

export const teachingMethodLabel: Record<string, string> = {
  ExplanationBoardWork: 'Explanation + Board Work',
  ActivityBased: 'Activity Based',
  LabPractical: 'Lab Practical',
  GroupDiscussion: 'Group Discussion',
  WorksheetPractice: 'Worksheet Practice',
  ProjectWork: 'Project Work',
  Revision: 'Revision',
  TestPreparation: 'Test Preparation',
  OralPractice: 'Oral Practice',
  Storytelling: 'Storytelling',
  Demonstration: 'Demonstration',
};

export const planStatusOptions = [
  { value: 'all', label: 'All Plan Status' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'NeedsChanges', label: 'Needs Changes' },
  { value: 'Missed', label: 'Missed' },
  { value: 'Rescheduled', label: 'Rescheduled' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'AutoCreated', label: 'Auto Created' },
  { value: 'AiGenerated', label: 'AI Generated' },
];

export const diaryStatusOptions = [
  { value: 'all', label: 'All Diary Status' },
  { value: 'NotSubmitted', label: 'Diary Pending' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Submitted', label: 'Diary Submitted' },
  { value: 'Backdated', label: 'Backdated' },
  { value: 'EvidenceMissing', label: 'Evidence Missing' },
];

export const approvalStatusOptions = [
  { value: 'all', label: 'All Approval Status' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'ChangesRequested', label: 'Changes Requested' },
  { value: 'AutoApproved', label: 'Auto Approved' },
];

export const executionStatusOptions = [
  { value: 'all', label: 'All Execution Status' },
  { value: 'OnTrack', label: 'On Track' },
  { value: 'Delayed', label: 'Delayed' },
  { value: 'Missed', label: 'Missed' },
  { value: 'Rescheduled', label: 'Rescheduled' },
  { value: 'ProgressUpdated', label: 'Progress Updated' },
  { value: 'NeedsReview', label: 'Needs Review' },
];

export const missedReasonOptions = [
  { value: 'TeacherAbsent', label: 'Teacher Absent' },
  { value: 'Holiday', label: 'Holiday' },
  { value: 'SchoolEvent', label: 'School Event' },
  { value: 'Exam', label: 'Exam' },
  { value: 'Substitution', label: 'Substitution' },
  { value: 'ClassCancelled', label: 'Class Cancelled' },
  { value: 'TechnicalIssue', label: 'Technical Issue' },
  { value: 'Other', label: 'Other' },
];

export const reviewModeOptions = [
  { value: 'NoApproval', label: 'No Approval' },
  { value: 'HodApproval', label: 'HOD Approval' },
  { value: 'PrincipalApproval', label: 'Principal Approval' },
  { value: 'HodAndPrincipalApproval', label: 'HOD + Principal Approval' },
];

export const understandingLevelOptions = [
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
  { value: 'Mixed', label: 'Mixed' },
];

export const engagementLevelOptions = [
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
];

export const evidenceTypeOptions = [
  { value: 'ClassPhoto', label: 'Class Photo' },
  { value: 'BoardWorkPhoto', label: 'Board Work Photo' },
  { value: 'Worksheet', label: 'Worksheet' },
  { value: 'StudentActivityImage', label: 'Student Activity Image' },
  { value: 'PdfNotes', label: 'PDF Notes' },
  { value: 'Audio', label: 'Audio' },
  { value: 'Video', label: 'Video' },
  { value: 'AttendanceReference', label: 'Attendance Reference' },
  { value: 'LabRecord', label: 'Lab Record' },
  { value: 'StudentWorkSample', label: 'Student Work Sample' },
  { value: 'Other', label: 'Other' },
];

export const lessonPlanTemplates = [
  { value: 'Lecture', label: 'Lecture-based' },
  { value: 'ActivityBased', label: 'Activity-based' },
  { value: 'LabPractical', label: 'Lab Practical' },
  { value: 'Revision', label: 'Revision Class' },
  { value: 'TestPreparation', label: 'Test Preparation' },
  { value: 'ProjectWork', label: 'Project Work' },
  { value: 'RemedialClass', label: 'Remedial Class' },
  { value: 'OralPractice', label: 'Oral Practice' },
  { value: 'Storytelling', label: 'Storytelling' },
  { value: 'WorksheetPractice', label: 'Worksheet Practice' },
];

export const quickFilterOptions = [
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This Week' },
  { value: 'pending_diary', label: 'Pending Diary' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'missed_lessons', label: 'Missed Lessons' },
  { value: 'delayed_progress', label: 'Delayed Progress' },
  { value: 'no_evidence', label: 'No Evidence' },
  { value: 'backdated', label: 'Backdated Entries' },
  { value: 'my_lessons', label: 'My Lessons' },
  { value: 'my_reviews', label: 'My Reviews' },
];

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const initialLessonPlans: LessonPlanRow[] = [
  {
    id: 'lp-1',
    academicYear: '2026-27',
    teacherId: 't-1',
    teacherName: 'Rohit Mehta',
    classId: 'c-7',
    className: '7',
    divisionId: 'd-a',
    divisionName: 'A',
    subjectId: 's-maths',
    subjectName: 'Mathematics',
    chapterId: 'ch-fractions',
    chapterName: 'Fractions',
    plannedDate: todayIso,
    periodId: 'p-2',
    period: 'Period 2',
    plannedTime: '10:00 - 10:45',
    topic: 'Addition of Fractions',
    learningObjective: 'Students will add like and unlike fractions using LCM.',
    teachingMethod: 'ExplanationBoardWork',
    plannedCompletionPercentage: 40,
    resourcesRequired: 'Fraction strips, worksheet 3.1',
    planStatus: 'Approved',
    diaryStatus: 'Submitted',
    approvalStatus: 'Approved',
    actualCompletionPercentage: 40,
    existingChapterProgress: 35,
    source: 'Manual',
    isAiGenerated: false,
    aiQualityScore: 82,
    executionStatus: 'ProgressUpdated',
    reviewedBy: 'HOD Mathematics',
    reviewedAt: dayjs().subtract(1, 'day').toISOString(),
    status: 'Approved',
    reviewStatus: 'Diary Notes Saved',
  },
  {
    id: 'lp-2',
    academicYear: '2026-27',
    teacherId: 't-2',
    teacherName: 'Anita Sharma',
    classId: 'c-8',
    className: '8',
    divisionId: 'd-b',
    divisionName: 'B',
    subjectId: 's-science',
    subjectName: 'Science',
    chapterId: 'ch-light',
    chapterName: 'Light',
    plannedDate: dayjs(todayIso).add(1, 'day').format('YYYY-MM-DD'),
    periodId: 'p-3',
    period: 'Period 3',
    plannedTime: '11:00 - 11:45',
    topic: 'Reflection from Plane Mirror',
    learningObjective: 'Students will identify incident ray, reflected ray, and normal.',
    teachingMethod: 'LabPractical',
    plannedCompletionPercentage: 25,
    resourcesRequired: 'Mirror, laser pointer, ray diagram chart',
    planStatus: 'Submitted',
    diaryStatus: 'NotSubmitted',
    approvalStatus: 'Pending',
    actualCompletionPercentage: 0,
    existingChapterProgress: 10,
    source: 'Timetable',
    isAiGenerated: false,
    executionStatus: 'NeedsReview',
    status: 'Submitted',
    reviewStatus: 'Plan Pending Approval',
  },
  {
    id: 'lp-3',
    academicYear: '2026-27',
    teacherId: 't-3',
    teacherName: 'Farah Khan',
    classId: 'c-9',
    className: '9',
    divisionId: 'd-a',
    divisionName: 'A',
    subjectId: 's-english',
    subjectName: 'English',
    chapterId: 'ch-tenses',
    chapterName: 'Grammar: Tenses',
    plannedDate: dayjs(todayIso).subtract(1, 'day').format('YYYY-MM-DD'),
    periodId: 'p-1',
    period: 'Period 1',
    plannedTime: '09:00 - 09:45',
    topic: 'Past Perfect Tense',
    learningObjective: 'Students will form past perfect sentences in context.',
    teachingMethod: 'WorksheetPractice',
    plannedCompletionPercentage: 60,
    resourcesRequired: 'Grammar worksheet, smart board examples',
    planStatus: 'Approved',
    diaryStatus: 'Submitted',
    approvalStatus: 'Approved',
    actualCompletionPercentage: 55,
    existingChapterProgress: 55,
    source: 'Manual',
    isAiGenerated: true,
    aiQualityScore: 91,
    executionStatus: 'ProgressUpdated',
    reviewedBy: 'Principal',
    reviewedAt: dayjs().subtract(10, 'hour').toISOString(),
    status: 'Approved',
    reviewStatus: 'Diary Notes Saved',
  },
  {
    id: 'lp-4',
    academicYear: '2026-27',
    teacherId: 't-4',
    teacherName: 'Kiran Patel',
    classId: 'c-10',
    className: '10',
    divisionId: 'd-c',
    divisionName: 'C',
    subjectId: 's-sst',
    subjectName: 'Social Studies',
    chapterId: 'ch-constitution',
    chapterName: 'Indian Constitution',
    plannedDate: todayIso,
    periodId: 'p-4',
    period: 'Period 4',
    plannedTime: '12:00 - 12:45',
    topic: 'Fundamental Rights',
    learningObjective: 'Students will explain six fundamental rights with examples.',
    teachingMethod: 'GroupDiscussion',
    plannedCompletionPercentage: 30,
    resourcesRequired: 'Civics chart, textbook examples',
    planStatus: 'Approved',
    diaryStatus: 'Submitted',
    approvalStatus: 'Approved',
    actualCompletionPercentage: 0,
    existingChapterProgress: 20,
    source: 'Manual',
    isAiGenerated: false,
    executionStatus: 'NeedsReview',
    status: 'Approved',
    reviewStatus: 'Diary Notes Saved',
  },
  {
    id: 'lp-5',
    academicYear: '2026-27',
    teacherId: 't-5',
    teacherName: 'Nisha Rao',
    classId: 'c-8',
    className: '8',
    divisionId: 'd-a',
    divisionName: 'A',
    subjectId: 's-ict',
    subjectName: 'ICT',
    chapterId: 'ch-internet',
    chapterName: 'Internet Safety',
    plannedDate: dayjs(todayIso).add(2, 'day').format('YYYY-MM-DD'),
    periodId: 'p-5',
    period: 'Period 5',
    plannedTime: '13:30 - 14:15',
    topic: 'Password Hygiene',
    learningObjective: 'Students will identify strong passwords and phishing signals.',
    teachingMethod: 'ActivityBased',
    plannedCompletionPercentage: 20,
    resourcesRequired: 'Projector, safety checklist',
    planStatus: 'Draft',
    diaryStatus: 'NotSubmitted',
    approvalStatus: 'Pending',
    actualCompletionPercentage: 0,
    existingChapterProgress: 0,
    source: 'Manual',
    isAiGenerated: false,
    executionStatus: 'OnTrack',
    status: 'Draft',
    reviewStatus: 'Draft',
  },
  {
    id: 'lp-6',
    academicYear: '2026-27',
    teacherId: 't-1',
    teacherName: 'Rohit Mehta',
    classId: 'c-7',
    className: '7',
    divisionId: 'd-a',
    divisionName: 'A',
    subjectId: 's-maths',
    subjectName: 'Mathematics',
    chapterId: 'ch-equations',
    chapterName: 'Linear Equations',
    plannedDate: dayjs(todayIso).subtract(3, 'day').format('YYYY-MM-DD'),
    periodId: 'p-2',
    period: 'Period 2',
    plannedTime: '10:00 - 10:45',
    topic: 'Solving One-variable Equations',
    learningObjective: 'Students will solve basic one-variable linear equations.',
    teachingMethod: 'ExplanationBoardWork',
    plannedCompletionPercentage: 50,
    resourcesRequired: 'Textbook Ch. 4, board examples',
    planStatus: 'Missed',
    diaryStatus: 'NotSubmitted',
    approvalStatus: 'Pending',
    actualCompletionPercentage: 0,
    existingChapterProgress: 0,
    source: 'Manual',
    isAiGenerated: false,
    executionStatus: 'Missed',
    status: 'Missed',
    reviewStatus: 'Missed - Needs Reschedule',
  },
];

export const initialDiaryEntries: TeacherDiaryRow[] = [
  {
    id: 'diary-1',
    lessonPlanId: 'lp-1',
    teacherId: 't-1',
    actualDate: todayIso,
    actualCompletionPercentage: 40,
    actualTopicCovered: 'Addition of like and unlike fractions',
    teachingMethodUsed: 'ExplanationBoardWork',
    studentResponse: 'Good response; four students need extra practice with LCM.',
    classUnderstandingLevel: 'Medium',
    studentEngagementLevel: 'High',
    needRevision: true,
    reflection: 'Board examples worked very well. Will use more visual aids next class.',
    whatWentWell: 'Students engaged well with number-line approach.',
    whatWasDifficult: 'Unlike fractions with large denominators confused some students.',
    studentsNeedingSupport: 'Aarav, Priya, and Mohan',
    nextClassFollowUp: 'Practice common denominators and start word problems.',
    remedialActionRequired: 'Extra worksheet for slow learners on LCM method.',
    homeworkAssigned: 'Exercise 3.1, Q1-Q8',
    diaryStatus: 'Submitted',
    isBackdated: false,
    isSubstituteDiary: false,
    submittedAt: dayjs().subtract(1, 'hour').toISOString(),
    // legacy
    classConducted: true,
    actualTopicTaught: 'Addition of like and unlike fractions',
    actualContentSummary: 'Used number-line examples and LCM method for unlike denominators.',
    completionPercentage: 40,
    resourcesUsed: 'Fraction strips, worksheet',
    teacherRemarks: 'Will start word problems next period.',
    status: 'Submitted',
  },
  {
    id: 'diary-2',
    lessonPlanId: 'lp-3',
    teacherId: 't-3',
    actualDate: dayjs(todayIso).subtract(1, 'day').format('YYYY-MM-DD'),
    actualCompletionPercentage: 55,
    actualTopicCovered: 'Past Perfect Tense',
    teachingMethodUsed: 'WorksheetPractice',
    studentResponse: 'Most students understood timeline sequence after examples.',
    classUnderstandingLevel: 'High',
    studentEngagementLevel: 'High',
    needRevision: false,
    reflection: 'Sentence transformation activity was very effective.',
    whatWentWell: 'Timeline diagram helped most students grasp the concept.',
    whatWasDifficult: 'Differentiating past perfect from simple past.',
    studentsNeedingSupport: 'None this session.',
    nextClassFollowUp: 'Start future perfect tense next session.',
    remedialActionRequired: '',
    homeworkAssigned: 'Write 10 sentences using past perfect tense',
    diaryStatus: 'Submitted',
    isBackdated: false,
    isSubstituteDiary: false,
    submittedAt: dayjs().subtract(1, 'day').toISOString(),
    // legacy
    classConducted: true,
    actualTopicTaught: 'Past Perfect Tense',
    actualContentSummary: 'Sentence formation, timeline usage, and correction practice.',
    completionPercentage: 55,
    resourcesUsed: 'Grammar worksheet, smart board',
    teacherRemarks: 'Progress synced to chapter progress.',
    status: 'Submitted',
  },
  {
    id: 'diary-3',
    lessonPlanId: 'lp-4',
    teacherId: 't-4',
    actualDate: todayIso,
    actualCompletionPercentage: 0,
    actualTopicCovered: '',
    teachingMethodUsed: 'GroupDiscussion',
    studentResponse: '',
    classUnderstandingLevel: 'Medium',
    studentEngagementLevel: 'Medium',
    needRevision: false,
    reflection: '',
    whatWentWell: '',
    whatWasDifficult: '',
    studentsNeedingSupport: '',
    nextClassFollowUp: '',
    remedialActionRequired: '',
    homeworkAssigned: '',
    diaryStatus: 'Submitted',
    isBackdated: false,
    isSubstituteDiary: false,
    submittedAt: dayjs().subtract(2, 'hour').toISOString(),
    // legacy
    classConducted: false,
    actualTopicTaught: '',
    actualContentSummary: '',
    completionPercentage: 0,
    resourcesUsed: '',
    missedReason: 'SchoolEvent',
    rescheduledToDate: dayjs(todayIso).add(3, 'day').format('YYYY-MM-DD'),
    teacherRemarks: 'Class engaged in annual day rehearsal.',
    status: 'Submitted',
  },
];

export const initialSettings: LessonPlanSettings = {
  academicYear: '2026-27',
  approvalMode: 'HodApproval',
  allowBackdatedDiary: true,
  maxBackdateDays: 3,
  requireBackdateReason: true,
  requireEvidenceForBackdate: false,
  allowProgressDecreaseWithOverride: false,
  autoUpdateChapterProgressAfterApprovedDiary: true,
  requireDiaryForEveryPlannedLesson: true,
  allowSubstituteDiary: true,
  allowDiaryWithoutLessonPlan: false,
  requireEvidenceForProgressOverride: true,
  maxProgressUpdatePerDiary: 30,
  requireReasonIfActualDiffersFromPlanned: true,
  autoDetectSyllabusDelay: true,
  diaryPendingReminderTime: '17:00',
  approvalPendingReminderDays: 2,
  enableMissedLessonReminder: true,
  enableSyllabusDelayAlert: true,
  weeklyPrincipalSummary: true,
  enableParentUpdate: false,
  allowAiLessonPlanGeneration: true,
  allowAiDiarySummary: true,
  allowAiReviewAssistant: true,
  allowAiParentUpdate: false,
  requireHumanReviewForAiContent: true,
  storeAiSuggestionHistory: true,
  autoApprovalForLowRiskDiary: false,
  escalationAfterPendingDays: 3,
  settingsActive: true,
};

export const initialCoverageData: CoverageRow[] = [
  {
    subject: 'Mathematics',
    chapter: 'Fractions',
    plannedPercentage: 40,
    actualPercentage: 40,
    gap: 0,
    status: 'OnTrack',
    teacher: 'Rohit Mehta',
    totalLessons: 5,
    completedLessons: 2,
    missedLessons: 0,
  },
  {
    subject: 'Science',
    chapter: 'Light',
    plannedPercentage: 50,
    actualPercentage: 25,
    gap: -25,
    status: 'Delayed',
    teacher: 'Anita Sharma',
    totalLessons: 6,
    completedLessons: 1,
    missedLessons: 1,
  },
  {
    subject: 'English',
    chapter: 'Grammar: Tenses',
    plannedPercentage: 60,
    actualPercentage: 55,
    gap: -5,
    status: 'OnTrack',
    teacher: 'Farah Khan',
    totalLessons: 4,
    completedLessons: 3,
    missedLessons: 0,
  },
  {
    subject: 'Social Studies',
    chapter: 'Indian Constitution',
    plannedPercentage: 30,
    actualPercentage: 0,
    gap: -30,
    status: 'Critical',
    teacher: 'Kiran Patel',
    totalLessons: 5,
    completedLessons: 0,
    missedLessons: 2,
  },
  {
    subject: 'ICT',
    chapter: 'Internet Safety',
    plannedPercentage: 20,
    actualPercentage: 0,
    gap: -20,
    status: 'Delayed',
    teacher: 'Nisha Rao',
    totalLessons: 3,
    completedLessons: 0,
    missedLessons: 0,
  },
];

export const initialHealthScore: TeachingHealthScore = {
  overall: 78,
  lessonPlansOnTime: 85,
  diarySubmittedOnTime: 72,
  diaryApproved: 80,
  syllabusProgressUpdated: 75,
  missedLessonsRescheduled: 60,
  resourcesAttached: 90,
  teacherReflectionAdded: 65,
  studentEngagementNoted: 70,
  evidenceAttached: 55,
  aiQualityReviewPassed: 88,
};

export const notificationEvents = [
  {
    event: 'LessonPlan.Submitted',
    audience: 'HOD / Principal',
    sampleMessage: 'A lesson plan is ready for review.',
    enabled: true,
  },
  {
    event: 'LessonPlan.Approved',
    audience: 'Teacher',
    sampleMessage: 'Your lesson plan has been approved.',
    enabled: true,
  },
  {
    event: 'LessonPlan.Rejected',
    audience: 'Teacher',
    sampleMessage: 'Your lesson plan needs correction.',
    enabled: true,
  },
  {
    event: 'TeacherDiary.PendingReminder',
    audience: 'Teacher',
    sampleMessage: 'A diary entry is pending for today.',
    enabled: true,
  },
  {
    event: 'TeacherDiary.Submitted',
    audience: 'Teacher',
    sampleMessage: 'Your teacher diary notes have been saved.',
    enabled: true,
  },
  {
    event: 'MissedLesson.Marked',
    audience: 'HOD / Principal',
    sampleMessage: 'A lesson has been marked as missed.',
    enabled: true,
  },
  {
    event: 'Reschedule.Suggested',
    audience: 'Teacher / HOD',
    sampleMessage: 'A reschedule slot has been suggested for missed lesson.',
    enabled: false,
  },
  {
    event: 'Syllabus.DelayDetected',
    audience: 'Teacher / HOD / Principal',
    sampleMessage: 'A chapter is behind the planned syllabus pace.',
    enabled: true,
  },
  {
    event: 'WeeklyPlan.Pending',
    audience: 'Teacher',
    sampleMessage: 'Weekly lesson plan is not submitted yet.',
    enabled: true,
  },
  {
    event: 'ParentUpdate.Generated',
    audience: 'Admin / Teacher',
    sampleMessage: 'AI-generated parent update is ready for review.',
    enabled: false,
  },
];
