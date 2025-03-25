import React, { useState } from 'react';

import { Box, Card, Avatar, Button, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';

import FinanceFeeOverviewTab from './finance-fee-overview-tab';
// import FeeNewCollectionForm from '../../collectFees/fee-collection-form';
import FinanceCollectCharges from '../../charges/component/collect-charges';
import FinanceStudentAdditionalDiscountDialog from './student-additional-discount';
import FeeCollectionMonthWise from '../../collectFees/component/fee-collect-monthwise';
// import FeeCollectionForm from '../../collectFees/component/finance-collect-fee-table-view';
import FinanceFeeRefundAllocationDialog from '../../../fee-refund/component/finance-fee-refund-allocated';

export type IUserCard = {
  id: string;
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
  totalPosts: number;
  totalFollowers: number;
  totalFollowing: number;
};

type Props = {
  user: IUserCard;
};
const { assetURL } = CONFIG.site;

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
        totalFees: 18000,
        amount: 1500,
        payableFee: 5000,
        paymentDueDateList: [
          {
            month: 'June-2024',
            date: '15-01-2024',
            status: 'Unpaid',
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

const FinanceStudentInfoCardComponent = ({ user }: Props) => {
  const feeDetailViewDialog = useBoolean();

  const openfeeDetailViewDialog = () => {
    feeDetailViewDialog.onTrue();
  };
  const closefeeDetailViewDialog = () => {
    feeDetailViewDialog.onFalse();
  };

  const dialog = useBoolean();
  const feeRefundDialog = useBoolean();
  const financeStudentAdditionalDiscountDialog = useBoolean();
  const collectChargesDialog = useBoolean();

  const [tableData, setTableData] = useState(dummyUser);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const closeDialog = () => {
    dialog.onFalse();
  };

  const feeRefundCloseDialog = () => {
    feeRefundDialog.onFalse();
  };

  const additionalDiscountCloseDialog = () => {
    financeStudentAdditionalDiscountDialog.onFalse();
  };

  return (
    <>
      <Card
        // onClick={openfeeDetailViewDialog}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          padding: 4,
          background: 'linear-gradient(to right, #fbe8d3, #e0f7fa)',
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        {/* Left Section: Student Name and Avatar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '20%',
            textAlign: 'center',
            padding: 2,
          }}
        >
          <Avatar
            alt={user.name}
            src={`${assetURL}/assets/images/avatar/avatar-${0 + 1}.webp`}
            sx={{ width: 120, height: 120, mb: 1 }}
          />
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            {user.name}
          </Typography>
        </Box>

        {/* Information Grid */}
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '80%', gap: 3 }}>
          {/* First Row */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2 }}>
            {[
              { label: 'Standard', icon: 'fa:mortar-board', value: '10-A' },
              { label: 'Roll Number', icon: 'mdi:account', value: '20223' },
              { label: 'Gr Number', icon: 'ph:student-bold', value: '9876GH' },
              { label: 'Class Teacher', icon: 'mdi:teach', value: 'Mr. John' },
              { label: 'Age', icon: 'ic:baseline-cake', value: '15 Years' },
            ].map((item) => (
              <Box key={item.label} sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ mb: 0.5, color: 'text.secondary' }}>
                  {item.label}
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="center">
                  <Iconify icon={item.icon} width={20} height={20} sx={{ mr: 1 }} />
                  {item.value}
                </Box>
              </Box>
            ))}
          </Box>

          {/* Second Row */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2 }}>
            {[
              { label: 'Total Charges', icon: 'arcticons:mymoney-pro', value: '₹ 0' },
              {
                label: 'Paid Fees',
                icon: 'arcticons:mymoney-pro',
                value: '₹ 10,000',
                color: 'success.main',
              },
              {
                label: 'Pending Fees',
                icon: 'arcticons:mymoney-pro',
                value: '₹ 20,000',
                color: 'warning.main',
              },
              {
                label: 'Overdue Fees',
                icon: 'arcticons:mymoney-pro',
                value: '₹ 30,000',
                color: 'error.main',
              },
              { label: 'Total Refund', icon: 'arcticons:mymoney-pro', value: '₹ 0' },
            ].map(({ label, icon, value, color }) => (
              <Box key={label} sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ mb: 0.5, color: 'text.secondary' }}>
                  {label}
                </Typography>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  sx={{ color: color || 'text.primary' }}
                >
                  <Iconify icon={icon} width={20} height={20} sx={{ mr: 1 }} />
                  {value}
                </Box>
              </Box>
            ))}
          </Box>

          {/* Action Buttons */}
          <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2} mt={3} mr={3}>
            <Button
              onClick={() => {
                feeRefundDialog.onFalse();
                dialog.onFalse();
                setSelectedStudent(students[0]);

                financeStudentAdditionalDiscountDialog.onTrue();
              }}
              startIcon={<Iconify icon="iconamoon:discount-thin" />}
              variant="outlined"
              size="large"
              sx={{
                backgroundColor: 'transparent',
                color: '#1a91bc',
              }}
            >
              Additional Discount
            </Button>
            <Button
              onClick={() => {
                financeStudentAdditionalDiscountDialog.onFalse();
                feeRefundDialog.onFalse();
                setSelectedStudent(students[0]);

                dialog.onTrue();
              }}
              startIcon={<Iconify icon="game-icons:receive-money" />}
              variant="outlined"
              size="large"
              color="primary"
            >
              Collect Fees
            </Button>
            <Button
              onClick={() => {
                feeRefundDialog.onFalse();
                dialog.onFalse();
                setSelectedStudent(students[0]);
                // setIsEdit(true);
                collectChargesDialog.onTrue();
              }}
              startIcon={<Iconify icon="fa6-solid:piggy-bank" />}
              variant="outlined"
              size="large"
              color="secondary"
            >
              Collect Charges
            </Button>
            <Button
              onClick={() => {
                financeStudentAdditionalDiscountDialog.onFalse();
                dialog.onFalse();
                setSelectedStudent(students[0]);
                // setIsEdit(true);
                feeRefundDialog.onTrue();
              }}
              startIcon={
                <Iconify
                  icon="game-icons:pay-money"
                  style={{
                    fontSize: '28px', // Larger size
                    fill: '#000', // Black fill for boldness
                    stroke: '#000', // Black stroke for extra weight
                    strokeWidth: '2px', // Thicker stroke
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)', // Subtle shadow for depth
                  }}
                />
              }
              variant="outlined"
              size="large"
              sx={{
                backgroundColor: 'transparent',
                color: '#ad7c00',
              }}
            >
              Process For Refund
            </Button>
          </Box>
        </Box>
      </Card>

      {feeDetailViewDialog.value && (
        <FinanceFeeOverviewTab
          onClose={closefeeDetailViewDialog}
          dialogValue={feeDetailViewDialog.value}
        />
      )}

      {financeStudentAdditionalDiscountDialog.value && (
        <FinanceStudentAdditionalDiscountDialog
          dialogValue={financeStudentAdditionalDiscountDialog.value}
          onClose={additionalDiscountCloseDialog}
          selectedData={selectedStudent}
        />
      )}

      {dialog.value && (
        <FeeCollectionMonthWise
          dialogValue={dialog.value}
          onClose={closeDialog}
          students={selectedStudent}
        />
        // <FeeCollectionForm
        //   dialogValue={dialog.value}
        //   onClose={closeDialog}
        // />
        // <FeeNewCollectionForm
        //   isFromStudentAdmissionFlow={false}
        //   dialogValue={dialog.value}
        //   onClose={closeDialog}
        //   data={[]}
        // />
        // <FinanceNewCollectFeeDialog
        //   isFromStudentAdmission={false}
        //   onSave={() => {}}
        //   dialogValue={dialog.value}
        //   onClose={closeDialog}
        //   data={selectedStudent}
        // />
      )}

      {collectChargesDialog.value && (
        <FinanceCollectCharges
          dialogValue={collectChargesDialog.value}
          onClose={() => {
            collectChargesDialog.onFalse();
          }}
          data={selectedStudent}
        />
      )}

      {feeRefundDialog.value && (
        <FinanceFeeRefundAllocationDialog
          dialogValue={feeRefundDialog.value}
          onClose={feeRefundCloseDialog}
          selectedData={selectedStudent}
        />
      )}
    </>
  );
};

export default FinanceStudentInfoCardComponent;
