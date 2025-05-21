'use client';

import React from 'react';

import { Box } from '@mui/material';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IResourceType, IResourceTypeTableProps } from './type';

const ResourceTypeTable: React.FC<IResourceTypeTableProps> = ({
  data,
  onAddResourceType,
  editData,
  open,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
}) => (
  <CustomizableTable
    tableId="resource-type-data-table"
    searchFieldProps={{
      placeholder: 'Search by Resource Type...',
      label: 'Search by Resource Type...',
      sx: {
        maxWidth: '400px',
        width: '100%',
      },
    }}
    noDataText={
      <>
        No Resource Types Found{' '}
        <Box
          onClick={() => {
            onAddResourceType.onTrue();
            setOpenDialog(true);
            setEditData(null);
          }}
          color="primary.main"
          fontWeight={600}
          sx={{
            '&:hover': {
              cursor: 'pointer',
              textDecoration: 'underline',
            },
          }}
        >
          Add Resource Type
        </Box>
      </>
    }
    columns={[
      { id: 'resourceTypeName', label: 'Resource Type Name', align: 'left' },
      {
        id: 'action',
        label: 'Action',
        minWidth: 50,
        isSort: false,
        sticky: true,
        isFilter: false,
        render(value, row) {
          return (
            <ThreeDotsActions
              showThreeDots={false}
              placement="right-top"
              showDeleteIcon
              showEditIcon
              handleDeleteClick={() => {
                onDelete(row as IResourceType);
              }}
              handleEditClick={() => {
                onEdit(row as IResourceType);
              }}
            />
          );
        },
      },
    ]}
    data={data}
  />
);

export default ResourceTypeTable;
