import React, { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { Iconify } from 'src/components/iconify/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Box, Button, MenuItem, MenuList } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import data from 'src/json/ResourceManagement/resourceAllocation/assigned-resource-data.json';

import ResourceTransferDialog from './resource-transfer-dialog';
import ResourceViewDialogTeacher from './resource-view-dialog-teacher';

import type { IResourceAllocateFormValues } from '../resource-allocation-interface';

const ResourceItemTableTeacher = () => {
  const ResourceViewDialog = useBoolean();
  const [selectedItem, setSelectedItem] = useState<IResourceAllocateFormValues>();
  const delocateDialog = useBoolean();
  const resourceTransferDialog = useBoolean();

  return (
    <>
      <CustomizableTable
        searchFieldProps={{
          placeholder: 'Search by Resource Name, Assigned to..',
          label: 'Search by Resource Name, Assigned to...',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        noDataText={
          <>
            No Allocated Resource Found.
            <Box
              onClick={() => {
                setSelectedItem({} as IResourceAllocateFormValues);
                ResourceViewDialog.onTrue();
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
              Allocate Resource
            </Box>
          </>
        }
        tableId="resource-item-table"
        columns={[
          { id: 'resourceName', label: 'Resource' },
          { id: 'category', label: 'Category' },

          { id: 'quantity', label: 'Quantity', filterType: 'number' },
          { id: 'assignedTo', label: 'Assigned To' },
          {
            id: 'allocationDate',
            label: 'Allocation Date',
            filterType: 'date',
            render: (value) => (value ? new Date(value).toLocaleDateString('en-GB') : '-'),
          },

          {
            id: 'expectedReturnDate',
            label: 'Expected Return Date',
            filterType: 'date',
            render: (value) => (value ? new Date(value).toLocaleDateString('en-GB') : '-'),
          },
          {
            id: 'action',
            label: 'Actions',
            align: 'left',
            minWidth: 100,
            sticky: true,
            isFilter: false,
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  placement="right-top"
                  showViewIcon
                  showThreeDots
                  handleViewClick={() => {
                    setSelectedItem(row as IResourceAllocateFormValues);
                    ResourceViewDialog.onTrue();
                  }}
                  actions={({ popover }: any) => (
                    <MenuList>
                      <MenuItem
                        onClick={() => {
                          setSelectedItem(row as IResourceAllocateFormValues);
                          delocateDialog.onTrue();
                        }}
                      >
                        <Iconify icon={GlobalIcons.delocate} />
                        Delocate
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setSelectedItem(row as IResourceAllocateFormValues);
                          resourceTransferDialog.onTrue();
                        }}
                      >
                        <Iconify icon={GlobalIcons.transfer} />
                        Transfer resource
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setSelectedItem(row as IResourceAllocateFormValues);
                        }}
                      >
                        <Iconify icon={GlobalIcons.maintenanceIcon} />
                        Request Maintenance
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

      {ResourceViewDialog.value && (
        <CustomDialog
          maxWidth="md"
          title="Allocate Resource"
          handleClose={() => {
            ResourceViewDialog.onFalse();
          }}
          open={ResourceViewDialog.value}
        >
          <ResourceViewDialogTeacher data={selectedItem as IResourceAllocateFormValues} />
        </CustomDialog>
      )}

      {resourceTransferDialog.value && (
        <CustomDialog
          maxWidth="md"
          title={`${selectedItem?.resourceName} Transfer Resource`}
          handleClose={() => {
            resourceTransferDialog.onFalse();
          }}
          open={resourceTransferDialog.value}
        >
          <ResourceTransferDialog
            isEdit={false}
            data={selectedItem as IResourceAllocateFormValues}
            handleClose={() => {
              resourceTransferDialog.onFalse();
            }}
          />
        </CustomDialog>
      )}

      {delocateDialog.value && (
        <ConfirmDialog
          open={delocateDialog.value}
          onClose={delocateDialog.onFalse}
          title="Delocate Resource"
          content="Are you sure want to delocate?"
          action={
            <Button
              variant="contained"
              color="error"
              onClick={async () => {
                delocateDialog.onFalse();
              }}
            >
              Delocate
            </Button>
          }
        />
      )}

      {}
    </>
  );
};

export default ResourceItemTableTeacher;
