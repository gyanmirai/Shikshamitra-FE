'use client';

import React from 'react';

import { Box, Tab, Card, Typography } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { Iconify } from 'src/components/iconify/iconify';

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
}

const FinanceStudentDetailedFeeComponent: React.FC<FinanceStudentDetailedFeeComponentProps> = ({
  studentId,
  student,
}) => {
  // Initialize tab state, defaulting to 'overview'
  const tabs = useTabs('overview');

  // Find the currently selected tab's component to render
  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;

  return (
    <Card sx={{ p: 2, borderRadius: 2, height: '100%', boxShadow: 'var(--shadows-4)' }}>
      {/* <Box sx={{ display: 'flex', flexDirection: 'column', }}> */}
      <Scrollbar sx={{ height: '300px' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Detailed Fee View</Typography>
        </Box>
        <Card>
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
        </Card>

        <Box px={1} pt={2}>
          {CurrentComponent?.({ student })}
        </Box>
      </Scrollbar>
      {/* </Box> */}
    </Card>
  );
};

export default FinanceStudentDetailedFeeComponent;
