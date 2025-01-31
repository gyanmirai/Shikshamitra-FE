import React, { useState } from 'react';

import { Box, Switch, Button } from '@mui/material';

import CustomizableTable from 'src/components/customizabaleTable';

const initialTableData = [
  { id: 1, roles: 'Administrator', canSubmit: true, canEdit: true, canView: true },
  { id: 2, roles: 'Teacher', canSubmit: true, canEdit: true, canView: false },
  { id: 3, roles: 'Student', canSubmit: false, canEdit: false, canView: true },
];

const PermissionAccess = () => {
  const [tableData, setTableData] = useState(initialTableData);

  return (
    <Box>
      <CustomizableTable
        tableId="permission-access-table"
        columns={[
          { id: 'roles', label: 'Roles' },
          {
            id: 'canSubmit',
            label: 'Can Submit',
            render: (value: any, row: any) => (
              <Switch
                size="small"
                checked={value}
                onChange={() => {
                  setTableData((prevData) =>
                    prevData.map((permission) =>
                      permission.id === row.id
                        ? { ...permission, canSubmit: !permission.canSubmit }
                        : permission
                    )
                  );
                }}
                inputProps={{ 'aria-label': 'controlled' }}
              />
            ),
          },
          {
            id: 'canEdit',
            label: 'Can Edit',
            render: (value: any, row: any) => (
              <Switch
                size="small"
                checked={value}
                onChange={() => {
                  setTableData((prevData) =>
                    prevData.map((permission) =>
                      permission.id === row.id
                        ? { ...permission, canEdit: !permission.canEdit }
                        : permission
                    )
                  );
                }}
                inputProps={{ 'aria-label': 'controlled' }}
              />
            ),
          },
          {
            id: 'canView',
            label: 'Can View',
            render: (value: any, row: any) => (
              <Switch
                size="small"
                checked={value}
                onChange={() => {
                  setTableData((prevData) =>
                    prevData.map((permission) =>
                      permission.id === row.id
                        ? { ...permission, canView: !permission.canView }
                        : permission
                    )
                  );
                }}
                inputProps={{ 'aria-label': 'controlled' }}
              />
            ),
          },
        ]}
        data={tableData}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
        <Button variant="contained">Save</Button>
      </Box>
    </Box>
  );
};

export default PermissionAccess;
