import React from 'react';

import { Box, Grid, Button, MenuList, MenuItem, TextField } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import DataTable from 'src/components/commonTable';
import ThreeDotsActions from 'src/components/three-dots-actions';

const DefinedSchoolWideRulesComponent = () => (
  <Box display="flex" flexDirection="column" gap={2}>
    <Grid item xs={12} md={6}>
      <Box
        pt="15px"
        display="flex"
        justifyItems="center"
        alignItems="center"
        flexDirection="row"
        gap={3}
      >
        <TextField
          name="Additionally Discount Category"
          label="Additionally Discount Category"
          size="small"
        />

        <Button variant="contained" size="small">
          Add Additionally Discount Category
        </Button>
      </Box>
    </Grid>

    <Grid container spacing={2}>
      <Grid item xs={12} md={12}>
        <Box>
          <DataTable
            columns={[
              { key: 'additionallyDiscountCategory', label: 'Additionally Discount Category' },
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
            data={[{ additionallyDiscountCategory: 'Scholership', action: 'Delete' }]}
          />
        </Box>
      </Grid>
    </Grid>
  </Box>
  // <Box display="flex" flexDirection="row" gap={3}>
  //   <Box display="flex" flexDirection="column" gap={3}>
  //     <FormControlLabel
  //       label="Discount"
  //       control={<Switch name="discount" checked onChange={() => {}} />}
  //     />
  //     <TextField
  //       name="Specify discount percentage"
  //       label="Specify discount percentage"
  //       // value={formik.values.description}
  //       // onChange={formik.handleChange}
  //       size="small"
  //     />
  //     <CustomSelect
  //       label="Reminder frequency"
  //       options={[]}
  //       value=""
  //       onChange={() => {}}
  //       formControlProps={{ sx: { minWidth: 150 } }}
  //     />
  //   </Box>
  //   <Box display="flex" flexDirection="column" gap={3}>
  //     <FormControlLabel
  //       label="Late-Fees"
  //       control={<Switch name="latefees" checked onChange={() => {}} />}
  //     />
  //     <TextField
  //       name="Specify late fee amount"
  //       label="Specify late fee amount"
  //       // value={formik.values.description}
  //       // onChange={formik.handleChange}
  //       size="small"
  //     />
  //     <CustomSelect
  //       label="Reminder frequency"
  //       options={[]}
  //       value=""
  //       onChange={() => {}}
  //       formControlProps={{ sx: { minWidth: 150 } }}
  //     />
  //   </Box>
  // </Box>
);

export default DefinedSchoolWideRulesComponent;
