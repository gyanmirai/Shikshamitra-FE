'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';

import { Box } from '@mui/material';
import React, { useMemo } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

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
        id: 'description',
        label: 'Description',
        align: 'left',
      },
      {
        id: 'documents',
        label: 'Documents',
        align: 'left',
        render: (value) => (value || []).map((doc: any) => doc.documentName).join(', '),
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
