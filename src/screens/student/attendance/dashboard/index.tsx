'use client';

import type { Dayjs } from 'dayjs';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import React, { useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Paper, Avatar, Button, useTheme, Typography } from '@mui/material';

import {
  AttendanceStatusType,
  AttendanceStatusOptions,
  AttendanceStatusTypeColors,
} from 'src/enums/attendance-type';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import UserHoverProfile from 'src/components/student-popover';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const classDummyData = [
  {
    name: '1',
    percentage: 35,
    divisions: [
      {
        name: 'A',
        percentage: 90,
      },
      {
        name: 'B',
        percentage: 60,
      },
      {
        name: 'C',
        percentage: 30,
      },
      {
        name: 'D',
        percentage: 40,
      },
    ],
  },
  {
    name: '2',
    percentage: 45,
    divisions: [
      {
        name: 'A',
        percentage: 10,
      },
      {
        name: 'B',
        percentage: 60,
      },
      {
        name: 'C',
        percentage: 20,
      },
      {
        name: 'D',
        percentage: 40,
      },
    ],
  },

  {
    name: '3',
    percentage: 78,
    divisions: [
      {
        name: 'A',
        percentage: 85,
      },
      {
        name: 'B',
        percentage: 70,
      },
      {
        name: 'C',
        percentage: 75,
      },
      {
        name: 'D',
        percentage: 82,
      },
    ],
  },
  {
    name: '4',
    percentage: 82,
    divisions: [
      {
        name: 'A',
        percentage: 88,
      },
      {
        name: 'B',
        percentage: 79,
      },
      {
        name: 'C',
        percentage: 81,
      },
      {
        name: 'D',
        percentage: 80,
      },
    ],
  },
  {
    name: '5',
    percentage: 76,
    divisions: [
      {
        name: 'A',
        percentage: 80,
      },
      {
        name: 'B',
        percentage: 75,
      },
      {
        name: 'C',
        percentage: 72,
      },
      {
        name: 'D',
        percentage: 77,
      },
    ],
  },
  {
    name: '6',
    percentage: 79,
    divisions: [
      {
        name: 'A',
        percentage: 82,
      },
      {
        name: 'B',
        percentage: 78,
      },
      {
        name: 'C',
        percentage: 76,
      },
      {
        name: 'D',
        percentage: 80,
      },
    ],
  },
  {
    name: '7',
    percentage: 81,
    divisions: [
      {
        name: 'A',
        percentage: 84,
      },
      {
        name: 'B',
        percentage: 80,
      },
      {
        name: 'C',
        percentage: 79,
      },
      {
        name: 'D',
        percentage: 81,
      },
    ],
  },
  {
    name: '8',
    percentage: 77,
    divisions: [
      {
        name: 'A',
        percentage: 80,
      },
      {
        name: 'B',
        percentage: 75,
      },
      {
        name: 'C',
        percentage: 76,
      },
      {
        name: 'D',
        percentage: 77,
      },
    ],
  },
  {
    name: '9',
    percentage: 83,
    divisions: [
      {
        name: 'A',
        percentage: 86,
      },
      {
        name: 'B',
        percentage: 82,
      },
      {
        name: 'C',
        percentage: 81,
      },
      {
        name: 'D',
        percentage: 83,
      },
    ],
  },
  {
    name: '10',
    percentage: 80,
    divisions: [
      {
        name: 'A',
        percentage: 83,
      },
      {
        name: 'B',
        percentage: 79,
      },
      {
        name: 'C',
        percentage: 78,
      },
      {
        name: 'D',
        percentage: 80,
      },
    ],
  },
  {
    name: '11',
    percentage: 75,
    divisions: [
      {
        name: 'A',
        percentage: 78,
      },
      {
        name: 'B',
        percentage: 74,
      },
      {
        name: 'C',
        percentage: 73,
      },
      {
        name: 'D',
        percentage: 75,
      },
    ],
  },
  {
    name: '12',
    percentage: 78,
    divisions: [
      {
        name: 'A',
        percentage: 81,
      },
      {
        name: 'B',
        percentage: 77,
      },
      {
        name: 'C',
        percentage: 76,
      },
      {
        name: 'D',
        percentage: 78,
      },
    ],
  },
];
const StudentAttendanceDashboardScreen = () => {
  const [schoolAttendance, setschoolAttendance] = useState(40);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(dayjs());
  return (
    <Box height="100%">
      {!selectedDivision ? (
        <>
          <CustomBreadcrumbs
            heading="Dashboard"
            links={[{ name: 'Student' }, { name: 'Attendance' }, { name: 'Dashboard' }]}
            sx={{ px: 1, mb: 2 }}
          />
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <DatePicker
              views={['month']}
              label="Select Month"
              value={selectedMonth}
              maxDate={dayjs()} // This disables future months
              onChange={(newValue) => setSelectedMonth(newValue)}
              format="MMM"
              slotProps={{
                textField: {
                  size: 'small',
                },
              }}
            />
            <Label
              sx={{ cursor: 'pointer' }}
              color={
                schoolAttendance > 75 ? 'success' : schoolAttendance > 40 ? 'warning' : 'error'
              }
            >
              School Attendance : {schoolAttendance}%
            </Label>
          </Box>{' '}
          <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
            {classDummyData.map((classData) => (
              <ClassCard classItem={classData} setSelectedDivision={setSelectedDivision} />
            ))}
          </Box>
        </>
      ) : (
        <>
          <CustomBreadcrumbs
            heading="Dashboard"
            links={[{ name: 'Student' }, { name: 'Attendance' }, { name: 'Dashboard' }]}
            sx={{ px: 1, mb: 2 }}
            action={
              <Button
                size="small"
                variant="soft"
                onClick={() => setSelectedDivision(null)}
                startIcon={<Iconify icon="mingcute:back-2-fill" />}
              >
                Back To Dashboard
              </Button>
            }
          />
          <DivisionOverview
            selectedDivision={selectedDivision}
            setSelectedDivision={setSelectedDivision}
          />
        </>
      )}
    </Box>
  );
};

export default StudentAttendanceDashboardScreen;

const ClassCard = ({ classItem, setSelectedDivision }: any) => {
  const a = null;
  return (
    <Paper sx={{ p: 2 }} elevation={3}>
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h6">Class {classItem.name}</Typography>
        <Label
          color={
            classItem.percentage > 75 ? 'success' : classItem.percentage > 40 ? 'warning' : 'error'
          }
        >
          {classItem.percentage}%
        </Label>
      </Box>
      <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
        {classItem.divisions.map((item: any) => (
          <RenderDivision
            classDetails={classItem}
            item={item}
            setSelectedDivision={setSelectedDivision}
          />
        ))}
      </Box>
    </Paper>
  );
};

const RenderDivision = ({ item, setSelectedDivision, classDetails }: any) => {
  const a = null;
  return (
    <Paper
      sx={{
        borderRadius: 1,
        p: 1,
        gap: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          scale: '1.17',
        },
      }}
      elevation={5}
      onClick={() => setSelectedDivision({ ...item, class: classDetails })}
    >
      {item.name}
      <Label
        sx={{ cursor: 'pointer' }}
        color={item.percentage > 75 ? 'success' : item.percentage > 40 ? 'warning' : 'error'}
      >
        {item.percentage}%
      </Label>
    </Paper>
  );
};

const DivisionOverview = ({ selectedDivision, setSelectedDivision }: any) => {
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [startDate, setStartDate] = useState<null | Dayjs>(dayjs().startOf('month'));
  const [endDate, setEndDate] = useState<null | Dayjs>(dayjs().endOf('month'));

  const theme = useTheme();
  return (
    <Grid container spacing={1} height="calc(100vh - 225px)">
      <Grid item xs={3} height="100%">
        <Paper elevation={3} sx={{ p: 1, height: '100%' }}>
          <Box
            display="flex"
            justifyContent="space-between"
            sx={{ borderBottom: `1px dashed gray`, pb: 2 }}
          >
            <Typography component="span">
              Class : <Label color="info">{selectedDivision?.class.name}</Label>
            </Typography>
            <Typography component="span">
              <Label
                color={
                  selectedDivision?.percentage > '75'
                    ? 'success'
                    : selectedDivision?.percentage > '40'
                      ? 'warning'
                      : 'error'
                }
              >
                {selectedDivision?.percentage}
              </Label>
            </Typography>
            <Typography component="span">
              Division : <Label color="info"> {selectedDivision?.name} </Label>
            </Typography>
          </Box>
          <Scrollbar sx={{ height: 'calc(100% -  60px)' }}>
            <Box mt={1} p={0.5} display="flex" flexDirection="column" gap={1}>
              {[1, 2, 3].map((student, index) => (
                <Paper
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    background:
                      selectedStudent === student ? theme.palette.action.hover : 'initial',
                    '&:hover': {
                      scale: '1.03',
                      background: theme.palette.action.hover,
                    },
                  }}
                  elevation={6}
                  onClick={() => setSelectedStudent(student)}
                >
                  <UserHoverProfile user={{ name: 'John Doe' }} avatarComp={<Avatar> JD</Avatar>} />
                  <Typography variant="h6">John Doe</Typography>
                  <Label color="success">85%</Label>
                </Paper>
              ))}
            </Box>
          </Scrollbar>
        </Paper>
      </Grid>
      <Grid item xs={9} height="100%">
        <Paper elevation={3} sx={{ p: 1, height: '100%' }}>
          <Box display="flex" gap={2}>
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
          </Box>
          <Scrollbar sx={{ height: 'calc(100% -  60px)', p: 1 }}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <CustomizableTable
                  tableId="attendance-table"
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
                    { id: 'date', label: 'Date', minWidth: '10%', filterType: 'date' },
                    {
                      id: 'status',
                      label: 'Status',
                      minWidth: '10%',
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
                    { id: 'reason', label: 'Reason', minWidth: '10%' },
                    { id: 'remarks', label: 'Remarks', minWidth: '20%' },
                  ]}
                />
              </Grid>
            </Grid>
          </Scrollbar>
        </Paper>
      </Grid>
    </Grid>
  );
};
