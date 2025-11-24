import React from 'react';
import { Iconify } from 'src/components/iconify';
import calculateAge from 'src/utils/calculate-age';
import { Box, Card, Avatar, Typography } from '@mui/material';
import { convertBase64Format } from 'src/utils/base64Formate';

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

const FinanceStudentInfoCardComponent = ({ user }: any) => (
  // Dialog state management using useBoolean hook

  // State to track the currently selected student, initialized with first student
  // const [selectedStudent, setSelectedStudent] = useState<Student>(students[0]);

  // Handler to close the main fee collection dialog

  // Handler to close the fee refund dialog

  // Handler to close the additional discount dialog
  <>
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        padding: 2,
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
          // padding: 2,
        }}
      >
        <Avatar
          alt={user.name}
          src={convertBase64Format(user?.profilePicture || '')}
          sx={{ width: 80, height: 80 }}
        />
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          {user?.firstName} {user?.lastName} {user?.middleName}
        </Typography>
      </Box>

      {/* Information Grid */}
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '80%', gap: 3 }}>
        {/* First Row */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2 }}>
          {[
            {
              label: 'Standard',
              icon: 'fa:mortar-board',
              value: `${user?.standard?.name}-${user?.division?.name}`,
            },
            { label: 'Roll Number', icon: 'mdi:account', value: user?.rollNo || '-' },
            { label: 'Gr Number', icon: 'ph:student-bold', value: user?.grNoRecord || '-' },
            { label: 'Class Teacher', icon: 'mdi:teach', value: 'Mr. John' },
            { label: 'Age', icon: 'ic:baseline-cake', value: calculateAge(user?.dateOfBirth) },
          ].map((item) => (
            <Box key={item.label} sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ mb: 0.5, color: 'text.secondary' }}>
                {item.label}
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="center" fontSize={12}>
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
                fontSize={12}
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
export default FinanceStudentInfoCardComponent;
