'use client';

import React from 'react';

import { Box, Tab, Card } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { CustomTabs } from 'src/components/custom-tabs';

import FinanceStudentFeeTab from './finance-student-fee-tab';
import FinanceFeeCollectionTab from './collectFees/finance-fee-collection-tab';
import FinanceFeeCollectionPaymentHistoryTab from './paymentHistory/finance-fee-collection-payment-history.tab';
import FinanceFeeCollectionRefundTab from './feeRefund/finance-fee-collection-refund';

const TABS = [
  {
    value: 'collect-fee',
    label: 'Collect Fees',
    component: () => <FinanceFeeCollectionTab />,
  },
  {
    value: 'student-fee',
    label: 'Student Fees',
    component: () => <FinanceStudentFeeTab />,
  },
  {
    value: 'payment-history',
    label: 'Payment History',
    component: () => <FinanceFeeCollectionPaymentHistoryTab />,
  },
  {
    value: 'fee-refund',
    label: 'Fee Refund',
    component: () => <FinanceFeeCollectionRefundTab />,
  },
  



];





const FinanceFeeCollectionScreen = () => {
  const tabs = useTabs('collect-fee');

  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;
  return (
    <Box>
      <Card>
        <CustomTabs
          value={tabs.value}
          onChange={tabs.onChange}
          variant="fullWidth"
          slotProps={{ tab: { px: 0 } }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </CustomTabs>
      </Card>
      <Box px={1} pt={2}>
        {CurrentComponent?.()}
      </Box>
    </Box>
  );
};




export default FinanceFeeCollectionScreen