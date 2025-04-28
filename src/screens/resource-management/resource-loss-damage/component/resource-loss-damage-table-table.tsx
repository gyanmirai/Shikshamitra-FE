import React from 'react';
import dayjs from 'dayjs';

import { Box } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import data from 'src/json/ResourceManagement/lossDamaged/lossDamagedData.json';

import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';

import AddReportLossDialog from './add-report-loss-dialog';

import type { IResourceIncidentFormValues } from '../resource-loss-damage-interface';

const ResourceLossDamageTableTeacher = () => {
  const addResourceLossDamagedDialog = useBoolean();
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
                addResourceLossDamagedDialog.onTrue();
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
