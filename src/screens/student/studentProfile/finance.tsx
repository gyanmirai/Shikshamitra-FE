import { Box, Grid } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import CustomizableTable from 'src/components/customizabaleTable';

import CompactKPICard from '../dashboard/principal/kpi-card-item';

import type { StudentTabsComponentType } from '.';

const feeRows: any[] = [];

const Finance = (props: StudentTabsComponentType) => {
  const feeCards = [
    {
      id: 'TOTAL_FEES',
      title: 'Total Fees',
      value: '-',
      status: 'primary' as const,
      tooltip: 'Total fee data is not available.',
    },
    {
      id: 'PAID_FEES',
      title: 'Paid Fees',
      value: '-',
      status: 'success' as const,
      tooltip: 'Paid fee data is not available.',
    },
    {
      id: 'DUE_FEES',
      title: 'Due Fees',
      value: '-',
      status: 'warning' as const,
      tooltip: 'Due fee data is not available.',
    },
    {
      id: 'REFUND_STATUS',
      title: 'Refund Status',
      value: '-',
      status: 'info' as const,
      tooltip: 'Refund data is not available.',
    },
  ];

  const columns: any[] = [
    { id: 'feeHead', label: 'Fee Head', align: 'left' },
    { id: 'totalFees', label: 'Total', align: 'left' },
    { id: 'totalPaidAmount', label: 'Paid', align: 'left' },
    { id: 'pendingAmount', label: 'Due', align: 'left' },
    { id: 'status', label: 'Status', align: 'left' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 280px)' }}>
      <Scrollbar sx={{ flexGrow: 1, height: '100%' }}>
        <Box sx={{ gap: 1, minWidth: 360, display: 'flex', flexDirection: 'column' }}>
          <Grid container spacing={1}>
            {feeCards.map((kpi) => (
              <Grid key={kpi.id} size={{ xs: 12, sm: 6, md: 3 }}>
                <CompactKPICard
                  title={kpi.title}
                  value={kpi.value}
                  tooltip={kpi.tooltip}
                  status={kpi.status}
                />
              </Grid>
            ))}
          </Grid>

          <CustomizableTable
            tableId="student-profile-fee-structure"
            columns={columns}
            data={feeRows}
            noDataText="No fee data found."
          />
        </Box>
      </Scrollbar>
    </Box>
  );
};

export default Finance;
