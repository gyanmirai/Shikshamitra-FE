interface PaymentHistory {
  paymentMode: string;
  amount: string;
  paymentId?: string;
  paymentStatus?: string;
  charges?: number;
}

interface PaymentDate {
  month: string;
  date: string;
  status: string;
  amount: number;
  paymentHistory: PaymentHistory[];
}

interface FeeDetail {
  feeHeadId: number;
  feeHead: string;
  totalFees: number;
  amount: number;
  paymentDates: PaymentDate[];
}

export interface StudentPayment {
  grNumber: string;
  studentName: string;
  paymentId: string;
  feeHead: string;
  paidAmount: string;
  refundAmount: string;
  paidDate: string;
  status: string;
  totalFees: number;
  askForRefund: number;
  charges: number;
  fees: FeeDetail[];
}

export const studentPayment: StudentPayment[] = [
  {
    grNumber: '28877',
    studentName: 'JAY',
    paymentId: 'j878d',
    feeHead: 'Tuition',
    paidAmount: '10000',
    refundAmount: '0',
    paidDate: '20-04-2024',
    status: 'Paid',
    totalFees: 60000,
    charges: 0,
    askForRefund: 2000,
    fees: [
      {
        feeHeadId: 198,
        feeHead: 'Tuition',
        totalFees: 60000,
        amount: 5000,
        paymentDates: [
          {
            month: 'June-2024',
            date: '15-01-2024',
            status: 'Unpaid',
            amount: 5000,
            paymentHistory: [
              {
                paymentMode: 'Card',
                amount: '2000',
                paymentId: '54j8',
                paymentStatus: 'Success',
              },
              { paymentMode: 'Cash', amount: '2000' },
              {
                paymentMode: 'Online',
                amount: '1000',
                paymentId: 'h8749',
                paymentStatus: 'Failed',
              },
              {
                paymentMode: 'Online',
                amount: '500',
                paymentId: 'h8749',
                paymentStatus: 'Success',
              },
              {
                paymentMode: 'Check',
                amount: '500',
                paymentId: 'h8749',
                paymentStatus: 'Not Clear',
                charges: 500,
              },
            ],
          },
          {
            month: 'July-2024',
            date: '15-02-2024',
            status: 'Paid',
            amount: 5000,
            paymentHistory: [
              {
                paymentMode: 'Bank Transfer',
                amount: '3000',
                paymentId: 'jh238',
                paymentStatus: 'Success',
              },
              {
                paymentMode: 'Card',
                amount: '2000',
                paymentId: 'aa123',
                paymentStatus: 'Success',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    grNumber: '28877',
    studentName: 'JAY',
    paymentId: 'j878d',
    feeHead: 'Library',
    paidAmount: '4000',
    refundAmount: '0',
    paidDate: '20-04-2024',
    status: 'Paid',
    totalFees: 60000,
    askForRefund: 2000,
    charges: 0,
    fees: [
      {
        feeHeadId: 198,
        feeHead: 'Tuition',
        totalFees: 60000,
        amount: 5000,
        paymentDates: [
          {
            month: 'July-2024',
            date: '15-02-2024',
            status: 'Paid',
            amount: 5000,
            paymentHistory: [
              {
                paymentMode: 'Bank Transfer',
                amount: '3000',
                paymentId: 'jh238',
                paymentStatus: 'Success',
              },
              {
                paymentMode: 'Card',
                amount: '2000',
                paymentId: 'aa123',
                paymentStatus: 'Success',
              },
            ],
          },
        ],
      },
    ],
  },
];
