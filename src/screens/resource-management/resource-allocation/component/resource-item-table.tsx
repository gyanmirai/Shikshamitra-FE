import React, { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { Iconify } from 'src/components/iconify/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Box, Button, MenuItem, MenuList } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import data from 'src/json/ResourceManagement/resourceAllocation/resource-allocation-data.json';

import ResourceTransferDialog from './resource-transfer-dialog';
import ResourceAllocateDialog from './resource-allocation-dialog';

import type { IResourceAllocateFormValues } from '../resource-allocation-interface';

const ResourceItemTable = () => {
  const allocationResourceDialog = useBoolean();
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
                allocationResourceDialog.onTrue();
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
          { id: 'allocationTarget', label: 'Allocation Target' },
          { id: 'assignedTo', label: 'Assigned To' },
          { id: 'quantity', label: 'Quantity', filterType: 'number' },
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
                    allocationResourceDialog.onTrue();
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
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={data}
      />

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
            isEdit={false}
            data={selectedItem as IResourceAllocateFormValues}
            handleClose={() => {
              allocationResourceDialog.onFalse();
            }}
          />
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
    </>
  );
};

export default ResourceItemTable;
