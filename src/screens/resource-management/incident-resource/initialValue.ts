import type { IIncidentResourceStatusFormValues } from './incident-resource-interface';

export function getInitialIncidentResourceStatusValues(
  data: Partial<IIncidentResourceStatusFormValues> = {},
  isEdit = false
): IIncidentResourceStatusFormValues {
  return {
    incidentName: data.incidentName || '',
    resourceName: data.resourceName || '',
    status: data.status || '',
    reportedBy: data.reportedBy || '',
    reportedDate: data.reportedDate || '',
    reporterRole: data.reporterRole || '',
    reporterdepartment: data.reporterdepartment || '',
    incidentDescription: data.incidentDescription || '',
    incidentType: data.incidentType || '',
    actionTaken: data.actionTaken || '',
    adminNotes: data.adminNotes || '',
  };
}
