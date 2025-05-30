export interface IFinanceNewBudgetCreateDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
  edit: boolean;
  activeTab?: string;
}

export interface IIncomeCategory {
  id: string;
  name: string;
  totalAmountExpected: number;
  collectedAmount: number;
  outstandingAmount: number;
}

export interface IExpenseCategory {
  id: string;
  name: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
}

export interface IBudgetData {
  expenseCategoryId: string;
  incomeCategoryId: string;
  incomeCategories: IIncomeCategory[];
  expenseCategories: IExpenseCategory[];
}
