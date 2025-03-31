import React, { useState } from 'react';

import { Box, Grid, Button, TextField, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import capitalizeWords from 'src/utils/capitalizeText';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetbudgetCategoryQuery,
  useAddbudgetCategoryMutation,
  useUpdatebudgetCategoryMutation,
  useDeletebudgetCategoryMutation,
} from 'src/redux/budgetCategory/budgetCategoryApi';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { DeleteConfirmationDialog } from 'src/components/delete-confirmation';

const PresetCategoryAndDepartmentForBudget = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [budgetCategory, setbudgetCategory] = useState('');
  const [selectedbudgetCategory, setSelectedbudgetCategory] = useState<any>(null);
  const dialogForDeleteConfirmation = useBoolean();

  const { data: budgetCategoryList, isLoading: isGetBudgetCategoryLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetbudgetCategoryQuery,
  });

  const [addBudgetCategory, { isLoading: isAddCategoryLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddbudgetCategoryMutation,
    popupConfig: {
      success: true,
      successMessage: 'Budget Category added Successfully',
    },
  });

  const [updateBudgetCategory, { isLoading: isBudgetUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdatebudgetCategoryMutation,
    popupConfig: {
      success: true,
      successMessage: 'Budget Category Update Successfully',
    },
  });

  const [deleteBudgetCategory, { isLoading: isdeleteBudgetCategory }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeletebudgetCategoryMutation,
    popupConfig: {
      success: true,
      successMessage: 'Budget Category Delete Successfully',
    },
  });

  const handlerAddBudgetCategory = async () => {
    if (isEdit) {
      if (!budgetCategory.trim()) {
        alert('Budget Category cannot be empty!');
        return;
      }

      const isDuplicate = budgetCategoryList?.items?.some(
        (item: any) => item.budgetCategoryName.toLowerCase() === budgetCategory.toLowerCase()
      );
      if (isDuplicate) {
        alert('This Budget Category already exists!');
        return;
      }

      try {
        await updateBudgetCategory({
          id: selectedbudgetCategory.id,
          body: {
            budgetCategoryName: budgetCategory,
          },
        }).unwrap();
        setbudgetCategory('');
        setIsEdit(false);
      } catch (error) {
        console.error('Failed to update Budget Category:', error);
      }
    } else {
      if (!budgetCategory.trim()) {
        alert('Budeget Category cannot be empty!');
        return;
      }

      const isDuplicate = budgetCategoryList?.items?.some(
        (item: any) => item.budgetCategoryName.toLowerCase() === budgetCategory.toLowerCase()
      );

      if (isDuplicate) {
        alert('This Budeget Category already exists!');
        return;
      }

      try {
        await addBudgetCategory({ budgetCategoryName: budgetCategory }).unwrap();
        setbudgetCategory('');
      } catch (error) {
        console.error('Failed to add Budeget Category:', error);
      }
    }
  };

  const handleDeleteBudgetCategory = async () => {
    if (!selectedbudgetCategory) return;

    try {
      await deleteBudgetCategory(selectedbudgetCategory.id).unwrap();
      dialogForDeleteConfirmation.onFalse();
    } catch (error) {
      console.error('Failed to delete Budget Category:', error);
    }
  };

  const handleEditClick = (data: any) => {
    setIsEdit(true);
    setbudgetCategory(data.budgetCategoryName);
    setSelectedbudgetCategory(data);
  };
  return (
    <Box pt="20px">
      <Grid container display="flex" flexDirection="column">
        <Box px="15px" display="flex" flexDirection="row" gap={3} alignItems="center">
          <TextField
            value={budgetCategory}
            onChange={(e) => setbudgetCategory(capitalizeWords(e.target.value))}
            name="category"
            label="Add New Category"
            size="small"
          />
          {isEdit ? (
            <Button
              onClick={handlerAddBudgetCategory}
              variant="contained"
              size="small"
              disabled={
                isAddCategoryLoading || isBudgetUpdateLoading || budgetCategory.trim() === ''
              }
            >
              {isBudgetUpdateLoading ? 'Updating...' : 'Save'}
            </Button>
          ) : (
            <Button
              disabled={
                isAddCategoryLoading || isBudgetUpdateLoading || budgetCategory.trim() === ''
              }
              onClick={handlerAddBudgetCategory}
              startIcon={<Iconify icon="ic:outline-plus" />}
              variant="contained"
              size="small"
            >
              {isAddCategoryLoading ? 'Adding...' : ' New Category'}
            </Button>
          )}
        </Box>
        <Grid item xs={12} md={12}>
          <CustomizableTable
            tableId="existing-categories-departments"
            isShowedDense={false}
            isPagination={false}
            isFilter={false}
            isSearch={false}
            isLoading={isGetBudgetCategoryLoading}
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
                render(row: any, value) {
                  return (
                    <ThreeDotsActions
                      showThreeDots={false}
                      showEditIcon
                      handleEditClick={() => {
                        handleEditClick(value);
                      }}
                      showDeleteIcon
                      handleDeleteClick={() => {
                        setSelectedbudgetCategory({
                          ...value,
                          budgetCategoryName: value.budgetCategoryName
                            ? value.budgetCategoryName.charAt(0).toUpperCase() +
                              value.budgetCategoryName.slice(1).toLowerCase()
                            : '',
                        });

                        dialogForDeleteConfirmation.onTrue();
                      }}
                    />
                  );
                },
              },
            ]}
            data={budgetCategoryList?.items || []}
          />
        </Grid>
        {dialogForDeleteConfirmation.value && (
          <DeleteConfirmationDialog
            open={dialogForDeleteConfirmation.value}
            onClose={() => {
              dialogForDeleteConfirmation.onFalse();
              setSelectedbudgetCategory(null);
            }}
            onConfirm={handleDeleteBudgetCategory}
            title="Delete Item"
            description={
              <>
                Are you sure you want to delete{' '}
                <strong>{`${selectedbudgetCategory.budgetCategoryName} Budget Category`}</strong> ?
                This action cannot be undone.
              </>
            }
            isDeleteLoading={isdeleteBudgetCategory}
          />
        )}
      </Grid>
    </Box>
  );
};

export default PresetCategoryAndDepartmentForBudget;
