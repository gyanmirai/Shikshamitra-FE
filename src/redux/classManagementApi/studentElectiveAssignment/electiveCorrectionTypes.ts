export interface ElectiveCorrectionRequest {
  academicMediumId: string;
  classId: string;
  divisionId: string;
  electiveGroupId: string;
  studentId: string;
  selectedSubjectId: string;
  preferredSubjectId: string | null;
  reason: string;
}

export interface ElectiveCorrectionReview {
  reviewToken: string;
  expiresAt: string;
  studentName: string;
  previousSubject: string;
  selectedSubject: string;
  previousPreference: string | null;
  preferredSubject: string | null;
  impacts: Array<{
    area: string;
    recordId: string | null;
    description: string;
    severity: 'warning' | 'info';
  }>;
}
