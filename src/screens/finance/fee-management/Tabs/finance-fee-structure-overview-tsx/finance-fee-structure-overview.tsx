import React from 'react';

import { Box } from '@mui/material';

// import FinanceFeeTrackingComponent from './component/finance-fee-tracking'
import FinanceFeeListOverviewComponent from './component/finance-fee-list-overview';
import FinanceCreateFeeStructureComponent from './component/finance-create-fee-structure';
import FinanceFeeStructureOverviewComponent from './component/finance-fee-structure-overview-component';

const FinanceFeeStructureOverview = () => (
  <Box>
    <FinanceFeeStructureOverviewComponent />
    <FinanceCreateFeeStructureComponent />
    {/* <FinanceFeeTrackingComponent /> */}
    <FinanceFeeListOverviewComponent />
  </Box>
);

export default FinanceFeeStructureOverview;
