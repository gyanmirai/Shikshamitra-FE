export const academicInsightsSectionKeys = [
  'classrooms', 'student360', 'calendar', 'curriculum', 'lesson', 'timetable',
  'tasks', 'evaluation', 'exams', 'reports', 'notifications', 'audits', 'settings',
] as const;

export type AcademicInsightsSectionKey = (typeof academicInsightsSectionKeys)[number];
export type AcademicInsightsStatus = 'ready' | 'empty' | 'unavailable' | 'error';

export type AcademicInsightsMetric = {
  key: string;
  label: string;
  value: number | null;
  unit?: string | null;
};

export type AcademicInsightsPoint = {
  key: string;
  label: string;
  value: number;
  x?: number | null;
  y?: number | null;
  status?: string | null;
};

export type AcademicInsightsSeries = {
  name: string;
  points: AcademicInsightsPoint[];
};

export type AcademicInsightsItem = {
  id: string;
  label: string;
  detail?: string | null;
  date?: string | null;
  status?: string | null;
  value?: number | null;
};

export type AcademicInsightsSection = {
  key: AcademicInsightsSectionKey;
  status: AcademicInsightsStatus;
  summary: string;
  metrics: AcademicInsightsMetric[];
  series: AcademicInsightsSeries[];
  items: AcademicInsightsItem[];
};

export type AcademicInsightsStudent = { id: string; label: string };

export type AcademicInsightsResponse = {
  role: string;
  scopeLabel: string;
  generatedAt: string;
  sections: AcademicInsightsSection[];
  students?: AcademicInsightsStudent[];
};

export type AcademicInsightsInput = {
  academicYearId: string;
  boardId: string;
  educationMediumId: string;
  standardId?: string;
  divisionId?: string;
  studentId?: string;
};
