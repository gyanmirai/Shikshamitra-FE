export enum MemberStatusType {
  Active,
  Inactive,
}

export const MemberStatusOptions = [
  {
    label: 'Active',
    value: MemberStatusType.Active,
  },
  {
    label: 'Inactive',
    value: MemberStatusType.Inactive,
  },
];

export const MemberStatusTypeColors = {
  [MemberStatusType.Active]: 'success',
  [MemberStatusType.Inactive]: 'warning',
};
