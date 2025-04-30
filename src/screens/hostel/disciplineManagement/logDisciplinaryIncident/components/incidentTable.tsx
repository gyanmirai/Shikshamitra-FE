'use client';

import React from 'react';

import { Box, Chip } from '@mui/material';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IHostelIncident, IHostelIncidentTableProps } from '../type';

const HostelIncidentTable: React.FC<IHostelIncidentTableProps> = ({
  data,
  onAddIncident,
  editData,
  open,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
}) => (
  <CustomizableTable
    tableId="hostel-incident-data-table"
    searchFieldProps={{
      placeholder: 'Search by Hostel Name...',
      label: 'Search by Hostel Name...',
    }}
    noDataText={
      <>
        No Incident Data Found{' '}
        <Box
          onClick={() => {
            onAddIncident.onTrue();
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
          Log Visitor
        </Box>
      </>
    }
    columns={[
      { id: 'hostelName', label: 'Hostel Name', align: 'left', minWidth: 130 },
      { id: 'floor', label: 'Floor', align: 'left', minWidth: 70 },
      {
        id: 'students',
        label: 'Students Involved',
        align: 'left',
        minWidth: 170,
        render: (value: any) => (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {value && value.length > 0
              ? value.map((org: string) => (
                  <Chip key={org} label={org} size="small" variant="outlined" />
                ))
              : '-'}
          </Box>
        ),
      },
      {
        id: 'incidentDate',
        label: 'Incident Date',
        align: 'left',
        minWidth: 130,
      },
      {
        id: 'incidentTime',
        label: 'Incident Time',
        align: 'left',
        minWidth: 130,
      },
      { id: 'description', label: 'Description', align: 'left' },
      { id: 'incidentType', label: 'Incident Type', align: 'left', minWidth: 130 },
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
              showDeleteIcon
              showEditIcon
              handleDeleteClick={() => {
                onDelete(row as IHostelIncident);
              }}
              handleEditClick={() => {
                onEdit(row as IHostelIncident);
              }}
              handleViewClick={() => {}}
            />
          );
        },
      },
    ]}
    data={data}
  />
);

export default HostelIncidentTable;
