export interface PendingAssignmentStudent {
  studentId: string;
  studentName?: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: number;
  contactNo: string;
  address: string;
  remarks: string;
  applicationNo: string;
  admissionNo: string | null;
  admissionDate: string | null;
  formNo: string;
  grNo: number | null;
  rollNo: number | null;
  academicYearName: string;
  academicMediumName: string;
  educationMediumStageName: string;
  standardName: string;
  divisionName: string;
}

export interface PendingAssignmentResponse {
  items: PendingAssignmentStudent[];
  totalCount: number;
}
