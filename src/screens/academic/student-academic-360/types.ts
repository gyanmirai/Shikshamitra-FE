export type Academic360StudentRow = {
  id?: string;
  studentId?: string;
  studentName?: string;
  profileImageUrl?: string | null;
  photoUrl?: string | null;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  grNo?: string | number | null;
  rollNo?: string | number | null;
  standardId?: string;
  standard?: string;
  standardName?: string;
  divisionId?: string;
  division?: string;
  divisionName?: string;
  academicYearName?: string;
  academicMediumName?: string;
  gender?: string | number | null;
  operationalStatus?: string | number | null;
  status?: string | number | null;
  attendance?: Academic360Metric | number | null;
  homework?: Academic360Metric | null;
  examAverage?: Academic360Metric | number | null;
  trend?: string | null;
  academicHealth?: string | null;
  academicHealthReasons?: string[];
  alertCount?: number | null;
  activeInterventionCount?: number | null;
  dataCompleteness?: string | Academic360DataCompleteness | null;
  lastUpdatedAt?: string | null;
  updatedAt?: string | null;
};

export type Academic360ApiList<T> = {
  items?: T[];
  totalCount?: number;
};

export type Academic360Record = Record<string, unknown>;

export type Academic360Metric = {
  value?: number | null;
  percentage?: number | null;
  completed?: number | null;
  total?: number | null;
  pending?: number | null;
  count?: number | null;
  status?: string | null;
  label?: string | null;
};

export type Academic360Attendance = {
  totalDays?: number;
  presentDays?: number;
  absentDays?: number;
  pendingDays?: number;
  percentage?: number;
  recentHistory?: Academic360Record[];
};

export type Academic360LearningTask = {
  id?: string;
  type?: string;
  title?: string;
  subjectName?: string;
  dueDate?: string;
  status?: string;
  marks?: number | null;
  totalMarks?: number | null;
  feedback?: string | null;
  resubmissionRequired?: boolean;
  submittedAt?: string | null;
  evaluatedAt?: string | null;
  isOverdue?: boolean;
};

export type Academic360LearningTasks = {
  totalAssigned?: number;
  submitted?: number;
  pending?: number;
  late?: number;
  reviewed?: number;
  pendingEvaluation?: number;
  resubmissionRequired?: number;
  submittedOnTime?: number;
  recentTasks?: Academic360LearningTask[];
};

export type Academic360ExamResult = {
  examId?: string;
  examName?: string;
  resultStatus?: string;
  rank?: number | null;
  totalMarks?: number;
  obtainedMarks?: number;
  percentage?: number;
  grade?: string;
  subjects?: Academic360Record[];
};

export type Academic360SubjectPerformance = {
  subjectId?: string;
  subjectName?: string;
  examCount?: number;
  averagePercentage?: number;
  latestGrade?: string;
};

export type Academic360Alert = {
  severity?: string;
  title?: string;
  message?: string;
  source?: string;
  evidence?: string;
  suggestedAction?: string;
  date?: string;
};

export type Academic360Kpi = {
  key?: string;
  label?: string;
  displayValue?: string;
  unit?: string;
  status?: string;
  trend?: string;
  dataSource?: string;
  tooltip?: string;
};

export type Academic360HealthFactor = {
  label?: string;
  earned?: number;
  maximum?: number;
  evidence?: string;
};

export type Academic360Health = {
  score?: number | null;
  status?: string;
  trend?: string;
  explanation?: string;
  factors?: Academic360HealthFactor[];
};

export type Academic360UpcomingItem = {
  date?: string;
  time?: string;
  title?: string;
  type?: string;
  status?: string;
  isOverdue?: boolean;
};

export type Academic360TimelineEvent = {
  date?: string;
  type?: string;
  title?: string;
  description?: string;
  severity?: string;
  source?: string;
};

export type Academic360Achievement = {
  title?: string;
  description?: string;
  source?: string;
};

export type Academic360Intervention = {
  id?: string | null;
  concern?: string;
  goal?: string;
  owner?: string;
  startDate?: string | null;
  reviewDate?: string | null;
  status?: string;
  progress?: number;
  outcome?: string;
};

export type Academic360DataCompleteness = {
  percentage?: number;
  status?: string;
  missingItems?: string[];
  availableItems?: string[];
};

export type Academic360Permissions = {
  canViewRank?: boolean;
  canViewParentContact?: boolean;
  canCreateIntervention?: boolean;
  canAddObservation?: boolean;
  canDownloadReport?: boolean;
};

export type Academic360Response = {
  student?: Academic360StudentRow;
  academicHealth?: Academic360Health | null;
  kpis?: Academic360Kpi[];
  attendance?: Academic360Attendance;
  timetable?: unknown;
  learningTasks?: Academic360LearningTasks;
  exams?: Academic360ExamResult[];
  subjectPerformance?: Academic360SubjectPerformance[];
  alerts?: Academic360Alert[];
  upcomingItems?: Academic360UpcomingItem[];
  timeline?: Academic360TimelineEvent[];
  achievements?: Academic360Achievement[];
  interventions?: Academic360Intervention[];
  dataCompleteness?: Academic360DataCompleteness;
  permissions?: Academic360Permissions;
};

export const readText = (value: unknown, fallback = '-'): string => {
  if (typeof value === 'string' && value.trim()) return value;
  if (typeof value === 'number') return String(value);
  return fallback;
};

export const readOptionalText = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
};

export const getStudentId = (student: Academic360StudentRow): string => {
  const studentId = readOptionalText(student.studentId).trim();
  return studentId || readOptionalText(student.id).trim();
};

export const getStudentName = (student: Academic360StudentRow): string => {
  const directName = readOptionalText(student.studentName);
  if (directName) return directName;

  return [student.firstName, student.middleName, student.lastName]
    .map(readOptionalText)
    .filter(Boolean)
    .join(' ');
};
