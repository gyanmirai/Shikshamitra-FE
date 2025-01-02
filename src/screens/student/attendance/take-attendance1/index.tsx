'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Search, RestartAlt, CancelOutlined, CheckCircleOutlined } from '@mui/icons-material';
import {
  Box,
  Chip,
  Grid,
  Paper,
  Stack,
  Avatar,
  Switch,
  Button,
  Divider,
  TextField,
  Typography,
  IconButton,
  ButtonGroup,
  InputAdornment,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const TakeAttendanceScreen = () => {
  const [view, setView] = React.useState('list');
  // State to control the dialog visibility
  const dialog = useBoolean();
  // State to store all available mediums

  // State to store all available organizations
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  // State to store the selected organization
  const [organization, setOrganization] = useState<string>('');
  // State to store all available classes
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store the selected class
  const [classes, setClass] = useState<string>('');
  // State to store all available divisions
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store the selected division
  const [division, setDivision] = useState<string>('');
  // State to store the selected date
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  // check if the attendance is saved
  const isSaved = useBoolean();

  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

  useEffect(() => {
    setAllOrganization(medium?.educationMediumStages || []);
    setOrganization(medium?.educationMediumStages?.[0]?.id || '');
  }, [medium]);

  useEffect(() => {
    setAllClass(allOrganization.find((org: any) => org?.id === organization)?.standards || []);
    setClass(
      allOrganization.find((org: any) => org?.id === organization)?.standards?.[0]?.id || ''
    );
  }, [organization, allOrganization]);

  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes]);

  // Dummy student data
  const dummyStudents = [
    { id: 1, name: 'John Doe', rollNo: '001', grNo: 'GR001', class: '10', division: 'A' },
    { id: 2, name: 'Jane Smith', rollNo: '002', grNo: 'GR002', class: '10', division: 'A' },
    { id: 3, name: 'Alice Johnson', rollNo: '003', grNo: 'GR003', class: '10', division: 'B' },
    { id: 4, name: 'Bob Williams', rollNo: '004', grNo: 'GR004', class: '10', division: 'B' },
    { id: 5, name: 'Charlie Brown', rollNo: '005', grNo: 'GR005', class: '10', division: 'C' },
  ];

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Take Attendance"
        links={[{ name: 'Student' }, { name: 'Attendance' }, { name: 'Take Attendance' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box display="flex" gap={2} flexWrap="wrap">
        <DatePicker
          label="Date"
          value={date}
          onChange={(val) => {
            setDate(val);
          }}
          slotProps={{ textField: { size: 'small', sx: { maxWidth: '250px', width: '100%' } } }}
        />

        <CustomSelect
          options={allOrganization}
          label="Organization"
          value={organization}
          onChange={(val) => setOrganization(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!medium}
        />
        <CustomSelect
          options={allClass}
          label="Class"
          value={classes}
          onChange={(val) => setClass(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!organization}
        />
        <CustomSelect
          options={allDivision}
          label="Division"
          value={division}
          onChange={(val) => setDivision(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!classes}
        />
      </Box>

      <Divider sx={{ my: 2 }} />
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <ButtonGroup>
          <Button
            variant={view === 'list' ? 'outlined' : 'contained'}
            color="inherit"
            onClick={() => setView('calender')}
          >
            <Iconify icon="material-symbols:grid-view" />
          </Button>
          <Button
            color="inherit"
            variant={view === 'list' ? 'contained' : 'outlined'}
            onClick={() => setView('list')}
          >
            <Iconify icon="lucide:layout-list" />
          </Button>
        </ButtonGroup>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button size="small" variant="outlined" startIcon={<RestartAlt />} onClick={() => {}}>
            Reset
          </Button>

          <Button size="small" variant="contained" startIcon={<Stack />} onClick={() => {}}>
            Save
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          placeholder="Search by name, roll no, gr no"
          size="small"
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          border: (theme) => `1px dashed gray`,
          p: 1,
          borderRadius: 1,
          my: 1,
        }}
      >
        <Typography variant="body1" fontWeight={500} color="error">
          Total Absent : 3
        </Typography>
        {/* <Chip size="small" label="Present" color="success" icon={<CheckCircleOutlined />} /> */}
        <Chip size="small" label="1 - John" color="error" icon={<CancelOutlined />} />
        <Chip size="small" label="2 - Jasmin" color="error" icon={<CancelOutlined />} />
        <Chip size="small" label="3 - Herbert" color="error" icon={<CancelOutlined />} />
      </Box>

      {view === 'list' ? (
        <ListView isSaved={isSaved} />
      ) : (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {dummyStudents.map((student) => (
            <AttendanceCard key={student.id} student={student} />
          ))}
        </Grid>
      )}
    </Box>
  );
};
export default TakeAttendanceScreen;

const AttendanceCard = ({ student }: any) => {
  const a = null;
  return (
    <Grid item xs={12} sm={6} md={3}>
      <Paper
        elevation={3}
        sx={{
          width: '100%',

          borderLeft: (theme) =>
            `4px solid ${student.rollNo === '001' ? theme.palette.error.main : theme.palette.success.main}`,
          cursor: 'pointer',
        }}
      >
        <Box display="flex" gap={1} p={1.5} alignItems="center">
          <Box
            sx={{
              width: '100px',
              height: '100px',
              borderRadius: 2,
              '& img': { width: '100%', height: '100%', objectFit: 'cover' },
            }}
          >
            <img
              src="https://images.rawpixel.com/image_png_200/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDI0LTAzL2ZyZWVpbWFnZXNjb21wYW55X3Bob3RvX29mX3lvdW5nX2luZGlhbl9naXJsX2hvbGRpbmdfc3R1ZGVudF9iYV8zN2QyNjU4Yi0yOWIwLTQyZmQtODhmYy04OGU3ZTcxYmVlNDcucG5n.png 200w, https://images.rawpixel.com/image_png_400/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDI0LTAzL2ZyZWVpbWFnZXNjb21wYW55X3Bob3RvX29mX3lvdW5nX2luZGlhbl9naXJsX2hvbGRpbmdfc3R1ZGVudF9iYV8zN2QyNjU4Yi0yOWIwLTQyZmQtODhmYy04OGU3ZTcxYmVlNDcucG5n.png 400w, https://images.rawpixel.com/image_png_600/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDI0LTAzL2ZyZWVpbWFnZXNjb21wYW55X3Bob3RvX29mX3lvdW5nX2luZGlhbl9naXJsX2hvbGRpbmdfc3R1ZGVudF9iYV8zN2QyNjU4Yi0yOWIwLTQyZmQtODhmYy04OGU3ZTcxYmVlNDcucG5n.png 600w, https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDI0LTAzL2ZyZWVpbWFnZXNjb21wYW55X3Bob3RvX29mX3lvdW5nX2luZGlhbl9naXJsX2hvbGRpbmdfc3R1ZGVudF9iYV8zN2QyNjU4Yi0yOWIwLTQyZmQtODhmYy04OGU3ZTcxYmVlNDcucG5n.png 1600w, https://images.rawpixel.com/image_png_1100/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDI0LTAzL2ZyZWVpbWFnZXNjb21wYW55X3Bob3RvX29mX3lvdW5nX2luZGlhbl9naXJsX2hvbGRpbmdfc3R1ZGVudF9iYV8zN2QyNjU4Yi0yOWIwLTQyZmQtODhmYy04OGU3ZTcxYmVlNDcucG5n.png 2400w, https://images.rawpixel.com/image_png_1300/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDI0LTAzL2ZyZWVpbWFnZXNjb21wYW55X3Bob3RvX29mX3lvdW5nX2luZGlhbl9naXJsX2hvbGRpbmdfc3R1ZGVudF9iYV8zN2QyNjU4Yi0yOWIwLTQyZmQtODhmYy04OGU3ZTcxYmVlNDcucG5n.png 3000w"
              alt="Student"
            />
          </Box>
          <Box flexGrow={1}>
            <Typography variant="h6">{student.name}</Typography>
            <Typography variant="body2">
              <Label color="info">{student.rollNo}</Label>
            </Typography>
            <Typography variant="body2">Class: {student.class}</Typography>
            <Typography variant="body2">Division: {student.division}</Typography>
          </Box>
          {/* <Box> */}
          <IconButton color="success" aria-label="mark present">
            <CheckCircleOutlined />
          </IconButton>
          <IconButton color="error" aria-label="mark absent">
            <CancelOutlined />
          </IconButton>
          {/* </Box> */}
        </Box>
        <Box p={2} sx={{ transition: 'all 0.3s ease-in-out' }}>
          <TextField size="small" label="Remarks" fullWidth multiline rows={2} />
        </Box>
      </Paper>
    </Grid>
  );
};

const ListView = ({ isSaved }: any) => {
  const dummyData = [
    {
      rollNo: '1',
      name: 'John Doe',
      grNo: 'GR001',
      attendance: 'Present',
      attendancePercentage: '80%',
      totalPresentDays: '20/25',
    },
    {
      rollNo: '2',
      name: 'Jane Smith',
      grNo: 'GR002',
      attendance: 'Absent',
      attendancePercentage: '70%',
      totalPresentDays: '18/25',
    },
    {
      rollNo: '3',
      name: 'Alice Johnson',
      grNo: 'GR003',
      attendance: 'Present',
      attendancePercentage: '90%',
      totalPresentDays: '22/25',
    },
    {
      rollNo: '4',
      name: 'Bob Williams',
      grNo: 'GR004',
      attendance: 'Present',
      attendancePercentage: '85%',
      totalPresentDays: '21/25',
    },
    {
      rollNo: '5',
      name: 'Charlie Brown',
      grNo: 'GR005',
      attendance: 'Absent',
      attendancePercentage: '75%',
      totalPresentDays: '19/25',
    },
  ];
  return (
    <CustomizableTable
      isSearch={false}
      columns={[
        { id: 'rollNo', label: 'Roll No' },
        { id: 'grNo', label: 'Gr No' },
        {
          id: 'name',
          label: 'Name',
          render(value, row) {
            return (
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar sx={{ width: 30, height: 30 }} alt={value} title={value} />
                {value}
              </Box>
            );
          },
        },
        { id: 'totalPresentDays', label: 'Total Present Days' },
        { id: 'attendancePercentage', label: 'Attendance Percentage' },
        {
          id: 'attendance',
          label: 'Attendance',
          isSort: false,
          render(value, row) {
            return isSaved.value ? (
              <Label color={value === 'Present' ? 'success' : 'error'}>{value}</Label>
            ) : (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                {/* <Typography component="small" fontSize="12px">
                  Absent
                </Typography> */}
                <Switch
                  size="small"
                  inputProps={{ 'aria-label': 'controlled' }}
                  checked={value === 'Present'}
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
                />
                {/* <Typography component="small" fontSize="12px">
                  Present
                </Typography> */}
              </Stack>
            );
          },
        },
        // {
        //   id: 'absentReason',
        //   label: 'Absent Reason',
        //   render(value, row) {
        //     return row.attendance === 'Present' ? (
        //       '-'
        //     ) : (
        //       <CustomSelect
        //         options={[
        //           { name: 'Sick', id: 'Sick' },
        //           { name: 'Family Emergency', id: 'Family Emergency' },
        //           { name: 'Transportation Issues', id: 'Transportation Issues' },
        //           { name: 'Medical Appointment', id: 'Medical Appointment' },
        //           { name: 'Religious Observance', id: 'Religious Observance' },
        //           { name: 'Other', id: 'Other' },
        //         ]}
        //         value={value || 'Sick'}
        //         onChange={(val) => {
        //           console.log(val);
        //         }}
        //         label=""
        //         labelKey="name"
        //         valueKey="id"
        //         formControlProps={{ sx: { maxWidth: '200px', width: '100%' } }}
        //       />
        //     );
        //   },
        // },
        {
          id: 'remarks',
          label: 'Remarks',
          render(value, row) {
            return row.attendance === 'Present' ? (
              '-'
            ) : (
              <TextField
                size="small"
                value={value || ''}
                onChange={(e) => {
                  console.log(e.target.value);
                }}
                multiline
                rows={2}
                sx={{ maxWidth: '200px', width: '100%' }}
              />
            );
          },
        },
      ]}
      data={dummyData}
    />
  );
};
