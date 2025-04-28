'use client';

import React from 'react';

import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import CustomDialog from 'src/components/customDialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import AddReportLossDialog from './component/add-report-loss-dialog';
import ResourceLossDamageTableTeacher from './component/resource-loss-damage-table-table';

import type { IResourceIncidentFormValues } from './resource-loss-damage-interface';

const ResourceLossDamageScreenTeacher = () => {
  const addResourceLossDamagedDialog = useBoolean();
  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <CustomBreadcrumbs
          heading="Report Loss / Damage"
          links={[{ name: 'Resource Management' }, { name: 'Report Loss / Damage' }]}
          sx={{ px: 1, mb: 2 }}
        />
        <Button
          sx={{ px: 1, mb: 2 }}
          onClick={() => {
            addResourceLossDamagedDialog.onTrue();
          }}
          startIcon={<Add />}
          variant="contained"
        >
          Report Loss/Damage
        </Button>
      </Box>
      <ResourceLossDamageTableTeacher />
      {addResourceLossDamagedDialog.value && (
        <CustomDialog
          maxWidth="md"
          title="Report Loss/Damage"
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

export default ResourceLossDamageScreenTeacher;
