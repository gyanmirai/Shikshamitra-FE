export enum ResourceMaintenanceRequestStatusType {
  Pending,
  'Under Maintenance',
  'Repair Completed',
  'Not Repaired',
}

export const ResourceMaintenanceRequestStatusTypeOptions = [
  {
    label: 'Pending',
    value: ResourceMaintenanceRequestStatusType.Pending,
  },
  {
    label: 'Under Maintenance',
    value: ResourceMaintenanceRequestStatusType['Under Maintenance'],
  },
  {
    label: 'Repair Completed',
    value: ResourceMaintenanceRequestStatusType['Repair Completed'],
  },
  {
    label: 'Not Repaired',
    value: ResourceMaintenanceRequestStatusType['Not Repaired'],
  },
];

export const ResourceMaintenanceRequestStatusTypeColors = {
  [ResourceMaintenanceRequestStatusType.Pending]: 'warning',
  [ResourceMaintenanceRequestStatusType['Under Maintenance']]: 'info',
  [ResourceMaintenanceRequestStatusType['Repair Completed']]: 'success',
  [ResourceMaintenanceRequestStatusType['Not Repaired']]: 'error',
};
