import type { StudentOnboardingItem } from './student-onboarding-model';

export type StudentSetupView =
  'readiness' | 'gr-number' | 'roll-number' | 'division' | 'fees' | 'credentials';

export type StudentSetupTaskScope = 'pending' | 'all';

export const studentSetupViews: Array<{
  value: StudentSetupView;
  label: string;
  icon: string;
}> = [
  { value: 'readiness', label: 'Readiness', icon: 'mdi:clipboard-check-outline' },
  { value: 'gr-number', label: 'GR Number', icon: 'mdi:identifier' },
  { value: 'roll-number', label: 'Roll Number', icon: 'mdi:format-list-numbered' },
  { value: 'division', label: 'Division', icon: 'mdi:google-classroom' },
  { value: 'fees', label: 'Fees', icon: 'mdi:receipt-text-outline' },
  { value: 'credentials', label: 'Credentials', icon: 'mdi:account-key-outline' },
];

const validViews = new Set<StudentSetupView>(studentSetupViews.map((view) => view.value));

const hasValue = (value: string | number | null | undefined) =>
  value !== undefined && value !== null && String(value).trim().length > 0;

export const hasAssignedGrNumber = (student: StudentOnboardingItem) => hasValue(student.grNo);

export const hasAssignedRollNumber = (student: StudentOnboardingItem) => hasValue(student.rollNo);

export const hasAssignedDivision = (student: StudentOnboardingItem) =>
  student.source === 'onboarding-case'
    ? hasValue(student.divisionId)
    : hasValue(student.divisionName) && student.divisionName.trim() !== '—';

export const hasConfirmedFees = (student: StudentOnboardingItem) =>
  student.feeStructureConfirmed === true;
export const hasCompletedCredentials = (student: StudentOnboardingItem) =>
  student.credentialsPending !== undefined
    ? !student.credentialsPending
    : [student.studentAccountStatus, student.guardianAccountStatus].every((status) =>
        ['ready', 'not-required'].includes(status)
      );

export const parseStudentSetupView = (value: string | null): StudentSetupView =>
  value && validViews.has(value as StudentSetupView) ? (value as StudentSetupView) : 'readiness';

export function studentSetupTaskHref(
  pathname: string,
  search: string,
  studentId: string,
  view: StudentSetupView
) {
  const params = new URLSearchParams(search);
  params.set('view', view);
  params.set('case', studentId);
  if (view !== 'readiness') {
    params.delete('stage');
    params.delete('today');
  }
  return `${pathname}?${params.toString()}`;
}

export const getDefaultTaskScope = (view: StudentSetupView): StudentSetupTaskScope =>
  view === 'division' ? 'all' : 'pending';

export const parseStudentSetupTaskScope = (
  value: string | null,
  view: StudentSetupView
): StudentSetupTaskScope =>
  value === 'pending' || value === 'all' ? value : getDefaultTaskScope(view);

export const getPendingStudentCount = (
  students: StudentOnboardingItem[],
  view: StudentSetupView
) => {
  if (view === 'gr-number') {
    return students.filter((student) => !hasAssignedGrNumber(student)).length;
  }

  if (view === 'roll-number') {
    return students.filter((student) => !hasAssignedRollNumber(student)).length;
  }

  if (view === 'division') {
    return students.filter((student) => !hasAssignedDivision(student)).length;
  }

  if (view === 'fees') return students.filter((student) => !hasConfirmedFees(student)).length;
  if (view === 'credentials')
    return students.filter((student) => !hasCompletedCredentials(student)).length;

  return students.length;
};

export const filterStudentsForSetupView = (
  students: StudentOnboardingItem[],
  view: StudentSetupView,
  scope: StudentSetupTaskScope
) => {
  if (view === 'readiness' || scope === 'all') return students;

  if (view === 'gr-number') {
    return students.filter((student) => !hasAssignedGrNumber(student));
  }

  if (view === 'roll-number') {
    return students.filter((student) => !hasAssignedRollNumber(student));
  }

  if (view === 'fees') return students.filter((student) => !hasConfirmedFees(student));
  if (view === 'credentials')
    return students.filter((student) => !hasCompletedCredentials(student));

  return students.filter((student) => !hasAssignedDivision(student));
};
