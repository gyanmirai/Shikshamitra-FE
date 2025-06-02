export enum SubjectType {
  core,
  elective,
}

export const SubjectTypeOptions = [
  {
    label: 'core',
    value: SubjectType.core,
  },
  {
    label: 'elective',
    value: SubjectType.elective,
  },
];

export const SubjectTypeColors = {
  [SubjectType.core]: 'primary',
  [SubjectType.elective]: 'secondary',
};
