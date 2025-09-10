import React, { useState } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetEmployeeQuery } from 'src/redux/employee/employeeApi';
import { Box, Chip, Button, TextField, Typography, Autocomplete } from '@mui/material';

const TDS = () => {
  const [employee, setEmployee] = useState<string[] | undefined>([]);

  const { data: employees, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeQuery,
  });

  return (
    <>
      <Typography variant="h5">TDS Setup</Typography>
      <Box display="flex" gap={2} alignItems="center" mt={2}>
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
        <TextField size="small" label="TDS Percentage" />
        <TextField size="small" label="TDS Amount" />
        <Button variant="contained">Save</Button>
      </Box>
    </>
  );
};

export default TDS;
