export interface IIncidentResourceStatusFormValues {
  incidentName: string;
  resourceName: string;
  status: string;
  reportedBy: string;
  reportedDate: string;
  reporterRole: string;
  reporterdepartment: string;
  incidentDescription: string;
  incidentType: string;
  actionTaken: string;
  adminNotes: string;
}

export interface IViewEquipmentIncidentDialogProps {
  data: IIncidentResourceStatusFormValues;
  isEdit: boolean;
  onClose: () => void;
}
