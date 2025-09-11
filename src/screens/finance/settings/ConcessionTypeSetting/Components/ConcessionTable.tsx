'use client';

import { Box } from '@mui/material';
import React, { useMemo } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IConcessionTypeForm, IConcessionTableProps } from '../type';

const ConcessionTypeTable: React.FC<IConcessionTableProps> = ({
  data,
  addConcessionType,
  setEditData,
  onEdit,
  onDelete,
}) => {
  const tableData = useMemo(
    () =>
      (data || []).map((row: IConcessionTypeForm) => ({
        ...row,
        amountPercentageValue:
          row.concessionType === 'fixed'
            ? `₹ ${row.amount?.toLocaleString()}`
            : `${row.percentage}%`,
        applicableFeeHeadsValue: row.applicableFeeHeads?.join(', '),
        documentRequiredValue: row.documentRequired ? 'Yes' : 'No',
      })),
    [data]
  );

  return (
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
          id: 'amountPercentageValue',
          label: 'Amount/Percentage',
          align: 'left',
        },
        {
          id: 'applicableFeeHeadsValue',
          label: 'Applicable Fee Heads',
          align: 'left',
        },
        {
          id: 'documentRequiredValue',
          label: 'Documents Required',
          align: 'left',
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
      data={tableData || []}
    />
  );
};

export default ConcessionTypeTable;
