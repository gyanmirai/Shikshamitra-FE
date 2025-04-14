export interface IFinanceAddExpenseTrackingDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
  isEdit: boolean;
  allData: any;
}

export interface IFormikValue {
  expenseCategory: string;
  expenseAmount: string;
  paymentMethod: string;
  date: any;
  paymentStatus: string;
  id: number;
  expenseName: string;
  notes?: string;
}

export interface IExpenseData {
  expenseCategory: string;
  expenseAmount: string;
  paymentMethod: string;
  date: string;
  id: number;
  paymentStatus: string;
  action?: string;
  expenseList?: any;
}
