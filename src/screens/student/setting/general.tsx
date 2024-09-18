import React, { useState } from 'react';

import { Visibility } from '@mui/icons-material';
import { Box, Card, Checkbox, Typography, FormControlLabel } from '@mui/material';

import { useGetRolesQuery } from 'src/redux/role/roleApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

const General = () => {
  const [role, setRole] = useState('');
  const { data: roles } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRolesQuery,
  });

  return (
    <Box>
      <Card sx={{ p: 2, my: 2 }}>
        <Typography variant="h6" gutterBottom>
          Field Configuration Section:
        </Typography>

        <Box>
          <FormControlLabel control={<Checkbox />} label="Student name" />
          <FormControlLabel control={<Checkbox />} label="Roll No." />
          <FormControlLabel control={<Checkbox />} label="Admission Date" />
        </Box>
      </Card>
      <Card sx={{ p: 2, my: 2 }}>
        <Typography variant="h6" gutterBottom>
          User Roles & Permissions Section:
        </Typography>

        <CustomSelect
          options={roles?.items || []}
          label="Role"
          labelKey="name"
          valueKey="id"
          value={role}
          onChange={(val: string | string[]) => setRole(val as string)}
          formControlProps={{
            sx: { maxWidth: 200, width: '100%', mb: 1 },
          }}
        />

        <CustomizableTable
          columns={[
            {
              id: 'checkBox',
              label: '',
              isSort: false,
              minWidth: '30px',
              renderColumn(value) {
                return <Checkbox />;
              },
              render(value, row) {
                return <Checkbox />;
              },
            },
            {
              id: 'modules',
              label: 'Modules',
              align: 'left',
              minWidth: '70%',
            },
            {
              id: 'view',
              label: 'View',
              isSort: false,
              render(value, row) {
                return <Visibility />;
              },
            },
          ]}
          data={[
            {
              modules: 'Dashboard',
            },
            {
              modules: 'Student List',
            },
            {
              modules: 'Student I-card',
            },
            {
              modules: 'Student Management',
            },
            {
              modules: 'Certificates',
            },
            {
              modules: 'Reports',
            },
          ]}
        />
      </Card>
    </Box>
  );
};

export default General;
