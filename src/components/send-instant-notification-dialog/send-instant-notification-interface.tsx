export interface ISendInstantNotificationDialogProps {
  open: boolean;
  onClose: () => void;
  data: any;
  userList: any;
  onSend?: (values: any) => Promise<void>;
  isSending?: boolean;
}
