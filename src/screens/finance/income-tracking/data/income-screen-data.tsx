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

export const incomeData: IncomeData[] = [
  {
    id: 1,
    incomeSource: 'Fees',
    incomeAmount: '50000',
    paymentMethod: 'Online',
    date: '12-12-2024',
    paymentStatus: 'Paid',
    action: 'View',
    incomeList: [
      {
        incomeName: 'Tuition Fees',
        amount: 25000,
        date: '11-10-2024',
      },
      {
        incomeName: 'Tuition Fees',
        amount: 25000,
        date: '12-10-2024',
      },
    ],
  },
  {
    id: 2,
    incomeSource: 'Donation',
    incomeAmount: '500000',
    paymentMethod: 'Online',
    date: '10-10-2024',
    paymentStatus: 'Paid',
    action: 'View',
    incomeList: [
      {
        incomeName: 'Sks Trust',
        amount: 250000,
        date: '11-10-2024',
      },
      {
        incomeName: 'Gyan Mirai',
        amount: 250000,
        date: '12-08-2024',
      },
    ],
  },
];
