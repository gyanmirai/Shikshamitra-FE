import dayjs from 'dayjs';

import type { IResourceIncidentFormValues } from './resource-loss-damage-interface';

export function getInitialResourceIncidentValues(
  data: Partial<IResourceIncidentFormValues> = {},
  isEdit = false
): IResourceIncidentFormValues {
  return {
    resourceName: data.resourceName || '',
    typeOfIncident: data.typeOfIncident || '',
    dateOfIncident: data.dateOfIncident ? dayjs(data.dateOfIncident) : null,
    incidentDescription: data.incidentDescription || '',
  };
}
