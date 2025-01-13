import React from 'react';

import { Box, Grid, Button, TextField } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

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

        <Button startIcon={<Iconify icon="ic:outline-plus" />} variant="contained" size="small">
          Additionally Discount Category
        </Button>
      </Box>
    </Grid>

    <Grid container spacing={2}>
      <Grid item xs={12} md={12}>
        <Box>
          <CustomizableTable
            isShowedDense={false}
            isPagination={false}
            isFilter={false}
            isSearch={false}
            columns={[
              { id: 'additionallyDiscountCategory', label: 'Additionally Discount Category' },
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
