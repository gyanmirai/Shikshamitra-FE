'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { formatNumber } from 'src/utils/formate_number';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';

import type { IHostelRequestFormType, IHostelRequestTableProps } from './type';

const HostelRequestTable: React.FC<IHostelRequestTableProps> = ({
  open,
  setOpen,
  addNewRequestDialog,
  requests,
  onDelete,
  onEdit,
  onRequestDetails,
  onAssignRoom,
}) => (
  <CustomizableTable
    tableId="hostel-request-table"
    searchFieldProps={{
      placeholder: 'Search by Student Name...',
      label: 'Search by Student Name...',
    }}
    noDataText={
      <>
        No Hostel Requests Found{' '}
        <Box
          onClick={() => {
            addNewRequestDialog.onTrue();
            setOpen(true);
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
          Create Request
        </Box>
      </>
    }
    columns={[
      { id: 'name', label: 'Student Name', align: 'left', minWidth: 150 },
      { id: 'gender', label: 'Gender', align: 'left', minWidth: 100 },
      { id: 'email', label: 'Email', align: 'left', minWidth: 150 },
      { id: 'className', label: 'Class', align: 'left', minWidth: 100 },
      { id: 'division', label: 'Division', align: 'left', minWidth: 100 },
      { id: 'hostelName', label: 'Hostel Name', align: 'left', minWidth: 130 },
      { id: 'hostelType', label: 'Hostel Type', align: 'left', minWidth: 130 },
      { id: 'roomType', label: 'Room Type', align: 'left', minWidth: 130 },
      {
        id: 'totalAmount',
        label: 'Amount',
        align: 'left',
        filterType: 'number',
        minWidth: 100,
        render(value, row) {
          return (
            <Typography
              sx={{
                fontSize: '12px',
                ...(row.id === 'total' ? { fontWeight: 'bold' } : {}),
              }}
            >
              {formatNumber(row.totalAmount, 'INR')}
            </Typography>
          );
        },
      },
      {
        id: 'action',
        label: 'Actions',
        minWidth: 100,
        isSort: false,
        sticky: true,
        isFilter: false,
        render(value, row) {
          return (
            <ThreeDotsActions
              placement="right-top"
              showThreeDots={false}
              showDeleteIcon
              showEditIcon
              showViewIcon
              handleViewClick={() => {
                onRequestDetails(row as IHostelRequestFormType);
              }}
              handleDeleteClick={() => {
                onDelete(row as IHostelRequestFormType);
              }}
              handleEditClick={() => {
                onEdit(row as IHostelRequestFormType);
              }}
            />
          );
        },
      },
    ]}
    data={requests}
  />
);
export default HostelRequestTable;
