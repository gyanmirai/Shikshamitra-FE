'use client';

import type { IColumn } from 'src/components/customizable-table/types';

import { Box } from '@mui/material';
import React, { useMemo } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';

import { ConcessionBasedOn } from '../type';

import type { IConcessionTypeForm, IConcessionTableProps } from '../type';

const ConcessionTypeTable: React.FC<IConcessionTableProps> = ({
  data,
  isLoading,
  addConcessionType,
  setEditData,
  onEdit,
  onDelete,
  onView,
}) => {
  const tableData = useMemo(
    () =>
      (data || []).map((row: any) => ({
        ...row,
        amountPercentageValue:
          row.basedOn === ConcessionBasedOn.Fixed
            ? `₹ ${row.amount?.toLocaleString()}`
            : `${row.amount}%`,
        applicableFeeHeadsValue: (row.applicableFeeHeads || [])
          .map((item: any) => item.name)
          .join(', '),
        documentRequiredValue: row.isDocumentRequired ? 'Yes' : 'No',
      })),
    [data]
  );

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'name',
        label: 'Name',
        align: 'left',
      },
      {
        id: 'basedOn',
        label: 'Based On',
        align: 'left',
        render: (value) => (value === ConcessionBasedOn.Fixed ? 'Fixed' : 'Percentage'),
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
        id: 'isDocumentRequired',
        label: 'Documents Required',
        align: 'left',
        render: (value, row) => (row.isDocumentRequired ? 'Yes' : 'No'),
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
            showViewIcon
            handleViewClick={() => {
              onView?.(row as IConcessionTypeForm);
            }}
            showEditIcon
            showDeleteIcon
            handleEditClick={() => onEdit?.(row as IConcessionTypeForm)}
            handleDeleteClick={() => onDelete?.(row as IConcessionTypeForm)}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <CustomizableTable
      tableId="concession-table"
      isLoading={isLoading}
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
      columns={columns}
      data={tableData || []}
    />
  );
};

export default ConcessionTypeTable;
