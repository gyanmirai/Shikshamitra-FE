export enum ResourceMaintenanceRequestStatusType {
  Pending,
  'Under Maintenance',
  'Repair Completed',
  'Not Repairable',
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
    label: 'Not Repairable',
    value: ResourceMaintenanceRequestStatusType['Not Repairable'],
  },
];

export const ResourceMaintenanceRequestStatusTypeColors = {
  [ResourceMaintenanceRequestStatusType.Pending]: 'warning',
  [ResourceMaintenanceRequestStatusType['Under Maintenance']]: 'info',
  [ResourceMaintenanceRequestStatusType['Repair Completed']]: 'success',
  [ResourceMaintenanceRequestStatusType['Not Repairable']]: 'error',
};
