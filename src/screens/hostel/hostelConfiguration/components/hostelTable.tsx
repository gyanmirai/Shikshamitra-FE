'use client';

import { Iconify } from 'src/components/iconify';
import React, { useState, useCallback } from 'react';
import { Box, MenuItem, MenuList } from '@mui/material';
import { useSearchParam } from 'src/hooks/use-search-param';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import hostelTableData from 'src/json/hostel/hostelConfiguration/hostelTableData.json';

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
}) => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'dateWise' });

  // State to manage the hostel data
  const [hostelData, setHostelData] = useState<IHostelData[]>(hostelTableData);

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          {/* {(row.status === 'Cancelled' || row.status === 'Scheduled') && ( */}
          <MenuItem
            onClick={() => {
              setSearchParams({ hostel: row.hostelName });
              pop.onClose();
            }}
          >
            <Iconify icon="mdi:plus" sx={{ mr: 1 }} />
            Add Room
          </MenuItem>
          {/* )} */}
        </MenuList>
      </>
    ),
    [setSearchParams]
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
        { id: 'hostelName', label: 'Hostel Name', align: 'left', minWidth: 130 },
        { id: 'hostelType', label: 'Hostel Type', align: 'left', minWidth: 130 },
        {
          id: 'totalFloors',
          label: 'Total Floors',
          align: 'left',
          filterType: 'number',
          minWidth: 180,
        },
        { id: 'assignedWarden', label: 'Assigned Warden', align: 'left', minWidth: 180 },
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
                showDeleteIcon
                showEditIcon
                handleDeleteClick={() => {
                  onDelete(row as IHostelData);
                }}
                handleEditClick={() => {
                  onEdit(row as IHostelData);
                }}
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
