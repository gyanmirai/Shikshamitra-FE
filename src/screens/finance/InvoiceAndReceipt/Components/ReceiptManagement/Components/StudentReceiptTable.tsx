import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Grid, Typography, IconButton } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetStudentReceiptDataQuery } from 'src/redux/invoiceAndReceipt/studentReceiptApi';

import type { IFeeReceipt } from '../type';

export default function StudentTableView({
  selectedStudent,
}: {
  selectedStudent: IFeeReceipt | null;
}) {
  const { data: receiptData, isLoading: boardLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentReceiptDataQuery,
  });
  return (
    <Box p={2}>
      {/* Student Info Card */}
      <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <Typography>
              <b>Student Name :</b> {selectedStudent?.student}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography>
              <b>Roll No. :</b> {selectedStudent?.rollNo || '-'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography>
              <b>Class/Division :</b> {`${selectedStudent?.class}-${selectedStudent?.division}`}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography>
              <b>GR No. :</b> {selectedStudent?.grNo || '-'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography>
              <b>Payment Term :</b> {selectedStudent?.paymentTerm || '-'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography>
              <b>Total Paid Fees :</b> ₹ {selectedStudent?.totalPaidFees?.toLocaleString() || '-'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography>
              <b>Pending Fees :</b> ₹ {selectedStudent?.totalPendingFees?.toLocaleString() || '-'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography>
              <b>Last Payment Date :</b> {selectedStudent?.lastPaymentDate || '-'}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Receipts List Table */}
      <Typography variant="h6" gutterBottom>
        Receipts Lists
      </Typography>
      <CustomizableTable
        tableId="receipt-table"
        noDataText={<>No Receipt Data Found</>}
        columns={[
          { id: 'receiptId', label: 'Receipt ID', align: 'left', minWidth: '12vw' },
          { id: 'invoiceId', label: 'Invoice ID', align: 'left', minWidth: '12vw' },
          {
            id: 'amount',
            label: 'Amount',
            align: 'left',
            minWidth: '8vw',
            filterType: 'number',
            render: (value) => `₹ ${value.toLocaleString()}`,
          },
          { id: 'paymentMethod', label: 'Payment Method', align: 'left', minWidth: '10vw' },
          {
            id: 'paymentDate',
            label: 'Payment Date',
            align: 'left',
            minWidth: '9vw',
            filterType: 'date',
          },
          {
            id: 'actions',
            label: 'Action',
            align: 'left',
            isFilter: false,
            isSort: false,
            minWidth: 50,
            sticky: true,
            render(value, row) {
              return (
                <Box display="flex">
                  <IconButton>
                    <Iconify icon={GlobalIcons.eye} sx={{ height: '16px', width: '16px' }} />
                  </IconButton>
                </Box>
              );
            },
          },
        ]}
        data={receiptData || []}
      />
    </Box>
  );
}
