'use client';

import React from 'react';

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
    data={[
      {
        id: 1,
        name: 'Class 1 Structure',
        class: '1',
        board: 'GSEB',
        medium: 'English',
        receiptBook: 'GSEB',
        paymentTerm: 'Monthly',
        feeHeads: [
          {
            name: 'Tuition Fee',
            color: '#2F80ED',
            totalFee: '₹ 10,000.00',
            discount: '₹ 1,000.00',
            dueDate: '30-04-2026',
          },
          {
            name: 'Hostel Fee',
            color: '#EB5757',
            totalFee: '₹ 10,000.00',
            discount: '₹ 1,000.00',
            dueDate: '30-04-2026',
          },
          {
            name: 'Transport Fee',
            color: '#F2994A',
            totalFee: '₹ 10,000.00',
            discount: '₹ 1,000.00',
            dueDate: '30-04-2026',
          },
          {
            name: 'Admission Fee',
            color: '#F2C94C',
            totalFee: '₹ 5,000.00',
            discount: '₹ 1,000.00',
            dueDate: '30-04-2026',
          },
          {
            name: 'Sport Fee',
            color: '#27AE60',
            totalFee: '₹ 12,000.00',
            discount: '₹ 00',
            dueDate: '30-04-2026',
          },
        ],
      },
    ]}
  />
);

export default FeeStructureTable;
