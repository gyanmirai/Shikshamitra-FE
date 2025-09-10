import React from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { InvoiceData } from './type';

const InvoiceTable = ({
  data,
  onView,
}: {
  data: InvoiceData[];
  onView: (data: InvoiceData) => void;
}) => (
  <CustomizableTable
    tableId="invoice-table"
    noDataText={<>No Invoice Data Found</>}
    columns={[
      { id: 'student', label: 'Student', align: 'left', minWidth: '12vw', sticky: true },
      { id: 'class', label: 'Class', align: 'left', minWidth: '8vw' },
      { id: 'division', label: 'Division', align: 'left', minWidth: '8vw' },
      {
        id: 'amount',
        label: 'Amount',
        align: 'left',
        filterType: 'number',
        minWidth: '8vw',
        render: (value) => `₹ ${value.toLocaleString()}`,
      },
      { id: 'paymentTerm', label: 'Payment Term', align: 'left', minWidth: '9vw' },
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
              handleViewClick={() => onView(row as InvoiceData)}
            />
          );
        },
      },
    ]}
    data={data || []}
  />
);

export default InvoiceTable;
