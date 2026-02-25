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
import { RestartAlt } from '@mui/icons-material';
import { useBoolean } from 'src/hooks/use-boolean';
import React, { useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import sortQueryString from 'src/utils/sort-query-string';
import { convertBase64Format } from 'src/utils/base64Formate';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { AttendanceStatus } from 'src/enums/student-attendace-status';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { Box, Card, Stack, Avatar, Button, Tooltip, TextField, Typography } from '@mui/material';
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
  // Reset confirmation dialog
  const resetConfirmDialog = useBoolean();

  const { currentYear, currentMedium: medium } = useSelector(
    (state: RootState) => state.globalState
  );

  // const [markAttendance] = useMarkAttendanceMutation();

  const { markAttendance, isLoading: isMarkAttendanceLoading } = useQueryAndMutation({
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

  const { data, isLoading, isFetching } = useQueryAndMutation({
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

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Mark Attendance"
        links={[
          { name: 'Student', href: '/student/enrollment/dashboard/' },
          { name: 'Attendance', href: '' },
          { name: 'Mark Attendance' },
        ]}
        description="Quickly record student attendance: Choose the date, then simply mark each student as Present or Absent."
      />
      <Card
        sx={{
          mb: 0,
          p: 1,
          pb: 2,
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <DatePicker
          label="Date"
          value={date}
          minDate={dayjs(currentYear?.startDate)}
          maxDate={dayjs(currentYear?.endDate)}
          onChange={(val) => {
            setDate(val);
          }}
          format="DD-MM-YYYY"
          slotProps={{ textField: { size: 'small', sx: { maxWidth: '200px', width: '100%' } } }}
        />

        <PaginatedSearchSelect
          label="Organization"
          disabled={!medium}
          fetchOptions={async (query) => {
            const items = allOrganization || [];
            const filtered = items.filter((item: any) =>
              item?.name?.toLowerCase().includes(query.toLowerCase())
            );
            return {
              data: filtered.map((item: any) => ({
                label: item.name,
                id: item.id,
              })),
              hasMore: false,
            };
          }}
          value={
            organization
              ? {
                  label: allOrganization.find((o: any) => o.id === organization)?.name || '',
                  id: organization,
                }
              : null
          }
          isOptionEqualToValue={(option, value) => option.id === value?.id}
          getOptionLabel={(option: any) => option?.label || ''}
          renderOption={(prop, option: any) => (
            <li {...prop} key={option.id}>
              {option.label}
            </li>
          )}
          minChars={0}
          onChange={(_, value: any) => {
            setOrganization(value?.id || '');
          }}
          fullWidth
          sx={{ maxWidth: '200px' }}
          size="small"
        />
        <PaginatedSearchSelect
          label="Class"
          disabled={!organization}
          fetchOptions={async (query) => {
            const items = allClass || [];
            const filtered = items.filter((item: any) =>
              item?.name?.toLowerCase().includes(query.toLowerCase())
            );
            return {
              data: filtered.map((item: any) => ({
                label: item.name,
                id: item.id,
              })),
              hasMore: false,
            };
          }}
          value={
            classes
              ? {
                  label: allClass.find((c: any) => c.id === classes)?.name || '',
                  id: classes,
                }
              : null
          }
          isOptionEqualToValue={(option, value) => option.id === value?.id}
          getOptionLabel={(option: any) => option?.label || ''}
          renderOption={(prop, option: any) => (
            <li {...prop} key={option.id}>
              {option.label}
            </li>
          )}
          minChars={0}
          onChange={(_, value: any) => {
            setClass(value?.id || '');
          }}
          fullWidth
          sx={{ maxWidth: '200px' }}
          size="small"
        />
        <PaginatedSearchSelect
          label="Division"
          disabled={!classes}
          fetchOptions={async (query) => {
            const items = allDivision || [];
            const filtered = items.filter((item: any) =>
              item?.name?.toLowerCase().includes(query.toLowerCase())
            );
            return {
              data: filtered.map((item: any) => ({
                label: item.name,
                id: item.id,
              })),
              hasMore: false,
            };
          }}
          value={
            division
              ? {
                  label: allDivision.find((d: any) => d.id === division)?.name || '',
                  id: division,
                }
              : null
          }
          isOptionEqualToValue={(option, value) => option.id === value?.id}
          getOptionLabel={(option: any) => option?.label || ''}
          renderOption={(prop, option: any) => (
            <li {...prop} key={option.id}>
              {option.label}
            </li>
          )}
          minChars={0}
          onChange={(_, value: any) => {
            setDivision(value?.id || '');
          }}
          fullWidth
          sx={{ maxWidth: '200px' }}
          size="small"
        />

        {/* Spacer to push buttons to the right */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Reset Button */}
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<RestartAlt sx={{ fontSize: '16px' }} />}
          onClick={() => {
            resetConfirmDialog.onTrue();
          }}
          disabled={
            studentData.length === 0 ||
            studentData.every((item: any) => item.isPresent === AttendanceStatus.Pending)
          }
          sx={{
            minWidth: '90px',
            fontWeight: 500,
            fontSize: '0.875rem',
          }}
        >
          Reset
        </Button>

        {/* Save Button */}
        <Button
          size="small"
          variant="contained"
          loading={isMarkAttendanceLoading}
          startIcon={<Iconify icon={GlobalIcons.submit} sx={{ fontSize: '16px' }} />}
          onClick={() => {
            handleSave();
          }}
          disabled={
            studentData.length === 0 ||
            studentData.every((item: any) => item.isPresent === AttendanceStatus.Pending)
          }
          sx={{
            minWidth: '90px',
            fontWeight: 500,
            fontSize: '0.875rem',
          }}
        >
          Save
        </Button>
      </Card>

      <ListView
        isSaved={isSaved}
        data={studentData}
        setStudentData={setStudentData}
        isLoading={isLoading}
        isFetching={isFetching}
        studentData={studentData}
      />

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        open={resetConfirmDialog.value}
        onClose={() => {
          resetConfirmDialog.onFalse();
        }}
        title="Reset Attendance"
        content={
          <>
            Are you sure you want to reset all attendance?
            <br />
            <strong>All students will be marked as Pending and remarks will be cleared.</strong>
          </>
        }
        action={
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              setStudentData((prev: any) =>
                prev.map((item: any) => ({
                  ...item,
                  isPresent: AttendanceStatus.Pending,
                  remarks: '',
                }))
              );
              resetConfirmDialog.onFalse();
              shikshaMitraToast.success({ message: 'Attendance Data Reset Successfully' });
            }}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};
export default TakeAttendanceScreen;

const ListView = ({ isSaved, data, setStudentData, isLoading, isFetching, studentData }: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedStudent, setSelectedStudent] = useState<any>([]);
  const sendInstantNotificationDialogValue = useBoolean();

  const [query, setQuery] = useState({
    sorting: '',
    skipCount: 0,
    maxResultCount: 10,
  });

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
        isLoading={isLoading || isFetching}
        rowProps={(tableData: any) => ({
          sx: {
            background: (theme) =>
              tableData.isPresent === AttendanceStatus.Present
                ? varAlpha(theme.vars.palette.success.mainChannel, 0.12)
                : tableData.isPresent === AttendanceStatus.Absent
                  ? varAlpha(theme.vars.palette.error.mainChannel, 0.12)
                  : varAlpha(theme.vars.palette.warning.mainChannel, 0.08),
            transition: 'background-color 0.2s',
            height: '40px', // Compact row height
            '& td': { py: 0.5 }, // Reduce cell padding
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
            minWidth: '250px',
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
              return row.isPresent === AttendanceStatus.Absent ? (
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
            label: (
              <Stack spacing={0.75} alignItems="center">
                {/* Count Badges Row - Positioned Above Buttons */}
                <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
                  {/* Present Count Badge */}
                  <Box
                    sx={{
                      minWidth: '28px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '10px',
                      bgcolor: (theme) => varAlpha(theme.vars.palette.success.mainChannel, 0.16),
                      color: 'success.dark',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      px: 0.75,
                    }}
                  >
                    {
                      studentData.filter((item: any) => item.isPresent === AttendanceStatus.Present)
                        .length
                    }
                  </Box>

                  {/* Pending Count Badge */}
                  <Box
                    sx={{
                      minWidth: '28px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '10px',
                      bgcolor: (theme) => varAlpha(theme.vars.palette.warning.mainChannel, 0.16),
                      color: 'warning.dark',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      px: 0.75,
                    }}
                  >
                    {
                      studentData.filter((item: any) => item.isPresent === AttendanceStatus.Pending)
                        .length
                    }
                  </Box>

                  {/* Absent Count Badge */}
                  <Box
                    sx={{
                      minWidth: '28px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '10px',
                      bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.16),
                      color: 'error.dark',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      px: 0.75,
                    }}
                  >
                    {
                      studentData.filter((item: any) => item.isPresent === AttendanceStatus.Absent)
                        .length
                    }
                  </Box>
                </Stack>

                {/* Action Buttons Row - Grouped Segmented Control */}
                <Box
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    width: '180px',
                    height: '32px',
                    bgcolor: (theme) => theme.vars.palette.background.neutral,
                    borderRadius: '6px',
                    p: 0.25,
                    gap: 0.25,
                  }}
                >
                  {/* Present Button with Tooltip - Clickable to Mark All */}
                  <Tooltip
                    title={
                      studentData.filter((item: any) => item.isPresent === AttendanceStatus.Present)
                        .length > 0 ? (
                        <Box sx={{ p: 1, maxWidth: 300 }}>
                          <Typography variant="caption" fontWeight={600} display="block" mb={0.5}>
                            Present Students (
                            {
                              studentData.filter(
                                (item: any) => item.isPresent === AttendanceStatus.Present
                              ).length
                            }
                            )
                          </Typography>
                          {studentData
                            .filter((item: any) => item.isPresent === AttendanceStatus.Present)
                            .slice(0, 10)
                            .map((student: any) => (
                              <Typography key={student.studentId} variant="caption" display="block">
                                • {student.rollNo} - {student.name}
                              </Typography>
                            ))}
                          {studentData.filter(
                            (item: any) => item.isPresent === AttendanceStatus.Present
                          ).length > 10 && (
                            <Typography
                              variant="caption"
                              display="block"
                              sx={{ fontStyle: 'italic', mt: 0.5 }}
                            >
                              +
                              {studentData.filter(
                                (item: any) => item.isPresent === AttendanceStatus.Present
                              ).length - 10}{' '}
                              more
                            </Typography>
                          )}
                          <Typography
                            variant="caption"
                            display="block"
                            mt={1}
                            sx={{ fontStyle: 'italic', opacity: 0.8 }}
                          >
                            Click to mark all as Present
                          </Typography>
                        </Box>
                      ) : (
                        'Click to mark all as Present'
                      )
                    }
                    arrow
                    placement="top"
                    slotProps={{
                      tooltip: {
                        sx: {
                          bgcolor: 'background.paper',
                          color: 'text.primary',
                          boxShadow: (theme) => theme.shadows[8],
                          border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                          '& .MuiTooltip-arrow': {
                            color: 'background.paper',
                            '&::before': {
                              border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                            },
                          },
                        },
                      },
                    }}
                  >
                    <Box
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          data.length === 0 ||
                          data.every((item: any) => item.isPresent === AttendanceStatus.Present)
                        ) {
                          return;
                        }
                        setStudentData((pre: any) =>
                          pre.map((item: any) => ({ ...item, isPresent: AttendanceStatus.Present }))
                        );
                      }}
                      sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                        bgcolor: (theme) =>
                          studentData.filter(
                            (item: any) => item.isPresent === AttendanceStatus.Present
                          ).length > 0
                            ? theme.vars.palette.success.main
                            : 'transparent',
                        color: (theme) =>
                          studentData.filter(
                            (item: any) => item.isPresent === AttendanceStatus.Present
                          ).length > 0
                            ? theme.vars.palette.success.contrastText
                            : theme.vars.palette.text.secondary,
                        cursor:
                          data.length === 0 ||
                          data.every((item: any) => item.isPresent === AttendanceStatus.Present)
                            ? 'not-allowed'
                            : 'pointer',
                        opacity:
                          data.length === 0 ||
                          data.every((item: any) => item.isPresent === AttendanceStatus.Present)
                            ? 0.5
                            : 1,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: (theme) =>
                            data.length === 0 ||
                            data.every((item: any) => item.isPresent === AttendanceStatus.Present)
                              ? 'transparent'
                              : studentData.filter(
                                    (item: any) => item.isPresent === AttendanceStatus.Present
                                  ).length > 0
                                ? theme.vars.palette.success.dark
                                : varAlpha(theme.vars.palette.success.mainChannel, 0.08),
                        },
                      }}
                    >
                      <Iconify icon="eva:checkmark-fill" width={18} />
                    </Box>
                  </Tooltip>

                  {/* Pending Button with Tooltip */}
                  <Tooltip
                    title={
                      studentData.filter((item: any) => item.isPresent === AttendanceStatus.Pending)
                        .length > 0 ? (
                        <Box sx={{ p: 1, maxWidth: 300 }}>
                          <Typography variant="caption" fontWeight={600} display="block" mb={0.5}>
                            Pending Students (
                            {
                              studentData.filter(
                                (item: any) => item.isPresent === AttendanceStatus.Pending
                              ).length
                            }
                            )
                          </Typography>
                          {studentData
                            .filter((item: any) => item.isPresent === AttendanceStatus.Pending)
                            .slice(0, 10)
                            .map((student: any) => (
                              <Typography key={student.studentId} variant="caption" display="block">
                                • {student.rollNo} - {student.name}
                              </Typography>
                            ))}
                          {studentData.filter(
                            (item: any) => item.isPresent === AttendanceStatus.Pending
                          ).length > 10 && (
                            <Typography
                              variant="caption"
                              display="block"
                              sx={{ fontStyle: 'italic', mt: 0.5 }}
                            >
                              +
                              {studentData.filter(
                                (item: any) => item.isPresent === AttendanceStatus.Pending
                              ).length - 10}{' '}
                              more
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        'No pending students'
                      )
                    }
                    arrow
                    placement="top"
                    slotProps={{
                      tooltip: {
                        sx: {
                          bgcolor: 'background.paper',
                          color: 'text.primary',
                          boxShadow: (theme) => theme.shadows[8],
                          border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                          '& .MuiTooltip-arrow': {
                            color: 'background.paper',
                            '&::before': {
                              border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                            },
                          },
                        },
                      },
                    }}
                  >
                    <Box
                      sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                        bgcolor: (theme) =>
                          studentData.filter(
                            (item: any) => item.isPresent === AttendanceStatus.Pending
                          ).length > 0
                            ? theme.vars.palette.warning.main
                            : 'transparent',
                        color: (theme) =>
                          studentData.filter(
                            (item: any) => item.isPresent === AttendanceStatus.Pending
                          ).length > 0
                            ? theme.vars.palette.warning.contrastText
                            : theme.vars.palette.text.secondary,
                        cursor: 'default',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Iconify icon="eva:minus-fill" width={18} />
                    </Box>
                  </Tooltip>

                  {/* Absent Button with Tooltip - Clickable to Mark All */}
                  <Tooltip
                    title={
                      studentData.filter((item: any) => item.isPresent === AttendanceStatus.Absent)
                        .length > 0 ? (
                        <Box sx={{ p: 1, maxWidth: 300 }}>
                          <Typography variant="caption" fontWeight={600} display="block" mb={0.5}>
                            Absent Students (
                            {
                              studentData.filter(
                                (item: any) => item.isPresent === AttendanceStatus.Absent
                              ).length
                            }
                            )
                          </Typography>
                          {studentData
                            .filter((item: any) => item.isPresent === AttendanceStatus.Absent)
                            .slice(0, 10)
                            .map((student: any) => (
                              <Typography key={student.studentId} variant="caption" display="block">
                                • {student.rollNo} - {student.name}
                              </Typography>
                            ))}
                          {studentData.filter(
                            (item: any) => item.isPresent === AttendanceStatus.Absent
                          ).length > 10 && (
                            <Typography
                              variant="caption"
                              display="block"
                              sx={{ fontStyle: 'italic', mt: 0.5 }}
                            >
                              +
                              {studentData.filter(
                                (item: any) => item.isPresent === AttendanceStatus.Absent
                              ).length - 10}{' '}
                              more
                            </Typography>
                          )}
                          <Typography
                            variant="caption"
                            display="block"
                            mt={1}
                            sx={{ fontStyle: 'italic', opacity: 0.8 }}
                          >
                            Click to mark all as Absent
                          </Typography>
                        </Box>
                      ) : (
                        'Click to mark all as Absent'
                      )
                    }
                    arrow
                    placement="top"
                    slotProps={{
                      tooltip: {
                        sx: {
                          bgcolor: 'background.paper',
                          color: 'text.primary',
                          boxShadow: (theme) => theme.shadows[8],
                          border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                          '& .MuiTooltip-arrow': {
                            color: 'background.paper',
                            '&::before': {
                              border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                            },
                          },
                        },
                      },
                    }}
                  >
                    <Box
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          data.length === 0 ||
                          data.every((item: any) => item.isPresent === AttendanceStatus.Absent)
                        ) {
                          return;
                        }
                        setStudentData((pre: any) =>
                          pre.map((item: any) => ({ ...item, isPresent: AttendanceStatus.Absent }))
                        );
                      }}
                      sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                        bgcolor: (theme) =>
                          studentData.filter(
                            (item: any) => item.isPresent === AttendanceStatus.Absent
                          ).length > 0
                            ? theme.vars.palette.error.main
                            : 'transparent',
                        color: (theme) =>
                          studentData.filter(
                            (item: any) => item.isPresent === AttendanceStatus.Absent
                          ).length > 0
                            ? theme.vars.palette.error.contrastText
                            : theme.vars.palette.text.secondary,
                        cursor:
                          data.length === 0 ||
                          data.every((item: any) => item.isPresent === AttendanceStatus.Absent)
                            ? 'not-allowed'
                            : 'pointer',
                        opacity:
                          data.length === 0 ||
                          data.every((item: any) => item.isPresent === AttendanceStatus.Absent)
                            ? 0.5
                            : 1,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: (theme) =>
                            data.length === 0 ||
                            data.every((item: any) => item.isPresent === AttendanceStatus.Absent)
                              ? 'transparent'
                              : studentData.filter(
                                    (item: any) => item.isPresent === AttendanceStatus.Absent
                                  ).length > 0
                                ? theme.vars.palette.error.dark
                                : varAlpha(theme.vars.palette.error.mainChannel, 0.08),
                        },
                      }}
                    >
                      <Iconify icon="eva:close-fill" width={18} />
                    </Box>
                  </Tooltip>
                </Box>
              </Stack>
            ),
            minWidth: '200px',
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
                <Stack direction="row" spacing={0} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{
                      position: 'relative',
                      display: 'flex',
                      width: '180px',
                      height: '32px',
                      bgcolor: (theme) => theme.vars.palette.background.neutral,
                      borderRadius: '6px',
                      p: 0.25,
                      gap: 0.25,
                    }}
                  >
                    {/* Present Button */}
                    <Box
                      onClick={() => {
                        setStudentData(
                          data.map((item: any) =>
                            item.studentId === row.studentId
                              ? { ...item, isPresent: AttendanceStatus.Present }
                              : item
                          )
                        );
                      }}
                      sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        bgcolor:
                          value === AttendanceStatus.Present
                            ? (theme) => theme.vars.palette.success.main
                            : 'transparent',
                        color:
                          value === AttendanceStatus.Present
                            ? (theme) => theme.vars.palette.success.contrastText
                            : (theme) => theme.vars.palette.text.secondary,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor:
                            value === AttendanceStatus.Present
                              ? (theme) => theme.vars.palette.success.dark
                              : (theme) => varAlpha(theme.vars.palette.success.mainChannel, 0.08),
                        },
                      }}
                    >
                      <Iconify icon="eva:checkmark-fill" width={18} />
                    </Box>

                    {/* Pending Button */}
                    <Box
                      onClick={() => {
                        setStudentData(
                          data.map((item: any) =>
                            item.studentId === row.studentId
                              ? { ...item, isPresent: AttendanceStatus.Pending }
                              : item
                          )
                        );
                      }}
                      sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        bgcolor:
                          value === AttendanceStatus.Pending
                            ? (theme) => theme.vars.palette.warning.main
                            : 'transparent',
                        color:
                          value === AttendanceStatus.Pending
                            ? (theme) => theme.vars.palette.warning.contrastText
                            : (theme) => theme.vars.palette.text.secondary,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor:
                            value === AttendanceStatus.Pending
                              ? (theme) => theme.vars.palette.warning.dark
                              : (theme) => varAlpha(theme.vars.palette.warning.mainChannel, 0.08),
                        },
                      }}
                    >
                      <Iconify icon="eva:minus-fill" width={18} />
                    </Box>

                    {/* Absent Button */}
                    <Box
                      onClick={() => {
                        setStudentData(
                          data.map((item: any) =>
                            item.studentId === row.studentId
                              ? { ...item, isPresent: AttendanceStatus.Absent }
                              : item
                          )
                        );
                      }}
                      sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        bgcolor:
                          value === AttendanceStatus.Absent
                            ? (theme) => theme.vars.palette.error.main
                            : 'transparent',
                        color:
                          value === AttendanceStatus.Absent
                            ? (theme) => theme.vars.palette.error.contrastText
                            : (theme) => theme.vars.palette.text.secondary,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor:
                            value === AttendanceStatus.Absent
                              ? (theme) => theme.vars.palette.error.dark
                              : (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.08),
                        },
                      }}
                    >
                      <Iconify icon="eva:close-fill" width={18} />
                    </Box>
                  </Box>
                </Stack>
              );
            },
          },
        ]}
        data={data}
        serverSide
        onServerSort={(column, sortData) => {
          setQuery((prev) => ({
            ...prev,
            sorting: sortQueryString(sortData),
          }));
        }}
        onServerPagination={(page: number, rowsPerPage: number) => {
          setQuery((prev) => ({
            ...prev,
            skipCount: page * rowsPerPage,
            maxResultCount: rowsPerPage,
          }));
        }}
      />{' '}
    </>
  );
};
