export enum CreateGatePassStatusType {
  Yes,
  No,
}

export const CreateGatePassRequestStatusOptions = [
  {
    label: 'Yes',
    value: CreateGatePassStatusType.Yes,
  },
  {
    label: 'Appproved',
    value: CreateGatePassStatusType.No,
  },
];

export const CreateGatePassRequestStatusColor = {
  [CreateGatePassStatusType.Yes]: 'warning',
  [CreateGatePassStatusType.No]: 'success',
};
