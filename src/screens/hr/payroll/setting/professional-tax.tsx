import React from 'react';

import { Add } from '@mui/icons-material';
import { Box, Button, TextField, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

const ProfessionalTax = () => {
  const dialog = useBoolean();
  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" alignItems="center">
        <Button startIcon={<Add />} variant="contained" onClick={dialog.onTrue}>
          Add New Tax Range
        </Button>
      </Box>
      <CustomizableTable
        columns={[
          { id: 'gender', label: 'Gender' },
          { id: 'fromSalary', label: 'From salary' },
          { id: 'toSalary', label: 'To salary' },
          { id: 'Tax amount', label: 'tax Amount' },
        ]}
        data={[
          { gender: 'Male', fromSalary: 0, toSalary: 10000, 'Tax amount': 0 },
          { gender: 'Male', fromSalary: 10001, toSalary: 20000, 'Tax amount': 150 },
          { gender: 'Male', fromSalary: 20001, toSalary: 30000, 'Tax amount': 300 },
          { gender: 'Female', fromSalary: 0, toSalary: 15000, 'Tax amount': 0 },
          { gender: 'Female', fromSalary: 15001, toSalary: 25000, 'Tax amount': 180 },
          { gender: 'Female', fromSalary: 25001, toSalary: 35000, 'Tax amount': 350 },
        ]}
      />
      <CustomDialog open={dialog.value} handleClose={dialog.onFalse} title="Create New Tax Range">
        <form>
          <Scrollbar sx={{ p: 2, background: 'background.nautral' }}>
            <Box display="flex" flexDirection="column" gap={2}>
              <CustomSelect
                options={[
                  { label: 'Male', value: 'male' },
                  { label: 'Female', value: 'female' },
                ]}
                label="Gender"
                value=""
                onChange={() => {}}
                formControlProps={{ fullWidth: true }}
              />
              <TextField size="small" label="From Salary" />
              <TextField size="small" label="To Salary" />
              <TextField size="small" label="Tax Amount" />
            </Box>
          </Scrollbar>
          <DialogActions sx={{ p: 2 }}>
            <Button variant="contained">Save</Button>
            <Button variant="outlined" onClick={dialog.onFalse}>
              Cancel
            </Button>
          </DialogActions>
        </form>
      </CustomDialog>
    </Box>
  );
};

export default ProfessionalTax;
