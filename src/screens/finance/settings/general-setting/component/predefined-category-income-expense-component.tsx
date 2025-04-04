import React, { useState } from 'react';

import { Box, Button, TextField } from '@mui/material';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetbudgetCategoryQuery } from 'src/redux/budgetCategory/budgetCategoryApi';

import { Iconify } from 'src/components/iconify';
import AutoFocus from 'src/components/autofocus';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const PredefinedCategoryIncomeExpenseComponent = () => {
  // State to store the selected budget category ID
  const [selectedBudgetCategory, setSelectedBudgetCategory] = useState<string | undefined>(
    undefined
  );

  // Fetch budget category list using custom hook that combines query and mutation
  // Returns data object containing budget categories and loading state
  const { data: budgetCategoryList, isLoading: isGetBudgetCategoryLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetbudgetCategoryQuery,
  });

  return (
    <>
      <Box display="flex" flex={1} flexDirection="row" gap={3} alignItems="center">
        {/* Category Selection */}
        <AutoFocus>
          <CustomSelect
            options={
              budgetCategoryList?.items?.length > 0
                ? budgetCategoryList.items.map((item: any) => ({
                    label: item.budgetCategoryName,
                    value: item.id,
                  }))
                : []
            }
            label="Select category"
            value={selectedBudgetCategory || ''}
            onChange={(e) => {
              console.log(e);
              setSelectedBudgetCategory(e as string);
            }}
            formControlProps={{ sx: { minWidth: 275 } }}
            placeholder="No categories available"
          />
        </AutoFocus>

        {/* Sub-category Input */}
        <TextField name="Addnewsubcategory" label="Add New Sub-Category" size="small" />

        {/* Button Wrapper for Center Alignment */}
        <Box display="flex" alignItems="center">
          <Button startIcon={<Iconify icon="ic:outline-plus" />} variant="contained" size="small">
            New Sub-Category
          </Button>
        </Box>
      </Box>

      <Box display="flex" gap={3}>
        <Box flex={1}>
          <CustomizableTable
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
                render(row: any) {
                  return (
                    <ThreeDotsActions
                      showThreeDots={false}
                      showDeleteIcon
                      handleDeleteClick={() => {}}
                    />
                  );
                },
              },
            ]}
            data={[
              { existingcategories: 'Income', subCategories: 'Tuition Fees', action: 'edit' },
              { existingcategories: 'Expense', subCategories: 'Maintenance', action: 'edit' },
            ]}
            // Optional: Adjust table styles for padding and row height
            // sx={{
            //     '& .MuiTableCell-root': { padding: '8px' },
            //     '& .MuiTableRow-root': { height: '40px' },
            // }}
          />
        </Box>
      </Box>
    </>
  );
};

export default PredefinedCategoryIncomeExpenseComponent;
