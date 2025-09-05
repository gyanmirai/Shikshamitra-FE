'use client';

import React, { useState } from 'react';
import Add from '@mui/icons-material/Add';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Button, Tooltip } from '@mui/material';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import data from 'src/json/ResourceManagement/resourceSettings/resourceSubcategoryData.json';

import AddSubCategoryDialog from './component/add-resource-subcategory-dialog';

import type { IResourceSubCategoryFormValues } from './resource-subcategory-interface';

const ResourceSubCategoryConfiguration = () => {
  // State to store the selected inventory item
  const [selectedData, setSelectedData] = useState<IResourceSubCategoryFormValues | null>(null);

  // Boolean state to manage delete action (used for toggling delete operation)
  const deleteItem = useBoolean();
  const links = [
    {
      name: 'Resource Settings',
      href: '',
    },
    {
      name: 'Resource Sub Category',
      href: '',
    },
  ];

  const addResourceSubCategoryDialog = useBoolean();
  const [isEdit, setIsEdit] = useState(false);
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Resource Sub Category"
        description="Here you can add the resource Sub-category to manage the resource effectively and trak on the basis of category."
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
              addResourceSubCategoryDialog.onTrue();
            }}
          >
            Add Resource Sub Category
          </Button>
        }
      />
      <CustomizableTable
        searchFieldProps={{
          placeholder: 'Search by Category Name, Sub-Category Name...',
          label: 'Search by Category Name, Sub-Category Name...',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        noDataText={
          <>
            No Sub Category Found{' '}
            <Box
              onClick={() => {
                setIsEdit(false);
                setSelectedData(null);
                addResourceSubCategoryDialog.onTrue();
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
              Add Sub Category
            </Box>
          </>
        }
        tableId="resourceCategoryConfiguration"
        columns={[
          { id: 'categoryName', label: 'Category Name' },
          {
            id: 'subcategoryName',
            label: 'Sub-Category Name',
            render: (value) => {
              if (Array.isArray(value) && value.length > 0) {
                const firstItem = value[0];
                const fullList = value.join(', ');

                return (
                  <Tooltip title={fullList} arrow placement="top-start">
                    <div
                      style={{
                        display: 'inline-block',
                        maxWidth: '100%',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {value.length > 1 ? `${firstItem}...` : firstItem}
                    </div>
                  </Tooltip>
                );
              }
              return <span>-</span>;
            },
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
                    setSelectedData(row as IResourceSubCategoryFormValues);
                    addResourceSubCategoryDialog.onTrue();
                    setIsEdit(true);
                  }}
                  handleViewClick={() => {
                    setSelectedData(row as IResourceSubCategoryFormValues);
                    addResourceSubCategoryDialog.onTrue();
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

      {addResourceSubCategoryDialog.value && (
        <CustomDialog
          title="Add Resource Sub Category"
          open={addResourceSubCategoryDialog.value}
          handleClose={addResourceSubCategoryDialog.onFalse}
        >
          <AddSubCategoryDialog isEdit={isEdit} data={selectedData} />
        </CustomDialog>
      )}
    </Box>
  );
};

export default ResourceSubCategoryConfiguration;
