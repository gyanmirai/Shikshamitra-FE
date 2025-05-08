export interface IResourceConditionStatusFormValues {
  resourceConditionStatusName: string;
  resourceConditionStatusDescription: string;
}

export interface IAddResourceConditionDialogProps {
  isEdit: boolean;
  data: IResourceConditionStatusFormValues | null;
  onClose: () => void;
}
