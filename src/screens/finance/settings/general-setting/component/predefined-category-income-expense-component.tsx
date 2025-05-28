import React, { useState } from 'react';

import { Box } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import AddBudgetSubcategoryDialog from '../dialogs/finance-add-budget-sub-category-dialog';

const PredefinedCategoryIncomeExpenseComponent = () => {
  // Selected budget category ID/value from dropdown
  const [selectedBudgetCategory, setSelectedBudgetCategory] = useState<string>('');
  // New sub-category name entered by user
  const [newSubCategory, setNewSubCategory] = useState('');
  // Dialog open/close state for edit/add form
  const editDialog = useBoolean();
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
      <Box display="flex" gap={3} mt={3}>
        <Box flex={1}>
          <CustomizableTable
            noDataText={
              <>
                No Budget Sub-Category Found
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
            isSearch={false}
            columns={[
              { id: 'existingcategories', label: 'Existing Categories' },
              { id: 'subCategories', label: 'Sub-Categories' },
              {
                id: 'action',
                label: 'Action',
                isFilter: false,
                isSort: false,
                sticky: true,
                align: 'center',
                minWidth: 100,
                render(row: any) {
                  return (
                    <ThreeDotsActions
                      showThreeDots={false}
                      showDeleteIcon
                      handleDeleteClick={() => {
                        // Add delete logic here
                      }}
                    />
                  );
                },
              },
            ]}
            data={[]}
          />
        </Box>
      </Box>

      {/* Dialog to Add Budget Subcategory */}
      {editDialog.value && (
        <CustomDialog
          open={editDialog.value}
          handleClose={editDialog.onFalse}
          title="Add Budget Sub Category"
          maxWidth="md"
        >
          <AddBudgetSubcategoryDialog
            onClose={editDialog.onFalse}
            isEditMode={false}
            data={null}
            onSave={(newData) => {
              // Handle save logic here, e.g., refresh list or update state
              editDialog.onFalse();
            }}
            categories={[]}
          />
        </CustomDialog>
      )}
    </>
  );
};

export default PredefinedCategoryIncomeExpenseComponent;
