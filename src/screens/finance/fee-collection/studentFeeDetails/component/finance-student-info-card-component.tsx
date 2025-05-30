import React, { useState } from 'react';

import { Box, Card, Avatar, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';

import { students } from '../student-fee-data/student-fee-data';

import type { Student } from '../student-fee-data/student-fee-data';

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

const FinanceStudentInfoCardComponent = ({ user }: Props) => {
  // Dialog state management using useBoolean hook
  const dialog = useBoolean();
  const feeRefundDialog = useBoolean();
  const financeStudentAdditionalDiscountDialog = useBoolean();
  const collectChargesDialog = useBoolean();

  // State to track the currently selected student, initialized with first student
  const [selectedStudent, setSelectedStudent] = useState<Student>(students[0]);

  // Handler to close the main fee collection dialog
  const closeDialog = () => {
    dialog.onFalse();
  };

  // Handler to close the fee refund dialog
  const feeRefundCloseDialog = () => {
    feeRefundDialog.onFalse();
  };

  // Handler to close the additional discount dialog
  const additionalDiscountCloseDialog = () => {
    financeStudentAdditionalDiscountDialog.onFalse();
  };
  return (
    <>
      <Card
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
                icon: 'hugeicons:tick-01',
                value: '₹ 10,000',
                color: 'success.main',
              },
              {
                label: 'Pending Fees',
                icon: 'bitcoin-icons:clock-outline',
                value: '₹ 20,000',
                color: 'warning.main',
              },
              {
                label: 'Overdue Fees',
                icon: 'pajamas:calendar-overdue',
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
          {/* <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2} mt={3} mr={3}>
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
          </Box> */}
        </Box>
      </Card>

      {/* {financeStudentAdditionalDiscountDialog.value && (
        <FinanceStudentAdditionalDiscountDialog
          dialogValue={financeStudentAdditionalDiscountDialog.value}
          onClose={additionalDiscountCloseDialog}
          studentData={selectedStudent}
        />
      )}
      {dialog.value && (
        <CustomDialog
          maxWidth="xl"
          open={dialog.value}
          handleClose={() => {
            dialog.onFalse();
          }}
          title="Collect Fees"
        >
          <FeeCollectionTable />
        </CustomDialog>
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
      )} */}
    </>
  );
};

export default FinanceStudentInfoCardComponent;
