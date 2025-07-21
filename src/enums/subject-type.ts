export enum SubjectType {
  Core,
  Elective,
}

export const SubjectTypeOptions = [
  {
    label: 'Core',
    value: SubjectType[0],
  },
  {
    label: 'Elective',
    value: SubjectType[1],
  },
];

export const SubjectTypeColors = {
  [SubjectType.Core]: 'primary',
  [SubjectType.Elective]: 'secondary',
};
