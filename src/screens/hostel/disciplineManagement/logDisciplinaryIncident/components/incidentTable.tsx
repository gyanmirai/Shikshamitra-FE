'use client';

import type { LabelColor } from 'src/components/label';

import React, { useCallback } from 'react';

import { Box, Chip, MenuItem, MenuList } from '@mui/material';

import {
  IncidentStatusType,
  IncidentStatusColors,
  IncidentStatusOptions,
} from 'src/enums/incident-status';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
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
  onView,
}) => {
  // Callback function to render action menu items for each row
  // Shows "Mark Out" option only for rows with status 0
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        {row.status === 0 && (
          <MenuItem
            onClick={() => {
              onView(row as IHostelIncident);
              pop.onClose();
            }}
          >
            <Iconify icon="mdi:call-to-action" sx={{ mr: 1 }} />
            Take Action
          </MenuItem>
        )}
      </MenuList>
    ),
    [onView]
  );
  return (
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
        { id: 'hostelName', label: 'Hostel Name', align: 'left' },
        {
          id: 'students',
          label: 'Students Involved',
          align: 'left',
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
        },
        {
          id: 'incidentTime',
          label: 'Incident Time',
          align: 'left',
        },
        { id: 'description', label: 'Description', align: 'left' },
        { id: 'incidentType', label: 'Incident Type', align: 'left' },
        {
          id: 'status',
          label: 'Status',
          filterType: 'enum',
          enumOptions: IncidentStatusOptions,
          minWidth: '130px',
          align: 'left',
          render(value, row) {
            const color = IncidentStatusColors[value as IncidentStatusType] as LabelColor;
            return <Label color={color}>{IncidentStatusType[value]}</Label>;
          },
        },
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
                actions={(prop) => actions({ ...prop, row })}
                placement="right-top"
                showDeleteIcon
                showEditIcon
                handleDeleteClick={() => {
                  onDelete(row as IHostelIncident);
                }}
                handleEditClick={() => {
                  onEdit(row as IHostelIncident);
                }}
              />
            );
          },
        },
      ]}
      data={data}
    />
  );
};

export default HostelIncidentTable;
