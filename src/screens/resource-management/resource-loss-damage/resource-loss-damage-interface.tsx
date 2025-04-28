export interface IResourceIncidentFormValues {
  resourceName: string;
  typeOfIncident: string;
  dateOfIncident: Date | null;
  incidentDescription: string;
}

export interface IAddReportLossDialogProps {
  isEdit: boolean;
  data: IResourceIncidentFormValues;
}
