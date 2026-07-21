'use client';

import type { Dayjs } from 'dayjs';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import React, { useMemo, useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import sortQueryString from 'src/utils/sort-query-string';
import UserHoverProfile from 'src/components/student-popover';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Grid, Paper, Avatar, Button, Typography } from '@mui/material';
import {
  AttendanceStatusType,
  AttendanceStatusOptions,
  AttendanceStatusTypeColors,
} from 'src/enums/attendance-type';
import {
  useGetStudentsByDivisionQuery,
  useGetStudentAttendanceHistoryQuery,
  useGetStudentAttendanceDashboardSummaryQuery,
} from 'src/redux/student';

import {
  buildAttendanceHistoryQuery,
  buildAttendanceSummaryQuery,
} from './attendance-dashboard-query';

const StudentAttendanceDashboardScreen = () => {
  // State to track selected division for detailed view
  const [selectedDivision, setSelectedDivision] = useState(null);
  // State to track selected month for attendance data
  const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(dayjs());
  const attendanceSummaryQuery = useMemo(
    () => buildAttendanceSummaryQuery(selectedMonth),
    [selectedMonth]
  );
  const { data: attendanceSummary } =
    useGetStudentAttendanceDashboardSummaryQuery(attendanceSummaryQuery);
  const attendanceClassSummary = attendanceSummary?.classes || [];
  const schoolAttendance = attendanceSummary?.schoolAttendancePercentage || 0;
  return (
    <Box height="100%">
      {!selectedDivision ? (
        <>
          <CustomBreadcrumbs
            heading="Dashboard"
            links={[
              { name: 'Student', href: '/student/dashboard' },
              { name: 'Attendance', href: '/student/attendance/dashboard/' },
              { name: 'Dashboard' },
            ]}
            description="This dashboard shows daily attendance stats, overall attendance rates"
          />
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <DatePicker
              views={['month']}
              label="Select Month"
              value={selectedMonth}
              maxDate={dayjs()} // This disables future months
              onChange={(newValue) => setSelectedMonth(newValue)}
              format="MMM"
              slotProps={{ textField: { size: 'small' } }}
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
          <Box display="flex" gap={1} flexWrap="wrap" mt={2}>
            {attendanceClassSummary.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No attendance summary found.
              </Typography>
            )}
            {attendanceClassSummary.map((classData: any) => (
              <ClassCard
                key={classData.standardId || classData.name}
                classItem={classData}
                setSelectedDivision={setSelectedDivision}
              />
            ))}
          </Box>
        </>
      ) : (
        <>
          <CustomBreadcrumbs
            description="This dashboard shows daily attendance stats, overall attendance rates."
            heading="Dashboard"
            links={[{ name: 'Student' }, { name: 'Attendance' }, { name: 'Dashboard' }]}
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
            selectedMonth={selectedMonth}
          />
        </>
      )}
    </Box>
  );
};

export default StudentAttendanceDashboardScreen;

const ClassCard = ({ classItem, setSelectedDivision }: any) => (
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
    <Box display="flex" gap={1} flexWrap="wrap" mt={2}>
      {classItem.divisions.map((item: any) => (
        <RenderDivision
          key={item.divisionId || item.name}
          classDetails={classItem}
          item={item}
          setSelectedDivision={setSelectedDivision}
        />
      ))}
    </Box>
  </Paper>
);

const RenderDivision = ({ item, setSelectedDivision, classDetails }: any) => (
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
      '&:hover': { scale: '1.17' },
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

const DivisionOverview = ({ selectedDivision, selectedMonth }: any) => {
  // State to track the selected student
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  // State to track the start date of attendance period, defaults to start of current month
  const [startDate, setStartDate] = useState<null | Dayjs>(
    (selectedMonth ?? dayjs()).startOf('month')
  );
  // State to track the end date of attendance period, defaults to end of current month
  const [endDate, setEndDate] = useState<null | Dayjs>((selectedMonth ?? dayjs()).endOf('month'));
  const [historyQuery, setHistoryQuery] = useState({
    sorting: 'date desc',
    skipCount: 0,
    maxResultCount: 10,
  });
  const { data: students, isLoading: studentsLoading } = useGetStudentsByDivisionQuery(
    { divisionId: selectedDivision?.divisionId, skipCount: 0, maxResultCount: 25 },
    { skip: !selectedDivision?.divisionId }
  );
  const studentRows =
    students?.items?.map((student: any) => ({
      ...student,
      name:
        student.studentName ||
        [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' '),
    })) || [];
  const attendanceHistoryArgs = useMemo(
    () =>
      selectedStudent?.studentId
        ? buildAttendanceHistoryQuery({
            studentId: selectedStudent.studentId,
            startDate,
            endDate,
            skipCount: historyQuery.skipCount,
            maxResultCount: historyQuery.maxResultCount,
            sorting: historyQuery.sorting,
          })
        : undefined,
    [
      selectedStudent?.studentId,
      startDate,
      endDate,
      historyQuery.skipCount,
      historyQuery.maxResultCount,
      historyQuery.sorting,
    ]
  );
  const {
    data: attendanceHistory,
    isLoading: attendanceHistoryLoading,
    isFetching: attendanceHistoryFetching,
  } = useGetStudentAttendanceHistoryQuery(attendanceHistoryArgs as any, {
    skip:
      !attendanceHistoryArgs?.studentId ||
      !attendanceHistoryArgs.startDate ||
      !attendanceHistoryArgs.endDate,
  });
  const attendanceHistoryRows =
    attendanceHistory?.items?.map((item: any) => ({
      ...item,
      date: dayjs(item.date).format('DD-MM-YYYY'),
      remarks: item.remarks || '-',
    })) || [];

  // Get the current theme instance
  const theme = useTheme();
  return (
    <Grid container spacing={1} height="calc(100vh - 225px)">
      <Grid size={{ xs: 3 }} height="100%">
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
                  selectedDivision?.percentage > 75
                    ? 'success'
                    : selectedDivision?.percentage > 40
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
              {studentsLoading && (
                <Typography variant="body2" color="text.secondary">
                  Loading students...
                </Typography>
              )}
              {!studentsLoading && studentRows.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No students found.
                </Typography>
              )}
              {studentRows.map((student: any, index: number) => (
                <Paper
                  key={student.studentId || index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    background:
                      selectedStudent === student ? theme.vars.palette.action.hover : 'initial',
                    '&:hover': { scale: '1.03', background: theme.vars.palette.action.hover },
                  }}
                  elevation={6}
                  onClick={() => setSelectedStudent(student)}
                >
                  <UserHoverProfile
                    user={{ name: student.name }}
                    avatarComp={<Avatar>{student.name?.[0] || 'S'}</Avatar>}
                  />
                  <Typography variant="h6">{student.name}</Typography>
                  <Label color="default">-</Label>
                </Paper>
              ))}
            </Box>
          </Scrollbar>
        </Paper>
      </Grid>

      <Grid size={{ xs: 9 }} height="100%">
        <Paper elevation={3} sx={{ p: 1, height: '100%' }}>
          <Box display="flex" gap={1}>
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
              <Grid size={{ xs: 12 }}>
                <CustomizableTable
                  tableId="attendance-table"
                  data={attendanceHistoryRows}
                  noDataText={
                    selectedStudent
                      ? 'No attendance history found.'
                      : 'Select a student to view attendance history.'
                  }
                  serverSide
                  serverSidePagination
                  serverSideSort
                  totalCount={attendanceHistory?.totalCount || 0}
                  isLoading={attendanceHistoryLoading || attendanceHistoryFetching}
                  onServerSort={(column, sortData) => {
                    setHistoryQuery((prev) => ({
                      ...prev,
                      sorting: sortQueryString(sortData) || 'date desc',
                      skipCount: 0,
                    }));
                  }}
                  onServerPagination={(page: number, rowsPerPage: number) => {
                    setHistoryQuery((prev) => ({
                      ...prev,
                      skipCount: (page - 1) * rowsPerPage,
                      maxResultCount: rowsPerPage,
                    }));
                  }}
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
