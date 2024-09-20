import React from 'react';

import Add from '@mui/icons-material/Add';
import { Search } from '@mui/icons-material';
import { Box, Button, TextField, Typography, DialogActions, InputAdornment } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

const PF = () => {
  const dialog = useBoolean();
  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" alignItems="center">
        <Button startIcon={<Add />} variant="contained" onClick={dialog.onTrue}>
          Create New
        </Button>
      </Box>
      <CustomizableTable
        columns={[
          { id: 'code', label: 'Code' },
          { id: 'name', label: 'Name' },
          { id: 'employeePercentage', label: 'Employee Percentage' },
          { id: 'employerPercentage', label: 'Employer Percentage' },
        ]}
        data={[]}
      />
      <Typography variant="h5" mt={2}>
        Assign PF Rule to Employee
      </Typography>
      <Box display="flex" gap={2} alignItems="center" mt={2}>
        <TextField
          size="small"
          label="Search Employee"
          sx={{ maxWidth: '250px', width: '100%' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <CustomSelect
          options={[]}
          label="PF Rule"
          value=""
          onChange={() => {}}
          formControlProps={{ fullWidth: true, sx: { maxWidth: '250px', width: '100%' } }}
        />
        <Button variant="contained">Assign</Button>
      </Box>
      <CustomDialog open={dialog.value} handleClose={dialog.onFalse} title="Create New PF">
        <form>
          <Scrollbar sx={{ p: 2, background: 'background.neutral' }}>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField size="small" label="Code" fullWidth />
              <TextField size="small" label="Name" fullWidth />
              <TextField size="small" label="Employee Percentage" fullWidth />
              <TextField size="small" label="Employer Percentage" fullWidth />
            </Box>
          </Scrollbar>
        </form>
        <DialogActions>
          <Button variant="contained">Save</Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};

export default PF;
