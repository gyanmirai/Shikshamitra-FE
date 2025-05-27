import React, { useState } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Grid, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';

import AddBudgetCategoryDialog from '../dialogs/finance-add-budget-category-dialog';

const PresetCategoryAndDepartmentForBudget = () => {
  // Dialog state for delete confirmation popup
  const dialogForDeleteConfirmation = useBoolean();
  // Dialog state for edit/add category popup
  const editDialog = useBoolean();
  // State to track if we are in edit mode or add mode
  const [isEdit, setIsEdit] = useState(false);

  return (
    <Box pt="20px">
      <Grid container display="flex" flexDirection="column">
        <Grid item xs={12} md={12}>
          <CustomizableTable
            noDataText={
              <>
                No Budget Category Found
                <Box
                  onClick={() => {
                    setIsEdit(false);
                    editDialog.onTrue();
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
                  Add Budget Category
                </Box>
              </>
            }
            tableId="existing-categories-departments"
            isShowedDense={false}
            isPagination={false}
            isFilter={false}
            isSearch={false}
            columns={[
              {
                id: 'budgetCategoryName',
                label: 'Categories',
                render(value, row) {
                  return (
                    <Typography fontSize="12px" sx={{ textTransform: 'capitalize' }}>
                      {value}
                    </Typography>
                  );
                },
              },

              {
                id: 'action',
                label: 'Action',
                isFilter: false,
                isSort: false,
                sticky: true,
                align: 'center',
                minWidth: 100,
                render(row: any, value) {
                  return (
                    <ThreeDotsActions
                      showThreeDots={false}
                      showEditIcon
                      handleEditClick={() => {
                        setIsEdit(true);
                        editDialog.onTrue();
                      }}
                      showDeleteIcon
                      handleDeleteClick={() => {
                        dialogForDeleteConfirmation.onTrue();
                      }}
                    />
                  );
                },
              },
            ]}
            data={[]}
          />
        </Grid>
        {dialogForDeleteConfirmation.value && (
          <ConfirmDialog
            open={dialogForDeleteConfirmation.value}
            onClose={() => {
              dialogForDeleteConfirmation.onFalse();
            }}
            title="Delete Item"
            content="Are you sure you want to delete?"
            action={
              <LoadingButton variant="contained" color="error" onClick={() => {}}>
                Delete
              </LoadingButton>
            }
          />
        )}

        {editDialog.value && (
          <CustomDialog
            open={editDialog.value}
            handleClose={() => {
              editDialog.onFalse();
            }}
            title={`${isEdit ? 'Edit' : 'Add'} Budget Category`}
            maxWidth="md"
          >
            <AddBudgetCategoryDialog
              onClose={() => {
                editDialog.onFalse();
              }}
              isEditMode={isEdit}
              data={null}
              onSave={() => {
                editDialog.onFalse();
              }}
            />
          </CustomDialog>
        )}
      </Grid>
    </Box>
  );
};

export default PresetCategoryAndDepartmentForBudget;
