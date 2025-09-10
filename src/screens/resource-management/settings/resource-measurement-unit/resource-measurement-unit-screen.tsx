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
import data from 'src/json/ResourceManagement/resourceSettings/resource-measurement-unit/resource-measurement-unit-data.json';

import AddMeasurementUnitDialog from './component/add-measureunit-dialog';

import type { IResourceMeasurementUnitFormValues } from './resource-measurement-unit-interface';

const ResorceMeasurementScreen = () => {
  // State to store the selected inventory item
  const [selectedData, setSelectedData] = useState<IResourceMeasurementUnitFormValues | null>(null);

  // Boolean state to manage delete action (used for toggling delete operation)
  const deleteItem = useBoolean();
  const links = [
    {
      name: 'Resource Settings',
      href: '',
    },
    {
      name: 'Resource Measurement Unit',
      href: '',
    },
  ];

  const addMeasurementUnitDialog = useBoolean();
  const [isEdit, setIsEdit] = useState(false);
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Resource Measurement Unit"
        description="Here you can add the resource measurement unit to manage the resource effectively and trak on the basis of their measurement unit."
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
              addMeasurementUnitDialog.onTrue();
            }}
          >
            Add Resource Measurement Unit
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
            No Resource Measurement Unit Found{' '}
            <Box
              onClick={() => {
                setIsEdit(false);
                setSelectedData(null);
                addMeasurementUnitDialog.onTrue();
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
              Add Resource Measurement Unit
            </Box>
          </>
        }
        tableId="resourceMeasurementUnitTable"
        columns={[
          { id: 'resourceMeasurementUnit', label: 'Name' },
          {
            id: 'resourceMeasurementUnitDescription',
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
                    setSelectedData(row as IResourceMeasurementUnitFormValues);
                    addMeasurementUnitDialog.onTrue();
                    setIsEdit(true);
                  }}
                  handleViewClick={() => {
                    setSelectedData(row as IResourceMeasurementUnitFormValues);
                    addMeasurementUnitDialog.onTrue();
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

      {addMeasurementUnitDialog.value && (
        <CustomDialog
          title="Add Resource Measurement Unit"
          open={addMeasurementUnitDialog.value}
          handleClose={addMeasurementUnitDialog.onFalse}
        >
          <AddMeasurementUnitDialog
            isEdit={isEdit}
            data={selectedData}
            onClose={() => {
              addMeasurementUnitDialog.onFalse();
            }}
          />
        </CustomDialog>
      )}
    </Box>
  );
};

export default ResorceMeasurementScreen;
