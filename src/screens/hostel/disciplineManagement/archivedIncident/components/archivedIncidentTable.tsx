'use client';

import type { LabelColor } from 'src/components/label';

import React from 'react';

import { Box, Chip } from '@mui/material';

import {
  IncidentStatusType,
  IncidentStatusColors,
  IncidentStatusOptions,
} from 'src/enums/incident-status';

import { Label } from 'src/components/label';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IArchivedIncidentTableProps } from '../type';
import type { IHostelIncident } from '../../logDisciplinaryIncident/type';

const ArchivedIncidentTable: React.FC<IArchivedIncidentTableProps> = ({
  data,
  editData,
  setEditData,
  onView,
}) => (
  <CustomizableTable
    tableId="hostel-incident-data-table"
    searchFieldProps={{
      placeholder: 'Search by Hostel Name...',
      label: 'Search by Hostel Name...',
    }}
    noDataText={<>No Archived Incident Data Found </>}
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
        minWidth: 40,
        isSort: false,
        sticky: true,
        isFilter: false,
        render(value, row) {
          return (
            <ThreeDotsActions
              showThreeDots={false}
              placement="right-top"
              showViewIcon
              handleViewClick={() => {
                onView(row as IHostelIncident);
              }}
            />
          );
        },
      },
    ]}
    data={data}
  />
);

export default ArchivedIncidentTable;
