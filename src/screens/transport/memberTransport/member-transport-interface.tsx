export interface ITransportRouteAssignedDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
  isEdit: boolean;
  allData: any;
  isStaff: boolean;
  clickFromTable: boolean;
}

// Formik Values Interface
export interface IFormikValue {
  id: number;
  name: string;
  grade: string;
  assignedRoute: string;
  pickupPoint: string;
  dropoffPoint: string;
  differentDropOffPoint: boolean;
  others: string;
  messageSentToStudent: string;
}

export interface ITransportAddNewRequestDialogProps {
  dialogValue: boolean;
  onClose: () => void;
  selectedEntry: any;
}
