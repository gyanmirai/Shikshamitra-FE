'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import React, { useMemo, useState, useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { RestartAlt, CancelOutlined, CheckCircleOutlined } from '@mui/icons-material';
import {
  Box,
  Chip,
  Grid,
  Paper,
  Stack,
  Avatar,
  Button,
  Divider,
  Tooltip,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';
import { convertBase64Format } from 'src/utils/base64Formate';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';

import { varAlpha } from 'src/theme/styles';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetAttendanceByFilterQuery,
  useFillStudentAttendanceMutation,
} from 'src/redux/student/take-attendance/take-attendace-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

const TakeAttendanceScreen = () => {
  const [fillStudentAttendance] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useFillStudentAttendanceMutation,
  });

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

  const handleSave = async () => {
    try {
      const response = await fillStudentAttendance({
        attendanceDate: dateConvertor(dayjs(date).format(dateFormat), true), // Passing date as a query parameter
        data: studentData.map((student: any) => ({
          studentId: student?.student?.id,
          isPresent: student.isPresent,
          remarks: student.remarks,
        })),
      }).unwrap();
      toast.success('Attendance saved successfully');
    } catch (error) {
      console.error('Error saving attendance:', error);
    }
  };

  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAttendanceByFilterQuery,
    params: {
      attendanceDate: dateConvertor(dayjs(date).format(dateFormat), true),
      educationMediumStageId: organization,
      standardId: classes,
      divisionId: division,
    },
    options: {
      skip: !(date && organization && classes && division),
    },
  });

  const [studentData, setStudentData] = useState<any>([]);

  useEffect(() => {
    if (data?.items) {
      setStudentData(
        data?.items?.map((item: any) => ({
          ...item,
          name: `${item?.student?.firstName} ${item?.student?.lastName} ${item?.student?.middleName}`,
          percentage: (item.presentDays / item.totalDays) * 100,
          // Ensure isPresent reflects the actual attendance data from API
          // If attendance is already marked for this date, use that value
          // Otherwise, set to null (unmarked)
          isPresent: item.isPresent !== undefined ? item.isPresent : null,
          remarks: item.remarks || '',
        })) || []
      );
    } else {
      // Clear student data when no data is available
      setStudentData([]);
    }
  }, [data?.items]);

  // Reset student data when filters change to ensure fresh data
  useEffect(() => {
    setStudentData([]);
  }, [date, organization, classes, division]);

  const absentStudents = useMemo(
    () => studentData.filter((item: any) => item.isPresent === false),
    [studentData]
  );

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Mark Attendance"
        links={[
          { name: 'Student', href: '/student/enrollment/dashboard/' },
          { name: 'Attendance', href: '/student/attendance/dashboard/' },
          { name: 'Mark Attendance' },
        ]}
        sx={{ px: 1, mb: 1 }}
        description="Quickly record student attendance: Choose the date, then simply mark each student as Present or Absent."
      />
      <Box display="flex" gap={2} flexWrap="wrap" sx={{ mb: 1, pt: 1 }}>
        <DatePicker
          label="Date"
          value={date}
          onChange={(val) => {
            setDate(val);
          }}
          format="DD-MM-YYYY"
          maxDate={dayjs()}
          slotProps={{
            textField: {
              size: 'small',
              sx: { maxWidth: '250px', width: '100%' },
            },
          }}
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

      <Divider sx={{ my: 1 }} />
      <Box
        sx={{
          mb: 0.5,
          pb: 1,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Button
          variant="outlined"
          onClick={() => {
            setStudentData((pre: any) => pre.map((item: any) => ({ ...item, isPresent: true })));
          }}
          size="small"
          startIcon={<CheckCircleOutlined sx={{ fontSize: '16px' }} />}
          disabled={
            studentData.length === 0 || studentData.every((item: any) => item.isPresent === true)
          }
          sx={{
            color: 'success.main',
            borderColor: 'success.main',
            '&:hover': {
              borderColor: 'success.dark',
              backgroundColor: 'success.lighter',
            },
            '&:disabled': {
              color: 'text.disabled',
              borderColor: 'text.disabled',
            },
            minWidth: '100px',
            fontWeight: 500,
            fontSize: '0.8rem',
            py: 0.5,
          }}
        >
          All Present
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            setStudentData((pre: any) => pre.map((item: any) => ({ ...item, isPresent: false })));
          }}
          size="small"
          startIcon={<CancelOutlined sx={{ fontSize: '16px' }} />}
          disabled={
            studentData.length === 0 || studentData.every((item: any) => item.isPresent === false)
          }
          sx={{
            color: 'error.main',
            borderColor: 'error.main',
            '&:hover': {
              borderColor: 'error.dark',
              backgroundColor: 'error.lighter',
            },
            '&:disabled': {
              color: 'text.disabled',
              borderColor: 'text.disabled',
            },
            minWidth: '90px',
            fontWeight: 500,
            fontSize: '0.8rem',
            py: 0.5,
          }}
        >
          All Absent
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<RestartAlt sx={{ fontSize: '16px' }} />}
          onClick={() => {
            setStudentData(
              data?.items?.map((item: any) => ({
                ...item,
                name: `${item?.student?.firstName} ${item?.student?.lastName} ${item?.student?.middleName}`,
                percentage: (item.presentDays / item.totalDays) * 100,
                isPresent: null,
                remarks: '',
              })) || []
            );
          }}
          disabled={
            studentData.length === 0 || studentData.every((item: any) => item.isPresent === null)
          }
          sx={{
            color: 'warning.main',
            borderColor: 'warning.main',
            '&:hover': {
              borderColor: 'warning.dark',
              backgroundColor: 'warning.lighter',
            },
            '&:disabled': {
              color: 'text.disabled',
              borderColor: 'text.disabled',
            },
            minWidth: '70px',
            fontWeight: 500,
            fontSize: '0.8rem',
            py: 0.5,
          }}
        >
          Reset
        </Button>

        <Button
          size="small"
          variant="contained"
          startIcon={<Iconify icon={GlobalIcons.submit} sx={{ fontSize: '16px' }} />}
          onClick={() => {
            handleSave();
          }}
          disabled={
            studentData.length === 0 || studentData.every((item: any) => item.isPresent === null)
          }
          sx={{
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark',
              boxShadow: 2,
            },
            '&:disabled': {
              backgroundColor: 'text.disabled',
              color: 'text.secondary',
            },
            minWidth: '70px',
            fontWeight: 600,
            fontSize: '0.8rem',
            py: 0.5,
            boxShadow: 1,
          }}
        >
          Save
        </Button>
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          border: (theme) => `1px dashed gray`,
          p: 0.5,
          borderRadius: 1,
          mb: 1,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '45px', // Further reduced minimum height
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            py: 0.25,
          }}
        >
          <Label
            color="success"
            variant="soft"
            sx={{
              minWidth: '90px',
              textAlign: 'center',
              py: 1,
              px: 2,
              borderRadius: 2,
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Present: {studentData.filter((item: any) => item.isPresent === true).length}
          </Label>
          <Label
            color="error"
            variant="soft"
            sx={{
              minWidth: '80px',
              textAlign: 'center',
              py: 1,
              px: 2,
              borderRadius: 2,
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Absent: {absentStudents.length}
          </Label>
          <Label
            color="warning"
            variant="soft"
            sx={{
              minWidth: '100px',
              textAlign: 'center',
              py: 1,
              px: 2,
              borderRadius: 2,
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Pending: {studentData.filter((item: any) => item.isPresent === null).length}
          </Label>
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'flex-start',
            minHeight: '32px', // Fixed height for chip area
            flex: 1,
            py: 0.25,
          }}
        >
          {absentStudents.length > 0 && (
            <>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  whiteSpace: 'nowrap',
                  fontWeight: 500,
                }}
              >
                Absent Students:
              </Typography>
              {absentStudents.map((item: any) => (
                <Chip
                  key={item.student.id}
                  size="small"
                  label={`${item.student.rollNo} - ${item.student.firstName || 'Student'}`}
                  color="error"
                  avatar={
                    <Avatar>
                      {item.student.firstName?.[0] || item.student.rollNo?.[0] || 'S'}
                    </Avatar>
                  }
                  variant="soft"
                  onDelete={() => {
                    setStudentData((studentDetails: any) =>
                      studentDetails.map((student: any) =>
                        item.student.id === student.student.id
                          ? { ...student, isPresent: true }
                          : student
                      )
                    );
                  }}
                />
              ))}
            </>
          )}
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {view === 'list' ? (
          <ListView
            isSaved={isSaved}
            data={studentData}
            setStudentData={setStudentData}
            isLoading={isLoading}
          />
        ) : (
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {studentData.map((student: any) => (
                <AttendanceCard
                  key={student.id}
                  student={student}
                  setStudentData={setStudentData}
                />
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Box>
  );
};
export default TakeAttendanceScreen;

const AttendanceCard = ({ student: studentAttendanceData, setStudentData }: any) => {
  const a = null;
  return (
    <Grid item xs={12} sm={6} md={3}>
      <Paper
        elevation={3}
        sx={{
          width: '100%',

          borderLeft: (theme) =>
            `4px solid ${!studentAttendanceData.isPresent ? theme.palette.error.main : theme.palette.success.main}`,
          cursor: 'pointer',
          background: (theme) =>
            !studentAttendanceData.isPresent
              ? varAlpha(theme.palette.error.mainChannel, 0.05)
              : varAlpha(theme.palette.success.mainChannel, 0.05),
        }}
      >
        <Box display="flex" gap={1} p={1.5} alignItems="center">
          <Box
            sx={{
              width: '100px',
              height: '100px',

              '& img': { width: '100%', height: '100%', objectFit: 'cover' },
            }}
          >
            <img
              src={convertBase64Format(studentAttendanceData?.student?.profilePicture)}
              alt="Student"
              style={{
                borderRadius: '50%',
              }}
            />
          </Box>
          <Box flexGrow={1} ml={1} gap={0.5}>
            <Typography variant="h6">{studentAttendanceData?.name}</Typography>
            <Typography variant="body2">
              <Label color="info" sx={{ fontSize: 15 }}>
                Roll No :- {studentAttendanceData?.student?.rollNo}
              </Label>
            </Typography>
            <Typography variant="body2">
              Class: {studentAttendanceData?.student?.standard?.name}
            </Typography>
            <Typography variant="body2">
              Division: {studentAttendanceData?.student?.division?.name}
            </Typography>
          </Box>
          {/* <Box> */}
          <Tooltip title="Present">
            <IconButton
              color="success"
              aria-label="mark present"
              onClick={() => {
                setStudentData((studentData: any) =>
                  studentData.map((item: any) =>
                    item.id === studentAttendanceData.id ? { ...item, isPresent: true } : item
                  )
                );
              }}
            >
              <CheckCircleOutlined />
            </IconButton>
          </Tooltip>
          <Tooltip title="Absent">
            <IconButton
              color="error"
              aria-label="mark absent"
              onClick={() => {
                setStudentData((studentData: any) =>
                  studentData.map((item: any) =>
                    item.id === studentAttendanceData.id ? { ...item, isPresent: false } : item
                  )
                );
              }}
            >
              <CancelOutlined />
            </IconButton>
          </Tooltip>{' '}
          {/* </Box> */}
        </Box>
        <Box p={2} sx={{ transition: 'all 0.3s ease-in-out' }}>
          <TextField
            size="small"
            label="Remarks"
            fullWidth
            multiline
            rows={2}
            value={studentAttendanceData?.remarks}
            onChange={(e) => {
              setStudentData((studentData: any) =>
                studentData.map((item: any) =>
                  item.id === studentAttendanceData.id ? { ...item, remarks: e.target.value } : item
                )
              );
            }}
          />
        </Box>
      </Paper>
    </Grid>
  );
};

const ListView = ({ isSaved, data, setStudentData, isLoading }: any) => {
  const a = null;
  const [selectedStudent, setSelectedStudent] = useState<any>([]);
  const sendInstantNotificationDialogValue = useBoolean();

  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };
  return (
    <>
      <CustomizableTable
        onSendNotification={handlerSendNotification}
        showCheckbox={selectedStudent.length !== 0}
        tableId="student-attendance-list"
        noDataText="No Students Found"
        isLoading={isLoading}
        tableProps={{
          sx: {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            '& .MuiTableContainer-root': {
              flex: 1,
              maxHeight: 'calc(100vh - 300px)', // Adjust based on header height
            },
          },
        }}
        rowProps={(tableData: any) => ({
          sx: {
            background: (theme) =>
              tableData.isPresent === true
                ? varAlpha(theme.palette.success.mainChannel, 0.08)
                : tableData.isPresent === false
                  ? varAlpha(theme.palette.error.mainChannel, 0.08)
                  : varAlpha(theme.palette.warning.mainChannel, 0.08),
          },
        })}
        columns={[
          // {
          //   id: 'checkBox',
          //   label: '',
          //   minWidth: '60px',
          //   sticky: true,
          //   isSort: false,
          //   isFilter: false,
          //   align: 'center',
          //   renderColumn: (value) => (
          //     <Checkbox
          //       checked={data.length ? data.length === selectedStudent.length : false}
          //       onChange={(e) => {
          //         if (e.target.checked) {
          //           setSelectedStudent(data);
          //         } else {
          //           setSelectedStudent([]);
          //         }
          //       }}
          //     />
          //   ),
          //   render(value, row) {
          //     return (
          //       <Checkbox
          //         checked={selectedStudent.some(
          //           (student: any) => student.student.id === row.student.id
          //         )}
          //         onChange={(e) => {
          //           if (!e.target.checked) {
          //             setSelectedStudent(
          //               selectedStudent.filter(
          //                 (student: any) => student.student.id !== row.student.id
          //               )
          //             );
          //           } else {
          //             setSelectedStudent([...selectedStudent, row]);
          //           }
          //         }}
          //       />
          //     );
          //   },
          // },
          {
            id: 'student.rollNo',
            label: 'Roll No',
            align: 'left',
            minWidth: '100px',
            sticky: true,
            isFilter: false,
          },
          {
            id: 'name',
            label: 'Name',
            align: 'left',
            sticky: true,
            minWidth: '160px',
            render(value, row) {
              return (
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar
                    src={
                      row?.student?.profilePicture
                        ? convertBase64Format(row?.student?.profilePicture)
                        : ''
                    }
                    sx={{ width: 30, height: 30 }}
                    alt={value}
                    title={value}
                  />
                  {value}
                </Box>
              );
            },
          },
          {
            id: 'student.grNoRecord',
            label: 'Gr No',
            align: 'left',
            minWidth: '100px',
            defaultHidden: true,
          },

          {
            id: 'presentDays',
            label: 'Present Days',
            align: 'left',
            minWidth: '140px',
            isFilter: false,
          },
          {
            id: 'percentage',
            label: 'Attendance %',
            align: 'left',
            minWidth: '145px',
          },
          {
            id: 'remarks',
            label: 'Remarks',
            minWidth: '280px',
            isFilter: false,
            isSort: false,
            render(value, row) {
              return row.isPresent === false ? (
                <TextField
                  size="small"
                  value={value || ''}
                  onChange={(e) => {
                    console.log(e.target.value);
                    setStudentData(
                      data.map((item: any) =>
                        item.id === row.id ? { ...item, remarks: e.target.value } : item
                      )
                    );
                  }}
                  multiline
                  rows={2}
                  placeholder="Add remarks..."
                  sx={{
                    width: '100%',
                    '& .MuiInputBase-input::placeholder': {
                      color: 'text.secondary',
                      fontStyle: 'italic',
                      opacity: 0.7,
                    },
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: '56px', // Same height as TextField with 2 rows
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.disabled',
                    fontStyle: 'italic',
                    fontSize: '0.875rem',
                  }}
                >
                  {row.isPresent === true ? 'No remarks needed' : 'Mark attendance first'}
                </Box>
              );
            },
          },
          {
            id: 'isPresent',
            label: 'Attendance',
            minWidth: '160px',
            align: 'left',
            isSort: false,
            sticky: true,
            isFilter: false,
            render(value, row) {
              return isSaved.value ? (
                <Label color={value === true ? 'success' : value === false ? 'error' : 'warning'}>
                  {value === true ? 'Present' : value === false ? 'Absent' : 'Not Yet Marked'}
                </Label>
              ) : (
                <Stack direction="column" spacing={1} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{
                      position: 'relative',
                      width: '140px',
                      height: '36px',
                      backgroundColor: 'background.paper',
                      borderRadius: '18px',
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Background sections */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '33.33%',
                        height: '100%',
                        backgroundColor: value === true ? 'success.light' : 'transparent',
                        transition: 'all 0.3s ease',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: '33.33%',
                        width: '33.33%',
                        height: '100%',
                        backgroundColor: value === null ? 'warning.light' : 'transparent',
                        transition: 'all 0.3s ease',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '33.33%',
                        height: '100%',
                        backgroundColor: value === false ? 'error.light' : 'transparent',
                        transition: 'all 0.3s ease',
                      }}
                    />

                    {/* Clickable sections */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '33.33%',
                        height: '100%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                        '&:hover': {
                          backgroundColor: 'success.lighter',
                        },
                      }}
                      onClick={() => {
                        setStudentData(
                          data.map((item: any) =>
                            item.student.id === row.student.id ? { ...item, isPresent: true } : item
                          )
                        );
                      }}
                    >
                      <Box
                        sx={{
                          fontSize: '16px',
                          fontWeight: 600,
                          color: value === true ? 'success.dark' : 'text.secondary',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        ✓
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: '33.33%',
                        width: '33.33%',
                        height: '100%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                        '&:hover': {
                          backgroundColor: 'warning.lighter',
                        },
                      }}
                      onClick={() => {
                        setStudentData(
                          data.map((item: any) =>
                            item.student.id === row.student.id
                              ? { ...item, isPresent: null, remarks: '' }
                              : item
                          )
                        );
                      }}
                    >
                      <Box
                        sx={{
                          fontSize: '16px',
                          fontWeight: 600,
                          color: value === null ? 'warning.dark' : 'text.secondary',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        ?
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '33.33%',
                        height: '100%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                        '&:hover': {
                          backgroundColor: 'error.lighter',
                        },
                      }}
                      onClick={() => {
                        setStudentData(
                          data.map((item: any) =>
                            item.student.id === row.student.id
                              ? { ...item, isPresent: false }
                              : item
                          )
                        );
                      }}
                    >
                      <Box
                        sx={{
                          fontSize: '16px',
                          fontWeight: 600,
                          color: value === false ? 'error.dark' : 'text.secondary',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        ✗
                      </Box>
                    </Box>
                  </Box>
                </Stack>
              );
            },
          },
        ]}
        data={data}
      />{' '}
      {sendInstantNotificationDialogValue.value && (
        <SendInstantNotificationDialog
          open={sendInstantNotificationDialogValue.value}
          onClose={sendInstantNotificationDialogValue.onFalse}
          data={[]}
          userList={selectedStudent}
        />
      )}
    </>
  );
};
