'use client';

import React from 'react';

import { Button } from '@mui/material';
import { Add } from '@mui/icons-material';

import { useBoolean } from 'src/hooks/use-boolean';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AddResourceDialog from './component/add-resource-dialog';
import IssueResourceDialog from './component/issue-resource-dialog';
import ProcurementResourceDialog from './component/procurement-request-dialog';

import type {
  IAddResourceFormValues,
  IProcurementFormValues,
  IIssueResourceFormValues,
} from './inventory-interface';

const InventoryManagement = () => {
  const dialogIssueResource = useBoolean();
  const dialogAddResource = useBoolean();
  const dialogProcurementResource = useBoolean();

  return (
    <>
      <CustomBreadcrumbs
        heading="Inventory Management"
        links={[{ name: 'Resource Management' }, { name: 'Inventory Management' }]}
        sx={{ px: 1, mb: 2 }}
      />

      <Button
        onClick={() => {
          dialogAddResource.onTrue();
        }}
        variant="contained"
        startIcon={<Add />}
      >
        Add Resources{' '}
      </Button>
      <Button
        onClick={() => {
          dialogIssueResource.onTrue();
        }}
        variant="outlined"
        startIcon={<Add />}
      >
        Issue Resource{' '}
      </Button>
      <Button
        onClick={() => {
          dialogProcurementResource.onTrue();
        }}
        variant="outlined"
        startIcon={<Add />}
      >
        Procurement Request{' '}
      </Button>

      {dialogAddResource.value && (
        <AddResourceDialog
          isEdit={false}
          data={{} as IAddResourceFormValues}
          handleClose={() => {
            dialogAddResource.onFalse();
          }}
          open={dialogAddResource.value}
        />
      )}
      {dialogIssueResource.value && (
        <IssueResourceDialog
          isEdit={false}
          data={{} as IIssueResourceFormValues}
          handleClose={() => {
            dialogIssueResource.onFalse();
          }}
          open={dialogIssueResource.value}
        />
      )}
      {dialogProcurementResource.value && (
        <ProcurementResourceDialog
          isEdit={false}
          data={{} as IProcurementFormValues}
          handleClose={() => {
            dialogProcurementResource.onFalse();
          }}
          open={dialogProcurementResource.value}
        />
      )}
    </>
  );
};

export default InventoryManagement;
