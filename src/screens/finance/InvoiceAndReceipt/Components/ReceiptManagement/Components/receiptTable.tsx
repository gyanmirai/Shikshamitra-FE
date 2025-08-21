import React from 'react';

import { Box, IconButton } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';

const ReceiptTable = ({ data }: any) => (
  <CustomizableTable
    tableId="receipt-table"
    noDataText={<>No Receipt Data Found</>}
    columns={[
      { id: 'receiptId', label: 'Receipt ID', align: 'left', minWidth: '10vw', sticky: true },
      { id: 'invoiceId', label: 'Invoice ID', align: 'left', minWidth: '10vw' },
      { id: 'student', label: 'Student', align: 'left', minWidth: '12vw' },
      {
        id: 'amount',
        label: 'Amount',
        align: 'left',
        minWidth: '8vw',
        render: (value) => `₹ ${value.toLocaleString()}`,
      },
      { id: 'paymentMethod', label: 'Payment Method', align: 'left', minWidth: '10vw' },
      { id: 'paymentDate', label: 'Payment Date', align: 'left', minWidth: '9vw' },
      {
        id: 'actions',
        label: 'Actions',
        isFilter: false,
        isSort: false,
        align: 'left',
        minWidth: 70,
        sticky: true,
        render(value, row) {
          return (
            <Box display="flex">
              <IconButton>
                <Iconify icon={GlobalIcons.eye} sx={{ height: '16px', width: '16px' }} />
              </IconButton>
              <IconButton>
                <Iconify icon={GlobalIcons.download} sx={{ height: '16px', width: '16px' }} />
              </IconButton>
            </Box>
          );
        },
      },
    ]}
    data={data || []}
  />
);

export default ReceiptTable;
