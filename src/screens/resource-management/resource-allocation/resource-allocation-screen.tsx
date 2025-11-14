'use client';

import React from 'react';
import { Add } from '@mui/icons-material';
import { Box, Grid, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import ResourceItemTable from './component/resource-item-table';
import ResourceAllocateDialog from './component/resource-allocation-dialog';

import type { IResourceAllocateFormValues } from './resource-allocation-interface';

const ResourceAllocationScreen = () => {
  const allocationResourceDialog = useBoolean();
  return (
    <>
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <Box>
          <CustomBreadcrumbs
            heading="Resource Allocation"
            links={[{ name: 'Resource Management' }, { name: 'Resource Allocation' }]}
            sx={{ mb: 2 }}
          />
        </Box>

        <Box display="flex" flexDirection="row" gap={2} alignItems="center" pb="15px">
          <Button
            onClick={() => {
              allocationResourceDialog.onTrue();
            }}
            variant="contained"
            startIcon={<Add />}
          >
            Allocate Resource{' '}
          </Button>
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
            label="Select Allocation Target"
            options={[]}
            value=""
            onChange={() => {}}
          />
        </Grid>
      </Grid>
      <ResourceItemTable />
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

export default ResourceAllocationScreen;
