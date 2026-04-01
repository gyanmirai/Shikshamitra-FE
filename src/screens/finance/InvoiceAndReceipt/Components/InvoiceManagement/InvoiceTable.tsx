import type { LabelColor } from 'src/components/label';

import React from 'react';
import { Box } from '@mui/material';
import { Label } from 'src/components/label';
import ThreeDotsActions from 'src/components/three-dots-actions';
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
          id: 'invoiceNumber',
          label: 'Invoice #',
          align: 'left',
          minWidth: '10vw',
          sticky: true,
        },
        {
          id: 'student',
          label: 'Student(Gr No.)',
          align: 'left',
          minWidth: '12vw',
          sticky: true,
          render(value, row) {
            return `${row.student} (${row.grNumber})`;
          },
        },
        {
          id: 'rollNumber',
          label: 'Roll No.',
          align: 'left',
          minWidth: '6vw',
        },
        {
          id: 'billingCycle',
          label: 'Billing Cycle',
          align: 'left',
          minWidth: '8vw',
        },
        {
          id: 'totalAmount',
          label: 'Total',
          align: 'left',
          filterType: 'number',
          minWidth: '7vw',
          render: (value: number) => `₹ ${value.toLocaleString()}`,
        },
        {
          id: 'paidAmount',
          label: 'Paid',
          align: 'left',
          filterType: 'number',
          minWidth: '7vw',
          render: (value: number) => `₹ ${value.toLocaleString()}`,
        },
        {
          id: 'status',
          label: 'Status',
          align: 'left',
          minWidth: '6vw',
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
          id: 'actions',
          label: 'Action',
          isFilter: false,
          isSort: false,
          sticky: true,
          minWidth: 60,
          render(_value: any, row: any) {
            return (
              <ThreeDotsActions
                showThreeDots={false}
                showViewIcon
                handleViewClick={() => onView(row as InvoiceData)}
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
