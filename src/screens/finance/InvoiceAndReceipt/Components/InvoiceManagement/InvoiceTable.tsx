import type { LabelColor } from 'src/components/label';

import React from 'react';

import { Box, IconButton } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import {
  InvoiceStatusType,
  InvoiceStatusColors,
  InvoiceStatusOptions,
} from 'src/enums/finance-invoice-status';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';

const InvoiceTable = ({ data }: any) => (
  <CustomizableTable
    tableId="invoice-table"
    noDataText={<>No Invoice Data Found</>}
    columns={[
      { id: 'invoiceId', label: 'Invoice ID', align: 'left', minWidth: '10vw', sticky: true },
      { id: 'student', label: 'Student', align: 'left', minWidth: '12vw' },
      { id: 'classDivision', label: 'Class/Division', align: 'left', minWidth: '8vw' },
      {
        id: 'amount',
        label: 'Amount',
        align: 'left',
        minWidth: '8vw',
        render: (value) => `₹ ${value.toLocaleString()}`,
      },
      { id: 'dueDate', label: 'Due Date', align: 'left', minWidth: '9vw' },
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
              <IconButton>
                <Iconify icon={GlobalIcons.share} sx={{ height: '16px', width: '16px' }} />
              </IconButton>
            </Box>
          );
        },
      },
    ]}
    data={data || []}
  />
);

export default InvoiceTable;
