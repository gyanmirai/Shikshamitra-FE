import React, { useState } from 'react';

import { Box, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import data from 'src/json/ResourceManagement/resourceSettings/resourceCategoryData.json';

import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import AddResourceCategoryDialog from './component/add-resource-category-dialog';

import type { IResourceCategoryFormValues } from './resource-category-interface';

const ResourceCategoryConfiguration = () => {
  // State to store the selected inventory item
  const [selectedData, setSelectedData] = useState<IResourceCategoryFormValues>();

  // Boolean state to manage delete action (used for toggling delete operation)
  const deleteItem = useBoolean();

  const addResourceCategoryDialog = useBoolean();
  return (
    <Box>
      <CustomizableTable
        noDataText={
          <>
            No Category Found{' '}
            <Box
              onClick={() => {
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

      {/* Resource Category Dialog */}
      {addResourceCategoryDialog.value && (
        <CustomDialog
          title="Add Resource Category"
          open={addResourceCategoryDialog.value}
          handleClose={addResourceCategoryDialog.onFalse}
        >
          <AddResourceCategoryDialog isEdit={false} data={{ categoryName: '' }} />
        </CustomDialog>
      )}
    </Box>
  );
};

export default ResourceCategoryConfiguration;
