export interface IFinanceAddNewIncomeDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
  isEdit: boolean;
  allData: any;
}

export interface IFormikValue {
  incomeSource: string;
  incomeAmount: string;
  paymentMethod: string;
  date: any;
  paymentStatus: string;
  id: number;
  incomeName: string;
  notes?: string;
}
