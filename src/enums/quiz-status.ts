export enum QuizStatusType {
  Pass,
  Fail,
  Pending,
}

export const QuizStatusOptions = [
  {
    label: 'Pass',
    value: QuizStatusType.Pass,
  },
  {
    label: 'Fail',
    value: QuizStatusType.Fail,
  },
  {
    label: 'Pending',
    value: QuizStatusType.Pending,
  },
];

export const QuizStatusTypeColors = {
  [QuizStatusType.Pass]: 'primary',
  [QuizStatusType.Fail]: 'error',
  [QuizStatusType.Pending]: 'warning',
};
