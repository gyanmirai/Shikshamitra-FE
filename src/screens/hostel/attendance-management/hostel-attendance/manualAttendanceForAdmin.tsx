'use client';

import type { Dayjs } from 'dayjs';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { DatePicker } from '@mui/x-date-pickers';
import CustomizableTable from 'src/components/customizable-table';
import { Box, Stack, TextField, Autocomplete } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import hostelManualAttendance from 'src/json/hostel/hostel-attendance/hostelManualAttendance.json';
import {
  AttendanceStatusType,
  AttendanceStatusOptions,
  AttendanceStatusTypeColors,
} from 'src/enums/attendance-type';

import type { IStudentHostelManualAttendance } from './type';

const ManualHostelAttendanceForAdmin = () => {
  // State for storing the selected date
  // const [_date, setDate] = useState<Dayjs | null>(dayjs());
  // State for storing the selected block
  const [, setRollCall] = useState<string>();
  // State for storing the selected hostel
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_setHostel, setHostel] = useState<string>('');
  // State for storing the selected room
  const [, setFloor] = useState<string>('');
  // Dialog state for sending instant notifications
  // State for storing the selected student data
  // const [_selectedStudent, ] = useState<IStudentHostelManualAttendance[]>([]);
  // State for storing the students data
  const [studentsData] = useState<IStudentHostelManualAttendance[]>(hostelManualAttendance);
  // State to track the start date of attendance period, defaults to start of current month
  const [startDate, setStartDate] = useState<null | Dayjs>(dayjs().startOf('month'));
  // State to track the end date of attendance period, defaults to end of current month
  const [endDate, setEndDate] = useState<null | Dayjs>(dayjs().endOf('month'));
  const totalStudents = studentsData?.length || 0;
  const totalPresent = studentsData?.filter((student) => student.isPresent).length || 0;
  const totalAbsent = totalStudents - totalPresent;
  // Handler function to open the send notification dialog
  // const handlerSendNotification = () => {
  //   if (!sendInstantNotificationDialogValue.value) {
  //     sendInstantNotificationDialogValue.onTrue();
  //   }
  // };

  // const absentStudents = useMemo(
  //   () => studentsData.filter((item: any) => !item.isPresent),
  //   [studentsData]
  // );

  return (
    <Box display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Attendance"
        description="Manual attendance for all students"
        links={[
          { name: 'Hostel Management', href: '/hostel/dashboard' },
          { name: 'Attendance And Leave Management', href: '' },
          { name: 'Attendance', href: '' },
        ]}
      />
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'end', flexWrap: 'wrap', mb: 2 }}>
        <DatePicker
          value={startDate}
          onChange={(value) => setStartDate(value)}
          label="Start Date"
          slotProps={{ textField: { size: 'small' } }}
        />
        <DatePicker
          value={endDate}
          onChange={(value) => setEndDate(value)}
          label="End Date"
          slotProps={{ textField: { size: 'small' } }}
        />

        {/* Hostel Dropdown */}
        <Autocomplete
          options={[
            { id: 'H1', name: 'Hostel A' },
            { id: 'H2', name: 'Hostel B' },
            { id: 'H3', name: 'Hostel C' },
          ]}
          getOptionLabel={(option) => option.name || ''}
          onChange={(_, value) => {
            setHostel(value?.id || '');
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Hostel"
              name="hostel"
              variant="outlined"
              fullWidth
              size="small"
            />
          )}
          sx={{ maxWidth: '200px', width: '100%' }}
        />

        <Autocomplete
          options={[
            { id: '1', name: 'Block 1' },
            { id: '2', name: 'Block 2' },
            { id: '3', name: 'Block 3' },
          ]}
          getOptionLabel={(option) => option.name || ''}
          onChange={(_, value) => {
            setFloor(value?.id || '');
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Floor"
              name="floor"
              variant="outlined"
              fullWidth
              size="small"
            />
          )}
          sx={{ maxWidth: '200px', width: '100%' }}
        />

        <Autocomplete
          options={[
            { id: '1', name: 'Block 1' },
            { id: '2', name: 'Block 2' },
            { id: '3', name: 'Block 3' },
          ]}
          getOptionLabel={(option) => option.name || ''}
          onChange={(_, value) => {
            setRollCall(value?.id || '');
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Roll Call"
              name="rollCall"
              variant="outlined"
              fullWidth
              size="small"
            />
          )}
          sx={{ maxWidth: '200px', width: '100%' }}
        />
      </Box>
      <CustomizableTable
        tableId="attendance-table"
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
          { id: 'date', label: 'Date', minWidth: 80, filterType: 'date' },
          { id: 'studentName', label: 'Student Name', minWidth: 140 },
          {
            id: 'status',
            label: 'Status',
            minWidth: 70,
            filterType: 'enum',
            enumOptions: AttendanceStatusOptions,
            render(value, row) {
              const color = AttendanceStatusTypeColors[value as AttendanceStatusType];
              return (
                <Label color={color as LabelColor}>
                  {AttendanceStatusType[value as AttendanceStatusType]}
                </Label>
              );
            },
          },
          { id: 'reason', label: 'Reason', minWidth: 60 },
          { id: 'remarks', label: 'Remarks', minWidth: 80 },
        ]}
      />{' '}
      <Stack direction="row" spacing={1} sx={{ mb: 2, mt: 2 }} justifyContent="flex-end">
        <Label color="default">{`Total Students: ${totalStudents}`}</Label>
        <Label color="success">{`Present: ${totalPresent}`}</Label>
        <Label color="error">{`Absent: ${totalAbsent}`}</Label>
      </Stack>
    </Box>
  );
};

export default ManualHostelAttendanceForAdmin;
