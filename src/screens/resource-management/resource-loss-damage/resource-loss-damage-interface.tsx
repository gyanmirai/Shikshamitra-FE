import type { Dayjs } from 'dayjs';

export interface IResourceIncidentFormValues {
  resourceName: string;
  typeOfIncident: string;
  dateOfIncident: Dayjs | null;
  incidentDescription: string;
}

export interface IAddReportLossDialogProps {
  isEdit: boolean;
  data: IResourceIncidentFormValues;
  onClose: () => void;
}
