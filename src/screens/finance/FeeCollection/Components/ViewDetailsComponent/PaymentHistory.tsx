import type { PaymentHistoryItem } from 'src/redux/feeCollection/feeCollection';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { Chip, Paper, Stack, Tooltip, IconButton, Typography } from '@mui/material';

import type { IStudentFee } from '../type';

const PaymentHistory = ({
  student,
  payments,
}: {
  student: IStudentFee | null;
  payments?: PaymentHistoryItem[];
}) => {
  const tableData = useMemo(
    () =>
      (payments ?? []).map((p) => ({
        receiptNo: p.receiptNumber,
        date: p.date ? new Date(p.date).toLocaleDateString('en-IN') : '-',
        amount: p.amount,
        paymentMethod: p.paymentMethods?.join(', ') ?? '-',
      })),
    [payments]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          height: '450px',
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          border: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack spacing={0.5}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Payment History
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            View and download past transaction receipts
          </Typography>
        </Stack>

        <CustomizableTable
          tableId="student-receipt-details"
          noDataText="Data Not Found"
          columns={[
            {
              id: 'receiptNo',
              label: 'Receipt No.',
              align: 'left',
              render: (value) => (
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {value}
                </Typography>
              ),
            },
            {
              id: 'date',
              label: 'Date',
              align: 'left',
              filterType: 'date',
              render: (value) => (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {value}
                </Typography>
              ),
            },
            {
              id: 'amount',
              label: 'Amount',
              filterType: 'number',
              align: 'left',
              render: (value) => (
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'success.main' }}>
                  ₹ {value.toLocaleString()}
                </Typography>
              ),
            },
            {
              id: 'paymentMethod',
              label: 'Payment Method',
              align: 'left',
              render: (value) => {
                const method = Array.isArray(value) ? value.join(', ') : value;
                return (
                  <Chip
                    label={method}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderRadius: 1,
                      fontWeight: 600,
                      borderColor: 'divider',
                      color: 'text.secondary',
                    }}
                  />
                );
              },
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
                <Tooltip title="Download Receipt" arrow>
                  <IconButton
                    size="small"
                    sx={{
                      color: 'text.secondary',
                      '&:hover': { color: 'primary.main', bgcolor: 'action.hover' },
                    }}
                  >
                    <Iconify icon={GlobalIcons.download} width={20} />
                  </IconButton>
                </Tooltip>
              ),
            },
          ]}
          data={tableData}
        />
      </Paper>
    </motion.div>
  );
};

export default PaymentHistory;
