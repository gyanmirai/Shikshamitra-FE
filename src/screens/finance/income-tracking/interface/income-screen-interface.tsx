interface IncomeItem {
  incomeName: string;
  amount: number;
  date: string;
}

export interface IncomeData {
  id: number;
  incomeSource: string;
  incomeAmount: string;
  paymentMethod: string;
  date: string;
  paymentStatus: string;
  action?: string;
  incomeList?: IncomeItem[];
}

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
