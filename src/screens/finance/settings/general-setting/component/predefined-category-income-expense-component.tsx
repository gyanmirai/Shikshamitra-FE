import React from 'react';

import { Box, Button, MenuItem, MenuList, TextField } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import DataTable from 'src/components/commonTable';
import ThreeDotsActions from 'src/components/three-dots-actions';

const PredefinedCategoryIncomeExpenseComponent = () => (
  <>
    {/* <Box py="15px">
      <Typography component="span" variant="h6">
        Predefined Categories for Income and Expenses
      </Typography>
    </Box> */}

    <Box display="flex" gap={3}>
      <Box flex={1}>
        <DataTable
          columns={[
            { key: 'existingcategories', label: 'Existing Categories' },
            { key: 'subCategories', label: 'Sub-Categories' },
            {
              key: 'action',
              label: 'Action',
              render(row: any) {
                return (
                  <ThreeDotsActions
                    actions={({ popover }: any) => (
                      <MenuList>
                        <MenuItem
                          onClick={() => {
                            // modal.onTrue();
                            // popover.onClose();
                          }}
                        >
                          <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
                          Edit
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            // uploadModal.onTrue();
                            // popover.onClose();
                          }}
                        >
                          <Iconify
                            icon="solar:trash-bin-trash-bold"
                            sx={{ height: '16px', width: '16px' }}
                          />
                          Delete
                        </MenuItem>
                      </MenuList>
                    )}
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
