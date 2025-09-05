'use client';

import React, { useState } from 'react';
import Add from '@mui/icons-material/Add';
import { Box, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import data from 'src/json/ResourceManagement/resourceSettings/resource-status/resource-status-data.json';

import ResourceStatusDialog from './component/resource-status-dialog';

import type { IResourceStatusFormValues } from './resource-status-interface';

const ResourceStatusScreen = () => {
  // State to store the selected inventory item
  const [selectedData, setSelectedData] = useState<IResourceStatusFormValues | null>(null);

  // Boolean state to manage delete action (used for toggling delete operation)
  const deleteItem = useBoolean();
  const links = [
    {
      name: 'Resource Settings',
      href: '',
    },
    {
      name: 'Resource Status',
      href: '',
    },
  ];

  const addResourceStatusDialog = useBoolean();
  const [isEdit, setIsEdit] = useState(false);
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Resource Status"
        description="Here you can add the resource status to manage the resource effectively and trak on the basis of their status."
        links={links}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button
            size="small"
            startIcon={<Add />}
            variant="contained"
            onClick={() => {
              setIsEdit(false);
              setSelectedData(null);
              addResourceStatusDialog.onTrue();
            }}
          >
            Add Resource Status
          </Button>
        }
      />
      <CustomizableTable
        searchFieldProps={{
          placeholder: 'Search by  Name ...',
          label: 'Search by  Name...',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        noDataText={
          <>
            No Resource Status{' '}
            <Box
              onClick={() => {
                setIsEdit(false);
                setSelectedData(null);
                addResourceStatusDialog.onTrue();
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
              Add Resource Status
            </Box>
          </>
        }
        tableId="resourceStatusConfiguration"
        columns={[
          { id: 'resourceStatusName', label: 'Name' },
          {
            id: 'resourceStatusDescription',
            label: 'Description',
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
                  showDeleteIcon
                  showEditIcon
                  showViewIcon
                  showThreeDots={false}
                  handleDeleteClick={() => {
                    deleteItem.onTrue();
                  }}
                  handleEditClick={() => {
                    setSelectedData(row as IResourceStatusFormValues);
                    addResourceStatusDialog.onTrue();
                    setIsEdit(true);
                  }}
                  handleViewClick={() => {
                    setSelectedData(row as IResourceStatusFormValues);
                    addResourceStatusDialog.onTrue();
                    setIsEdit(false);
                  }}
                />
              );
            },
          },
        ]}
        data={data}
      />

      {deleteItem.value && (
        <ConfirmDialog
          open={deleteItem.value}
          onClose={deleteItem.onFalse}
          title="Delete"
          content="Are you sure want to delete?"
          action={
            <Button
              variant="contained"
              color="error"
              onClick={async () => {
                deleteItem.onFalse();
              }}
            >
              Delete
            </Button>
          }
        />
      )}

      {addResourceStatusDialog.value && (
        <CustomDialog
          title="Add Resource Status"
          open={addResourceStatusDialog.value}
          handleClose={addResourceStatusDialog.onFalse}
        >
          <ResourceStatusDialog isEdit={isEdit} data={selectedData} />
        </CustomDialog>
      )}
    </Box>
  );
};

export default ResourceStatusScreen;
