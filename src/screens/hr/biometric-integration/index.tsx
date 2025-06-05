'use client';

import React from 'react';

import { Box, Button } from '@mui/material';

import { EmployeeAttendanceStatusOptions } from 'src/enums/employee-attendance-status';

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
        { id: 'employeeName', label: 'Name', minWidth: '8vw', align: 'left', sticky: true },
        { id: 'hoursWorked', label: 'Hours Worked', minWidth: '8vw', align: 'left' },
        { id: 'timeIn', label: 'In-time', minWidth: '8vw', align: 'left' },
        { id: 'timeOut', label: 'Out-time', minWidth: '8vw', align: 'left' },
        {
          id: 'status',
          label: 'Status',
          filterType: 'enum',
          sticky: true,
          // minWidth: '8vw',
          enumOptions: EmployeeAttendanceStatusOptions,
          render(value, row) {
            return (
              <Label
                color={value === 'Present' ? 'success' : value === 'Leave' ? 'error' : 'warning'}
              >
                {value}
              </Label>
            );
          },
        },
        // {
        //   id: 'empty',
        //   label: ' ',
        //   isFilter: false,
        //   align: 'left',
        //   render(value, row) {
        //     return ' ';
        //   },
        // },
      ]}
      data={[
        {
          employeeName: 'Rajesh Kumar',
          hoursWorked: '8.5',
          timeIn: '09:00 AM',
          timeOut: '05:30 PM',
          status: 'Present',
        },
        {
          employeeName: 'Priya Sharma',
          hoursWorked: '7.5',
          timeIn: '09:30 AM',
          timeOut: '05:00 PM',
          status: 'Present',
        },
        {
          employeeName: 'Amit Patel',
          hoursWorked: '0',
          timeIn: '-',
          timeOut: '-',
          status: 'Leave',
        },
        {
          employeeName: 'Neha Gupta',
          hoursWorked: '4',
          timeIn: '09:00 AM',
          timeOut: '01:00 PM',
          status: 'Half Day',
        },
        {
          employeeName: 'Suresh Verma',
          hoursWorked: '8',
          timeIn: '09:15 AM',
          timeOut: '05:15 PM',
          status: 'Present',
        },
        {
          employeeName: 'Anita Singh',
          hoursWorked: '8.25',
          timeIn: '09:00 AM',
          timeOut: '05:15 PM',
          status: 'Present',
        },
        {
          employeeName: 'Deepak Mishra',
          hoursWorked: '0',
          timeIn: '-',
          timeOut: '-',
          status: 'Leave',
        },
        {
          employeeName: 'Meera Reddy',
          hoursWorked: '4.5',
          timeIn: '09:00 AM',
          timeOut: '01:30 PM',
          status: 'Half Day',
        },
        {
          employeeName: 'Vikram Malhotra',
          hoursWorked: '8.5',
          timeIn: '09:00 AM',
          timeOut: '05:30 PM',
          status: 'Present',
        },
        {
          employeeName: 'Pooja Iyer',
          hoursWorked: '8',
          timeIn: '09:30 AM',
          timeOut: '05:30 PM',
          status: 'Present',
        },
      ]}
    />
  </Box>
);

export default BiometricIntegrationScreen;
