'use client';

import React from 'react';

import { Box, Button, TextField, Autocomplete } from '@mui/material';

import { useGetRolesQuery } from 'src/redux/role/roleApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import DataTable from 'src/components/commonTable';

const Permission = () => {
  const [value, setValue] = React.useState<Record<any, any> | null>(null);

  const { data: roles, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRolesQuery,
  });
  return (
    <Box p={1}>
      <Box display="flex" gap={2}>
        <Autocomplete
          options={roles?.items || []}
          getOptionLabel={(option: any) => option.name}
          id="controlled-demo"
          value={value}
          loading={isLoading}
          sx={{ maxWidth: 300, width: '100%' }}
          onChange={(event: any, newValue: any | null) => {
            setValue(newValue);
          }}
          size="small"
          renderInput={(params) => <TextField {...params} size="small" label="Roles" />}
        />
      </Box>
      <br />
      {value?.name && (
        <DataTable
          columns={[
            {
              key: 'name',
              label: 'Role',
            },
            {
              key: 'user',
              label: 'Users',
              render: (row: any) => (
                <ul style={{ listStyleType: 'bullet' }}>
                  {row?.user?.map((user: string, index: number) => <li key={index}>{user}</li>)}
                </ul>
              ),
            },
            {
              label: 'Actions',
              key: 'name',
              render: (row: any) => (
                <Box>
                  <Button variant="contained" size="small">
                    Assign Users
                  </Button>
                </Box>
              ),
            },
          ]}
          data={[
            {
              name: value?.name || '',
              user: ['parth', 'jignesh'],
            },
          ]}
        />
      )}
    </Box>
  );
};

export default Permission;
