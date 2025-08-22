import React from 'react';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IFeeReceipt } from '../type';

const ReceiptTable = ({
  data,
  onView,
}: {
  data: IFeeReceipt[];
  onView: (data: IFeeReceipt) => void;
}) => (
  <CustomizableTable
    tableId="fees-status-table"
    noDataText={<>No Fees Data Found</>}
    columns={[
      { id: 'student', label: 'Student Name', align: 'left', minWidth: '12vw', sticky: true },
      { id: 'rollNo', label: 'Roll No.', align: 'left', minWidth: '6vw' },
      { id: 'division', label: 'Division', align: 'left', minWidth: '6vw' },
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
);

export default ReceiptTable;
