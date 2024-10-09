import React from 'react';

import { Box } from '@mui/material';

import FinanceFeeTrackingComponent from './component/finance-fee-tracking';
import FinanceFeeListOverviewComponent from './component/finance-fee-list-overview';
import FinanceFeeStructureOverviewComponent from './component/finance-fee-structure-overview-component';

import type FeeStructureOverView from './data/FeeStructure-interface';

const FinanceFeeStructureOverview = () => {
  const data: FeeStructureOverView[] = [
    {
      classGrade: '12',

      feeType: 'Tuition',
      amount: '$600',

      dueDate: '01-01-2024',
      status: 'Completed',
      action: 'View',
    },
    {
      classGrade: '10',

      feeType: 'Tuition',
      amount: '$600',

      dueDate: '01-01-2024',
      status: 'Completed',
      action: 'View',
    },
    {
      classGrade: '10',

      feeType: 'Tuition',
      amount: '$600',

      dueDate: '01-01-2024',
      status: 'Completed',
      action: 'View',
    },
  ];

  return (
    <Box>
      <FinanceFeeStructureOverviewComponent data={data} />

      <FinanceFeeTrackingComponent />
      <FinanceFeeListOverviewComponent />
    </Box>
  );
};

export default FinanceFeeStructureOverview;
