import type { LabelColor } from 'src/components/label';

import React from 'react';
import { Label } from 'src/components/label';
import { Box, Typography } from '@mui/material';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { InvoiceStatusColors, InvoiceStatusOptions } from 'src/enums/finance-invoice-status';

import type { InvoiceData } from './type';

const InvoiceTable = ({
  data,
  onView,
}: {
  data: InvoiceData[];
  onView: (data: InvoiceData) => void;
}) => (
  <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
    <CustomizableTable
      tableId="invoice-table"
      tableTitle="Invoices"
      noDataText={<>No Invoice Data Found</>}
      columns={[
        {
          stickyPosition: 'left',
          id: 'invoiceNumber',
          label: 'Invoice #',
          align: 'left',
          width: 140,
          minWidth: 120,
          maxWidth: 160,
          sticky: true,
        },
        {
          stickyPosition: 'left',
          id: 'student',
          label: 'Name(Gr No.)',
          align: 'left',
          width: 220,
          minWidth: 180,
          maxWidth: 260,
          sticky: true,
          render: (value, row) => (
            <Typography variant="caption" fontSize="13px">
              {value || '-'} {row.grNumber && `(${row.grNumber})`}
            </Typography>
          ),
        },
        {
          id: 'rollNumber',
          label: 'Roll No.',
          align: 'left',
          width: 96,
          minWidth: 80,
          maxWidth: 120,
        },
        {
          id: 'billingCycle',
          label: 'Billing Cycle',
          align: 'left',
          width: 140,
          minWidth: 120,
          maxWidth: 160,
        },
        {
          id: 'totalAmount',
          label: 'Total',
          align: 'left',
          filterType: 'number',
          width: 120,
          minWidth: 100,
          maxWidth: 160,
          render: (value: number) => `₹ ${value.toLocaleString()}`,
        },
        {
          id: 'paidAmount',
          label: 'Paid',
          align: 'left',
          filterType: 'number',
          width: 120,
          minWidth: 100,
          maxWidth: 160,
          render: (value: number) => `₹ ${value.toLocaleString()}`,
        },
        {
          stickyPosition: 'right',
          id: 'status',
          label: 'Status',
          align: 'left',
          width: 100,
          minWidth: 84,
          maxWidth: 130,
          filterType: 'enum',
          sticky: true,
          enumOptions: InvoiceStatusOptions,
          isSort: false,
          render(value: string) {
            const color = (InvoiceStatusColors[value] || 'default') as LabelColor;
            return <Label color={color}>{value}</Label>;
          },
        },
        {
          align: 'left',
          stickyPosition: 'right',
          excludeFromExport: true,
          id: 'actions',
          label: 'Action',
          isFilter: false,
          isSort: false,
          sticky: true,
          width: 80,
          minWidth: 64,
          render(_value: any, row: any) {
            return (
              <AdaptiveThreeDotsActions directActionLimit={2}
                actions={[
                  {
                    id: 'view',
                    label: 'View',
                    icon: 'carbon:view-filled',
                    onClick: () => onView(row as InvoiceData),
                  },
                ]}
              />
            );
          },
        },
      ]}
      data={data || []}
    />
  </Box>
);

export default InvoiceTable;
