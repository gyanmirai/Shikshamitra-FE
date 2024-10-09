import React from 'react';

import Grid2 from '@mui/material/Unstable_Grid2';
import { DatePicker } from '@mui/x-date-pickers';
import { Box, Button, TextField, Typography } from '@mui/material';

import CustomSelect from 'src/components/custom-select';

const FinanceCreateFeeStructureComponent = () => (
  <>
    <Typography component="span" variant="h6">
      Create New Fee Structure
    </Typography>

    <Box pt="10px" display="flex" flexDirection="column" gap={3}>
      {/* <Grid2 xl={2} >
                <Button variant="contained" size="medium">Create New Fee Structure</Button>
            </Grid2> */}

      <Grid2 xl={6}>
        <Box display="flex" flexDirection="row" gap={3}>
          <CustomSelect
            label="Class/Grade"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { minWidth: 205 } }}
          />
          <TextField
            name="Tuition Fees"
            label="Tuition Fees"
            // value={formik.values.description}
            // onChange={formik.handleChange}
            size="small"
          />
          <TextField
            name="Discount Percentage"
            label="Discount Percentage"
            // value={formik.values.description}
            // onChange={formik.handleChange}
            size="small"
          />
          <TextField
            name="Library Fees"
            label="Library Fees"
            // value={formik.values.description}
            // onChange={formik.handleChange}
            size="small"
          />
        </Box>

        <Box display="flex" flexDirection="row" gap={3} py="8px">
          <TextField
            name="Fixed Reductions"
            label="Fixed Reductions"
            // value={formik.values.description}
            // onChange={formik.handleChange}
            size="small"
          />
          <TextField
            name="Transport Fees"
            label="Transport Fees"
            // value={formik.values.description}
            // onChange={formik.handleChange}
            size="small"
          />
          <Box width="200px">
            <DatePicker
              label="To Date"
              format="DD-MM-YYYY"
              slotProps={{ textField: { size: 'small' } }}
            />
          </Box>
          <TextField
            name="Other Miscellaneous Fees"
            label="Other Miscellaneous Fees"
            size="small"
          />
        </Box>
      </Grid2>
      <Box
        justifyItems="flex-end"
        justifyContent="flex-end"
        display="flex"
        flexDirection="row"
        gap={3}
        pb="20px"
      >
        <Button variant="contained">Preview</Button>
        <Button variant="contained">Save</Button>
      </Box>
    </Box>
  </>
);

export default FinanceCreateFeeStructureComponent;
