'use client';

import { Box, Grid } from '@mui/material';

import FinanceRecentExpenses from './components/FinanceRecentExpenses';
import FinanceCategoryExpense from './components/FinanceCategoryExpense';
import FinanceCollectionMethod from './components/FinanceCollectionMethod';
import FinanceDashboardOverview from './components/FinanceDashboardOverview';
import FinanceIncomeExpenseTrend from './components/FinanceIncomeExpenseTrend';
import FinanceOutstandingByClass from './components/FinanceOutstandingByClass';
import FinanceMonthlyFeesCollectionTrend from './components/FinanceMonthlyFeesCollectionTrend';

const FinanceAccountantDashboardScreen = () => (
  <Box>
    <Grid container spacing={1}>
      <Grid size={{ xs: 12 }}>
        <FinanceDashboardOverview />
      </Grid>

      <Grid size={{ xs: 12, md: 8 }}>
        <FinanceIncomeExpenseTrend
          title="Income vs Expense Trend"
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
                name: 'Income',
                type: 'bar',
                fill: 'solid',
                data: [
                  180000, 150000, 200000, 220000, 175000, 210000, 240000, 195000, 260000, 230000,
                  225000, 250000,
                ],
              },
              {
                name: 'Expense',
                type: 'area',
                fill: 'solid',
                color: '#cfcfcf7d',
                data: [
                  120000, 110000, 130000, 150000, 90000, 125000, 140000, 115000, 160000, 135000,
                  128000, 150000,
                ],
              },
            ],
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <FinanceCollectionMethod
          title="Collection Method"
          chart={{
            series: [
              { label: 'Online', value: 4344 },
              { label: 'Cash', value: 5435 },
              { label: 'Cheque', value: 1443 },
            ],
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <FinanceOutstandingByClass
          title="Paid Fees by Class"
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
                name: 'Outstanding Amount',
                data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 50000) + 10000),
              },
            ],
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <FinanceCategoryExpense
          title="Expense Categories"
          chart={{
            labels: ['Salaries', 'Maintenance', 'Utilities', 'Events', 'Others'],
            series: [
              {
                name: 'Expenses',
                data: [120000, 50000, 30000, 20000, 10000],
              },
            ],
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }} mb={2}>
        <FinanceRecentExpenses
          title="Recent Expenses"
          list={[
            {
              id: '1',
              category: 'Office Supplies',
              amount: 1200,
              addedBy: 'John Doe',
              date: '2 hours ago',
              avatarUrl: '/static/images/avatars/avatar_1.png',
            },
            {
              id: '2',
              category: 'Maintenance',
              amount: 4500,
              addedBy: 'Jane Smith',
              date: '4 hours ago',
              avatarUrl: '/static/images/avatars/avatar_2.png',
            },
            {
              id: '3',
              category: 'Electricity Bill',
              amount: 15000,
              addedBy: 'Admin',
              date: '1 day ago',
              avatarUrl: '/static/images/avatars/avatar_3.png',
            },
            {
              id: '4',
              category: 'Water Bill',
              amount: 2000,
              addedBy: 'Admin',
              date: '1 day ago',
              avatarUrl: '/static/images/avatars/avatar_4.png',
            },
            {
              id: '5',
              category: 'Internet',
              amount: 3000,
              addedBy: 'Admin',
              date: '2 days ago',
              avatarUrl: '/static/images/avatars/avatar_5.png',
            },
          ]}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }} mb={2}>
        <FinanceMonthlyFeesCollectionTrend
          title="Monthly Fees Collection Trend"
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
                data: [
                  115000, 55000, 110000, 135000, 65000, 110000, 185000, 105000, 220000, 110000,
                  150000, 225000,
                ],
              },
            ],
          }}
        />
      </Grid>
    </Grid>
  </Box>
);

export default FinanceAccountantDashboardScreen;
