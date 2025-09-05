import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Box, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import AddBudgetSubcategoryDialog from '../dialogs/finance-add-budget-sub-category-dialog';

const PredefinedCategoryIncomeExpenseComponent = () => {
  // Selected budget category ID/value from dropdown
  const [selectedBudgetCategory, setSelectedBudgetCategory] = useState<any | null>(null);
  // New sub-category name entered by user
  const [newSubCategory, setNewSubCategory] = useState('');
  // Dialog open/close state for edit/add form
  const editDialog = useBoolean();
  const deleteDialog = useBoolean();

  // Flag to determine if in edit mode vs add mode
  const [isEdit, setIsEdit] = useState(false);

  // Map categories for CustomSelect options
  // const categoriesOptions =
  //   budgetCategoryList?.items?.length > 0
  //     ? budgetCategoryList.items.map((item: any) => ({
  //         label: item.budgetCategoryName,
  //         value: item.id,
  //       }))
  //     : [];

  return (
    <>
      <CustomizableTable
        noDataText={
          <>
            No Budget Sub-Category Data Found
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
              Add Budget Sub Category
            </Box>
          </>
        }
        tableId="predefined-category-income-expense"
        isShowedDense={false}
        isPagination={false}
        isFilter={false}
        columns={[
          { id: 'budgetCategoryId', label: 'Categories' },
          { id: 'budgetSubcategoryName', label: 'Sub-Categories' },
          {
            id: 'action',
            label: 'Actions',
            isFilter: false,
            isSort: false,
            sticky: true,
            align: 'left',
            minWidth: 50,
            render(value, row: any) {
              return (
                <ThreeDotsActions
                  showThreeDots={false}
                  showDeleteIcon
                  handleDeleteClick={() => {
                    setSelectedBudgetCategory(row);
                    deleteDialog.onTrue();
                    // Add delete logic here
                  }}
                  showEditIcon
                  handleEditClick={() => {
                    setSelectedBudgetCategory(row);
                    editDialog.onTrue();
                    setIsEdit(true);
                  }}
                />
              );
            },
          },
        ]}
        data={[
          {
            id: 1,
            budgetCategoryId: 'Income',
            budgetSubcategoryName: 'Salary',
          },
          {
            id: 2,
            budgetCategoryId: 'Income',
            budgetSubcategoryName: 'Investments',
          },
          {
            id: 3,
            budgetCategoryId: 'Expense',
            budgetSubcategoryName: 'Groceries',
          },
          {
            id: 4,
            budgetCategoryId: 'Expense',
            budgetSubcategoryName: 'Utilities',
          },
          {
            id: 5,
            budgetCategoryId: 'Expense',
            budgetSubcategoryName: 'Transportation',
          },
        ]}
      />

      {/* Dialog to Add Budget Subcategory */}

      <CustomDialog
        open={editDialog.value}
        handleClose={editDialog.onFalse}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {isEdit ? 'Update Budget Sub Category' : 'Add Budget Sub Category'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              title={
                isEdit
                  ? 'Update budget sub-categories to organize income and expenses.'
                  : 'Add budget sub-categories to organize income and expenses.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <AddBudgetSubcategoryDialog
          onClose={() => {
            editDialog.onFalse();
            setSelectedBudgetCategory(null);
          }}
          isEditMode={isEdit}
          data={selectedBudgetCategory}
          onSave={(newData) => {
            // Handle save logic here, e.g., refresh list or update state
            editDialog.onFalse();
          }}
        />
      </CustomDialog>

      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          setSelectedBudgetCategory(null);
          deleteDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete the budget sub category{' '}
            <strong>{selectedBudgetCategory?.budgetCategoryId}</strong>?
          </>
        }
        action={
          <LoadingButton variant="contained" color="error" size="small" onClick={() => {}}>
            Yes
          </LoadingButton>
        }
      />
    </>
  );
};

export default PredefinedCategoryIncomeExpenseComponent;
