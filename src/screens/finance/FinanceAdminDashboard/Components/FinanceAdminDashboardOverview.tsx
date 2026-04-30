import { Box, Grid } from '@mui/material';
import { financePaths } from 'src/constants/finance-menu';
import { fNumber, fCurrency } from 'src/utils/format-number';
import CompactKPICard from 'src/screens/student/dashboard/principal/kpi-card-item';

// ----------------------------------------------------------------------

const kpiData = [
  {
    id: 'CARD_PENDING_CONCESSION',
    title: 'Pending Concession Requests',
    value: fNumber(8),
    status: 'info' as const,
    path: financePaths.concession,
    tooltip: '8 concession requests awaiting review',
    chart: {
      type: 'bar' as const,
      series: [3, 5, 4, 8, 6, 7, 5, 8, 9, 8],
      width: 30,
      height: 56,
      colors: ['#2196F3'],
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    },
  },
  {
    id: 'CARD_TOTAL_COLLECTION',
    title: 'Total Collection (YTD)',
    value: fCurrency(12500000),
    status: 'success' as const,
    path: financePaths.feeCollection,
    tooltip: 'Total fee collected this academic year',
    chart: {
      type: 'area' as const,
      series: [40, 60, 55, 80, 72, 90, 85, 100, 110, 125],
      width: 30,
      height: 56,
      colors: ['#22C55E'],
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    },
  },
  {
    id: 'CARD_TOTAL_EXPENSE',
    title: 'Total Expenses (YTD)',
    value: fCurrency(8500000),
    status: 'error' as const,
    path: financePaths.expenseTracking,
    tooltip: 'Total expenses incurred this academic year',
    chart: {
      type: 'area' as const,
      series: [30, 45, 40, 60, 55, 70, 65, 80, 78, 85],
      width: 30,
      height: 56,
      colors: ['#FF5630'],
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    },
  },
  {
    id: 'ACTION_FAILED_PAYMENTS',
    title: 'Failed / Partial Payments',
    value: fNumber(12),
    status: 'error' as const,
    path: financePaths.feeCollection,
    tooltip: '12 payments failed or partially paid — action needed',
    chart: {
      type: 'donut' as const,
      series: [88, 12],
      width: 56,
      height: 56,
      colors: ['#22C55E', '#FF5630'],
      labels: ['Successful', 'Failed/Partial'],
    },
  },
  {
    id: 'ACTION_REFUND_PENDING',
    title: 'Refund Requests Pending',
    value: fNumber(7),
    status: 'warning' as const,
    path: financePaths.feeRefund,
    tooltip: '7 refund requests awaiting approval',
    chart: {
      type: 'donut' as const,
      series: [15, 7],
      width: 56,
      height: 56,
      colors: ['#22C55E', '#FFA500'],
      labels: ['Processed', 'Pending'],
    },
  },
  {
    id: 'ACTION_NET_BALANCE',
    title: 'Net Balance (Income − Expense)',
    value: fCurrency(4000000),
    status: 'success' as const,
    path: financePaths.accounts.incomeAndExpense,
    tooltip: 'Income ₹1.25Cr  −  Expense ₹85L  =  Net ₹40L',
    chart: {
      type: 'bar' as const,
      series: [125, 85, 40],
      width: 56,
      height: 56,
      colors: ['#22C55E', '#FF5630', '#2196F3'],
      labels: ['Income', 'Expense', 'Net'],
    },
  },
];

const FinanceAdminDashboardOverview = () => (
  <Box>
    <Grid container spacing={1}>
      {kpiData.map((kpi) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={kpi.id}>
          <CompactKPICard
            title={kpi.title}
            value={kpi.value}
            status={kpi.status}
            path={kpi.path}
            tooltip={kpi.tooltip}
            chart={kpi.chart}
          />
        </Grid>
      ))}
    </Grid>
  </Box>
);

export default FinanceAdminDashboardOverview;
