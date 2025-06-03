export enum EntranceExamStatusType {
  Pending,
  Pass,
  Fail,
}

export const EntranceExamStatusOptions = [
  {
    label: 'Pending',
    value: EntranceExamStatusType.Pending,
  },
  {
    label: 'Pass',
    value: EntranceExamStatusType.Pass,
  },
  {
    label: 'Fail',
    value: EntranceExamStatusType.Fail,
  },
];

export const EntranceExamStatusTypeColors = {
  [EntranceExamStatusType.Pending]: 'warning',
  [EntranceExamStatusType.Pass]: 'success',
  [EntranceExamStatusType.Fail]: 'error',
};
