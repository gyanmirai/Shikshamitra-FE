import { Box } from '@mui/system';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Paper, IconButton, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetPaymentHistoryQuery } from 'src/redux/feeCollection/paymentHistory';

import type { IStudentFee } from '../type';

const PaymentHistory = ({ student }: { student: IStudentFee | null }) => {
  const { data: feeHistoryData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetPaymentHistoryQuery,
  });
  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: 1,
        height: '450px',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        mb: 2,
      }}
    >
      <Typography variant="h6" sx={{ color: 'primary.main' }}>
        Payment History
      </Typography>
      <CustomizableTable
        tableId="student-receipt-details"
        noDataText="Fee Data Not Found"
        columns={[
          { id: 'receiptNo', label: 'Receipt No.', align: 'left' },
          { id: 'date', label: 'Date', align: 'left', filterType: 'date' },
          {
            id: 'amount',
            label: 'Amount',
            filterType: 'number',
            align: 'left',
            render: (value) => `₹ ${value.toLocaleString()}`,
          },
          {
            id: 'paymentMethod',
            label: 'Payment Method',
            align: 'left',
            render: (value) =>
              Array.isArray(value) ? <Box>{value.join(', ')}</Box> : <Box>{value}</Box>,
          },
          {
            id: 'action',
            label: 'Action',
            align: 'left',
            sticky: true,
            isSort: false,
            isFilter: false,
            minWidth: 50,
            render: () => (
              <IconButton>
                <Iconify icon={GlobalIcons.download} />
              </IconButton>
            ),
          },
        ]}
        data={feeHistoryData || []}
      />
    </Paper>
  );
};

export default PaymentHistory;
