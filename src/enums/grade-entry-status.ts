export enum ExamGradeStatusType {
  Pending = 0,
  Assigned = 1,
}

export const ExamGradeStatusOptions = [
  {
    label: 'Pending',
    value: ExamGradeStatusType.Pending,
  },
  {
    label: 'Assigned',
    value: ExamGradeStatusType.Assigned,
  },
];

export const ExamGradeStatusColor = {
  [ExamGradeStatusType.Pending]: 'warning',
  [ExamGradeStatusType.Assigned]: 'success',
};

// Full marks entry workflow status
export enum GradeEntryWorkflowStatus {
  Draft = 0,
  Submitted = 1,
  Verified = 2,
  Published = 3, // Published = Locked (final state)
}

export const GradeEntryWorkflowStatusLabel: Record<GradeEntryWorkflowStatus, string> = {
  [GradeEntryWorkflowStatus.Draft]: 'Draft',
  [GradeEntryWorkflowStatus.Submitted]: 'Submitted',
  [GradeEntryWorkflowStatus.Verified]: 'Verified',
  [GradeEntryWorkflowStatus.Published]: 'Published',
};

export const GradeEntryWorkflowStatusColor: Record<GradeEntryWorkflowStatus, string> = {
  [GradeEntryWorkflowStatus.Draft]: 'default',
  [GradeEntryWorkflowStatus.Submitted]: 'info',
  [GradeEntryWorkflowStatus.Verified]: 'warning',
  [GradeEntryWorkflowStatus.Published]: 'success',
};

export const GradeEntryWorkflowStatusOptions = Object.entries(GradeEntryWorkflowStatusLabel).map(
  ([value, label]) => ({ label, value: Number(value) })
);

// Student attendance status for exam
export enum AttendanceStatus {
  Present = 0,
  Absent = 1,
  MedicalLeave = 2,
  Exempted = 3,
}

export const AttendanceStatusLabel: Record<AttendanceStatus, string> = {
  [AttendanceStatus.Present]: 'Present',
  [AttendanceStatus.Absent]: 'Absent',
  [AttendanceStatus.MedicalLeave]: 'Medical Leave',
  [AttendanceStatus.Exempted]: 'Exempted',
};

export const AttendanceStatusColor: Record<AttendanceStatus, string> = {
  [AttendanceStatus.Present]: 'success',
  [AttendanceStatus.Absent]: 'error',
  [AttendanceStatus.MedicalLeave]: 'warning',
  [AttendanceStatus.Exempted]: 'info',
};

export const AttendanceStatusOptions = Object.entries(AttendanceStatusLabel).map(
  ([value, label]) => ({ label, value: Number(value) })
);
