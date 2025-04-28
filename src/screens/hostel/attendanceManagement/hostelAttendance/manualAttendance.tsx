'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { RestartAlt, CancelOutlined, CheckCircleOutlined } from '@mui/icons-material';
import { Box, Stack, Switch, Button, Checkbox, TextField, Autocomplete } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { varAlpha } from 'src/theme/styles';
import hostelManualAttendance from 'src/json/hostel/hostelAttendance/hostelManualAttendance.json';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import type { IStudentHostelManualAttendance } from './type';

const ManualHostelAttendance = () => {
  // State for storing the selected date
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  // State for storing the selected block
  const [block, setBlock] = useState<string>('');
  // State for storing the selected hostel
  const [hostel, setHostel] = useState<string>('');
  // State for storing the selected room
  const [room, setRoom] = useState<string>('');
  // Dialog state for sending instant notifications
  const sendInstantNotificationDialogValue = useBoolean();
  // State for storing the selected student data
  const [selectedStudent, setSelectedStudent] = useState<IStudentHostelManualAttendance[]>([]);
  // State for storing the students data
  const [studentsData, setStudentsData] =
    useState<IStudentHostelManualAttendance[]>(hostelManualAttendance);

  const totalStudents = studentsData?.length || 0;
  const totalPresent = studentsData?.filter((student) => student.isPresent).length || 0;
  const totalAbsent = totalStudents - totalPresent;
  // Handler function to open the send notification dialog
  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };

  const absentStudents = useMemo(
    () => studentsData.filter((item: any) => !item.isPresent),
    [studentsData]
  );

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
        sx={{ px: 1, mb: 2 }}
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

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            onClick={() => {}}
            size="small"
            color="success"
            startIcon={<CheckCircleOutlined />}
          >
            All Present
          </Button>
          <Button
            variant="contained"
            onClick={() => {}}
            size="small"
            color="error"
            startIcon={<CancelOutlined />}
          >
            All Absent
          </Button>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<RestartAlt />} onClick={() => {}}>
            Reset
          </Button>

          <Button
            size="small"
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            onClick={() => {}}
          >
            Save
          </Button>
        </Box>
      </Box>
      <CustomizableTable
        onSendNotification={handlerSendNotification}
        showCheckbox={selectedStudent?.length !== 0}
        tableId="student-attendance-list"
        noDataText="No Students Found"
        searchFieldProps={{
          placeholder: 'Search Room No, Student Name...',
          label: 'Search Room No, Student Name...',
        }}
        isSearch={false}
        rowProps={(tableData: any) => ({
          sx: {
            background: (theme) =>
              tableData.isPresent
                ? varAlpha(theme.palette.success.mainChannel, 0.08)
                : varAlpha(theme.palette.error.mainChannel, 0.08),
          },
        })}
        columns={[
          {
            id: 'checkBox',
            label: ' ',
            sticky: true,
            isSort: false,
            isFilter: false,
            renderColumn: (value) => (
              <Checkbox
                checked={studentsData?.length === selectedStudent?.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedStudent(studentsData);
                  } else {
                    setSelectedStudent([]);
                  }
                }}
              />
            ),
            render(value, row) {
              return (
                <Checkbox
                  checked={selectedStudent?.some((student: any) => student.id === row.id)}
                  onChange={(e) => {
                    if (!e.target.checked) {
                      setSelectedStudent(
                        selectedStudent?.filter((student: any) => student.id !== row.id)
                      );
                    } else {
                      setSelectedStudent([
                        ...(selectedStudent || []),
                        row as IStudentHostelManualAttendance,
                      ]);
                    }
                  }}
                />
              );
            },
          },
          {
            id: 'roomNo',
            label: 'Room No',
            align: 'left',
            minWidth: '100px',
          },
          {
            id: 'studentName',
            label: 'Student Name',
            align: 'left',
          },
          {
            id: 'hostelName',
            label: 'Hostel Name',
            align: 'left',
          },
          {
            id: 'isPresent',
            label: 'Attendance',
            align: 'center',
            isSort: false,
            isFilter: false,
            render(value, row) {
              return (
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Switch
                    size="small"
                    inputProps={{ 'aria-label': 'controlled' }}
                    checked={value}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: 'success.main',
                        '&:hover': {
                          backgroundColor: 'success.light',
                        },
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: 'success.main',
                      },
                      '& .MuiSwitch-switchBase:not(.Mui-checked)': {
                        color: 'error.main',
                        '&:hover': {
                          backgroundColor: 'error.light',
                        },
                      },
                      '& .MuiSwitch-switchBase:not(.Mui-checked) + .MuiSwitch-track': {
                        backgroundColor: 'error.main',
                      },
                    }}
                    onChange={(e) => {
                      setStudentsData(
                        studentsData?.map((item: any) =>
                          item.id === row.id ? { ...item, isPresent: e.target.checked } : item
                        )
                      );
                    }}
                  />
                </Stack>
              );
            },
          },
          {
            id: 'remarks',
            label: 'Remarks',
            isSort: false,
            isFilter: false,
            render(value, row) {
              return row.attendance === 'Present' ? (
                '-'
              ) : (
                <TextField
                  size="small"
                  value={value || ''}
                  onChange={(e) => {
                    console.log(e.target.value);
                    setStudentsData(
                      studentsData?.map((item: any) =>
                        item.id === row.id ? { ...item, remarks: e.target.value } : item
                      )
                    );
                  }}
                  multiline
                  rows={2}
                  sx={{ maxWidth: '200px', width: '100%' }}
                />
              );
            },
          },
        ]}
        data={studentsData as IStudentHostelManualAttendance[]}
      />
      <Stack direction="row" spacing={1} sx={{ mb: 2, mt: 2 }} justifyContent="flex-end">
        <Label color="default">{`Total Students: ${totalStudents}`}</Label>
        <Label color="success">{`Present: ${totalPresent}`}</Label>
        <Label color="error">{`Absent: ${totalAbsent}`}</Label>
      </Stack>
    </Box>
  );
};

export default ManualHostelAttendance;
