import dayjs from 'dayjs';

export type LessonPlanStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Cancelled';
export type TeacherDiaryStatus = 'Not Started' | 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
export type ReviewMode = 'NoApproval' | 'HodApproval' | 'PrincipalApproval' | 'BothHodAndPrincipal';
export type MissedReason =
  | 'Holiday'
  | 'Exam'
  | 'Teacher Absent'
  | 'School Event'
  | 'Class Unavailable'
  | 'Other';

export type LessonPlanRow = {
  id: string;
  academicYear: string;
  teacherName: string;
  className: string;
  divisionName: string;
  subjectName: string;
  chapterName: string;
  plannedDate: string;
  period: string;
  plannedTime: string;
  topic: string;
  learningObjective: string;
  teachingMethod: string;
  resourcesRequired: string;
  plannedCompletionPercentage: number;
  actualCompletionPercentage: number;
  existingChapterProgress: number;
  diaryStatus: TeacherDiaryStatus;
  status: LessonPlanStatus;
  reviewStatus: string;
  reviewRemarks?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  originalLessonPlanId?: string;
};

export type TeacherDiaryRow = {
  id: string;
  lessonPlanId: string;
  actualDate: string;
  classConducted: boolean;
  actualTopicTaught: string;
  actualContentSummary: string;
  completionPercentage: number;
  studentResponse: string;
  homeworkAssigned: string;
  resourcesUsed: string;
  missedReason?: MissedReason;
  rescheduledToDate?: string;
  teacherRemarks: string;
  status: Exclude<TeacherDiaryStatus, 'Not Started'>;
  reviewRemarks?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  submittedAt?: string;
};

export type LessonPlanSetting = {
  academicYear: string;
  approvalMode: ReviewMode;
  allowBackDateEntry: boolean;
  maxBackDateDays: number;
  allowProgressDecrease: boolean;
  autoUpdateChapterProgress: boolean;
  requireDiaryForEveryPlannedLesson: boolean;
  isActive: boolean;
};

export type NotificationEventRow = {
  event: string;
  audience: string;
  sampleMessage: string;
  enabled: boolean;
};

export const todayIso = dayjs().format('YYYY-MM-DD');
export const weekStartIso = dayjs().startOf('week').add(1, 'day').format('YYYY-MM-DD');

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

export const teachingMethodOptions = [
  { value: 'Explanation + Board Work', label: 'Explanation + Board Work' },
  { value: 'Activity Based', label: 'Activity Based' },
  { value: 'Lab Demonstration', label: 'Lab Demonstration' },
  { value: 'Group Discussion', label: 'Group Discussion' },
  { value: 'Worksheet Practice', label: 'Worksheet Practice' },
];

export const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Cancelled', label: 'Cancelled' },
];

export const diaryStatusOptions = [
  { value: 'all', label: 'All Diary Status' },
  { value: 'Not Started', label: 'Not Started' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
];

export const missedReasonOptions = [
  { value: 'Holiday', label: 'Holiday' },
  { value: 'Exam', label: 'Exam' },
  { value: 'Teacher Absent', label: 'Teacher Absent' },
  { value: 'School Event', label: 'School Event' },
  { value: 'Class Unavailable', label: 'Class Unavailable' },
  { value: 'Other', label: 'Other' },
];

export const reviewModeOptions = [
  { value: 'NoApproval', label: 'No Approval' },
  { value: 'HodApproval', label: 'HOD Approval' },
  { value: 'PrincipalApproval', label: 'Principal Approval' },
  { value: 'BothHodAndPrincipal', label: 'HOD + Principal' },
];

export const initialLessonPlans: LessonPlanRow[] = [
  {
    id: 'lp-1',
    academicYear: '2026-27',
    teacherName: 'Rohit Mehta',
    className: '7',
    divisionName: 'A',
    subjectName: 'Mathematics',
    chapterName: 'Fractions',
    plannedDate: todayIso,
    period: 'Period 2',
    plannedTime: '10:00 - 10:45',
    topic: 'Addition of Fractions',
    learningObjective: 'Students will add like and unlike fractions using LCM.',
    teachingMethod: 'Explanation + Board Work',
    resourcesRequired: 'Fraction strips, worksheet 3.1',
    plannedCompletionPercentage: 40,
    actualCompletionPercentage: 40,
    existingChapterProgress: 35,
    diaryStatus: 'Submitted',
    status: 'Approved',
    reviewStatus: 'Diary Pending Approval',
    reviewedBy: 'HOD Mathematics',
    reviewedAt: dayjs().subtract(1, 'day').toISOString(),
  },
  {
    id: 'lp-2',
    academicYear: '2026-27',
    teacherName: 'Anita Sharma',
    className: '8',
    divisionName: 'B',
    subjectName: 'Science',
    chapterName: 'Light',
    plannedDate: dayjs(todayIso).add(1, 'day').format('YYYY-MM-DD'),
    period: 'Period 3',
    plannedTime: '11:00 - 11:45',
    topic: 'Reflection from Plane Mirror',
    learningObjective: 'Students will identify incident ray, reflected ray, and normal.',
    teachingMethod: 'Lab Demonstration',
    resourcesRequired: 'Mirror, laser pointer, ray diagram chart',
    plannedCompletionPercentage: 25,
    actualCompletionPercentage: 0,
    existingChapterProgress: 10,
    diaryStatus: 'Not Started',
    status: 'Submitted',
    reviewStatus: 'Plan Pending Approval',
  },
  {
    id: 'lp-3',
    academicYear: '2026-27',
    teacherName: 'Farah Khan',
    className: '9',
    divisionName: 'A',
    subjectName: 'English',
    chapterName: 'Grammar: Tenses',
    plannedDate: dayjs(todayIso).subtract(1, 'day').format('YYYY-MM-DD'),
    period: 'Period 1',
    plannedTime: '09:00 - 09:45',
    topic: 'Past Perfect Tense',
    learningObjective: 'Students will form past perfect sentences in context.',
    teachingMethod: 'Worksheet Practice',
    resourcesRequired: 'Grammar worksheet, smart board examples',
    plannedCompletionPercentage: 60,
    actualCompletionPercentage: 55,
    existingChapterProgress: 55,
    diaryStatus: 'Approved',
    status: 'Approved',
    reviewStatus: 'Progress Synced',
    reviewedBy: 'Principal',
    reviewedAt: dayjs().subtract(10, 'hour').toISOString(),
  },
  {
    id: 'lp-4',
    academicYear: '2026-27',
    teacherName: 'Kiran Patel',
    className: '10',
    divisionName: 'C',
    subjectName: 'Social Studies',
    chapterName: 'Indian Constitution',
    plannedDate: todayIso,
    period: 'Period 4',
    plannedTime: '12:00 - 12:45',
    topic: 'Fundamental Rights',
    learningObjective: 'Students will explain six fundamental rights with examples.',
    teachingMethod: 'Group Discussion',
    resourcesRequired: 'Civics chart, textbook examples',
    plannedCompletionPercentage: 30,
    actualCompletionPercentage: 0,
    existingChapterProgress: 20,
    diaryStatus: 'Rejected',
    status: 'Approved',
    reviewStatus: 'Diary Correction Requested',
    reviewRemarks: 'Add clearer evidence of student response.',
  },
  {
    id: 'lp-5',
    academicYear: '2026-27',
    teacherName: 'Nisha Rao',
    className: '8',
    divisionName: 'A',
    subjectName: 'ICT',
    chapterName: 'Internet Safety',
    plannedDate: dayjs(todayIso).add(2, 'day').format('YYYY-MM-DD'),
    period: 'Period 5',
    plannedTime: '13:30 - 14:15',
    topic: 'Password Hygiene',
    learningObjective: 'Students will identify strong passwords and phishing signals.',
    teachingMethod: 'Activity Based',
    resourcesRequired: 'Projector, safety checklist',
    plannedCompletionPercentage: 20,
    actualCompletionPercentage: 0,
    existingChapterProgress: 0,
    diaryStatus: 'Not Started',
    status: 'Draft',
    reviewStatus: 'Draft',
  },
];

export const initialDiaryEntries: TeacherDiaryRow[] = [
  {
    id: 'diary-1',
    lessonPlanId: 'lp-1',
    actualDate: todayIso,
    classConducted: true,
    actualTopicTaught: 'Addition of like and unlike fractions',
    actualContentSummary: 'Used number-line examples and LCM method for unlike denominators.',
    completionPercentage: 40,
    studentResponse: 'Good response; four students need extra practice with LCM.',
    homeworkAssigned: 'Exercise 3.1, Q1-Q8',
    resourcesUsed: 'Fraction strips, worksheet',
    teacherRemarks: 'Will start word problems next period.',
    status: 'Submitted',
    submittedAt: dayjs().subtract(1, 'hour').toISOString(),
  },
  {
    id: 'diary-2',
    lessonPlanId: 'lp-3',
    actualDate: dayjs(todayIso).subtract(1, 'day').format('YYYY-MM-DD'),
    classConducted: true,
    actualTopicTaught: 'Past Perfect Tense',
    actualContentSummary: 'Sentence formation, timeline usage, and correction practice.',
    completionPercentage: 55,
    studentResponse: 'Most students understood timeline sequence after examples.',
    homeworkAssigned: 'Write 10 sentences using past perfect tense',
    resourcesUsed: 'Grammar worksheet, smart board',
    teacherRemarks: 'Approved progress synced to chapter progress.',
    status: 'Approved',
    submittedAt: dayjs().subtract(1, 'day').toISOString(),
    reviewedBy: 'Principal',
    reviewedAt: dayjs().subtract(10, 'hour').toISOString(),
  },
  {
    id: 'diary-3',
    lessonPlanId: 'lp-4',
    actualDate: todayIso,
    classConducted: false,
    actualTopicTaught: '',
    actualContentSummary: '',
    completionPercentage: 0,
    studentResponse: '',
    homeworkAssigned: '',
    resourcesUsed: '',
    missedReason: 'School Event',
    rescheduledToDate: dayjs(todayIso).add(3, 'day').format('YYYY-MM-DD'),
    teacherRemarks: 'Class engaged in annual day rehearsal.',
    status: 'Rejected',
    reviewRemarks: 'Clarify whether rescheduled period is confirmed.',
    submittedAt: dayjs().subtract(2, 'hour').toISOString(),
  },
];

export const initialSettings: LessonPlanSetting = {
  academicYear: '2026-27',
  approvalMode: 'HodApproval',
  allowBackDateEntry: true,
  maxBackDateDays: 3,
  allowProgressDecrease: false,
  autoUpdateChapterProgress: true,
  requireDiaryForEveryPlannedLesson: true,
  isActive: true,
};

export const notificationEvents: NotificationEventRow[] = [
  {
    event: 'LessonPlan.Submitted',
    audience: 'HOD / Principal',
    sampleMessage: 'A weekly lesson plan is ready for review.',
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
    event: 'Syllabus.DelayDetected',
    audience: 'Principal',
    sampleMessage: 'A class is behind the planned syllabus pace.',
    enabled: false,
  },
];

export const periodTimeMap: Record<string, string> = {
  'Period 1': '09:00 - 09:45',
  'Period 2': '10:00 - 10:45',
  'Period 3': '11:00 - 11:45',
  'Period 4': '12:00 - 12:45',
  'Period 5': '13:30 - 14:15',
};

export const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
