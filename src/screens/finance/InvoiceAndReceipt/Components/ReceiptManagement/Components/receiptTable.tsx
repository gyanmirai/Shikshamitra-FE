import type { LabelColor } from 'src/components/label';

import React from 'react';
import { Box } from '@mui/material';
import { Label } from 'src/components/label';
import ThreeDotsActions from 'src/components/three-dots-actions';
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
      tableTitle="Receipts"
      tableId="fees-status-table"
      noDataText={<>No Fees Data Found</>}
      columns={[
        { id: 'student', label: 'Student Name', align: 'left', minWidth: '12vw', sticky: true },
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
              <ThreeDotsActions
                placement="right-center"
                showViewIcon
                showThreeDots={false}
                handleViewClick={() => onView(row as IFeeReceipt)}
              />
            );
          },
        },
      ]}
      data={data || []}
    />
  </Box>
);

export default ReceiptTable;
