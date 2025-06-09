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
  Switch,
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
        })) || []
      );
    }
  }, [data?.items]);

  const absentStudents = useMemo(
    () => studentData.filter((item: any) => !item.isPresent),
    [studentData]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Mark Attendance"
        links={[
          { name: 'Student', href: '/student/enrollment/dashboard/' },
          { name: 'Attendance', href: '/student/attendance/dashboard/' },
          { name: 'Mark Attendance' },
        ]}
        sx={{ px: 1, mb: 2 }}
        description="Quickly record student attendance: Choose the date, then simply mark each student as Present or Absent."
      />
      <Box display="flex" gap={2} flexWrap="wrap">
        <DatePicker
          label="Date"
          value={date}
          onChange={(val) => {
            setDate(val);
          }}
          format="DD/MM/YYYY"
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
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            onClick={() => {
              setStudentData((pre: any) => pre.map((item: any) => ({ ...item, isPresent: true })));
            }}
            size="small"
            // color="success"
            startIcon={<CheckCircleOutlined />}
            sx={{ color: 'success.main' }}
          >
            All Present
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setStudentData((pre: any) => pre.map((item: any) => ({ ...item, isPresent: false })));
            }}
            size="small"
            // color="error"
            startIcon={<CancelOutlined />}
            sx={{ color: 'error.main' }}
          >
            All Absent
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<RestartAlt />}
            onClick={() => {
              setStudentData(
                data?.items?.map((item: any) => ({
                  ...item,
                  name: `${item?.student?.firstName} ${item?.student?.lastName} ${item?.student?.middleName}`,
                  percentage: (item.presentDays / item.totalDays) * 100,
                })) || []
              );
            }}
          >
            Reset
          </Button>

          <Button
            size="small"
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            onClick={() => {
              handleSave();
            }}
          >
            Save
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
          border: (theme) => `1px dashed gray`,
          p: 1,
          borderRadius: 1,
          my: 1,
        }}
      >
        <Typography variant="body1" fontWeight={500}>
          Total Absent : <b>{absentStudents.length}</b>
        </Typography>
        {absentStudents.map((item: any) => (
          <Chip
            size="small"
            label={`${item.student.rollNo} - ${item.name}`}
            color="error"
            avatar={<Avatar>{item.name[0]}</Avatar>}
            variant="soft"
            onDelete={() => {
              setStudentData((studentDetails: any) =>
                studentDetails.map((student: any) =>
                  item.student.id === student.student.id ? { ...item, isPresent: false } : item
                )
              );
            }}
            // icon={
            //   <CancelOutlined
            //     onClick={() => {
            //       setStudentData((studentDetails: any) =>
            //         studentDetails.map((student: any) =>
            //           item.student.id === student.student.id ? { ...item, isPresent: false } : item
            //         )
            //       );
            //     }}
            //   />
            // }
          />
        ))}
      </Box>

      {view === 'list' ? (
        <ListView
          isSaved={isSaved}
          data={studentData}
          setStudentData={setStudentData}
          isLoading={isLoading}
        />
      ) : (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {studentData.map((student: any) => (
            <AttendanceCard key={student.id} student={student} setStudentData={setStudentData} />
          ))}
        </Grid>
      )}
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
        rowProps={(tableData: any) => ({
          sx: {
            background: (theme) =>
              tableData.isPresent
                ? varAlpha(theme.palette.success.mainChannel, 0.08)
                : varAlpha(theme.palette.error.mainChannel, 0.08),
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
          },
          {
            id: 'name',
            label: 'Name',
            align: 'left',
            sticky: true,
            minWidth: '180px',
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
          },

          {
            id: 'presentDays',
            label: 'Total Present Days',
            align: 'left',
            minWidth: '180px',
          },
          {
            id: 'percentage',
            label: 'Attendance Percentage',
            align: 'left',
            minWidth: '210px',
          },
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
                    setStudentData(
                      data.map((item: any) =>
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
          {
            id: 'isPresent',
            label: 'Attendance',
            minWidth: '6vw',
            align: 'left',
            isSort: false,
            sticky: true,
            isFilter: false,
            render(value, row) {
              return isSaved.value ? (
                <Label color={value === 'Present' ? 'success' : 'error'}>{value}</Label>
              ) : (
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
                      setStudentData(
                        data.map((item: any) =>
                          item.student.id === row.student.id
                            ? { ...item, isPresent: e.target.checked }
                            : item
                        )
                      );
                    }}
                  />
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
