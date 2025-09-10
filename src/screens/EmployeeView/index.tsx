'use client';

import React from 'react';
import { Box } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';

const EmployeeViewScreen = () => (
  <Box>
    {/* <DataTable
        columns={[
          { label: 'Name', key: 'name' },
          { label: 'Role', key: 'role' },
          { label: 'Board', key: 'board' },
          { label: 'Organization', key: 'organization' },
          { label: 'Action', key: 'action' },
        ]}
        data={[]}
      /> */}
    <CustomizableTable
      tableId="employee-view-table"
      columns={[
        {
          id: 'name',
          label: 'Name',
        },
        { id: 'role', label: 'Role' },
        { id: 'board', label: 'Board' },
        { label: 'Organization', id: 'organization' },
        { label: 'Action', id: 'action' },
      ]}
      data={[]}
    />
  </Box>
);

export default EmployeeViewScreen;
