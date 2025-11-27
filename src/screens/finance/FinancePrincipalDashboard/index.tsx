'use client';

import React from 'react';
import { Box, Grid } from '@mui/material';

// New Components

import FinanceAlertsList from './Components/FinanceAlertsList';
import FinanceRevenueStreams from './Components/FinanceRevenueStreams';
import FinanceExpenseBreakdown from './Components/FinanceExpenseBreakdown';
import FinanceConcessionImpact from './Components/FinanceConcessionImpact';
import FinanceNeedApprovalList from './Components/FinanceNeedApprovalList';
import FinancePrincipalOverview from './Components/FinancePrincipalOverview';
import FinanceFeeStatusOverview from './Components/FinanceFeeStatusOverview';
import FinanceRecentExpenses from '../dashboard/Components/FinanceRecentExpenses';
// Reused Components
import FinanceMonthlyFeesCollectionTrend from '../dashboard/Components/FinanceMonthlyFeesCollectionTrend';

const FinancePrincipalDashboard = () => (
  <Box sx={{ p: 2 }}>
    <Grid container spacing={3}>
      {/* Summary Cards */}
      <Grid size={{ xs: 12 }}>
        <FinancePrincipalOverview />
      </Grid>

      {/* Charts Row 1 */}
      <Grid size={{ xs: 12, md: 8 }}>
        <FinanceMonthlyFeesCollectionTrend
          title="Yearly Collection Trend"
          subheader="(+43%) than last year"
          chart={{
            labels: [
              'Jan',
              'Feb',
              'Mar',
              'Apr',
              'May',
              'Jun',
              'Jul',
              'Aug',
              'Sep',
              'Oct',
              'Nov',
              'Dec',
            ],
            series: [
              {
                name: 'Total Collection',
                type: 'column',
                fill: 'solid',
                data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
              },
              {
                name: 'Expected',
                type: 'line',
                fill: 'solid',
                data: [10, 34, 13, 56, 77, 88, 99, 77, 45, 13, 56, 77],
              },
            ],
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <FinanceExpenseBreakdown
          title="Expense Breakdown"
          chart={{
            labels: ['Staff Salary', 'Infrastructure', 'Admin', 'Others'],
            series: [45000, 25000, 15000, 10000],
          }}
        />
      </Grid>

      {/* Charts Row 2 */}
      <Grid size={{ xs: 12, md: 4 }}>
        <FinanceFeeStatusOverview
          title="Fee Status Overview"
          subheader="Student Count by Status"
          chart={{
            labels: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'],
            series: [
              { name: 'Paid', data: [44, 55, 41, 67, 22] },
              { name: 'Partial', data: [13, 23, 20, 8, 13] },
              { name: 'Pending', data: [11, 17, 15, 15, 21] },
            ],
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <FinanceConcessionImpact
          title="Concession Impact"
          subheader="Amount given as concession"
          chart={{
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
            series: [
              {
                name: 'Concession Amount',
                data: [1000, 2500, 1500, 3000, 2000, 4000, 3500, 5000, 4500],
              },
            ],
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <FinanceRevenueStreams
          title="Revenue Streams"
          subheader="Other income sources"
          chart={{
            labels: ['Transport', 'Hostel', 'Uniform', 'Events', 'Canteen'],
            series: [
              {
                name: 'Revenue',
                data: [50000, 35000, 25000, 15000, 10000],
              },
            ],
          }}
        />
      </Grid>

      {/* Lists Row */}
      <Grid size={{ xs: 12, md: 4 }}>
        <FinanceNeedApprovalList
          title="Pending Approvals"
          list={[
            {
              id: '1',
              type: 'Concession',
              studentName: 'Rohan Sharma',
              description: 'Merit Scholarship',
              amount: 5000,
              date: '2025-07-20',
            },
            {
              id: '2',
              type: 'Charge',
              studentName: 'Priya Patel',
              description: 'Late Fee Waiver',
              amount: 500,
              date: '2025-07-19',
            },
            {
              id: '3',
              type: 'Concession',
              studentName: 'Amit Kumar',
              description: 'Sibling Discount',
              amount: 2000,
              date: '2025-07-18',
            },
            {
              id: '4',
              type: 'Charge',
              studentName: 'Sneha Gupta',
              description: 'Library Fine',
              amount: 150,
              date: '2025-07-18',
            },
          ]}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <FinanceRecentExpenses
          title="Major Expenses"
          list={[
            {
              id: '1',
              category: 'Infrastructure Repair',
              amount: 12000,
              addedBy: 'Admin',
              date: '2025-07-20',
              avatarUrl: '',
            },
            {
              id: '2',
              category: 'Annual Function',
              amount: 8500,
              addedBy: 'Event Coordinator',
              date: '2025-07-18',
              avatarUrl: '',
            },
            {
              id: '3',
              category: 'Lab Equipment',
              amount: 5000,
              addedBy: 'Science Dept',
              date: '2025-07-15',
              avatarUrl: '',
            },
            {
              id: '4',
              category: 'Sports Gear',
              amount: 3000,
              addedBy: 'Sports Dept',
              date: '2025-07-12',
              avatarUrl: '',
            },
          ]}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <FinanceAlertsList
          title="Finance Alerts"
          list={[
            {
              id: '1',
              title: 'Unusual Expense Detected',
              description: 'High maintenance cost recorded this week.',
              severity: 'warning',
              date: '2 hours ago',
            },
            {
              id: '2',
              title: 'Low Collection Trend',
              description: 'Collection is 15% below target for July.',
              severity: 'error',
              date: '1 day ago',
            },
            {
              id: '3',
              title: 'Budget Exceeded',
              description: 'Sports department exceeded monthly budget.',
              severity: 'info',
              date: '2 days ago',
            },
          ]}
        />
      </Grid>
    </Grid>
  </Box>
);

export default FinancePrincipalDashboard;
