import React from 'react';
import { Box } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';

const DashboardPayrollHistory = () => (
  <Box>
    <CustomizableTable
      tableId="payroll-history-table"
      columns={[
        { id: 'month', label: 'Month' },
        { id: 'totalEmployee', label: 'Total Staff', align: 'center' },
        { id: 'totalNetPayble', label: 'Total Net Payble', align: 'center' },
        { id: 'fixPay', label: 'Fix Pay', align: 'center' },
        { id: 'bonus', label: 'Bonus', align: 'center' },
        { id: 'tds', label: 'TDS', align: 'center' },
        { id: 'pt', label: 'PT', align: 'center' },
        { id: 'deduction', label: 'Deduction', align: 'center' },
        { id: 'status', label: 'Status' },
      ]}
      data={[]}
    />
  </Box>
);

export default DashboardPayrollHistory;
