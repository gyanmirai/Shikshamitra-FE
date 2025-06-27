import React from 'react';

import FinanceStudentInfoCardComponent from './component/finance-student-info-card-component';

import type { IUserCard } from './component/finance-student-info-card-component';

const dummyUser: IUserCard = {
  id: '12345',
  name: 'John Doe',
  role: '10-B',
  coverUrl: 'https://example.com/cover.jpg',
  avatarUrl: 'https://example.com/avatar.jpg',
  totalPosts: 120,
  totalFollowers: 4500,
  totalFollowing: 300,
};

const students = [
  {
    studentId: 123,
    name: 'John Doe',
    grade: 10,
    feestructureId: 'hkjl987',
    paymentTerm: 'Monthly',
    totalPending: 38000,
    totalPaid: 40000,
    discountAmount: 0,
    fixedReduction: 0,
    overAllDueDate: '20-04-2025',
    totalFees: 78000,
    totalDueAfterDiscount: 0,
    previousCharges: 500,
    chargesDetails: 'The payment of 500 made by cheque in June 2024 was bounced. Cheque No: H8749.',
    fees: [
      {
        feeHeadId: 'Tuition',
        feeHead: 'Tuition',
        totalFees: 60000,
        amount: 5000,
        paymentDueDateList: [
          {
            month: 'June-2024',
            date: '15-01-2024',
            status: 'Unpaid',
            amount: 5000,
            paymentHistory: [
              { paymentMode: 'Card', amount: '2000', paymentId: '54j8', paymentStatus: 'Success' },
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
              { paymentMode: 'Card', amount: '2000', paymentId: 'aa123', paymentStatus: 'Success' },
            ],
          },
          {
            month: 'Aug-2024',
            date: '15-03-2024',
            status: 'Paid',
            amount: 5000,
            paymentHistory: [
              {
                paymentMode: 'Online',
                amount: '4000',
                paymentId: 'bb874',
                paymentStatus: 'Success',
              },
              { paymentMode: 'Cash', amount: '1000' },
            ],
          },
          {
            month: 'Sep-2024',
            date: '15-04-2024',
            status: 'Paid',
            amount: 5000,
            paymentHistory: [
              {
                paymentMode: 'Check',
                amount: '3000',
                paymentId: 'ck452',
                paymentStatus: 'Cleared',
              },
              {
                paymentMode: 'Online',
                amount: '2000',
                paymentId: 'on123',
                paymentStatus: 'Success',
              },
            ],
          },
          {
            month: 'Oct-2024',
            date: '15-05-2024',
            status: 'Paid',
            amount: 5000,
            paymentHistory: [
              { paymentMode: 'Card', amount: '2500', paymentId: 'cd998', paymentStatus: 'Success' },
              {
                paymentMode: 'Bank Transfer',
                amount: '2500',
                paymentId: 'bt321',
                paymentStatus: 'Success',
              },
            ],
          },
          {
            month: 'Nov-2024',
            date: '15-06-2024',
            status: 'Paid',
            amount: 5000,
            paymentHistory: [{ paymentMode: 'Cash', amount: '5000' }],
          },
          {
            month: 'Dec-2024',
            date: '15-07-2024',
            status: 'Paid',
            amount: 5000,
            paymentHistory: [
              {
                paymentMode: 'Online',
                amount: '5000',
                paymentId: 'on654',
                paymentStatus: 'Success',
              },
            ],
          },
          {
            month: 'Jan-2025',
            date: '15-08-2024',
            status: 'Paid',
            amount: 5000,
            paymentHistory: [
              { paymentMode: 'Card', amount: '5000', paymentId: 'ca876', paymentStatus: 'Success' },
            ],
          },
          {
            month: 'Feb-2025',
            date: '15-09-2024',
            status: 'Unpaid',
            amount: 5000,
            paymentHistory: [
              {
                paymentMode: 'Bank Transfer',
                amount: '2000',
                paymentId: 'bt987',
                paymentStatus: 'Pending',
              },
              { paymentMode: 'Cash', amount: '3000' },
            ],
          },
          {
            month: 'April-2025',
            date: '15-10-2024',
            status: 'Unpaid',
            amount: 5000,
            paymentHistory: [],
          },
          {
            month: 'May-2025',
            date: '15-11-2024',
            status: 'Unpaid',
            amount: 5000,
            paymentHistory: [],
          },
        ],
      },
      {
        feeHeadId: 'Library',
        feeHead: 'Library',
        totalFees: 18000,
        amount: 1500,
        paymentDueDateList: [
          {
            month: 'June-2024',
            date: '15-01-2024',
            status: 'Paid',
            amount: 1500,
            paymentHistory: [
              { paymentMode: 'Card', amount: '500', paymentId: 'JUN123', paymentStatus: 'Success' },
              { paymentMode: 'Cash', amount: '1000', paymentStatus: 'Success' },
            ],
          },
          {
            month: 'July-2024',
            date: '15-02-2024',
            status: 'Paid',
            amount: 1500,
            paymentHistory: [
              {
                paymentMode: 'Online',
                amount: '1500',
                paymentId: 'JUL456',
                paymentStatus: 'Success',
              },
            ],
          },
          {
            month: 'Aug-2024',
            date: '15-03-2024',
            status: 'Paid',
            amount: 1500,
            paymentHistory: [
              {
                paymentMode: 'Bank Transfer',
                amount: '1000',
                paymentId: 'AUG789',
                paymentStatus: 'Success',
              },
              { paymentMode: 'Cash', amount: '500', paymentStatus: 'Success' },
            ],
          },
          {
            month: 'Sep-2024',
            date: '15-03-2024',
            status: 'Paid',
            amount: 1500,
            paymentHistory: [
              {
                paymentMode: 'Check',
                amount: '1500',
                paymentId: 'SEP101',
                paymentStatus: 'Cleared',
              },
            ],
          },
          {
            month: 'Oct-2024',
            date: '15-03-2024',
            status: 'Paid',
            amount: 1500,
            paymentHistory: [
              { paymentMode: 'Card', amount: '750', paymentId: 'OCT202', paymentStatus: 'Success' },
              {
                paymentMode: 'Online',
                amount: '750',
                paymentId: 'OCT203',
                paymentStatus: 'Success',
              },
            ],
          },
          {
            month: 'Nov-2024',
            date: '15-03-2024',
            status: 'Paid',
            amount: 1500,
            paymentHistory: [{ paymentMode: 'Cash', amount: '1500', paymentStatus: 'Success' }],
          },
          {
            month: 'Dec-2024',
            date: '15-03-2024',
            status: 'Paid',
            amount: 1500,
            paymentHistory: [
              {
                paymentMode: 'Online',
                amount: '1500',
                paymentId: 'DEC404',
                paymentStatus: 'Success',
              },
            ],
          },
          {
            month: 'Jan-2025',
            date: '15-03-2024',
            status: 'Paid',
            amount: 1500,
            paymentHistory: [
              {
                paymentMode: 'Bank Transfer',
                amount: '1500',
                paymentId: 'JAN505',
                paymentStatus: 'Success',
              },
            ],
          },
          {
            month: 'Feb-2025',
            date: '15-03-2024',
            status: 'Unpaid',
            amount: 1500,
            paymentHistory: [
              {
                paymentMode: 'Online',
                amount: '500',
                paymentId: 'FEB606',
                paymentStatus: 'Failed',
              },
              { paymentMode: 'Cash', amount: '1000', paymentStatus: 'Pending' },
            ],
          },
          {
            month: 'April-2025',
            date: '15-03-2024',
            status: 'Unpaid',
            amount: 1500,
            paymentHistory: [
              {
                paymentMode: 'Check',
                amount: '1500',
                paymentId: 'APR707',
                paymentStatus: 'Not Cleared',
              },
            ],
          },
          {
            month: 'May-2025',
            date: '15-03-2024',
            status: 'Unpaid',
            amount: 1500,
            paymentHistory: [],
          },
        ],
      },
      {
        feeHeadId: 'Admission',
        feeHead: 'Admission',
        grossFee: 1000,
        payableFee: 1000,
        generalDiscount: 0,
        AcceptedpaymentMethod: ['cash'],
        lateFeeChargesType: 'fixed',
        lateFeeChargesAmount: '1000',
        isActive: true,
        status: 'Unpaid', // Partially Paid, Unpaid, Paid
        paymentDueDate: '20-04-2024',
        paymentDueDateList: [
          {
            month: 'June-2024',
            date: '20-04-2024',
            status: 'Unpaid',
            amount: 1000,
            paymentHistory: [],
          },
        ],
      },
    ],
  },
];

interface FinanceStudentFeeCardComponentProps {
  student: Record<string, any>;
}

const FinanceStudentFeeCardComponent: React.FC<FinanceStudentFeeCardComponentProps> = ({
  student,
}) => <FinanceStudentInfoCardComponent user={student} />;

export default FinanceStudentFeeCardComponent;
