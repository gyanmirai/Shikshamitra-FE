import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { Box, MenuItem, MenuList } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import data from 'src/json/hostel/hostelMaintenance/report-incident-maintenance-data.json';
import {
  IncidentReportStatusType,
  IncidentReportStatusTypeColor,
  IncidentReportStatusTypeOptions,
} from 'src/enums/incident-report-statusType';

import MaintenceIncidentResolvedDialog from '../../adminAction/component/maintenance-resolved-dialog';
import MaintenceIncidentAssignedToWardenDialog from '../../adminAction/component/maintenance-incident-assigned-to-warden-dialog';

import type { IAssignedToMaintenanceWarden } from '../../adminAction/saftey-management-admin-action-interface';
import type {
  IAddSafteyManagement,
  IReportSafteyManagementTableProps,
} from '../saftey-management-interface';

const ReportSafteyManagementTable: React.FC<IReportSafteyManagementTableProps> = ({ onClick }) => {
  const assignedToMaintenanceWarden = useBoolean();
  const resolvedMaintenanceReport = useBoolean();
  const [selectedItem, setSelectedItem] = useState<IAddSafteyManagement>();
  return (
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
            filterType: 'date' as const,
            render: (value) => (value ? dayjs(value).format('DD-MM-YYYY') : '-'),
          },
          {
            id: 'incidentTime',
            label: 'Incident Time',
            filterType: 'string' as const,
            align: 'left',
            isFilter: true,
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
            filterType: 'enum' as const,
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
                  placement="right-top"
                  showDeleteIcon
                  showEditIcon
                  showViewIcon
                  handleDeleteClick={() => onClick(row as IAddSafteyManagement, 'delete')}
                  handleEditClick={() => onClick(row as IAddSafteyManagement, 'edit')}
                  handleViewClick={() => onClick(row as IAddSafteyManagement, 'view')}
                  actions={({ popover }) => (
                    <MenuList>
                      <MenuItem
                        onClick={() => {
                          setSelectedItem(row as IAddSafteyManagement);
                          resolvedMaintenanceReport.onTrue();
                          popover.onClose();
                        }}
                      >
                        <Iconify
                          icon={GlobalIcons.approvedIcon}
                          sx={{ height: '16px', width: '16px' }}
                        />
                        Mark as Resolved
                      </MenuItem>

                      <MenuItem
                        onClick={() => {
                          setSelectedItem(row as IAddSafteyManagement);
                          assignedToMaintenanceWarden.onTrue();
                          popover.onClose();
                        }}
                      >
                        <Iconify
                          icon={GlobalIcons.assigned}
                          sx={{ height: '16px', width: '16px' }}
                        />
                        Assign to Maintenance/Warden
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

      {assignedToMaintenanceWarden.value && selectedItem && (
        <CustomDialog
          title={`Assign ${selectedItem.incidentTitle} to Maintenance/Warden`}
          open={assignedToMaintenanceWarden.value}
          handleClose={assignedToMaintenanceWarden.onFalse}
          maxWidth="md"
        >
          <MaintenceIncidentAssignedToWardenDialog
            onClose={() => {
              assignedToMaintenanceWarden.onFalse();
            }}
            selectedItem={selectedItem}
            isEdit={false}
            data={{} as IAssignedToMaintenanceWarden}
          />
        </CustomDialog>
      )}

      {resolvedMaintenanceReport.value && selectedItem && (
        <CustomDialog
          title={`Resolved ${selectedItem.incidentTitle}`}
          open={resolvedMaintenanceReport.value}
          handleClose={resolvedMaintenanceReport.onFalse}
          maxWidth="md"
        >
          <MaintenceIncidentResolvedDialog
            onClose={() => {
              resolvedMaintenanceReport.onFalse();
            }}
            selectedItem={selectedItem}
          />
        </CustomDialog>
      )}
    </Box>
  );
};

export default ReportSafteyManagementTable;
