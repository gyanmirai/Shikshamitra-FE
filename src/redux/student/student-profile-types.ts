export type StudentRecordProfile = {
  id: string;
  studentId: string;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  grNo: number | null;
  grNumber: string | null;
  rollNo: number | null;
  standardId: string | null;
  standardName: string | null;
  divisionId: string | null;
  divisionName: string | null;
  academicMediumId: string;
  academicMediumName: string | null;
  status: number;
  dateOfBirth: string | null;
  gender: number | null;
  academicYearId?: string | null;
  admissionOnboarding?: {
    applicationId: string;
    applicationNumber: string;
    academicYearId: string;
    finalizedAt?: string | null;
    onboardingCaseId: string;
    status: string;
    activatedAt?: string | null;
    completedAt?: string | null;
    credentialsStatus?: string | null;
  }[];
  recordsAccess?: 'Full' | 'Summary';
  entrySource?: 'ActivatedOnboarding' | 'CompletedOnboarding' | 'LegacyOverride' | 'Provisioning';
  placementEditable?: boolean;
  maskedFields?: string[];
  enrollmentHistory?: {
    id: string;
    academicYearId: string;
    academicYearName?: string | null;
    standardName?: string | null;
    divisionName?: string | null;
    rollNumber?: number | null;
    isActive: boolean;
    onboardingCaseId?: string | null;
  }[];
};

const studentGuid = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;

export function unwrapStudentRecordProfile(response: unknown): StudentRecordProfile | null {
  const value =
    response && typeof response === 'object' && 'data' in response ? response.data : response;
  if (
    !value ||
    typeof value !== 'object' ||
    !('id' in value) ||
    typeof value.id !== 'string' ||
    !studentGuid.test(value.id) ||
    !('studentId' in value) ||
    typeof value.studentId !== 'string' ||
    value.studentId.toLowerCase() !== value.id.toLowerCase()
  ) {
    return null;
  }
  return value as StudentRecordProfile;
}
