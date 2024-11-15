'use client';

import type { LabelColor } from 'src/components/label';
import type { UsePopoverReturn } from 'src/components/custom-popover';

import React, { useCallback } from 'react';

import { Search } from '@mui/icons-material';
import {
  Box,
  Button,
  MenuList,
  MenuItem,
  TextField,
  DialogActions,
  InputAdornment,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import EmployeeFrom from '../employee/employee-form';

const StaffDirectoryScreen = () => {
  const dialog = useBoolean();
  const statusDialog = useBoolean();

  const actions = useCallback(
    // eslint-disable-next-line react/no-unused-prop-types
    ({ popover }: { popover: UsePopoverReturn }, row: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            popover.onClose();
            dialog.onTrue();
          }}
        >
          <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
          Edit Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            popover.onClose();
            statusDialog.onTrue();
          }}
        >
          <Iconify icon="mdi:form-dropdown" sx={{ height: '16px', width: '16px' }} />
          Change Status
        </MenuItem>
      </MenuList>
    ),
    [dialog, statusDialog]
  );
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Staff Directory"
        links={[{ name: 'HR' }, { name: 'Staff Directory' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <TextField
        fullWidth
        placeholder="Search by department or designation"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{
          backgroundColor: 'background.paper',
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        }}
      />
      <CustomizableTable
        columns={[
          { id: 'name', label: 'Name' },
          { id: 'designation', label: 'Designation' },
          { id: 'department', label: 'Department' },
          {
            id: 'status',
            label: 'Status',
            render(value, row) {
              let color: LabelColor = 'success';
              if (value === 'Active') {
                color = 'success';
              } else if (value === 'Left') {
                color = 'error';
              } else if (value === 'In Active') {
                color = 'warning';
              } else if (value === 'Retired') {
                color = 'info';
              }
              return <Label color={color}>{value}</Label>;
            },
          },
          {
            id: 'actions',
            label: 'Actions',
            render(value, row) {
              return (
                <ThreeDotsActions placement="right-top" actions={(props) => actions(props, row)} />
              );
            },
          },
        ]}
        data={[
          {
            id: 1,
            name: 'John Doe',
            designation: 'Software Engineer',
            department: 'Engineering',
            status: 'Active',
          },
          {
            id: 2,
            name: 'Jane Smith',
            designation: 'HR Manager',
            department: 'Human Resources',
            status: 'Active',
          },
          {
            id: 3,
            name: 'Mike Johnson',
            designation: 'Product Manager',
            department: 'Product',
            status: 'Left',
          },
          {
            id: 4,
            name: 'Sarah Williams',
            designation: 'Marketing Director',
            department: 'Marketing',
            status: 'Active',
          },
          {
            id: 5,
            name: 'David Brown',
            designation: 'Financial Analyst',
            department: 'Finance',
            status: 'Active',
          },
          {
            id: 6,
            name: 'Emily Davis',
            designation: 'UX Designer',
            department: 'Design',
            status: 'In Active',
          },
          {
            id: 7,
            name: 'Robert Wilson',
            designation: 'Sales Manager',
            department: 'Sales',
            status: 'Retired',
          },
          {
            id: 8,
            name: 'Lisa Anderson',
            designation: 'Content Writer',
            department: 'Marketing',
            status: 'Active',
          },
        ]}
      />
      <CustomDialog
        maxWidth="lg"
        open={dialog.value}
        handleClose={dialog.onFalse}
        title="Add Employee"
        paperProps={{
          sx: {
            maxHeight: '70vh',
          },
        }}
      >
        <EmployeeFrom />
      </CustomDialog>

      <CustomDialog
        open={statusDialog.value}
        handleClose={statusDialog.onFalse}
        title="Change Status"
      >
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral' }}>
          <CustomSelect
            options={[
              { label: 'Active', value: 'active' },
              { label: 'In Active', value: 'inActive' },
              { label: 'Left', value: 'left' },
              { label: 'Retired', value: 'retired' },
            ]}
            value=""
            onChange={() => {}}
            label="Change Status"
            formControlProps={{
              fullWidth: true,
              sx: {
                maxWidth: 'unset',
              },
            }}
          />
        </Scrollbar>
        <DialogActions>
          <Button variant="outlined" onClick={statusDialog.onFalse}>
            Cancel
          </Button>
          <Button variant="contained" onClick={statusDialog.onFalse}>
            Change Status
          </Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};

export default StaffDirectoryScreen;
