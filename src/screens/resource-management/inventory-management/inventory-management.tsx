'use client';

import React from 'react';

import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AddResourceDialog from './component/add-resource-dialog';
import InventoryPageGraph from './component/inventory-page-graph';
import InventoryItemTable from './component/inventory-item-table';
import IssueResourceDialog from './component/issue-resource-dialog';
import ProcurementResourceDialog from './component/procurement-request-dialog';
import InventoryDashboardCard from './component/inventory-management-page-card';

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
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <Box>
          <CustomBreadcrumbs
            heading="Inventory Management"
            links={[{ name: 'Resource Management' }, { name: 'Inventory Management' }]}
            sx={{ px: 1, mb: 2 }}
          />
        </Box>

        <Box display="flex" flexDirection="row" gap={2} alignItems="center" pb="15px">
          <Button
            onClick={() => {
              dialogAddResource.onTrue();
            }}
            variant="contained"
            startIcon={<Add />}
          >
            Add Resources{' '}
          </Button>
          {/* <Button
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
          </Button> */}
        </Box>

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
      </Box>
      <Box display="flex" flexDirection="column" gap={3}>
        <InventoryDashboardCard />
        <InventoryPageGraph />
        <InventoryItemTable />
        <Box />
      </Box>
    </>
  );
};

export default InventoryManagement;
