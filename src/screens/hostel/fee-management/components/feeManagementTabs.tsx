'use client';

import React from 'react';
import { useTabs } from 'src/hooks/useTabs';
import { Box, Tab, Card } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';

import HostelPendingFeeTab from './hostel-pending-fee-tab/hostelPendingFeeTab';
import HostelFeeBreakdownTab from './hostel-fee-breakdown-tab/hostelFeeBreakdownTab';
import HostelAdjustmentComponent from './hostel-adjustment-component/hostelAdjustmentComponent';
import HostelPaymentHistoryComponent from './hostel-payment-history-component/hostelPaymentHistoryComponent';

const TABS = [
  {
    value: 'fee-breakdown',
    label: 'Fee Breakdown',
    component: () => <HostelFeeBreakdownTab />,
  },
  {
    value: 'payment-history',
    label: 'Payment History',
    component: () => <HostelPaymentHistoryComponent />,
  },
  {
    value: 'pending-fees',
    label: 'Pending Fees',
    component: () => <HostelPendingFeeTab />,
  },
  {
    value: 'charges',
    label: 'Charges',
    component: () => <HostelAdjustmentComponent />,
  },
];

interface FinanceStudentDetailedFeeComponentProps {
  studentId: string;
}

const HostelStudentDetailedFeeComponent: React.FC<FinanceStudentDetailedFeeComponentProps> = ({
  studentId,
}) => {
  // Initialize tabs with default value 'fee-breakdown' using custom hook
  const tabs = useTabs('fee-breakdown');

  // Find and store the current component to render based on selected tab value
  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;
  return (
    <Box pt="15px">
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

export default HostelStudentDetailedFeeComponent;
