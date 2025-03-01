export enum StudentEnrollmentReportType {
  EnrollmentByGender,
  EnrollmentByAge,
}

export const StudentEnrollmentReportTypeOptions = [
  {
    label: 'Enrollment By Gender',
    value: StudentEnrollmentReportType.EnrollmentByGender,
  },
  {
    label: 'Enrollment By Age',
    value: StudentEnrollmentReportType.EnrollmentByAge,
  },
];
