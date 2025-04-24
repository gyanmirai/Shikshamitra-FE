import React, { useState } from 'react';

import { Box, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import data from 'src/json/ResourceManagement/resourceSettings/resourceSubcategoryData.json';

import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import ThreeDotsActions from 'src/components/three-dots-actions';

import AddSubCategoryDialog from './component/add-resource-subcategory-dialog';

import type { IResourceSubCategoryFormValues } from './resource-subcategory-interface';

const ResourceSubCategoryConfiguration = () => {
  // State to store the selected inventory item
  const [selectedData, setSelectedData] = useState<IResourceSubCategoryFormValues>();

  // Boolean state to manage delete action (used for toggling delete operation)
  const deleteItem = useBoolean();

  const addResourceSubCategoryDialog = useBoolean();
  return (
    <Box>
      <CustomizableTable
        noDataText={
          <>
            No Sub Category Found{' '}
            <Box
              onClick={() => {
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
          { id: 'subcategoryName', label: 'Sub-Category Name' },
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
                  handleDeleteClick={() => {
                    deleteItem.onTrue();
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

      {addResourceSubCategoryDialog.value && (
        <CustomDialog
          title="Add Resource Sub Category"
          open={addResourceSubCategoryDialog.value}
          handleClose={addResourceSubCategoryDialog.onFalse}
        >
          <AddSubCategoryDialog
            isEdit={false}
            data={{ categoryName: '', subcategoryName: '' } as IResourceSubCategoryFormValues}
          />
        </CustomDialog>
      )}
    </Box>
  );
};

export default ResourceSubCategoryConfiguration;
