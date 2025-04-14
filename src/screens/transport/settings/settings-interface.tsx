export interface IDriverFormDialogProps {
  driver: any;
  dialogValue: boolean;
  onClose: () => void;
  isEdit: boolean;
}

export interface ITransportAddingStopDialogProps {
  dialogValue: boolean;
  onClose: () => void;
  sendToParent?: (data: any) => void;
}
