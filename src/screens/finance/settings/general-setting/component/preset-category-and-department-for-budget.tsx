import React from 'react';

import { Box, Grid, Button, TextField } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

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
          <CustomizableTable
            isShowedDense={false}
            isPagination={false}
            isFilter={false}
            isSearch={false}
            columns={[
              { id: 'categories', label: 'Categories' },

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
              { categories: 'Income', action: 'edit' },
              { categories: 'Expense', action: 'edit' },
            ]}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Box display="flex" flexDirection="row" gap={3} alignItems="center">
            <TextField name="category" label="Add New Category" size="small" />
            <Button startIcon={<Iconify icon="ic:outline-plus" />} variant="contained" size="small">
              New Category
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  </>
);

export default PresetCategoryAndDepartmentForBudget;
