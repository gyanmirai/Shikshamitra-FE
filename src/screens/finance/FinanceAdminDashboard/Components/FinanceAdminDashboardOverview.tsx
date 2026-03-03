import { Grid } from '@mui/material';
import { financePaths } from 'src/constants/finance-menu';
import { fNumber, fCurrency } from 'src/utils/format-number';
import CompactKPICard from 'src/screens/student/dashboard/principal/kpi-card-item';

// ----------------------------------------------------------------------

const kpiData = [
  {
    id: 'CARD_PENDING_CONCESSION',
    icon: 'hugeicons:discount',
    title: 'Pending Concession Requests',
    value: fNumber(8),
    status: 'info' as const,
    path: financePaths.concession,
    trendData: [3, 5, 4, 8, 6, 7, 5, 8, 9, 8],
  },
  {
    id: 'CARD_TOTAL_COLLECTION',
    icon: 'hugeicons:money-bag-02',
    title: 'Total Collection (YTD)',
    value: fCurrency(12500000),
    status: 'success' as const,
    path: financePaths.feeCollection,
    trendData: [40, 60, 55, 80, 72, 90, 85, 100, 110, 125],
  },
  {
    id: 'CARD_TOTAL_EXPENSE',
    icon: 'hugeicons:wallet-02',
    title: 'Total Expenses (YTD)',
    value: fCurrency(8500000),
    status: 'error' as const,
    path: financePaths.expenseTracking,
    trendData: [30, 45, 40, 60, 55, 70, 65, 80, 78, 85],
  },
];

const FinanceAdminDashboardOverview = () => (
  <Grid container spacing={2}>
    {kpiData.map((kpi) => (
      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={kpi.id}>
        <CompactKPICard
          title={kpi.title}
          value={kpi.value}
          icon={kpi.icon}
          status={kpi.status}
          path={kpi.path}
          trendData={kpi.trendData}
        />
      </Grid>
    ))}
  </Grid>
);

export default FinanceAdminDashboardOverview;
