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
