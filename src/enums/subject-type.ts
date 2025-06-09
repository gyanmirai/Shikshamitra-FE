export enum SubjectType {
  Core,
  Elective,
}

export const SubjectTypeOptions = [
  {
    label: 'Core',
    value: SubjectType.Core,
  },
  {
    label: 'Elective',
    value: SubjectType.Elective,
  },
];

export const SubjectTypeColors = {
  [SubjectType.Core]: 'primary',
  [SubjectType.Elective]: 'secondary',
};
