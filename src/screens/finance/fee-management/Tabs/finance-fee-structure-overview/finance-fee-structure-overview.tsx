import React from 'react';

import { Box } from '@mui/material';

import FinanceFeeStructureOverviewComponent from './component/finance-fee-structure-overview-component';

import type FeeStructureOverView from './data/FeeStructure-interface';

const FinanceFeeStructureOverview = () => {
  const data: FeeStructureOverView[] = [
    {
      classGrade: '12',
      feeType: 'Tuition',
      amount: '60000',
      dueDate: '01-01-2024',
      status: 'Paid',
      action: 'View',
    },
    {
      classGrade: '10',
      feeType: 'Tuition',
      amount: '40000',
      dueDate: '01-01-2024',
      status: 'Paid',
      action: 'View',
    },
  ];

  return (
    <Box>
      {/* <CustomBreadcrumbs
        heading="Fee Structure Overview"
        links={[{ name: 'Finance' }, { name: 'Fee Structure Overview' }]}
        sx={{ px: 1, mb: 2 }}
        
      /> */}
      {/* <FinanceFeeTrackingComponent /> */}
      <FinanceFeeStructureOverviewComponent data={data} />

      {/* <FinanceFeeListOverviewComponent /> */}
    </Box>
  );
};

export default FinanceFeeStructureOverview;
