export enum ExamGradeStatusType {
  Pending,
  Assigned,
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
