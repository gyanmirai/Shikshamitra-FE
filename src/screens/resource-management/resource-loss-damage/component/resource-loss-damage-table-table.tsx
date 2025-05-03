import dayjs from 'dayjs';
import React, { useState } from 'react';

import { Box } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import data from 'src/json/ResourceManagement/lossDamaged/lossDamagedData.json';

import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import AddReportLossDialog from './add-report-loss-dialog';

import type {
  IReportLossTableProps,
  IResourceIncidentFormValues,
} from '../resource-loss-damage-interface';

const ResourceLossDamageTableTeacher: React.FC<IReportLossTableProps> = ({ onClick }) => {
  const addResourceLossDamagedDialog = useBoolean();

  const [selectedRow, setSelectedRow] = useState<IResourceIncidentFormValues>();

  return (
    <>
      <CustomizableTable
        searchFieldProps={{
          placeholder: 'Search by Resource Name',
          label: 'Search by Resource Name',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        noDataText={
          <>
            No Resource Loss/Damage Reported{' '}
            <Box
              onClick={() => {
                onClick({} as IResourceIncidentFormValues, 'new');
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
              Add Loss/Damage Report
            </Box>
          </>
        }
        tableId="resource-loss-damage-table-teacher"
        columns={[
          { id: 'resourceName', label: 'Resource Name' },
          { id: 'typeOfIncident', label: 'Type of Incident' },
          {
            id: 'dateOfIncident',
            label: 'Date of Incident',
            filterType: 'date',
            render: (value) => (value ? dayjs(value).format('DD-MM-YYYY') : '-'),
          },
          {
            id: 'action',
            label: 'Actions',
            align: 'left',
            minWidth: 70,
            sticky: true,
            isFilter: false,
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  placement="right-top"
                  showViewIcon
                  showThreeDots={false}
                  showEditIcon
                  handleViewClick={() => {
                    setSelectedRow(row as IResourceIncidentFormValues);
                    onClick(row as IResourceIncidentFormValues, 'view');
                  }}
                  handleDeleteClick={() => {
                    setSelectedRow(row as IResourceIncidentFormValues);
                    onClick(row as IResourceIncidentFormValues, 'delete');
                  }}
                  handleEditClick={() => {
                    setSelectedRow(row as IResourceIncidentFormValues);
                    onClick(row as IResourceIncidentFormValues, 'edit');
                  }}
                />
              );
            },
          },
        ]}
        data={data}
      />
      {addResourceLossDamagedDialog.value && (
        <CustomDialog
          maxWidth="md"
          title="Add Report Loss/Damage"
          open={addResourceLossDamagedDialog.value}
          handleClose={addResourceLossDamagedDialog.onFalse}
        >
          <AddReportLossDialog
            onClose={() => {
              addResourceLossDamagedDialog.onFalse();
            }}
            data={{} as IResourceIncidentFormValues}
            isEdit={false}
          />
        </CustomDialog>
      )}
    </>
  );
};

export default ResourceLossDamageTableTeacher;
