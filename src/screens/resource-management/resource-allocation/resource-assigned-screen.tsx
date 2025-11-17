'use client';

import React from 'react';
import { Box, Grid } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import ResourceAllocateDialog from './component/resource-allocation-dialog';
import ResourceItemTableTeacher from './component/resource-item-table-teacher';

import type { IResourceAllocateFormValues } from './resource-allocation-interface';

const ResourceAssignedScreen = () => {
  const allocationResourceDialog = useBoolean();
  return (
    <>
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <Box>
          <CustomBreadcrumbs
            heading="Assigned Resources"
            links={[{ name: 'Resource Management' }, { name: 'Assigned Resources' }]}
            sx={{ mb: 2 }}
          />
        </Box>
      </Box>

      <Grid container spacing={2} mb={5} mt={1}>
        <Grid size={{ lg: 3 }}>
          <CustomSelect
            autoFocus
            label="Select Resource"
            options={[]}
            value=""
            onChange={() => {}}
          />
        </Grid>
        <Grid size={{ lg: 3 }}>
          <CustomSelect
            autoFocus
            label="Select Category"
            options={[]}
            value=""
            onChange={() => {}}
          />
        </Grid>
      </Grid>
      <ResourceItemTableTeacher />
      {allocationResourceDialog.value && (
        <CustomDialog
          maxWidth="md"
          title="Allocate Resource"
          handleClose={() => {
            allocationResourceDialog.onFalse();
          }}
          open={allocationResourceDialog.value}
        >
          <ResourceAllocateDialog
            handleClose={() => {
              allocationResourceDialog.onFalse();
            }}
            isEdit={false}
            data={{} as IResourceAllocateFormValues}
          />
        </CustomDialog>
      )}
    </>
  );
};

export default ResourceAssignedScreen;
