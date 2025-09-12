'use client';

import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import React from 'react';
import { useTabs } from 'src/hooks/use-tabs';
import { Box, Tab, Card, Button } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { Iconify } from 'src/components/iconify/iconify';
import CreditCardIcon from '@mui/icons-material/CreditCard';

import FeeConcession from './ViewDetailsComponent/FeeConcession';
import PaymentHistory from './ViewDetailsComponent/PaymentHistory';
import OutstandingFee from './ViewDetailsComponent/OutstandingFees';
import OverviewFeeDetails from './ViewDetailsComponent/OverviewFeeDetails';

import type { IStudentFee } from './type';

const TABS = [
  {
    value: 'overview',
    label: 'Overview',
    icon: <Iconify icon="mdi:chart-line" />, // example icon
    component: ({ student }: { student: IStudentFee | null }) => (
      <OverviewFeeDetails student={student} />
    ),
  },
  {
    value: 'outstanding-fees',
    label: 'Outstanding Fees',
    icon: <Iconify icon="mdi:clock-outline" />,
    component: ({ student }: { student: IStudentFee | null }) => (
      <OutstandingFee student={student} />
    ),
  },
  {
    value: 'payment-history',
    label: 'Payment History',
    icon: <Iconify icon="mdi:bank-outline" />,
    component: ({ student }: { student: IStudentFee | null }) => (
      <PaymentHistory student={student} />
    ),
  },
  {
    value: 'concessions',
    label: 'Concessions',
    icon: <Iconify icon="mdi:cash-refund" />,
    component: ({ student }: { student: IStudentFee | null }) => (
      <FeeConcession student={student} />
    ),
  },
];

interface FinanceStudentDetailedFeeComponentProps {
  studentId: string;
  student: IStudentFee | null;
  collectFeesDialog: UseBooleanReturn;
  viewDialog: UseBooleanReturn;
}

const FinanceStudentDetailedFeeComponent: React.FC<FinanceStudentDetailedFeeComponentProps> = ({
  studentId,
  student,
  collectFeesDialog,
  viewDialog,
}) => {
  // Initialize tab state, defaulting to 'overview'
  const tabs = useTabs('overview');

  // Find the currently selected tab's component to render
  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;

  return (
    <Card sx={{ boxShadow: 'var(--shadows-4)' }}>
      <CustomTabs value={tabs.value} onChange={tabs.onChange}>
        {TABS.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={
              <Box display="flex" alignItems="center" gap={1}>
                {tab.icon}
                {tab.label}
              </Box>
            }
            sx={{
              fontSize: '14px',
              textTransform: 'none',
            }}
          />
        ))}
      </CustomTabs>

      <Box sx={{ px: 2, mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<CreditCardIcon />}
          color="primary"
          size="small"
          onClick={() => {
            collectFeesDialog.onTrue();
            viewDialog.onFalse();
          }}
        >
          Collect Fees
        </Button>
      </Box>

      <Box px={1} pt={2}>
        {CurrentComponent?.({ student })}
      </Box>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mt: 2,
          ml: 1,
          mb: 2,
          alignItems: 'center',
          justifyItems: 'space-between',
        }}
      >
        {/* <Button variant="outlined" startIcon={<ArrowForwardIcon />} size="small">
          Send Reminder
        </Button> */}
      </Box>
    </Card>
  );
};

export default FinanceStudentDetailedFeeComponent;
