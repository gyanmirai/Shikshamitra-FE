export interface IFinanceReconciliationClearAndBounceChequeDialogProps {
  fromClearCheck: boolean;
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
}
