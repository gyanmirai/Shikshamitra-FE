'use client';

import React, { useState, useCallback } from 'react';

import { Box, MenuItem, MenuList } from '@mui/material';

import hostelTableData from 'src/json/hostel/hostelConfiguration/hostelTableData.json';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IHostelData, IHostelDataTableProps } from './type';

const HostelTable: React.FC<IHostelDataTableProps> = ({
  openDialog,
  setOpenDialog,
  editData,
  setEditData,
  onDelete,
  data,
  onEdit,
  onAddRoomDialog,
  onAddRoom,
  onRoomDetails,
}) => {
  const [hostelData, setHostelData] = useState<IHostelData[]>(hostelTableData);

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          {/* {(row.status === 'Cancelled' || row.status === 'Scheduled') && ( */}
          <MenuItem
            onClick={() => {
              onAddRoom(row as IHostelData);
              pop.onClose();
            }}
          >
            <Iconify icon="mdi:plus" sx={{ mr: 1 }} />
            Room Configuration
          </MenuItem>
          <MenuItem
            onClick={() => {
              onRoomDetails(row as IHostelData);
              pop.onClose();
            }}
          >
            <Iconify icon="mdi:eye" sx={{ mr: 1 }} />
            Room Details
          </MenuItem>
          {/* )} */}
        </MenuList>
      </>
    ),
    [onAddRoom, onRoomDetails]
  );

  return (
    <CustomizableTable
      tableId="hostel-data-table"
      searchFieldProps={{
        placeholder: 'Search by Hostel Name...',
        label: 'Search by Hostel Name...',
      }}
      noDataText={
        <>
          No Hostel Data Found{' '}
          <Box
            onClick={() => {
              setOpenDialog(true);
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
            Create Hostel
          </Box>
        </>
      }
      columns={[
        { id: 'hostelName', label: 'Hostel Name', align: 'left' },
        {
          id: 'totalRoomCapacity',
          label: 'Total Room Capacity',
          align: 'left',
          filterType: 'number',
        },
        { id: 'wardenDetails', label: 'Warden Details', align: 'left' },
        { id: 'currentOccupation', label: 'Current Occupation', align: 'left' },
        { id: 'hostelType', label: 'Hostel Type', align: 'left' },
        { id: 'location', label: 'Location', align: 'left' },
        {
          id: 'action',
          label: 'Actions',
          minWidth: 130,
          isSort: false,
          sticky: true,
          isFilter: false,
          render(value, row) {
            return (
              <ThreeDotsActions
                actions={(prop) => actions({ ...prop, row })}
                placement="right-top"
                showViewIcon
                showDeleteIcon
                showEditIcon
                handleDeleteClick={() => {
                  onDelete(row as IHostelData);
                }}
                handleEditClick={() => {
                  onEdit(row as IHostelData);
                }}
                handleViewClick={() => {}}
              />
            );
          },
        },
      ]}
      data={hostelData}
    />
  );
};

export default HostelTable;
