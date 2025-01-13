import React from 'react';

import { Box, Button, TextField } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const PredefinedCategoryIncomeExpenseComponent = () => (
  <>
    {/* <Box py="15px">
      <Typography component="span" variant="h6">
        Predefined Categories for Income and Expenses
      </Typography>
    </Box> */}

    <Box display="flex" gap={3}>
      <Box flex={1}>
        <CustomizableTable
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
      <Box display="flex" flex={1} flexDirection="column" gap={3} alignItems="center">
        <TextField name="category" label="Category" size="small" fullWidth />
        <TextField name="Addnewsubcategory" label="Add New Sub-Category" size="small" fullWidth />
        <Box display="flex" width="100%" alignSelf="flex-end">
          <Button startIcon={<Iconify icon="ic:outline-plus" />} variant="contained" size="small">
            New Sub-Category
          </Button>
        </Box>
      </Box>
    </Box>
  </>
);

export default PredefinedCategoryIncomeExpenseComponent;
