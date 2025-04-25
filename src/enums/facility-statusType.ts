export enum FacilityStatusType {
  Occupied,
  Available,
  Maintenance,
}

export const FacilityStatusTypeOptions = [
  {
    label: 'Available',
    value: FacilityStatusType.Available,
  },
  {
    label: 'Occupied',
    value: FacilityStatusType.Occupied,
  },
  {
    label: 'Maintenance',
    value: FacilityStatusType.Maintenance,
  },
];

export const FacilityStatusTypeColor = {
  [FacilityStatusType.Available]: 'success',
  [FacilityStatusType.Occupied]: 'error',
  [FacilityStatusType.Maintenance]: 'info',
};
