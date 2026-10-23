import type { LabelColor } from 'src/components/label';

import React from 'react';
import { Label } from 'src/components/label';
import { Box, Typography } from '@mui/material';

import CustomizableTable from 'src/components/customizabaleTable';
import { ReceiptStatusColors, ReceiptStatusOptions } from 'src/enums/finance-receipt-status';

import type { IFeeReceipt } from '../type';

const ReceiptTable = ({
  data,
  onView,
}: {
  data: IFeeReceipt[];
  onView: (data: IFeeReceipt) => void;
}) => (
  <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
    <CustomizableTable
      getRowAction={(row) => ({
        label: `Open fees for ${row.student || row.receiptNumber || 'student'}`,
        onClick: () => {
          onView(row as IFeeReceipt);
        },
      })}
      tableTitle="Receipts"
      tableId="fees-status-table"
      noDataText={<>No Fees Data Found</>}
      columns={[
        {
          stickyPosition: 'left',
          id: 'student',
          label: 'Student Name',
          align: 'left',
          minWidth: '12vw',
          sticky: true,
          render: (value, row) => (
            <Typography variant="caption" fontSize="13px">
              {value || '-'} {row.grNumber && `(${row.grNumber})`}
            </Typography>
          ),
        },
        { id: 'rollNo', label: 'Roll No.', align: 'left', minWidth: '6vw' },
        {
          id: 'totalPaidFees',
          label: 'Total Paid Fees',
          align: 'left',
          filterType: 'number',
          minWidth: '10vw',
          render: (value) => `₹ ${value.toLocaleString()}`,
        },
        {
          id: 'totalPendingFees',
          label: 'Total Pending Fees',
          align: 'left',
          filterType: 'number',

          minWidth: '12vw',
          render: (value) => `₹ ${value.toLocaleString()}`,
        },
        {
          id: 'lastPaymentDate',
          label: 'Last Payment Date',
          align: 'left',
          minWidth: '10vw',
          filterType: 'date',
        },
        {
          stickyPosition: 'right',
          id: 'status',
          label: 'Status',
          align: 'left',
          minWidth: '6vw',
          filterType: 'enum',
          sticky: true,
          enumOptions: ReceiptStatusOptions,
          isSort: false,
          render(value: string) {
            const color = (ReceiptStatusColors[value] || 'default') as LabelColor;
            return <Label color={color}>{value}</Label>;
          },
        },
      ]}
      data={data || []}
    />
  </Box>
);

export default ReceiptTable;
