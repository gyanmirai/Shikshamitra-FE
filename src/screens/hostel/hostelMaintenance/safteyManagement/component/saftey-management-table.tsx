import type { LabelColor } from 'src/components/label';

import React from 'react';
import dayjs from 'dayjs';

import { Box } from '@mui/material';

import data from 'src/json/hostel/hostelMaintenance/report-incident-maintenance-data.json';
import {
  IncidentReportStatusType,
  IncidentReportStatusTypeColor,
  IncidentReportStatusTypeOptions,
} from 'src/enums/incident-report-statusType';

import { Label } from 'src/components/label';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type {
  IAddSafteyManagement,
  IReportSafteyManagementTableProps,
} from '../saftey-management-interface';

const ReportSafteyManagementTable: React.FC<IReportSafteyManagementTableProps> = ({ onClick }) => (
  <Box>
    <CustomizableTable
      tableId="report-saftey-management-table"
      searchFieldProps={{
        placeholder: 'Search by Incident Type, Title...',
        label: 'Search by Incident Type, Title...',
      }}
      noDataText={
        <>
          No Incident Data Found{' '}
          <Box
            onClick={() => onClick({} as IAddSafteyManagement, 'new')}
            color="primary.main"
            fontWeight={600}
            sx={{ '&:hover': { cursor: 'pointer', textDecoration: 'underline' } }}
          >
            Report Incident
          </Box>
        </>
      }
      columns={[
        { id: 'incidentTitle', label: 'Incident Title', align: 'left' },
        { id: 'incidentType', label: 'Incident Type', align: 'left' },
        {
          id: 'incidentDate',
          label: 'Incident Date',
          align: 'left',
          filterType: 'date',
          render: (value) => (value ? dayjs(value).format('DD-MM-YYYY') : '-'),
        },
        {
          id: 'incidentTime',
          label: 'Incident Time',
          align: 'left',
          isFilter: false,
          isSort: false,
          render: (value) => (value ? dayjs(value).format('hh:mm A') : '-'),
        },
        { id: 'incidentUrgency', label: 'Urgency', align: 'left' },
        { id: 'incidentDescription', label: 'Description', align: 'left' },
        { id: 'incidentReportedBy', label: 'Reported By', align: 'left' },
        {
          id: 'status',
          label: 'Status',
          align: 'left',
          minWidth: '130px',
          filterType: 'enum',
          enumOptions: IncidentReportStatusTypeOptions,
          render(value, row) {
            const color = IncidentReportStatusTypeColor[
              value as IncidentReportStatusType
            ] as LabelColor;

            return <Label color={color}>{IncidentReportStatusType[value]}</Label>;
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
                showThreeDots={false}
                placement="right-top"
                showDeleteIcon
                showEditIcon
                showViewIcon
                handleDeleteClick={() => onClick(row as IAddSafteyManagement, 'delete')}
                handleEditClick={() => onClick(row as IAddSafteyManagement, 'edit')}
                handleViewClick={() => onClick(row as IAddSafteyManagement, 'view')}
              />
            );
          },
        },
      ]}
      data={data}
    />
  </Box>
);

export default ReportSafteyManagementTable;
