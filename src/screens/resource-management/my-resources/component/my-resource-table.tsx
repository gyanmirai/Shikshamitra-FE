import dayjs from 'dayjs';
import React from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, MenuItem, MenuList } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import data from 'src/json/resource-management/my-resources/my-resource-data.json';

import type { IMyResources, IMyResourcesTableProps } from '../my-resources-interface';

const MyResourceTable: React.FC<IMyResourcesTableProps> = ({ onClick }) => (
  <CustomizableTable
    tableId="my-resources-table"
    searchFieldProps={{
      placeholder: 'Search by Name, Category...',
      label: 'Search by Name, Category...',
      sx: {
        maxWidth: '400px',
        width: '100%',
      },
    }}
    noDataText={
      <>
        No Resources Found.
        <Box
          onClick={() => {
            onClick(null, 'new');
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
          New Resource
        </Box>
      </>
    }
    columns={[
      {
        label: 'Name',
        id: 'name',
        minWidth: '150px',
      },
      {
        label: 'Category',
        id: 'category',
        minWidth: '120px',
      },
      {
        label: 'Sub-Category',
        id: 'subCategory',
        minWidth: '120px',
      },
      {
        label: 'Vendor',
        id: 'vendor',
        minWidth: '150px',
      },
      {
        label: 'Condition',
        id: 'condition',
        minWidth: '100px',
      },
      {
        label: 'Status',
        id: 'status',
        minWidth: '100px',
      },
      {
        label: 'Quantity',
        id: 'quantity',
        minWidth: '80px',
        filterType: 'number',
      },
      {
        label: 'Unit',
        id: 'measurementUnit',
        minWidth: '80px',
      },
      {
        label: 'Assigned Date',
        id: 'assignedDate',
        minWidth: '140px',
        filterType: 'date',
        render: (value) => (value ? dayjs(value).format('DD MMM YYYY') : null),
      },
      {
        id: 'action',
        label: 'Actions',
        align: 'left',
        minWidth: 100,
        sticky: true,
        isFilter: false,
        isSort: false,
        render(value, row) {
          return (
            <ThreeDotsActions
              placement="right-top"
              actions={({ popover }) => (
                <MenuList>
                  <MenuItem
                    onClick={() => {
                      onClick(row as IMyResources, 'concern');
                      popover.onClose();
                    }}
                    sx={{ color: 'error.main' }}
                  >
                    <Iconify
                      icon="pepicons-pencil:raise-hand"
                      sx={{ height: '16px', width: '16px' }}
                    />
                    Raise Concern
                  </MenuItem>
                </MenuList>
              )}
            />
          );
        },
      },
    ]}
    data={data}
  />
);

export default MyResourceTable;
