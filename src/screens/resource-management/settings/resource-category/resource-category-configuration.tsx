'use client';

import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import data from 'src/json/ResourceManagement/resourceSettings/resourceCategoryData.json';

import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import AddResourceCategoryDialog from './component/add-resource-category-dialog';

import type { IResourceCategoryFormValues } from './resource-category-interface';

const ResourceCategoryConfiguration = () => {
  // State to store the selected inventory item
  const [selectedData, setSelectedData] = useState<IResourceCategoryFormValues | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  // Boolean state to manage delete action (used for toggling delete operation)
  const deleteItem = useBoolean();

  const addResourceCategoryDialog = useBoolean();

  const links = [
    {
      name: 'Resource Settings',
      href: '',
    },
    {
      name: 'Resource Category',
      href: '',
    },
  ];
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Resource Category"
        description="Here you can add the resource category to manage the resource effectively and trak on the basis of category."
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
              addResourceCategoryDialog.onTrue();
            }}
          >
            Add Resource Category
          </Button>
        }
      />
      <CustomizableTable
        searchFieldProps={{
          placeholder: 'Search by Category Name...',
          label: 'Search by Category Name...',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        noDataText={
          <>
            No Category Found{' '}
            <Box
              onClick={() => {
                setIsEdit(false);
                setSelectedData(null);
                addResourceCategoryDialog.onTrue();
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
              Add Category
            </Box>
          </>
        }
        tableId="resourceCategoryConfiguration"
        columns={[
          { id: 'categoryName', label: 'Category Name' },
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
                  showThreeDots={false}
                  showEditIcon
                  showViewIcon
                  handleDeleteClick={() => {
                    deleteItem.onTrue();
                  }}
                  handleEditClick={() => {
                    setIsEdit(true);
                    setSelectedData(row as IResourceCategoryFormValues);
                    addResourceCategoryDialog.onTrue();
                  }}
                  handleViewClick={() => {
                    setIsEdit(false);
                    setSelectedData(row as IResourceCategoryFormValues);
                    addResourceCategoryDialog.onTrue();
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
          content="Are you sure you want to delete?"
          action={
            <Button
              variant="contained"
              color="error"
              onClick={async () => {
                deleteItem.onFalse();
              }}
            >
              Yes
            </Button>
          }
        />
      )}

      {/* Resource Category Dialog */}
      {addResourceCategoryDialog.value && (
        <CustomDialog
          title="Add Resource Category"
          open={addResourceCategoryDialog.value}
          handleClose={addResourceCategoryDialog.onFalse}
        >
          <AddResourceCategoryDialog isEdit={isEdit} data={selectedData} />
        </CustomDialog>
      )}
    </Box>
  );
};

export default ResourceCategoryConfiguration;
