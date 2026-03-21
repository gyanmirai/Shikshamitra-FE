'use client';

import type { Dayjs } from 'dayjs';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import React, { useState, useCallback } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, MenuItem, MenuList, TextField, Autocomplete } from '@mui/material';
import {
  BiometricHostelAttendanceType,
  BiometricHostelAttendanceColor,
  BiometricHostelAttendanceOptions,
} from 'src/enums/biometric-hostel-attendance';

const BiometricHostelAttendance = () => {
  // State for storing the selected date
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  // State for storing the selected block
  const [, setBlock] = useState<string>('');
  // State for storing the selected hostel
  const [, setHostel] = useState<string>('');
  // State for storing the selected room
  const [, setRoom] = useState<string>('');

  // Actions to be displayed in the three-dot menu
  const actions = useCallback(
    ({ popover: pop }: any) => (
      <>
        {' '}
        <MenuList>
          {/* {(row.status === 'Cancelled' || row.status === 'Scheduled') && ( */}
          <MenuItem onClick={() => {}}>
            <Iconify icon="mdi:bell" sx={{ mr: 1 }} />
            Notify Parents
          </MenuItem>
          {/* )} */}
        </MenuList>
      </>
    ),
    []
  );

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Attendance"
        description="Biometric attendance for all students"
        links={[
          { name: 'Hostel Management', href: '/hostel/dashboard' },
          { name: 'Attendance And Leave Management', href: '' },
          { name: 'Attendance', href: '' },
        ]}
      />
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'end', flexWrap: 'wrap', mb: 2 }}>
        <DatePicker
          format="DD-MM-YYYY"
          label="Select Date"
          value={date}
          onChange={(value) => {
            setDate(value);
          }}
          slotProps={{
            textField: {
              size: 'small',
            },
          }}
        />
        <Autocomplete
          options={[
            { id: '1', name: 'Block 1' },
            { id: '2', name: 'Block 2' },
            { id: '3', name: 'Block 3' },
          ]}
          getOptionLabel={(option) => option.name || ''}
          onChange={(_, value) => {
            setBlock(value?.id || '');
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Block"
              name="block"
              variant="outlined"
              fullWidth
              size="small"
            />
          )}
          sx={{ maxWidth: '200px', width: '100%' }}
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

        {/* Room Dropdown */}
        <Autocomplete
          options={[
            { id: 'R101', name: 'Room 101' },
            { id: 'R102', name: 'Room 102' },
            { id: 'R103', name: 'Room 103' },
          ]}
          getOptionLabel={(option) => option.name || ''}
          onChange={(_, value) => {
            setRoom(value?.id || '');
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Room"
              name="room"
              variant="outlined"
              fullWidth
              size="small"
            />
          )}
          sx={{ maxWidth: '200px', width: '100%' }}
        />
      </Box>
      <CustomizableTable
        tableId="attendace-leave-management"
        searchFieldProps={{
          placeholder: 'Search Room No, Student Name...',
          label: 'Search Room No, Student Name...',
        }}
        noDataText="Attendance Data Not Found"
        columns={[
          { id: 'roomNumber', label: 'Room Number', filterType: 'number' },
          { id: 'studentName', label: 'Student Name' },
          { id: 'hostelName', label: 'Hostel Name' },
          { id: 'floor', label: 'Floor', filterType: 'number' },
          { id: 'timeStamp', label: 'Time Stamp', filterType: 'date' },
          {
            id: 'status',
            label: 'Status',
            filterType: 'enum',
            enumOptions: BiometricHostelAttendanceOptions,
            render(value, row) {
              const color = BiometricHostelAttendanceColor[
                value as BiometricHostelAttendanceType
              ] as LabelColor;

              return <Label color={color}>{BiometricHostelAttendanceType[value]}</Label>;
            },
          },
          {
            id: 'action',
            label: 'Action',
            sticky: true,
            isSort: false,
            isFilter: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={(prop) => actions({ ...prop, row })}
                  placement="right-top"
                />
              );
            },
          },
        ]}
        data={[
          {
            id: '1',
            roomNumber: 101,
            studentName: 'Aarav Mehta',
            hostelName: 'Hostel A',
            floor: 1,
            timeStamp: '2025-04-25T07:30:00Z',
            status: BiometricHostelAttendanceType.Present,
          },
          {
            id: '2',
            roomNumber: 102,
            studentName: 'Neha Shah',
            hostelName: 'Hostel B',
            floor: 2,
            timeStamp: '2025-04-25T07:45:00Z',
            status: BiometricHostelAttendanceType.Absent,
          },
          {
            id: '3',
            roomNumber: 103,
            studentName: 'Rohan Patel',
            hostelName: 'Hostel A',
            floor: 1,
            timeStamp: '2025-04-25T08:00:00Z',
            status: BiometricHostelAttendanceType.Missing,
          },
          {
            id: '4',
            roomNumber: 104,
            studentName: 'Isha Desai',
            hostelName: 'Hostel C',
            floor: 3,
            timeStamp: '2025-04-25T07:15:00Z',
            status: BiometricHostelAttendanceType.Present,
          },
        ]}
      />
    </Box>
  );
};

export default BiometricHostelAttendance;
