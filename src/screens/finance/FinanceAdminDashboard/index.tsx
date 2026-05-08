'use client';

import React from 'react';
import { Box, Grid } from '@mui/material';

import FinanceAnnualSummaryChart from './Components/FinanceAnnualSummaryChart';
import FinanceRequestStatusChart from './Components/FinanceRequestStatusChart';
import FinanceFeesDistributionChart from './Components/FinanceFeesDistributionChart';
import FinanceAdminDashboardOverview from './Components/FinanceAdminDashboardOverview';
import FinanceConcessionCategoryChart from './Components/FinanceConcessionCategoryChart';

const FinanceAdminDashboardScreen = () => (
  <Box pb={1}>
    <Grid container spacing={1}>
      <Grid size={{ xs: 12 }}>
        <FinanceAdminDashboardOverview />
      </Grid>

      <Grid size={{ xs: 12, md: 7 }}>
        <FinanceAnnualSummaryChart
          title="Annual Finance Summary"
          chart={{
            labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
            series: [
              {
                name: 'Income',
                type: 'line',
                fill: 'solid',
                data: [10000000, 12000000, 11000000, 13000000, 14000000, 15000000, 16000000],
              },
              {
                name: 'Expense',
                type: 'line',
                fill: 'solid',
                data: [8000000, 9000000, 8500000, 9500000, 10000000, 11000000, 12000000],
              },
            ],
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <FinanceRequestStatusChart
          title="Concession Request Status"
          chart={{
            series: [
              { label: 'Approved', value: 45 },
              { label: 'Rejected', value: 15 },
              { label: 'Pending', value: 25 },
            ],
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <FinanceFeesDistributionChart
          title="Student Fees Distribution"
          chart={{
            labels: [
              'Class 1',
              'Class 2',
              'Class 3',
              'Class 4',
              'Class 5',
              'Class 6',
              'Class 7',
              'Class 8',
              'Class 9',
              'Class 10',
              'Class 11',
              'Class 12',
            ],
            series: [
              {
                name: 'Paid',
                data: [
                  85000, 90000, 78000, 95000, 92000, 100000, 105000, 98000, 110000, 115000, 108000,
                  112000,
                ],
              },
              {
                name: 'Pending',
                data: [12000, 8000, 15000, 7000, 10000, 9000, 8500, 12000, 6000, 5000, 7000, 6500],
              },
              {
                name: 'Overdue',
                data: [3000, 2000, 4000, 1500, 2000, 2500, 3000, 2000, 1500, 1000, 2000, 1500],
              },
            ],
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <FinanceConcessionCategoryChart
          title="Concession by Category"
          chart={{
            labels: [
              'Merit-Based Concession',
              'Scholarship Concession',
              'Sibling Concession',
              'Staff Child Concession',
              'Financial Aid Concession',
            ],
            series: [
              {
                name: 'Concessions',
                data: [90, 1500, 3000, 2000, 1000],
              },
            ],
          }}
        />
      </Grid>

      {/* <Grid size={{ xs: 12, md: 6 }}>
        <FinancePendingApprovalsList
          title="Pending Approvals"
          list={[
            {
              id: '1',
              type: 'Charge Request',
              requester: 'John Doe',
              amount: 5000,
              date: '2 hours ago',
              status: 'Pending',
              avatarUrl: '/static/images/avatars/avatar_1.png',
            },
            {
              id: '2',
              type: 'Concession Request',
              requester: 'Jane Smith',
              amount: 2000,
              date: '4 hours ago',
              status: 'Pending',
              avatarUrl: '/static/images/avatars/avatar_2.png',
            },
            {
              id: '3',
              type: 'Charge Request',
              requester: 'Admin',
              amount: 1000,
              date: '1 day ago',
              status: 'Urgent',
              avatarUrl: '/static/images/avatars/avatar_3.png',
            },
          ]}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <FinanceRecentUpdatesList
          title="Recent Updates"
          list={[
            {
              id: '1',
              action: 'Approved Charge',
              user: 'Finance Manager',
              target: 'Library Fee',
              time: new Date(),
              avatarUrl: '/static/images/avatars/avatar_4.png',
            },
            {
              id: '2',
              action: 'Rejected Concession',
              user: 'Principal',
              target: 'Late Fee Waiver',
              time: new Date(Date.now() - 2 * 60 * 60 * 1000),
              avatarUrl: '/static/images/avatars/avatar_5.png',
            },
            {
              id: '3',
              action: 'Updated Policy',
              user: 'Admin',
              target: 'Fee Structure',
              time: new Date(Date.now() - 24 * 60 * 60 * 1000),
              avatarUrl: '/static/images/avatars/avatar_6.png',
            },
          ]}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <FinancePolicyAlertsList
          title="Policy Alerts"
          list={[
            {
              id: '1',
              message: 'Unassigned charges found for Class 10.',
              severity: 'warning',
            },
            {
              id: '2',
              message: 'Fee structure pending approval for next academic year.',
              severity: 'info',
            },
            {
              id: '3',
              message: 'Critical: Budget limit exceeded for Maintenance category.',
              severity: 'error',
            },
          ]}
        />
      </Grid> */}
    </Grid>
  </Box>
);

export default FinanceAdminDashboardScreen;
