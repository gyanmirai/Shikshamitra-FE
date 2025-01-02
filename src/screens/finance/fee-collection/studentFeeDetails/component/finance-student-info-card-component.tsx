import React from 'react';

import { Box, Card, Avatar, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';

import FinanceFeeOverviewTab from './finance-fee-overview-tab';

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

const FinanceStudentInfoCardComponent = ({ user }: Props) => {
  const feeDetailViewDialog = useBoolean();

  const openfeeDetailViewDialog = () => {
    feeDetailViewDialog.onTrue();
  };
  const closefeeDetailViewDialog = () => {
    feeDetailViewDialog.onFalse();
  };

  return (
    <>
      <Card
        onClick={openfeeDetailViewDialog}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          padding: 4,
          background: 'linear-gradient(to right, #fbe8d3, #e0f7fa)',
          boxShadow: 3,
          borderRadius: 2,
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: 6,
            cursor: 'pointer',
          },
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
            sx={{ width: 80, height: 80, mb: 1 }}
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
              { label: 'Section', icon: 'ph:student-bold', value: 'A' },
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
          {/* <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2} mt={3} mr={3}>
            <Button variant="contained" size="small">
              Additional Discount
            </Button>
            <Button variant="contained" size="small">
              Collect Fees
            </Button>
            <Button variant="contained" size="small">
              Collect Charges
            </Button>
            <Button variant="contained" size="small">
              Process For Refund
            </Button>
          </Box> */}
        </Box>
      </Card>

      {feeDetailViewDialog.value && (
        <FinanceFeeOverviewTab
          onClose={closefeeDetailViewDialog}
          dialogValue={feeDetailViewDialog.value}
        />
      )}
    </>
  );
};

export default FinanceStudentInfoCardComponent;
