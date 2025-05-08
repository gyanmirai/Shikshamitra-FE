'use client';

import React, { useState } from 'react';

import Add from '@mui/icons-material/Add';
import { Box, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import data from 'src/json/ResourceManagement/resourceSettings/resource-condition/resource-condition-data.json';

import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AddResourceConditionDialog from './component/add-resource-condition-dialog';

import type { IResourceConditionStatusFormValues } from './resource-condition-interface';

const ResourceConditionScreen = () => {
  // State to store the selected inventory item
  const [selectedData, setSelectedData] = useState<IResourceConditionStatusFormValues | null>(null);

  // Boolean state to manage delete action (used for toggling delete operation)
  const deleteItem = useBoolean();
  const links = [
    {
      name: 'Resource Settings',
      href: '',
    },
    {
      name: 'Resource Condition',
      href: '',
    },
  ];

  const addResourceConditionDialog = useBoolean();
  const [isEdit, setIsEdit] = useState(false);
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Resource Condition"
        description="Here you can add the resource condition to manage the resource effectively and trak on the basis of their condition."
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
              addResourceConditionDialog.onTrue();
            }}
          >
            Add Resource Condition
          </Button>
        }
      />
      <CustomizableTable
        searchFieldProps={{
          placeholder: 'Search by Name ...',
          label: 'Search by  Name...',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        noDataText={
          <>
            No Resource Condition{' '}
            <Box
              onClick={() => {
                setIsEdit(false);
                setSelectedData(null);
                addResourceConditionDialog.onTrue();
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
              Add Resource Condition
            </Box>
          </>
        }
        tableId="resourceConditionConfiguration"
        columns={[
          { id: 'resourceConditionStatusName', label: 'Name' },
          {
            id: 'resourceConditionStatusDescription',
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
                    setSelectedData(row as IResourceConditionStatusFormValues);
                    addResourceConditionDialog.onTrue();
                    setIsEdit(true);
                  }}
                  handleViewClick={() => {
                    setSelectedData(row as IResourceConditionStatusFormValues);
                    addResourceConditionDialog.onTrue();
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

      {addResourceConditionDialog.value && (
        <CustomDialog
          title="Add Resource Condition"
          open={addResourceConditionDialog.value}
          handleClose={addResourceConditionDialog.onFalse}
        >
          <AddResourceConditionDialog
            isEdit={isEdit}
            data={selectedData}
            onClose={() => {
              addResourceConditionDialog.onFalse();
            }}
          />
        </CustomDialog>
      )}
    </Box>
  );
};

export default ResourceConditionScreen;
