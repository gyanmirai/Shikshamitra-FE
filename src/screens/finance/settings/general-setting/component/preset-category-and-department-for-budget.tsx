import React from 'react';

import { Box, Grid, Button, MenuItem, MenuList, TextField } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import DataTable from 'src/components/commonTable';
import ThreeDotsActions from 'src/components/three-dots-actions';

const PresetCategoryAndDepartmentForBudget = () => (
  <>
    {/* <Box py="15px">
      <Typography component="span" variant="h6">
        Preset Categories and Departments for Budgeting
      </Typography>
    </Box> */}

    <Box pb="20px">
      <Grid container spacing={3}>
        {/* Existing Categories and Departments Table */}
        <Grid item xs={12} md={6}>
          <DataTable
            columns={[
              { key: 'categories', label: 'Categories' },

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
              { categories: 'Income', action: 'edit' },
              { categories: 'Expense', action: 'edit' },
            ]}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Box display="flex" flexDirection="row" gap={3} alignItems="center">
            <TextField name="category" label="Add New Category" size="small" fullWidth />
            <Button variant="contained" size="small">
              Add
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  </>
);

export default PresetCategoryAndDepartmentForBudget;
