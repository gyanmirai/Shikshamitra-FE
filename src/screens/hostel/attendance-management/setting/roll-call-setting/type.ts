export interface IRollCallSetting {
  rollCallName: string;
  startTime: string;
  endTime: string;
  description: string;
}

export interface IRollCallFormProps {
  dialog: { onFalse: () => void };
  onClose: (_e?: any, isSubmit?: boolean) => void;
  editData: IRollCallSetting | null;
}
