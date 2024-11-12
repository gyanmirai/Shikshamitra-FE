'use client';

import React from 'react';

import { Box, Button } from '@mui/material';

import { EmployeeAttendanceStatus } from 'src/enums/employee-attendance-status';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const BiometricIntegrationScreen = () => (
  <Box>
    <CustomBreadcrumbs
      heading="Biometric Integration"
      links={[
        { name: 'HR' },
        { name: 'Attendance And Leave Management' },
        { name: 'Biometric Integration' },
      ]}
      sx={{ px: 1, mb: 3 }}
    />
    <Box display="flex" gap={2} justifyContent="flex-end" mb={2}>
      <Button variant="outlined" startIcon={<Iconify icon="eva:download-fill" />}>
        Download Sample File
      </Button>
      <Button variant="contained" startIcon={<Iconify icon="eva:upload-fill" />}>
        Upload File
      </Button>
    </Box>
    <CustomizableTable
      // isLoading={isLoading}
      columns={[
        { id: 'employeeName', label: 'Name' },

        { id: 'hoursWorked', label: 'Hours Worked' },
        { id: 'timeIn', label: 'In-time' },
        { id: 'timeOut', label: 'Out-time' },
        {
          id: 'status',
          label: 'Status',
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
