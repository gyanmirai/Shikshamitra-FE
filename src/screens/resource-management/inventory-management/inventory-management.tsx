'use client';

import React from 'react';
import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AddResourceDialog from './component/add-resource-dialog';
import InventoryItemTable from './component/inventory-item-table';

import type { IInventoryItem } from './inventory-interface';

const InventoryManagement = () => {
  const dialogAddResource = useBoolean();

  const [selectedData, setSelectedData] = React.useState<IInventoryItem | null>(null);
  const [isEdit, setIsEdit] = React.useState(false);

  const handleClick = (data: IInventoryItem, eventName: string) => {
    setSelectedData(data);
    if (eventName === 'edit') {
      setIsEdit(true);
      dialogAddResource.onTrue();
    }
  };

  return (
    <>
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <Box>
          <CustomBreadcrumbs
            heading="Inventory Management"
            links={[{ name: 'Resource Management' }, { name: 'Inventory Management' }]}
            sx={{ mb: 2 }}
          />
        </Box>

        <Box display="flex" flexDirection="row" gap={2} alignItems="center" pb="15px">
          <Button
            onClick={() => {
              setSelectedData(null);
              setIsEdit(false);
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
            isEdit={isEdit}
            data={selectedData as IInventoryItem}
            handleClose={() => {
              dialogAddResource.onFalse();
            }}
            open={dialogAddResource.value}
          />
        )}
        {/* {dialogIssueResource.value && (
          <IssueResourceDialog
            isEdit={false}
            data={{} as IIssueResourceFormValues}
            handleClose={() => {
              dialogIssueResource.onFalse();
            }}
            open={dialogIssueResource.value}
          />
        )} */}
        {/* {dialogProcurementResource.value && (
          <ProcurementResourceDialog
            isEdit={false}
            data={{} as IProcurementFormValues}
            handleClose={() => {
              dialogProcurementResource.onFalse();
            }}
            open={dialogProcurementResource.value}
          />
        )} */}
      </Box>
      <Box display="flex" flexDirection="column" gap={3}>
        {/* <InventoryDashboardCard /> */}
        {/* <InventoryPageGraph /> */}
        <InventoryItemTable onClick={handleClick} />
        <Box />
      </Box>
    </>
  );
};

export default InventoryManagement;
