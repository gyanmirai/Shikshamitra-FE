export interface IVehicleFormDialogProps {
  vehicle: any;
  dialogValue: boolean;
  onClose: () => void;
  isEdit: boolean;
}

export interface ITransportAddNewMaintenanceDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
  isEdit: boolean;
  allData: any;
}

export interface IFormikValue {
  dateOfMaintenance: any;
  serviceDetails: string;
  nextScheduleMaintenance: any;
  id: number;
}
