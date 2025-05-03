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

export interface IReportLossTableProps {
  onClick: (data: IResourceIncidentFormValues, eventName: string) => void;
}

export interface IAddReportLossFormProps {
  isEdit: boolean;
  data: IResourceIncidentFormValues | null;
  onClose: () => void;
}
