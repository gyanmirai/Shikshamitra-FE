export interface IAddNewMemberDialogProps {
  dialogValue: boolean;
  onSave: (values: any) => void;
  onClose: () => void;
  data?: any;
  isEdit: boolean;
  isRenewMembership: boolean;
}
