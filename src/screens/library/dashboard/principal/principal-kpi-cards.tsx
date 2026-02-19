import { Grid } from '@mui/material';
import { fNumber } from 'src/utils/format-number';

// Reuse the same component as Admin/Librarian for visual consistency
import CompactKPICard from '../../../student/dashboard/principal/kpi-card-item';

// ----------------------------------------------------------------------

const PrincipalKPICards = () => {
  // Strategic Data with Admin-style structure
  const kpiData = [
    {
      id: 'LIB_PRINCIPAL_TOTAL_BOOKS',
      title: 'Total Books',
      value: fNumber(12450),
      percent: 4.8, // +120 added approx
      icon: 'solar:book-bookmark-bold-duotone',
      status: 'primary' as const,
      chart: { data: [11000, 11200, 11500, 11800, 12000, 12200, 12350, 12450] },
      tooltip: 'Total inventory including new additions this month',
    },
    {
      id: 'LIB_PRINCIPAL_ACTIVE_MEMBERS',
      title: 'Active Members',
      value: fNumber(1180),
      percent: 5.2,
      icon: 'solar:users-group-rounded-bold-duotone',
      status: 'info' as const,
      chart: { data: [1100, 1110, 1120, 1140, 1150, 1160, 1170, 1180] },
      tooltip: 'Active students and staff with library privileges',
    },
    {
      id: 'LIB_PRINCIPAL_CIRCULATION',
      title: 'Monthly Circulation',
      value: fNumber(3450),
      percent: 12.5,
      icon: 'solar:transfer-horizontal-bold-duotone',
      status: 'success' as const,
      chart: { data: [3100, 3200, 3150, 3300, 3350, 3400, 3420, 3450] },
      tooltip: 'Total books issued and returned this month',
    },
    {
      id: 'LIB_PRINCIPAL_OVERDUE',
      title: 'Overdue Rate',
      value: '12%',
      percent: -2.5,
      icon: 'solar:alarm-add-bold-duotone',
      status: 'warning' as const,
      chart: { data: [15, 14, 14, 13, 13, 12.5, 12.2, 12] },
      tooltip: 'Percentage of books currently overdue',
    },
    {
      id: 'LIB_PRINCIPAL_FINE_COLLECTION',
      title: 'Fine Collection Rate',
      value: '85%',
      percent: 3.2,
      icon: 'solar:wallet-money-bold-duotone',
      status: 'success' as const, // High collection is good
      chart: { data: [75, 78, 80, 81, 82, 83, 84, 85] },
      tooltip: 'Percentage of fines collected vs pending',
    },
    {
      id: 'LIB_PRINCIPAL_MEMBERSHIP',
      title: 'Membership Growth',
      value: fNumber(120),
      percent: 4.8,
      icon: 'solar:users-group-rounded-bold-duotone',
      status: 'primary' as const,
      chart: { data: [110, 112, 115, 118, 120, 122, 123, 124] },
      tooltip: 'New members added this month',
    },
  ];

  return (
    <Grid container spacing={1}>
      {kpiData.map((kpi) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={kpi.id}>
          <CompactKPICard
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            percentChange={kpi.percent}
            trendData={kpi.chart.data}
            status={kpi.status}
            tooltip={kpi.tooltip}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default PrincipalKPICards;
