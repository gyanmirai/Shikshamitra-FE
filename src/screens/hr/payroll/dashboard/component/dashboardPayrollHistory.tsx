import React from 'react';

import { Box } from '@mui/material';

import CustomizableTable from 'src/components/customizabaleTable';

const DashboardPayrollHistory = () => (
  <Box>
    <CustomizableTable
      tableId="payroll-history-table"
      columns={[
        { id: 'month', label: 'Month' },
        { id: 'totalEmployee', label: 'Total Employee' },
        { id: 'totalNetPayble', label: 'Total Net Payble' },
        { id: 'fixPay', label: 'Fix Pay' },
        { id: 'bonus', label: 'Bonus' },
        { id: 'tds', label: 'TDS' },
        { id: 'pt', label: 'PT' },
        { id: 'deduction', label: 'Deduction' },
        { id: 'status', label: 'Status' },
      ]}
      data={[]}
    />
  </Box>
);

export default DashboardPayrollHistory;
