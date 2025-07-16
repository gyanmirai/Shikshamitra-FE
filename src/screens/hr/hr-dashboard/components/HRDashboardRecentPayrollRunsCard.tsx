import React from 'react';

import { Card, Typography } from '@mui/material';

import CustomizableTable from 'src/components/customizabaleTable';

const HRDashboardRecentPayrollRunsCard = () => (
  <Card sx={{ borderRadius: 3, p: 2, height: '100%' }}>
    {/* Title */}
    <Typography variant="subtitle1" mb={2}>
      Recent Payroll Status
    </Typography>
    <CustomizableTable
      tableId="recentPayrollRuns"
      columns={[
        { id: 'month', label: 'Month' },
        { id: 'runDate', label: 'Run Date' },
        { id: 'totalPaid', label: 'Total Paid' },
        { id: 'status', label: 'Status' },
      ]}
      data={[
        {
          month: 'May 2025',
          runDate: '01-06-2025',
          totalPaid: '₹ 12,45,680',
          status: 'Completed',
        },
        {
          month: 'Apr 2025',
          runDate: '01-05-2025',
          totalPaid: '₹ 12,45,680',
          status: 'Completed',
        },
        {
          month: 'Mar 2025',
          runDate: '01-04-2025',
          totalPaid: '₹ 12,45,680',
          status: 'Completed',
        },
        {
          month: 'Feb 2025',
          runDate: '01-03-2025',
          totalPaid: '₹ 12,45,680',
          status: 'Completed',
        },
      ]}
    />
  </Card>
);

export default HRDashboardRecentPayrollRunsCard;
