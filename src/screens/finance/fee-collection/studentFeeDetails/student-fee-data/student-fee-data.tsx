interface PaymentHistory {
  paymentMode: string;
  amount: string;
  paymentId?: string;
  paymentStatus: string;
}

interface PaymentDueDate {
  month: string;
  date: string;
  status: string;
  amount: number;
  paymentHistory: PaymentHistory[];
}

interface Fee {
  feeHeadId: string;
  feeHead: string;
  grossFees: number;
  payableFee: number;
  generalDiscount: number;
  acceptedpaymentMethod: string[];
  lateFeeChargesType: string;
  lateFeeChargesAmount: string;
  isActive: boolean;
  status: string;
  paymentDueDate: string;
  paymentDueDateList: PaymentDueDate[];
}

export interface Student {
  studentId: number;
  name: string;
  grade: number;
  feestructureId: string;
  paymentTerm: string;
  totalPending: number;
  totalPaid: number;
  discountAmount: number;
  fixedReduction: number;
  overAllDueDate: string;
  totalFees: number;
  totalDueAfterDiscount: number;
  previousCharges: number;
  chargesDetails: string;
  fees: Fee[];
}

export const students: Student[] = [
  {
    studentId: 101,
    name: 'Alice Johnson',
    grade: 9,
    feestructureId: 'FS12345',
    paymentTerm: 'Quarterly',
    totalPending: 25000,
    totalPaid: 50000,
    discountAmount: 2000,
    fixedReduction: 1000,
    overAllDueDate: '30-06-2025',
    totalFees: 75000,
    totalDueAfterDiscount: 22000,
    previousCharges: 500,
    chargesDetails: 'Cheque payment of 500 in March 2025 bounced. Cheque No: C9876.',
    fees: [
      {
        feeHeadId: 'TUI001',
        feeHead: 'Tuition Fee',
        grossFees: 50000,
        payableFee: 48000,
        generalDiscount: 2000,
        acceptedpaymentMethod: ['Online', 'Cash', 'Cheque'],
        lateFeeChargesType: 'Per Day',
        lateFeeChargesAmount: '50',
        isActive: true,
        status: 'Unpaid',
        paymentDueDate: '10-05-2025',
        paymentDueDateList: [
          {
            month: 'March-2025',
            date: '10-03-2025',
            status: 'Paid',
            amount: 16000,
            paymentHistory: [
              {
                paymentMode: 'Online',
                amount: '16000',
                paymentId: 'PAY123',
                paymentStatus: 'Success',
              },
            ],
          },
          {
            month: 'April-2025',
            date: '10-04-2025',
            status: 'Unpaid',
            amount: 16000,
            paymentHistory: [],
          },
          {
            month: 'May-2025',
            date: '10-05-2025',
            status: 'Unpaid',
            amount: 16000,
            paymentHistory: [],
          },
        ],
      },
      {
        feeHeadId: 'ACT002',
        feeHead: 'Activity Fee',
        grossFees: 5000,
        payableFee: 5000,
        generalDiscount: 0,
        acceptedpaymentMethod: ['Cash', 'Online'],
        lateFeeChargesType: 'Fixed',
        lateFeeChargesAmount: '500',
        isActive: true,
        status: 'Paid',
        paymentDueDate: '05-04-2025',
        paymentDueDateList: [
          {
            month: 'April-2025',
            date: '05-04-2025',
            status: 'Paid',
            amount: 5000,
            paymentHistory: [
              {
                paymentMode: 'Cash',
                amount: '5000',
                paymentId: 'ACTPAY001',
                paymentStatus: 'Success',
              },
            ],
          },
        ],
      },
    ],
  },
];
