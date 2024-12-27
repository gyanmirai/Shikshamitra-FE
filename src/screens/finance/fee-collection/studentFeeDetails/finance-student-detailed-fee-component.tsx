'use client';

import React from 'react';

import { Box, Tab, Card, Typography } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { CustomTabs } from 'src/components/custom-tabs';

import FinanceStudentPendingFeeTab from './finance-student-pending-fee-tab';
import FinanceFeeRefundHistory from '../feeRefund/finance-fee-refund-history';
import FinanceStudentFeeBreakdownTab from './finance-student-fee-breakdown-tab';
import FinanceFeeCollectionCharges from '../charges/finance-fee-collection-charges';
// import FinanceFeeCollectionRefundTab from '../feeRefund/finance-fee-collection-refund';
import FinanceFeeCollectionPaymentHistoryComponent from '../collectFees/component/finance-fee-collection-payment-history-component';

const TABS = [
  {
    value: 'fee-breakdown',
    label: 'Fee Breakdown',
    component: () => <FinanceStudentFeeBreakdownTab />,
  },
  {
    value: 'payment-history',
    label: 'Payment History',
    component: () => <FinanceFeeCollectionPaymentHistoryComponent />,
  },
  {
    value: 'pending-fees',
    label: 'Pending Fees',
    component: () => <FinanceStudentPendingFeeTab />,
  },
  {
    value: 'charges',
    label: 'Charges',
    component: () => <FinanceFeeCollectionCharges />,
  },
  {
    value: 'fee-refund',
    label: 'Refund History',
    component: () => <FinanceFeeRefundHistory />,
  },
];

interface FinanceStudentDetailedFeeComponentProps {
  studentId: string;
}

const FinanceStudentDetailedFeeComponent: React.FC<FinanceStudentDetailedFeeComponentProps> = ({
  studentId,
}) => {
  const tabs = useTabs('fee-breakdown');
  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;

  return (
    <Box pt="15px">
      <Typography sx={{ mb: '15px', fontSize: '16px' }}>Detailed Fee View</Typography>
      <Card>
        <CustomTabs value={tabs.value} onChange={tabs.onChange} variant="fullWidth">
          {TABS.map((tab) => (
            <Tab sx={{ fontSize: '12px' }} key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </CustomTabs>
      </Card>
      <Box px={1} pt={2}>
        {CurrentComponent?.()}
      </Box>
    </Box>
  );
};

export default FinanceStudentDetailedFeeComponent;
