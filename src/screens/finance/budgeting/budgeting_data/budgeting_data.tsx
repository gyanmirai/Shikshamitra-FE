export const expenseData = [
  {
    id: 'expense_01',
    name: 'Salaries',
    allocatedAmount: 100000000,
    spentAmount: 0,
    remainingAmount: 100000000,
    expensePercantage: '0 %',
  },
  {
    id: 'expense_02',
    name: 'Maintenance',
    allocatedAmount: 40000,
    spentAmount: 0,
    remainingAmount: 40000,
    expensePercantage: '0 %',
  },
  {
    id: 'expense_03',
    name: 'Educational Supplies',
    allocatedAmount: 20000,
    spentAmount: 0,
    remainingAmount: 20000,
    expensePercantage: '0 %',
  },
  {
    id: 'expense_03',
    name: 'Total',
    allocatedAmount: 60000,
    spentAmount: 0,
    remainingAmount: 60000,
    expensePercantage: '0 %',
  },
];

export const incomeData = [
  {
    id: 'income_01',
    name: 'Tuition Fees',
    totalAmountExpected: 150000000,
    collectedAmount: 0,
    outstandingAmount: 150000000,
    receivedPercantage: '0 %',
  },
  {
    id: 'income_02',
    name: 'Donations',
    totalAmountExpected: 50000,
    collectedAmount: 0,
    outstandingAmount: 50000,
    receivedPercantage: '0 %',
  },
  {
    id: 'income_03',
    name: 'Government Grants',
    totalAmountExpected: 30000,
    collectedAmount: 0,
    outstandingAmount: 30000,
    receivedPercantage: '0 %',
  },
  {
    id: 'income_03',
    name: 'Total',
    totalAmountExpected: 80000,
    collectedAmount: 0,
    outstandingAmount: 80000,
    receivedPercantage: '0 %',
  },
];

export interface IncomeCategory {
  id: string;
  name: string;
  totalAmountExpected: number;
  collectedAmount: number;
  outstandingAmount: number;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
}

export interface BudgetData {
  expenseCategoryId: string;
  incomeCategoryId: string;
  incomeCategories: IncomeCategory[];
  expenseCategories: ExpenseCategory[];
}

export const budgetDummyData: BudgetData = {
  expenseCategoryId: '345',
  incomeCategoryId: '123',
  incomeCategories: [
    {
      id: 'income_01',
      name: 'Tuition Fees',
      totalAmountExpected: 300000000,
      collectedAmount: 0,
      outstandingAmount: 300000000,
    },
    {
      id: 'income_02',
      name: 'Donations',
      totalAmountExpected: 50000,
      collectedAmount: 0,
      outstandingAmount: 50000,
    },
    {
      id: 'income_03',
      name: 'Government Grants',
      totalAmountExpected: 30000,
      collectedAmount: 0,
      outstandingAmount: 30000,
    },
  ],
  expenseCategories: [
    {
      id: 'expense_01',
      name: 'Salaries',
      allocatedAmount: 10000000,
      spentAmount: 0,
      remainingAmount: 10000000,
    },
    {
      id: 'expense_02',
      name: 'Maintenance',
      allocatedAmount: 40000,
      spentAmount: 0,
      remainingAmount: 40000,
    },
    {
      id: 'expense_03',
      name: 'Educational Supplies',
      allocatedAmount: 20000,
      spentAmount: 0,
      remainingAmount: 20000,
    },
  ],
};
