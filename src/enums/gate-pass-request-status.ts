export enum GatePassRequestStatusType {
  Pending,
  Approved,
}

export const GatePassRequestStatusOptions = [
  {
    label: 'Pending',
    value: GatePassRequestStatusType.Pending,
  },
  {
    label: 'Appproved',
    value: GatePassRequestStatusType.Approved,
  },
];

export const GatePassRequestStatusColor = {
  [GatePassRequestStatusType.Pending]: 'warning',
  [GatePassRequestStatusType.Approved]: 'success',
};
