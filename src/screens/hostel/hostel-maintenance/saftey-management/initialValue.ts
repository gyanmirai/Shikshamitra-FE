import type { IAddSafteyManagement } from './saftey-management-interface';

export function getSafetyManagementInitialValues(
  data: Partial<IAddSafteyManagement> | null = null
): IAddSafteyManagement {
  return {
    incidentTitle: data?.incidentTitle || '',
    incidentType: data?.incidentType || '',
    incidentDate: data?.incidentDate || null,
    incidentTime: data?.incidentTime || null,
    incidentUrgency: data?.incidentUrgency || '',
    incidentDescription: data?.incidentDescription || '',
    incidentReportedBy: data?.incidentReportedBy || '',
  };
}
