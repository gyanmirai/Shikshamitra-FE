'use client';

import React from 'react';

import { Box } from '@mui/material';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IConcessionTypeForm, IConcessionTableProps } from '../type';

const ConcessionTypeTable: React.FC<IConcessionTableProps> = ({
  data,
  addConcessionType,
  setEditData,
  onEdit,
  onDelete,
}) => (
  <CustomizableTable
    tableId="concession-table"
    noDataText={
      <>
        No Concession data found
        <Box
          onClick={() => {
            addConcessionType.onTrue();
            setEditData(null);
          }}
          color="primary.main"
          fontWeight={600}
          sx={{
            '&:hover': {
              cursor: 'pointer',
              color: 'primary.main',
              textDecoration: 'underline',
            },
          }}
        >
          Add Concession
        </Box>
      </>
    }
    columns={[
      {
        id: 'concessionName',
        label: 'Concession Name',
        align: 'left',
      },
      {
        id: 'concessionType',
        label: 'Concession Type',
        align: 'left',
      },
      {
        id: 'amountPercentage',
        label: 'Amount/Percentage',
        align: 'left',
        render: (value, row) =>
          row.concessionType === 'fixed'
            ? `₹ ${row.amount?.toLocaleString()}`
            : `${row.percentage}%`,
      },
      {
        id: 'applicableFeeHeads',
        label: 'Applicable Fee Heads',
        align: 'left',
        render: (value, row) => row.applicableFeeHeads.join(', '),
      },
      {
        id: 'documentRequired',
        label: 'Documents Required',
        align: 'left',
        render: (value, row) => (row.documentRequired ? 'Yes' : 'No'),
      },
      {
        id: 'actions',
        label: 'Actions',
        align: 'left',
        isSort: false,
        isFilter: false,
        sticky: true,
        minWidth: 50,
        render: (value, row) => (
          <ThreeDotsActions
            showThreeDots={false}
            showEditIcon
            showDeleteIcon
            handleEditClick={() => onEdit?.(row as IConcessionTypeForm)}
            handleDeleteClick={() => onDelete?.(row as IConcessionTypeForm)}
          />
        ),
      },
    ]}
    data={data || []}
  />
);

export default ConcessionTypeTable;
