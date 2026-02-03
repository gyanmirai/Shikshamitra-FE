export interface IRecipient {
  name: string;
  message: string;
  communicationChannel: string[];
  placeHolder: string[];
  division?: string;
  standard?: string;
  placeHolderOptions?: any;
  isEnable: boolean;
}

export interface INotificationData {
  id: string;
  event: string;
  triggerCondition: string;
  recipient: IRecipient[];
  communicationChannel: string[];
}

export interface IEditNotificationDialogProps {
  onClose: () => void;
  data: INotificationData | null;
  isFromView?: boolean;
}
