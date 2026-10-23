'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type {
  AttendanceDashboardClass,
  AttendanceDashboardDivision,
} from 'src/redux/student/attendance-dashboard-types';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import React, { useMemo, useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import sortQueryString from 'src/utils/sort-query-string';
import { studentPaths } from 'src/constants/student-menu';
import UserHoverProfile from 'src/components/student-popover';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  AttendanceStatusType,
  AttendanceStatusOptions,
  AttendanceStatusTypeColors,
} from 'src/enums/attendance-type';
import {
  Box,
  Grid,
  Paper,
  Avatar,
  Button,
  Skeleton,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  useGetStudentsByDivisionQuery,
  useGetStudentAttendanceHistoryQuery,
  useGetStudentAttendanceDashboardSummaryQuery,
} from 'src/redux/student';

import {
  buildAttendanceHistoryQuery,
  buildAttendanceSummaryQuery,
} from './attendance-dashboard-query';
import {
  attendanceCompletionLabel,
  attendancePercentageColor,
  attendancePercentageLabel,
} from './attendance-dashboard-metrics';

type SelectedDivision = AttendanceDashboardDivision & { class: AttendanceDashboardClass };

const StudentAttendanceDashboardScreen = () => {
  const year = useSelector((state: RootState) => state.globalState.currentYear);
  // State to track selected division for detailed view
  const [selectedDivision, setSelectedDivision] = useState<SelectedDivision | null>(null);
  // State to track selected month for attendance data
  const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(dayjs());
  const attendanceSummaryQuery = useMemo(
    () => ({ ...buildAttendanceSummaryQuery(selectedMonth), academicYearId: year?.id }),
    [selectedMonth, year?.id]
  );
  const {
    data: attendanceSummary,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetStudentAttendanceDashboardSummaryQuery(attendanceSummaryQuery);
  const attendanceClassSummary = attendanceSummary?.classes || [];
  const schoolAttendance = attendanceSummary?.schoolAttendancePercentage;
  return (
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
      {!selectedDivision ? (
        <>
          <CustomBreadcrumbs
            heading="Dashboard"
            links={[
              { name: 'Student', href: studentPaths.dashboard },
              { name: 'Attendance', href: studentPaths.attendance.markAttendance },
              { name: 'Dashboard' },
            ]}
            description="This dashboard shows daily attendance stats, overall attendance rates"
          />
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            gap={1}
            flexWrap="wrap"
          >
            <DatePicker
              views={['month']}
              label="Select Month"
              value={selectedMonth}
              maxDate={dayjs()} // This disables future months
              onChange={(newValue) => setSelectedMonth(newValue)}
              format="MMM"
              slotProps={{ textField: { size: 'small' } }}
            />
            <Label sx={{ cursor: 'pointer' }} color={attendancePercentageColor(schoolAttendance)}>
              School Attendance : {attendancePercentageLabel(schoolAttendance)}
            </Label>
          </Box>
          {isLoading && <Skeleton variant="rounded" height={120} sx={{ mt: 2 }} />}
          {isFetching && !isLoading && (
            <LinearProgress aria-label="Refreshing attendance summary" sx={{ mt: 1 }} />
          )}
          {isError && (
            <StudentFeedback
              notificationKey="STU-0622"
              presentation="toast"
              severity="error"
              sx={{ mt: 1 }}
              action={
                <Button size="small" onClick={() => refetch()}>
                  Retry
                </Button>
              }
            >
              Attendance summary could not be loaded.
            </StudentFeedback>
          )}
          {attendanceSummary && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {attendanceCompletionLabel(attendanceSummary)}
            </Typography>
          )}
          {attendanceSummary?.isProvisional && (
            <StudentFeedback
              notificationKey="STU-0623"
              presentation="persistent"
              severity="info"
              sx={{ mt: 1 }}
            >
              Attendance is provisional. Complete pending marking and confirm imported attendance
              start dates before relying on this percentage.
            </StudentFeedback>
          )}
          <Box display="flex" gap={1} flexWrap="wrap" mt={2}>
            {!isLoading && !isError && attendanceClassSummary.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No attendance summary found.
              </Typography>
            )}
            {attendanceClassSummary.map((classData) => (
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
            links={[
              { name: 'Student', href: studentPaths.dashboard },
              { name: 'Attendance', href: studentPaths.attendance.markAttendance },
              { name: 'Dashboard' },
            ]}
            action={
              <Button
                size="small"
                variant="soft"
                onClick={() => setSelectedDivision(null)}
                startIcon={<Iconify icon="mdi:arrow-left" />}
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

const ClassCard = ({
  classItem,
  setSelectedDivision,
}: {
  classItem: AttendanceDashboardClass;
  setSelectedDivision: (value: SelectedDivision) => void;
}) => (
  <Paper sx={{ p: 2 }} elevation={3}>
    <Box display="flex" justifyContent="space-between">
      <Typography variant="h6">Class {classItem.name}</Typography>
      <Label color={attendancePercentageColor(classItem.percentage)}>
        {attendancePercentageLabel(classItem.percentage)}
      </Label>
    </Box>
    <Box display="flex" gap={1} flexWrap="wrap" mt={2}>
      {classItem.divisions.map((item) => (
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

const RenderDivision = ({
  item,
  setSelectedDivision,
  classDetails,
}: {
  item: AttendanceDashboardDivision;
  classDetails: AttendanceDashboardClass;
  setSelectedDivision: (value: SelectedDivision) => void;
}) => (
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
    component="button"
    type="button"
    aria-label={`View class ${classDetails.name}, division ${item.name}`}
    onClick={() => setSelectedDivision({ ...item, class: classDetails })}
  >
    {item.name}
    <Label sx={{ cursor: 'pointer' }} color={attendancePercentageColor(item.percentage)}>
      {attendancePercentageLabel(item.percentage)}
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
    <Grid container spacing={1} sx={{ flex: 1, minHeight: 0 }}>
      <Grid size={{ xs: 12, md: 3 }} sx={{ minHeight: 0 }}>
        <Paper
          variant="outlined"
          sx={{ p: 1, height: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, gap: 1, flexWrap: 'wrap' }}
          >
            <Typography component="span">
              Class : <Label color="info">{selectedDivision?.class.name}</Label>
            </Typography>
            <Typography component="span">
              <Label color={attendancePercentageColor(selectedDivision?.percentage)}>
                {attendancePercentageLabel(selectedDivision?.percentage)}
              </Label>
            </Typography>
            <Typography component="span">
              Division : <Label color="info"> {selectedDivision?.name} </Label>
            </Typography>
          </Box>

          <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
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

      <Grid size={{ xs: 12, md: 9 }} sx={{ minHeight: 0 }}>
        <Paper
          variant="outlined"
          sx={{ p: 1, height: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1 }}
        >
          <Box display="flex" gap={1} flexWrap="wrap">
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

          <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <CustomizableTable
              tableId="attendance-table"
              wrapperProps={{ sx: { height: 1 } }}
              tableContainerProps={{ sx: { height: 1 } }}
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
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};
