'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useEffect } from 'react';
import { convertBase64Format } from 'src/utils/base64Formate';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { AttendanceStatus } from 'src/enums/student-attendace-status';
import { RestartAlt, CancelOutlined, CheckCircleOutlined } from '@mui/icons-material';
import { Box, Chip, Stack, Avatar, Button, Divider, TextField, Typography } from '@mui/material';
import {
  useMarkAttendanceMutation,
  useGetAttendanceByFilterQuery,
} from 'src/redux/student/take-attendance/take-attendace-api';

const TakeAttendanceScreen = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [view, setView] = React.useState('list');

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

  const { currentYear, currentMedium: medium } = useSelector(
    (state: RootState) => state.globalState
  );

  // const [markAttendance] = useMarkAttendanceMutation();

  const [markAttendance] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useMarkAttendanceMutation,
  });

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
      const payload = {
        academicYearId: currentYear?.id,
        standardId: classes,
        divisionId: division,
        date: dateConvertor(date?.format(dateFormat) ?? ''),
        entries: studentData.map((student: any) => ({
          studentId: student.studentId,
          status: student.isPresent,
          remarks: student.remarks || '',
        })),
      };

      await markAttendance(payload).unwrap();

      shikshaMitraToast.success({
        message: `Attendance saved successfully for ${date?.format('DD-MM-YYYY')}`,
      });
    } catch (error) {
      console.error('Error marking attendance:', error);
      shikshaMitraToast.error({ message: 'Failed to save attendance.' });
    }
  };

  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAttendanceByFilterQuery,
    params: {
      AcademicYearId: currentYear?.id,
      StandardId: classes,
      DivisionId: division,
      Date: dateConvertor(dayjs(date).format(dateFormat)),
    },
    options: { skip: !(date && organization && classes && division) },
  });

  const [studentData, setStudentData] = useState<any>([]);

  useEffect(() => {
    if (data?.students) {
      setStudentData(
        data?.students?.map((item: any) => ({
          ...item,
          rollNo: item?.rollNo || '-',
          name: `${item?.firstName} ${item?.lastName} ${item?.middleName}`,
          // percentage: (item.presentDays / item.totalDays) * 100,
          // Ensure isPresent reflects the actual attendance data from API
          // If attendance is already marked for this date, use that value
          // Otherwise, set to null (unmarked)
          isPresent: item.status,
          remarks: item.remarks || '',
        })) || []
      );
    } else {
      // Clear student data when no data is available
      setStudentData([]);
    }
  }, [data?.students]);

  // // Reset student data when filters change to ensure fresh data
  // useEffect(() => {
  //   setStudentData([]);
  // }, [date, organization, classes, division]);

  const absentStudents = useMemo(
    () => studentData.filter((item: any) => item.isPresent === false),
    [studentData]
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Mark Attendance"
        links={[
          { name: 'Student', href: '/student/enrollment/dashboard/' },
          { name: 'Attendance', href: '' },
          { name: 'Mark Attendance' },
        ]}
        sx={{ mb: 1 }}
        description="Quickly record student attendance: Choose the date, then simply mark each student as Present or Absent."
      />
      <Box display="flex" gap={2} flexWrap="wrap" sx={{ mb: 1, pt: 1 }}>
        <DatePicker
          label="Date"
          value={date}
          minDate={dayjs(currentYear?.startDate)}
          maxDate={dayjs(currentYear?.endDate)}
          onChange={(val) => {
            setDate(val);
          }}
          format="DD-MM-YYYY"
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
            setStudentData((pre: any) =>
              pre.map((item: any) => ({ ...item, isPresent: AttendanceStatus.Present }))
            );
          }}
          size="small"
          startIcon={<CheckCircleOutlined sx={{ fontSize: '16px' }} />}
          disabled={
            studentData.length === 0 ||
            studentData.every((item: any) => item.isPresent === AttendanceStatus.Present)
          }
          sx={{
            color: 'success.main',
            borderColor: 'success.main',
            '&:hover': { borderColor: 'success.dark', backgroundColor: 'success.lighter' },
            '&:disabled': { color: 'text.disabled', borderColor: 'text.disabled' },
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
            setStudentData((pre: any) =>
              pre.map((item: any) => ({ ...item, isPresent: AttendanceStatus.Absent }))
            );
          }}
          size="small"
          startIcon={<CancelOutlined sx={{ fontSize: '16px' }} />}
          disabled={
            studentData.length === 0 ||
            studentData.every((item: any) => item.isPresent === AttendanceStatus.Absent)
          }
          sx={{
            color: 'error.main',
            borderColor: 'error.main',
            '&:hover': { borderColor: 'error.dark', backgroundColor: 'error.lighter' },
            '&:disabled': { color: 'text.disabled', borderColor: 'text.disabled' },
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
              data?.students?.map((item: any) => ({
                ...item,
                name: `${item?.firstName} ${item?.lastName} ${item?.middleName}`,
                isPresent: item.status,
                remarks: item.remarks,
              })) || []
            );
            shikshaMitraToast.success({ message: 'Attendance Data Reset Successfully' });
          }}
          disabled={
            studentData.length === 0 || studentData.every((item: any) => item.isPresent === null)
          }
          sx={{
            color: 'warning.main',
            borderColor: 'warning.main',
            '&:hover': { borderColor: 'warning.dark', backgroundColor: 'warning.lighter' },
            '&:disabled': { color: 'text.disabled', borderColor: 'text.disabled' },
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
            gap: 1,
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
              py: 1.7,
              px: 2,
              borderRadius: 2,
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Present :{' '}
            {studentData.filter((item: any) => item.isPresent === AttendanceStatus.Present).length}
          </Label>
          <Label
            color="error"
            variant="soft"
            sx={{
              minWidth: '80px',
              textAlign: 'center',
              py: 1.7,

              px: 2,
              borderRadius: 2,
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Absent :{' '}
            {studentData.filter((item: any) => item.isPresent === AttendanceStatus.Absent).length}
          </Label>
          <Label
            color="warning"
            variant="soft"
            sx={{
              minWidth: '100px',
              textAlign: 'center',
              py: 1.7,
              px: 2,
              borderRadius: 2,
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Pending :{' '}
            {studentData.filter((item: any) => item.isPresent === AttendanceStatus.Pending).length}
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
                sx={{ color: 'text.secondary', whiteSpace: 'nowrap', fontWeight: 500 }}
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

      <ListView
        isSaved={isSaved}
        data={studentData}
        setStudentData={setStudentData}
        isLoading={isLoading}
      />
    </Box>
  );
};
export default TakeAttendanceScreen;

const ListView = ({ isSaved, data, setStudentData, isLoading }: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        noDataText="No Students Found for Attendance"
        isLoading={isLoading}
        rowProps={(tableData: any) => ({
          sx: {
            background: (theme) =>
              tableData.isPresent === true
                ? varAlpha(theme.vars.palette.success.mainChannel, 0.08)
                : tableData.isPresent === false
                  ? varAlpha(theme.vars.palette.error.mainChannel, 0.08)
                  : varAlpha(theme.vars.palette.warning.mainChannel, 0.08),
          },
        })}
        columns={[
          {
            id: 'rollNo',
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
            id: 'grNo',
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
          { id: 'percentage', label: 'Attendance %', align: 'left', minWidth: '145px' },
          {
            id: 'remarks',
            label: 'Remarks',
            minWidth: '280px',
            isFilter: false,
            isSort: false,
            align: 'left',
            render(value, row) {
              return row.isPresent === false ? (
                <TextField
                  size="small"
                  value={value || ''}
                  onChange={(e) => {
                    setStudentData(
                      data.map((item: any) =>
                        item.id === row.id ? { ...item, remarks: e.target.value } : item
                      )
                    );
                  }}
                  label="Add remarks"
                  multiline
                  rows={2}
                  sx={{
                    width: '100%',
                    '& .MuiInputBase-input::placeholder': { color: 'text.secondary', opacity: 0.7 },
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
                  {row.isPresent === AttendanceStatus.Present
                    ? 'No remarks needed'
                    : 'Mark attendance first'}
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
                <Label
                  color={
                    value === AttendanceStatus.Present
                      ? 'success'
                      : value === AttendanceStatus.Absent
                        ? 'error'
                        : 'warning'
                  }
                >
                  {value === AttendanceStatus.Present
                    ? 'Present'
                    : value === AttendanceStatus.Absent
                      ? 'Absent'
                      : 'Not Yet Marked'}
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
                        backgroundColor:
                          value === AttendanceStatus.Present ? 'success.light' : 'transparent',
                        '&:hover': { backgroundColor: 'success.lighter' },
                      }}
                      onClick={() => {
                        setStudentData(
                          data.map((item: any) =>
                            item.studentId === row.studentId
                              ? { ...item, isPresent: AttendanceStatus.Present }
                              : item
                          )
                        );
                      }}
                    >
                      <Box
                        sx={{
                          fontSize: '16px',
                          fontWeight: 600,
                          color:
                            value === AttendanceStatus.Present ? 'success.dark' : 'text.secondary',
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
                        backgroundColor:
                          value === AttendanceStatus.Pending ? 'warning.light' : 'transparent',
                        '&:hover': { backgroundColor: 'warning.lighter' },
                      }}
                      onClick={() => {
                        setStudentData(
                          data.map((item: any) =>
                            item.studentId === row.studentId
                              ? { ...item, isPresent: AttendanceStatus.Pending, remarks: '' }
                              : item
                          )
                        );
                      }}
                    >
                      <Box
                        sx={{
                          fontSize: '16px',
                          fontWeight: 600,
                          color:
                            value === AttendanceStatus.Pending ? 'warning.dark' : 'text.secondary',
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
                        backgroundColor:
                          value === AttendanceStatus.Absent ? 'error.light' : 'transparent',
                        '&:hover': { backgroundColor: 'error.lighter' },
                      }}
                      onClick={() => {
                        setStudentData(
                          data.map((item: any) =>
                            item.studentId === row.studentId
                              ? { ...item, isPresent: AttendanceStatus.Absent }
                              : item
                          )
                        );
                      }}
                    >
                      <Box
                        sx={{
                          fontSize: '16px',
                          fontWeight: 600,
                          color:
                            value === AttendanceStatus.Absent ? 'error.dark' : 'text.secondary',
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
    </>
  );
};
