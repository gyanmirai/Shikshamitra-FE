import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import { Box } from '@mui/material';
import React, { useState } from 'react';
import { Label } from 'src/components/label';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  AttendanceStatusType,
  AttendanceStatusOptions,
  AttendanceStatusTypeColors,
} from 'src/enums/attendance-type';

const MyAttendance = () => {
  // State to store selected year (defaults to current year)
  const [year] = useState<string>(dayjs().format('YYYY'));

  // State to store selected month (defaults to current month)
  const [month, setMonth] = useState<string>(dayjs().format('MM'));
  return (
    <Box display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Attendance"
        description="Manual attendance for all students"
        links={[
          { name: 'Hostel Management', href: '/hostel/dashboard' },
          { name: 'Attendance And Leave Management', href: '' },
          { name: 'My Attendance', href: '' },
        ]}
      />
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <CustomSelect
          label="Year"
          options={[
            { value: '2025', label: '2025' },
            { value: '2024', label: '2024' },
            { value: '2023', label: '2023' },
            { value: '2022', label: '2022' },
          ]}
          onChange={(val) => {
            setMonth(val as string);
          }}
          value={year}
          formControlProps={{
            sx: { width: '100%', maxWidth: '200px' },
          }}
        />
        <CustomSelect
          label="Month"
          options={[
            { value: '01', label: 'January' },
            { value: '02', label: 'February' },
            { value: '03', label: 'March' },
            { value: '04', label: 'April' },
            { value: '05', label: 'May' },
            { value: '06', label: 'June' },
            { value: '07', label: 'July' },
            { value: '08', label: 'August' },
            { value: '09', label: 'September' },
            { value: '10', label: 'October' },
            { value: '11', label: 'November' },
            { value: '12', label: 'December' },
          ]}
          onChange={(val) => {
            setMonth(val as string);
          }}
          value={month}
          formControlProps={{
            sx: { width: '100%', maxWidth: '200px' },
          }}
        />
      </Box>
      <CustomizableTable
        tableId="student-attendance-table"
        noDataText="Student Attendace Data Not Found"
        searchFieldProps={{
          placeholder: 'Search by Date, Status, Reason, Remarks...',
          label: 'Search by Date, Status, Reason, Remarks...',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        data={[
          {
            date: '18/07/2024',
            status: 'Present',
            reason: 'Doctors Appointment',
            remarks: 'Student attended half-day due to medical checkup',
          },
          {
            date: '17/07/2024',
            status: 'Absent',
            reason: 'Traffic',
            remarks: 'Student informed about heavy traffic congestion',
          },
        ]}
        columns={[
          { id: 'date', label: 'Date', minWidth: '10%' },
          {
            id: 'status',
            label: 'Status',
            minWidth: '10%',
            filterType: 'enum',
            enumOptions: AttendanceStatusOptions,
            render(value, row) {
              const color = AttendanceStatusTypeColors[value as AttendanceStatusType] as LabelColor;
              return (
                <Label color={color}>{AttendanceStatusType[value as AttendanceStatusType]}</Label>
              );
            },
          },
          { id: 'reason', label: 'Reason', minWidth: '10%' },
          { id: 'remarks', label: 'Remarks', minWidth: '20%' },
        ]}
      />{' '}
    </Box>
  );
};

export default MyAttendance;
