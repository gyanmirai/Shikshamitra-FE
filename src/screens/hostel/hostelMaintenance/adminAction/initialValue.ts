import type { IAssignedToMaintenanceWarden } from './saftey-management-admin-action-interface';

export function getAssignedToMaintenanceWardenInitialValues(
  data: Partial<IAssignedToMaintenanceWarden> | null = null
): IAssignedToMaintenanceWarden {
  return {
    wardenName: data?.wardenName || '',
    assignedDeadline: data?.assignedDeadline || null,
    updateStatus: data?.updateStatus || '',
    notes: data?.notes || '',
  };
}
export function getMaintenanceResolvedInitialValues() {
  return {
    notes: '',
  };
}
