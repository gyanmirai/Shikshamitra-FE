'use client';

import React, { useState } from 'react';

import { Box } from '@mui/material';

import hostelTableData from 'src/json/hostel/hostelConfiguration/hostelTableData.json';

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
}) => {
  const [hostelData, setHostelData] = useState<IHostelData[]>(hostelTableData);

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
        {
          id: 'totalRoomCapacity',
          label: 'Total Room Capacity',
          align: 'left',
          minWidth: 180,
          filterType: 'number',
        },
        { id: 'wardenDetails', label: 'Warden Details', align: 'left', minWidth: 150 },
        { id: 'currentOccupation', label: 'Current Occupation', align: 'left', minWidth: 180 },
        { id: 'hostelType', label: 'Hostel Type', align: 'left', minWidth: 130 },
        { id: 'location', label: 'Location', align: 'left', minWidth: 100 },
        {
          id: 'action',
          label: 'Actions',
          minWidth: 80,
          isSort: false,
          sticky: true,
          isFilter: false,
          render(value, row) {
            return (
              <ThreeDotsActions
                placement="right-top"
                showThreeDots={false}
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
