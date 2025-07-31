'use client';

import React from 'react';

import feeStructureData from 'src/json/finance/student-fee-management/feeStructureData.json';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const FeeStructureTable = () => (
  <CustomizableTable
    tableId="fee-structure-table"
    columns={[
      {
        id: 'name',
        label: 'Fee Structure Name',
        children(row) {
          return (
            <CustomizableTable
              tableId={`fee-heads-${row.id}`}
              columns={[
                { id: 'name', label: 'Fee Head' },
                { id: 'totalFee', label: 'Total Fee' },
                { id: 'discount', label: 'Discount' },
                { id: 'dueDate', label: 'Due Date' },
              ]}
              data={row.feeHeads}
            />
          );
        },
      },
      { id: 'class', label: 'Class' },
      { id: 'board', label: 'Board' },
      { id: 'medium', label: 'Medium' },
      { id: 'receiptBook', label: 'Receipt Book' },
      { id: 'paymentTerm', label: 'Payment Term' },
      {
        id: 'action',
        label: 'Action',
        render: (value, row) => (
          <ThreeDotsActions
            showThreeDots={false}
            showDeleteIcon
            handleDeleteClick={() => {
              // TODO: Implement delete functionality
              console.warn('Delete functionality not yet implemented');
            }}
            showEditIcon
            handleEditClick={() => {
              // TODO: Implement edit functionality
              console.warn('Edit functionality not yet implemented');
            }}
          />
        ),
      },
    ]}
    data={feeStructureData || []}
  />
);

export default FeeStructureTable;
