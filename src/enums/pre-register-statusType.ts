export enum PreRegisterStatusType {
  Pending,
  Approved,
}

export const PreRegisterStatusOptions = [
  {
    label: 'Pending',
    value: PreRegisterStatusType.Pending,
  },
  {
    label: 'Approved',
    value: PreRegisterStatusType.Approved,
  },
];

export const PreRegisterStatusColors = {
  [PreRegisterStatusType.Pending]: 'warning',
  [PreRegisterStatusType.Approved]: 'success',
};
