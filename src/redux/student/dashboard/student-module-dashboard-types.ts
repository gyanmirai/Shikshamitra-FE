export type StudentDashboardMode = 'admin' | 'leadership' | 'teacher' | 'common';
export type StudentDashboardSectionKey = 'records' | 'admissions' | 'attendance';
export type StudentModuleDashboardLink = {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: string;
  permission: string;
  visibilityPermission: string;
};
export type StudentModuleDashboardContext = {
  mode: StudentDashboardMode;
  displayName: string;
  scopeLabel: string;
  sections: StudentDashboardSectionKey[];
  links: StudentModuleDashboardLink[];
  myStudents: { studentId: string; name: string; relationship: string }[];
};
export type StudentModuleDashboardMetric = {
  id: string;
  label: string;
  value: number;
  tone: 'neutral' | 'success' | 'warning';
  href: string;
  permission: string;
};
export type StudentModuleDashboardSection = {
  key: StudentDashboardSectionKey;
  academicYearId: string;
  generatedAt: string;
  description: string;
  metrics: StudentModuleDashboardMetric[];
  classStrength: StudentDashboardClassStrength[];
  classStrengthTotalCount?: number;
  attentionItems?: StudentDashboardAttentionItem[];
  attentionTotalCount?: number;
  workGroups?: StudentModuleDashboardMetric[];
  onboardingTasks?: StudentModuleDashboardMetric[];
  attendanceToday?: StudentDashboardAttendanceToday | null;
};
export type StudentDashboardClassStrength = {
  standardId: string | null;
  label: string;
  students: number;
  href: string;
  divisions?: { divisionId: string | null; label: string; students: number; href: string }[];
};
export type StudentDashboardAttentionItem = {
  caseId: string;
  studentId: string;
  studentName: string;
  className: string;
  divisionName: string | null;
  blocker: string;
  ownerName: string | null;
  dueAt: string | null;
  href: string;
};
export type StudentDashboardAttendanceToday = {
  schoolDate: string;
  timeZone?: string;
  availability: 'available' | 'outsideYear' | 'noExpected';
  provisional: boolean;
  expected: number | null;
  missing: number | null;
  draft: number | null;
  submitted: number | null;
  review: number | null;
  href: string;
};
export type StudentDashboardScope = {
  boardId?: string;
  mediumId?: string;
  standardId?: string;
  divisionId?: string;
};
export type StudentDashboardFilterOptions = {
  boards: { id: string; name: string; parentId?: string | null }[];
  mediums: { id: string; name: string; parentId?: string | null }[];
  standards: { id: string; name: string; parentId?: string | null }[];
  divisions: { id: string; name: string; parentId?: string | null }[];
};
// Local cache partition only; authorization always comes from the authenticated API.
export type StudentDashboardQueryIdentity = { identityKey: string };
export type StudentDashboardSectionInput = StudentDashboardQueryIdentity &
  StudentDashboardScope & {
    section: StudentDashboardSectionKey;
    academicYearId: string;
  };
