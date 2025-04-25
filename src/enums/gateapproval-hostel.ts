export enum HostelGateVerificationStatusType {
  Pending,
  OnLeave,
  Returned,
}

export const HostelGateVerificationStatusOptions = [
  {
    label: 'Pending',
    value: HostelGateVerificationStatusType.Pending,
  },
  {
    label: 'On Leave',
    value: HostelGateVerificationStatusType.OnLeave,
  },
  {
    label: 'Returned',
    value: HostelGateVerificationStatusType.Returned,
  },
];

export const HostelGateVerificationStatusColor = {
  [HostelGateVerificationStatusType.Pending]: 'warning',
  [HostelGateVerificationStatusType.OnLeave]: 'error',
  [HostelGateVerificationStatusType.Returned]: 'primary',
};
