import type { LabelColor } from 'src/components/label';

import React from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Grid, Typography, IconButton } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetStudentInvoiceDataQuery } from 'src/redux/invoiceAndReceipt/studentInvoiceApi';
import {
  InvoiceStatusType,
  InvoiceStatusColors,
  InvoiceStatusOptions,
} from 'src/enums/finance-invoice-status';

import type { InvoiceData } from './type';

export default function InvoiceTableView({
  selectedStudent,
}: {
  selectedStudent: InvoiceData | null;
}) {
  const { data: invoiceData, isLoading: boardLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentInvoiceDataQuery,
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
              <b>Roll No. :</b> {selectedStudent?.rollNumber || '-'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography>
              <b>Class/Division :</b> {`${selectedStudent?.class}-${selectedStudent?.division}`}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography>
              <b>GR No. :</b> {selectedStudent?.grNumber || '-'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography>
              <b>Payment Term :</b> {selectedStudent?.paymentTerm || '-'}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Receipts List Table */}
      <Typography variant="h6" gutterBottom>
        Receipts Lists
      </Typography>
      <CustomizableTable
        tableId="invoice-table"
        noDataText={<>No Invoice Data Found</>}
        columns={[
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
          { id: 'dueDate', label: 'Due Date', align: 'left', minWidth: '9vw', filterType: 'date' },
          {
            id: 'status',
            label: 'Status',
            align: 'left',
            minWidth: 60,
            filterType: 'enum',
            enumOptions: InvoiceStatusOptions,
            isSort: false,
            render(value, row) {
              const color = InvoiceStatusColors[value as InvoiceStatusType] as LabelColor;
              return <Label color={color}>{InvoiceStatusType[value]}</Label>;
            },
          },
          {
            id: 'actions',
            label: 'Action',
            align: 'left',
            isFilter: false,
            isSort: false,
            minWidth: 70,
            sticky: true,
            render(value, row) {
              return (
                <Box display="flex">
                  <IconButton>
                    <Iconify icon={GlobalIcons.eye} sx={{ height: '16px', width: '16px' }} />
                  </IconButton>
                  <IconButton>
                    <Iconify icon="mdi:send" sx={{ height: '16px', width: '16px' }} />
                  </IconButton>
                </Box>
              );
            },
          },
        ]}
        data={invoiceData || []}
      />
    </Box>
  );
}
