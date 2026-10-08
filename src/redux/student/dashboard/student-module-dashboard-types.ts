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
  classStrength: { standardId: string | null; label: string; students: number; href: string }[];
};
// Local cache partition only; authorization always comes from the authenticated API.
export type StudentDashboardQueryIdentity = { identityKey: string };
export type StudentDashboardSectionInput = StudentDashboardQueryIdentity & {
  section: StudentDashboardSectionKey;
  academicYearId: string;
};
