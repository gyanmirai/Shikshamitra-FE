'use client';

import React from 'react';

import { Box, Button } from '@mui/material';

import {
  EmployeeAttendanceStatus,
  EmployeeAttendanceStatusOptions,
} from 'src/enums/employee-attendance-status';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const BiometricIntegrationScreen = () => (
  <Box>
    <CustomBreadcrumbs
      heading="Import Attendance"
      links={[
        { name: 'HR', href: '/hr/dashboard/' },
        { name: 'Attendance & Leave', href: '/hr/biometric-integration/' },
        { name: 'Import Attendance' },
      ]}
      action={
        <Box display="flex" gap={2} justifyContent="flex-end" mb={2}>
          <Button variant="outlined" size="small" startIcon={<Iconify icon="eva:download-fill" />}>
            Download Sample File
          </Button>
          <Button variant="contained" size="small" startIcon={<Iconify icon="eva:upload-fill" />}>
            Upload File
          </Button>
        </Box>
      }
      sx={{ px: 1, mb: 3 }}
    />

    <CustomizableTable
      // isLoading={isLoading}
      noDataText={<>No Biometric Integration Data Found </>}
      searchFieldProps={{
        placeholder: 'Search by Name, Hours Worked, In-time..',
        label: 'Search by Name, Hours Worked, In-time...',
        sx: {
          maxWidth: '400px',
          width: '100%',
        },
      }}
      tableId="biometric-integration-table"
      columns={[
        { id: 'employeeName', label: 'Name' },

        { id: 'hoursWorked', label: 'Hours Worked' },
        { id: 'timeIn', label: 'In-time' },
        { id: 'timeOut', label: 'Out-time' },
        {
          id: 'status',
          label: 'Status',
          filterType: 'enum',

          enumOptions: EmployeeAttendanceStatusOptions,
          render(value, row) {
            return (
              <Label
                color={
                  value === EmployeeAttendanceStatus.Present
                    ? 'success'
                    : value === EmployeeAttendanceStatus.FullDayLeave
                      ? 'error'
                      : 'warning'
                }
              >
                {value}
              </Label>
            );
          },
        },
      ]}
      data={[]}
    />
  </Box>
);

export default BiometricIntegrationScreen;
