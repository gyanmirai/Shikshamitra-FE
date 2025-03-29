interface PaymentDate {
  month: string;
  date: string;
  status: string;
  paidAmount: string;
  pendingAmount: string;
}

interface FeeDetails {
  feeHeadId: number;
  feeHead: string;
  totalFees: number;
  finalFees: number;
  grossAmount: number;
  payableAmount: number;
  totalPaidAmount: number;
  discount: number;
  totalDiscount: number;
  paymentDates: PaymentDate[];
}

export interface StudentForFeeStructure {
  grNo: number;
  rollNo: number;
  studentId: number;
  name: string;
  grade: number;
  paymentTerm: string;
  paymentTermNumber: number;
  totalPending: number;
  totalPaid: number;
  totalGeneralDiscount: number;
  totalAdditionalDiscount: number;
  discountAmount: number;
  fixedReduction: number;
  overAllDueDate: string;
  totalFees: number;
  finalFees: number;
  totalDueAfterDiscount: number;
  fees: FeeDetails[];
}

export const studentsDataForFeeStructure: StudentForFeeStructure[] = [
  {
    grNo: 1,
    rollNo: 34,
    studentId: 123,
    name: 'Vishal Rameshbhai Patel',
    grade: 10,
    paymentTerm: 'Monthly',
    paymentTermNumber: 12,
    totalPending: 26000,
    totalPaid: 52000,
    totalGeneralDiscount: 3000,
    totalAdditionalDiscount: 0,

    discountAmount: 0,
    fixedReduction: 0,
    overAllDueDate: '20-04-2025',
    totalFees: 81000,
    finalFees: 78000,
    totalDueAfterDiscount: 0,
    fees: [
      {
        feeHeadId: 198,
        feeHead: 'Tuition',
        totalFees: 63000,
        finalFees: 60000,
        grossAmount: 5250,
        payableAmount: 5000,
        totalPaidAmount: 40000,
        discount: 3000 / 12,
        totalDiscount: 3000,
        paymentDates: [
          {
            month: 'May-2025',
            date: '15-03-2024',
            status: 'Unpaid',
            paidAmount: '0',
            pendingAmount: '5000',
          },
          {
            month: 'April-2025',
            date: '15-03-2024',
            status: 'Unpaid',
            paidAmount: '0',
            pendingAmount: '5000',
          },
          {
            month: 'March-2025',
            date: '15-03-2024',
            status: 'Unpaid',
            paidAmount: '0',
            pendingAmount: '5000',
          },
          {
            month: 'Feb-2025',
            date: '15-03-2024',
            status: 'Unpaid',
            paidAmount: '0',
            pendingAmount: '5000',
          },
          {
            month: 'Jan-2025',
            date: '15-03-2024',
            status: 'Paid',
            paidAmount: '5000',
            pendingAmount: '0',
          },
          {
            month: 'Dec-2024',
            date: '15-03-2024',
            status: 'Paid',
            paidAmount: '5000',
            pendingAmount: '0',
          },
          {
            month: 'Nov-2024',
            date: '15-03-2024',
            status: 'Paid',
            paidAmount: '5000',
            pendingAmount: '0',
          },
          {
            month: 'Oct-2024',
            date: '15-03-2024',
            status: 'Paid',
            paidAmount: '5000',
            pendingAmount: '0',
          },
          {
            month: 'Sep-2024',
            date: '15-03-2024',
            status: 'Paid',
            paidAmount: '5000',
            pendingAmount: '0',
          },
          {
            month: 'Aug-2024',
            date: '15-03-2024',
            status: 'Paid',
            paidAmount: '5000',
            pendingAmount: '0',
          },
          {
            month: 'July-2024',
            date: '15-02-2024',
            status: 'Paid',
            paidAmount: '5000',
            pendingAmount: '0',
          },
          {
            month: 'June-2024',
            date: '15-01-2024',
            status: 'Paid',
            paidAmount: '5000',
            pendingAmount: '0',
          },
        ],
      },
      {
        feeHeadId: 230,
        feeHead: 'Library',
        totalFees: 18000,
        finalFees: 18000,
        grossAmount: 1500,
        totalPaidAmount: 12000,
        discount: 0,
        totalDiscount: 0,
        paymentDates: [
          {
            month: 'May-2025',
            date: '15-03-2024',
            status: 'Unpaid',
            paidAmount: '0',
            pendingAmount: '1500',
          },
          {
            month: 'April-2025',
            date: '15-03-2024',
            status: 'Unpaid',
            paidAmount: '0',
            pendingAmount: '1500',
          },
          {
            month: 'March-2025',
            date: '15-03-2024',
            status: 'Unpaid',
            paidAmount: '0',
            pendingAmount: '1500',
          },
          {
            month: 'Feb-2025',
            date: '15-03-2024',
            status: 'Unpaid',
            paidAmount: '0',
            pendingAmount: '1500',
          },
          {
            month: 'Jan-2025',
            date: '15-03-2024',
            status: 'Paid',
            paidAmount: '1500',
            pendingAmount: '0',
          },
          {
            month: 'Dec-2024',
            date: '15-03-2024',
            status: 'Paid',
            paidAmount: '1500',
            pendingAmount: '0',
          },
          {
            month: 'Nov-2024',
            date: '15-03-2024',
            status: 'Paid',
            paidAmount: '1500',
            pendingAmount: '0',
          },
          {
            month: 'Oct-2024',
            date: '15-03-2024',
            status: 'Paid',
            paidAmount: '1500',
            pendingAmount: '0',
          },
          {
            month: 'Sep-2024',
            date: '15-03-2024',
            status: 'Paid',
            paidAmount: '1500',
            pendingAmount: '0',
          },
          {
            month: 'Aug-2024',
            date: '15-03-2024',
            status: 'Paid',
            paidAmount: '1500',
            pendingAmount: '0',
          },
          {
            month: 'July-2024',
            date: '15-02-2024',
            status: 'Paid',
            paidAmount: '1500',
            pendingAmount: '0',
          },
          {
            month: 'June-2024',
            date: '15-01-2024',
            status: 'Paid',
            paidAmount: '1500',
            pendingAmount: '0',
          },
        ],
        payableAmount: 0,
      },
    ],
  },
];
