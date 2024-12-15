import React from 'react';

import Add from '@mui/icons-material/Add';
import { Box, Button, TextField, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';

const PF = () => {
  const dialog = useBoolean();
  // const [employee, setEmployee] = useState<string[] | undefined>([]);

  // const { data: employees, isLoading } = useQueryAndMutation({
  //   type: 'query',
  //   currentQueryAndMutation: useGetEmployeeQuery,
  // });
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
        data={[
          {
            id: 1,
            code: 'PF001',
            name: 'Standard PF Rule',
            employeePercentage: '12%',
            employerPercentage: '12%',
          },
          {
            id: 2,
            code: 'PF002',
            name: 'Special PF Rule',
            employeePercentage: '10%',
            employerPercentage: '14%',
          },
          {
            id: 3,
            code: 'PF003',
            name: 'Basic PF Rule',
            employeePercentage: '8%',
            employerPercentage: '8%',
          },
          {
            id: 4,
            code: 'PF004',
            name: 'Enhanced PF Rule',
            employeePercentage: '15%',
            employerPercentage: '15%',
          },
        ]}
      />
      {/* <Typography variant="h5" mt={2}>
        Assign PF Rule to Employee
      </Typography>
      <Box display="flex" gap={2} alignItems="center" py={2}>
        <Autocomplete
          loading={isLoading}
          multiple
          limitTags={3}
          value={employee}
          onChange={(e, value) => {
            setEmployee(value);
          }}
          options={employees?.items || []}
          getOptionLabel={(option: any) => option?.firstName || ''}
          // defaultValue={top100Films.slice(0, 8)}
          renderInput={(params) => (
            <TextField {...params} size="small" label="Employee" placeholder="Search  Employee" />
          )}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              {option.firstName}
            </li>
          )}
          renderTags={(selected, getTagProps) =>
            selected.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                key={option.id}
                label={option.firstName}
                size="small"
                variant="soft"
              />
            ))
          }
          sx={{ maxWidth: '300px', width: '100%' }}
        />
        <CustomSelect
          options={[]}
          label="PF Rule"
          value=""
          onChange={() => {}}
          formControlProps={{ fullWidth: true, sx: { maxWidth: '250px', width: '100%' } }}
        />
        <Button variant="contained">Assign</Button>
      </Box> */}
      <CustomDialog open={dialog.value} handleClose={dialog.onFalse} title="Create New PF">
        <form>
          <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral' }}>
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
