'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';
import React, { useMemo, useState, useEffect, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { PickersDay, DatePicker, DateCalendar } from '@mui/x-date-pickers';
import {
  Box,
  Paper,
  Button,
  MenuItem,
  Checkbox,
  MenuList,
  useTheme,
  TextField,
  Typography,
  DialogActions,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSearchParam } from 'src/hooks/use-search-param';

import { GlobalIcons } from 'src/utils/icons';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useMoveToAdmissionMutation } from 'src/redux/student/registration/registration-api';
import { useGetEntranceExamSlotQuery } from 'src/redux/student/entrance-exam-slot/entrance-exam-slot-api';
import {
  EntranceExamStatusType,
  EntranceExamStatusOptions,
  EntranceExamStatusTypeColors,
} from 'src/enums/entranceExam-type';
import {
  useGetEntranceExamQuery,
  useAddEntranceExamMutation,
  useUpdateEntranceExamMutation,
  useLazyGetStudentForSlotByDateQuery,
} from 'src/redux/student/entrance-exam/entrance-exam-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import { ExamTypeForm } from '../setting/exam-type';
import { SlotsForm } from '../setting/entrance-exam-slots';

/**
 * Main component for managing entrance exam screens and functionalities
 */
const EntranceExamScreen = () => {
  // Search params hook for view state management
  const [searchParams, setSearchParam] = useSearchParam({ view: 'calender' });

  // State for managing edit data and move operations
  const [editData, setEditData] = useState<any | null>(null);
  // State for storing the ID of the student to be moved to admission
  const [moveId, setMoveId] = useState<string | null>(null);
  // State for managing the start date filter for entrance exams
  const [startDate, setStartDate] = useState<Dayjs | null>(null);

  // State for managing the end date filter for entrance exams
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  // Redux state and dispatch hooks
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // useDispatch hook for dispatching Redux actions
  const dispatch = useDispatch();

  // Dialog control hooks
  const resultDialog = useBoolean();
  // State for controlling the visibility of the move confirmation popup
  const confirmMovePopup = useBoolean();

  // Query hook for fetching entrance exam data
  const { data: entranceExamData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEntranceExamQuery,
  });

  // Mutation hook for moving students to admission
  const [moveToAdmission] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useMoveToAdmissionMutation,
    popupConfig: {
      successMessage: 'Student moved to Admission successfully',
      success: true,
    },
  });

  // Material-UI theme hook
  const theme = useTheme();

  /**
   * Memoized table data transformation
   */
  const tableData = useMemo(
    () =>
      entranceExamData?.items?.map((item: any) => ({
        ...item,
        date: dayjs(item.examDate).format('DD-MM-YYYY'),
        examTime: `${dayjs(item.entranceExamSlot.startDate).format('hh:mm A')} to ${dayjs(
          item.entranceExamSlot.endDate
        ).format('hh:mm A')}`,
        name: `${item.studentEnrollment.lastName} ${item.studentEnrollment.firstName} ${item.studentEnrollment.middleName}`,
        medium: item.studentEnrollment.educationMedium.name,
        class: item.studentEnrollment.standard.name,
        status: item.marksObtained === null ? 0 : item.marksObtained >= item.passingMark ? 1 : 2,
        percentage:
          item.marksObtained === null
            ? 0
            : +((item.marksObtained / item.totalMarks) * 100 || 0).toFixed(2),
        obtainMarks: item.marksObtained ?? '-',
      })),
    [entranceExamData]
  );

  /**
   * Memoized calendar data transformation
   */
  const calendarData = useMemo(
    () =>
      entranceExamData?.items.map((i: any) => {
        const startTime = dayjs(i.entranceExamSlot.startDate).format('hh:mm A');
        const endTime = dayjs(i.entranceExamSlot.endDate).format('hh:mm A');

        const startExamDate = dayjs(
          dayjs(
            `${dayjs(i.examDate).format('DD-MM-YYYY')} ${startTime}`,
            'DD-MM-YYYY hh:mm A'
          ).format('YYYY-MM-DD hh:mm A')
        ).format();
        const endExamDate = dayjs(
          dayjs(
            `${dayjs(i.examDate).format('DD-MM-YYYY')} ${endTime}`,
            'DD-MM-YYYY hh:mm A'
          ).format('YYYY-MM-DD hh:mm A')
        ).format();

        const status =
          i.marksObtained === null ? 'Pending' : i.marksObtained >= i.passingMark ? 'Pass' : 'Fail';
        let color: LabelColor = 'error';
        if (status === 'Pending') {
          color = 'warning';
        } else if (status === 'Pass') {
          color = 'success';
        } else {
          color = 'error';
        }
        return {
          ...i,
          start: startExamDate,
          end: endExamDate,
          color: theme.palette[color].main,
          allDay: false,
          textColor: theme.palette[color].main,
          title: `${i.studentEnrollment.firstName} ${i.studentEnrollment.lastName}`,
          description: i.reason,
        };
      }) || [],
    [entranceExamData?.items, theme.palette]
  );

  /**
   * Callback for handling row actions
   */
  const actions = useCallback(
    ({ popover }: any, row: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            setEditData(row);
            resultDialog.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon={GlobalIcons.upload} sx={{ height: '16px', width: '16px' }} />
          Upload Result
        </MenuItem>

        <MenuItem
          onClick={async () => {
            confirmMovePopup.onTrue();
            setEditData(row);
            setMoveId(row.id);
            popover.onClose();
          }}
        >
          <Iconify icon="mdi:arrow-right-circle" sx={{ height: '16px', width: '16px' }} />
          Move To Admission
        </MenuItem>
      </MenuList>
    ),
    [confirmMovePopup, resultDialog]
  );

  /**
   * Handler for dialog close events
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      console.log('Are u sure to leave this page ');
      resultDialog.onFalse();
      setEditData(null);
      dispatch(setIsChanges(false));
    } else {
      resultDialog.onFalse();
      setEditData(null);
    }
  };

  // State for managing selected students
  const [selectedStudents, setSelectedStudents] = useState<any>([]);

  // Dialog control for instant notifications
  const sendInstantNotificationDialogValue = useBoolean();

  /**
   * Handler for sending notifications
   */
  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };

  return (
    <Box>
      <CustomBreadcrumbs
        description="Manage students for the entrance exam as part of admission process."
        heading="Entrance Exam"
        links={[
          { name: 'Student', href: '/student/enrollment/dashboard/' },
          { name: 'Student Enrollment', href: '/student/enrollment/entrance-exam/?view=calender' },
          { name: 'Entrance Exam' },
        ]}
        sx={{ mb: 2 }}
      />
      <Box display="flex" gap={2} marginLeft={1} justifyContent="space-between" alignItems="center">
        <Box display="flex" gap={2}>
          <DatePicker
            label="Start Date"
            format="DD-MM-YYYY"
            slotProps={{
              textField: {
                sx: { width: '250px' },
                size: 'small',
              },
            }}
            onChange={(value) => {
              setStartDate(value);
            }}
          />
          <DatePicker
            label="End Date"
            format="DD-MM-YYYY"
            slotProps={{
              textField: {
                sx: { width: '250px' },
                size: 'small',
              },
            }}
            onChange={(value) => {
              setEndDate(value);
            }}
          />
        </Box>
        {/* <Button startIcon={<Upload />} variant="contained" size="small">
          Upload Results
        </Button> */}
      </Box>
      <Box mt={2}>
        <CustomizableTable
          onSendNotification={handlerSendNotification}
          showCheckbox={selectedStudents.length !== 0}
          tableId="entrance-exam-table"
          noDataText={<>No Entrance Exam Data Found </>}
          isLoading={isLoading}
          columns={[
            // {
            //   id: 'checkBox',
            //   align: 'left',
            //   minWidth: '60px',
            //   isSort: false,
            //   sticky: true,
            //   isFilter: false,
            //   label: '',
            //   renderColumn() {
            //     return (
            //       <Checkbox
            //         checked={tableData?.length && selectedStudents?.length === tableData?.length}
            //         onChange={(e) => {
            //           if (e.target.checked) {
            //             setSelectedStudents(tableData || []);
            //           } else {
            //             setSelectedStudents([]);
            //           }
            //         }}
            //       />
            //     );
            //   },
            //   render(value, row) {
            //     return (
            //       <Checkbox
            //         checked={!!selectedStudents.some((i: any) => i.id === row.id)}
            //         onChange={(e) => {
            //           if (e.target.checked) {
            //             setSelectedStudents([...selectedStudents, row]);
            //           } else {
            //             setSelectedStudents(selectedStudents.filter((i: any) => i.id !== row.id));
            //           }
            //         }}
            //       />
            //     );
            //   },
            // },
            {
              id: 'name',
              label: 'Student Name',
              align: 'left',
              sticky: true,
              minWidth: 180,
            },
            {
              id: 'class',
              label: 'Class',
              align: 'left',
            },
            { id: 'date', label: 'Date', filterType: 'date' },
            { id: 'examTime', label: 'Exam Time', align: 'left', minWidth: '120px' },
            {
              id: 'medium',
              label: 'Medium',
              align: 'left',
            },
            {
              id: 'passingMark',
              label: 'Passing Marks',
              filterType: 'number',
              align: 'left',
              minWidth: 140,
            },
            {
              id: 'totalMarks',
              label: 'Total Marks',
              filterType: 'number',
              align: 'left',
              minWidth: 140,
            },
            {
              id: 'obtainMarks',
              label: 'Obtained Marks',
              filterType: 'number',
              align: 'left',
              minWidth: 150,
            },
            {
              id: 'percentage',
              label: 'Percentage',
              filterType: 'number',
              sticky: true,
              align: 'left',
              render(value, row) {
                return (
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress variant="determinate" value={value} size={50} thickness={3} />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography
                        variant="body2"
                        component="small"
                        color="text.secondary"
                        sx={{ fontSize: '12px' }}
                      >
                        {value}%
                      </Typography>
                    </Box>
                  </Box>
                );
              },
            },
            {
              id: 'status',
              label: 'Status',
              filterType: 'enum',
              enumOptions: EntranceExamStatusOptions,
              align: 'left',
              sticky: true,
              render(value, row) {
                const color = EntranceExamStatusTypeColors[
                  value as EntranceExamStatusType
                ] as LabelColor;
                return (
                  <Label color={color}>
                    {EntranceExamStatusType[value as EntranceExamStatusType]}
                  </Label>
                );
              },
            },
            {
              id: 'action',
              label: 'Actions',
              align: 'left',
              isFilter: false,
              sticky: true,
              isSort: false,
              render: (value, row) => (
                <ThreeDotsActions placement="right-top" actions={(props) => actions(props, row)} />
              ),
            },
          ]}
          data={tableData || []}
        />{' '}
      </Box>
      <CustomDialog
        open={resultDialog.value}
        handleClose={() => {
          setEditData(null);
          resultDialog.onFalse();
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Result</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="Update entrance exam results by entering total, passing, and obtained marks for students."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <ResultForm handleClose={handleClose} editData={editData} />
      </CustomDialog>

      <ConfirmDialog
        title="Move"
        content={
          <>
            Are you sure want to move student <strong>{editData?.name || ''}</strong> in admission ?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            loading={isLoading}
            size="small"
            startIcon={<Iconify icon="mdi:arrow-right-circle" />}
            onClick={async () => {
              await moveToAdmission(moveId);
              confirmMovePopup.onFalse();
            }}
          >
            Move
          </LoadingButton>
        }
        open={confirmMovePopup.value}
        onClose={() => {
          confirmMovePopup.onFalse();
          setMoveId(null);
        }}
      />

      {sendInstantNotificationDialogValue.value && (
        <SendInstantNotificationDialog
          open={sendInstantNotificationDialogValue.value}
          onClose={sendInstantNotificationDialogValue.onFalse}
          data={[]}
          userList={selectedStudents}
        />
      )}
    </Box>
  );
};

export default EntranceExamScreen;

// Component for handling exam form functionality including scheduling exams and managing slots
export const ExamForm = ({
  studentName,
  educationBoard,
  educationMedium,
  standardName,
  studentEnrollmentId,
  handleClose,
}: {
  studentName: string;
  educationBoard: { name: string };
  educationMedium: { name: string };
  standardName: string;
  studentEnrollmentId: string;
  handleClose: (_e: any, isSubmit: boolean) => void;
}) => {
  // State to store all available exam slots
  const [allSlots, setAllSlots] = useState<any[]>([]);

  // Dialog state for slot management
  const dialog = useBoolean();

  // Validation schema for exam form fields
  const validationSchema = Yup.object({
    examDate: Yup.date().required('Exam date is required'),
    // passingMarks: Yup.number()
    //   .nullable()
    //   .test(
    //     'less-than-total',
    //     'Passing marks should be less than total marks',
    //     (value, context) => {
    //       const { totalMarks } = context.parent;
    //       return value == null || (totalMarks != null && value < totalMarks);
    //     }
    //   ),
    // examType: Yup.string().required('Exam type is required'),
    slot: Yup.string().required('At least one slot should be selected'),
  });

  // State for controlling the visibility of the add exam type dialog (currently unused)
  const addExamTypeDialog = useBoolean();

  // Fetch entrance exam slots using a custom hook
  // Query hook to fetch exam slots
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  // Fetch entrance exam slots using a custom hook
  // Query hook to fetch exam slots
  const { data: slots } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEntranceExamSlotQuery,
  });

  // Mutation hook for scheduling exams
  const [scheduleExam, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddEntranceExamMutation,
  });

  // Query hook to get student count for slots
  const [getStudentCountByDate, { isLoading: isStudentCountLoading }] = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useLazyGetStudentForSlotByDateQuery,
  });

  // Callback function to fetch student count for a specific slot and date
  const getStudentCount = useCallback(
    async (slotId: string, date: string) => {
      try {
        const res = await getStudentCountByDate({ slotId, examDate: date }).unwrap();
        return res.studentCount;
      } catch (e) {
        console.log(e);
        return 0;
      }
    },
    [getStudentCountByDate]
  );

  // Formik instance for form handling
  const formik = useFormik({
    // enableReinitialize: true,
    initialValues: {
      examDate: null,
      // examType: '',
      // scheduleType: ScheduleType.Individual,
      // totalMarks: 0,
      isConfirmed: false,
      slots: allSlots || [],
      slot: '',
      // passingMarks: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await scheduleExam({
          entranceExamSlotId: values.slot,
          studentEnrollmentId,
          examDate: dateConvertor(dayjs(values.examDate).format(dateFormat)),
          // examType: values.examType,
          // totalMarks: values.totalMarks,
          // examScheduleType: values.scheduleType,
          // passingMark: values.passingMarks,
        }).unwrap();
        handleClose(null, true);
      } catch (error) {
        console.log(error);
      }
      console.log(values);
    },
  });

  const handleGetAllStudentCount = useCallback(
    async (date: string) => {
      if (!slots?.items?.length) return;

      try {
        const formattedDate = dateConvertor(dayjs(date).format(dateFormat), true);

        const updatedSlots = await Promise.all(
          slots.items.map(async (slot: any) => {
            const label = `${dayjs(slot.startDate).format('hh:mm A')} to ${dayjs(slot.endDate).format('hh:mm A')}`;
            const studentCount = await getStudentCount(slot.id, formattedDate);

            return {
              ...slot,
              label,
              value: slot.id,
              studentCount,
            };
          })
        );

        setAllSlots(updatedSlots);
      } catch (error) {
        console.error('Failed to fetch student counts:', error);
      }
    },
    [getStudentCount, slots?.items]
  );

  // Effect to update form slots when allSlots changes
  useEffect(() => {
    formik.setFieldValue('slots', allSlots || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSlots]);

  const handleCloseExamType = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      addExamTypeDialog.onFalse();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      addExamTypeDialog.onFalse();
    }
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      {/* <BackPopUpChecked initialValues={formik.initialValues} currentValue={formik.values}> */}
      <Paper sx={{ p: 2 }}>
        <Box display="flex" gap={4}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Typography variant="subtitle2" color="text.primary">
              Student Name :
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {studentName}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Typography variant="subtitle2" color="text.primary">
              Board :
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {educationBoard?.name}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Typography variant="subtitle2" color="text.primary">
              Medium :
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {educationMedium?.name}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2" color="text.primary">
              Class :
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {' '}
              {standardName}
            </Typography>
          </Box>
        </Box>
      </Paper>
      <Scrollbar
        sx={{
          p: 2,
          bgcolor: 'background.neutral',
        }}
      >
        <Grid container spacing={3}>
          <Grid xs={4}>
            <Paper>
              <DateCalendar
                value={formik.values.examDate}
                onChange={(value) => {
                  formik.setFieldValue('examDate', value);
                  handleGetAllStudentCount(value);
                }}
                disablePast
                slots={{
                  day: (props: any) => {
                    const { day } = props;
                    const absent = day.format('DD-MM-YYYY') === '11-09-2024';
                    return (
                      <PickersDay
                        {...props}
                        sx={absent ? { bgcolor: 'error.main', color: 'white' } : {}}
                      />
                    );
                  },
                }}
              />
            </Paper>
            {formik.touched.examDate && formik.errors.examDate && (
              <Typography variant="caption" color="error">
                {formik.errors.examDate}
              </Typography>
            )}
          </Grid>
          <Grid xs={8}>
            <Paper sx={{ p: 1, height: '100%' }}>
              <Grid container spacing={2}>
                {/* <Grid xs={4}>
                  <TextField
                    name="examType"
                    value={formik.values.examType}
                    onChange={formik.handleChange}
                    error={formik.touched.examType && Boolean(formik.errors.examType)}
                    helperText={formik.touched.examType && formik.errors.examType}
                    label="Exam Type"
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid xs={4}>
                  <TextField
                    name="totalMarks"
                    type="number"
                    value={formik.values.totalMarks}
                    onChange={formik.handleChange}
                    label="Total Marks"
                    error={formik.touched.totalMarks && Boolean(formik.errors.totalMarks)}
                    helperText={formik.touched.totalMarks && formik.errors.totalMarks}
                    size="small"
                    fullWidth
                  />
                </Grid> */}
                {/* <Grid xs={4}>
                  <Autocomplete
                    options={scheduleTypeOptions || []}
                    getOptionLabel={(option) => option.name}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Schedule Type"
                        placeholder="Search Schedule Type"
                        size="small"
                        fullWidth
                        sx={{ width: '100%', minWidth: '200px' }}
                      />
                    )}
                    onChange={(e, value) => {
                      formik.setFieldValue('scheduleType', value?.id);
                    }}
                  />
                </Grid> */}
                {/* <Grid xs={4}>
                  <TextField
                    name="passingMarks"
                    type="number"
                    value={formik.values.passingMarks}
                    onChange={formik.handleChange}
                    label="Passing Marks"
                    error={formik.touched.passingMarks && Boolean(formik.errors.passingMarks)}
                    helperText={formik.touched.passingMarks && formik.errors.passingMarks}
                    size="small"
                    fullWidth
                  />
                  <Typography variant="caption" color="error">
                    {formik.errors.passingMarks}
                  </Typography>
                </Grid> */}
                {/* <Grid xs={12}>
                  <Divider sx={{ my: 0.5 }} />
                </Grid> */}
                <Grid xs={12}>
                  <Box>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      padding={2}
                    >
                      <Typography variant="h6">Slots</Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={dialog.onTrue}
                      >
                        Slot
                      </Button>
                    </Box>

                    <Grid container spacing={2}>
                      {isStudentCountLoading ? (
                        <Box className="loading" />
                      ) : formik.values.slots.length === 0 ? (
                        <EmptyContent title="Please select the date." />
                      ) : (
                        formik.values.slots.map((slot: any, index: number) => (
                          <Grid xs={6} key={index}>
                            <FormControlLabel
                              sx={{ marginLeft: 1 }}
                              control={
                                <Checkbox
                                  checked={slot.value === formik.values.slot}
                                  size="small"
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      formik.setFieldValue('slot', slot.value);
                                    } else {
                                      formik.setFieldValue('slot', '');
                                    }
                                  }}
                                />
                              }
                              label={slot.label}
                            />
                            <Label variant="soft" color="success">
                              {slot.studentCount} / {slot.studentLimit}
                            </Label>
                          </Grid>
                        ))
                      )}
                    </Grid>
                    {formik.touched.slot && formik.errors.slot && (
                      <Typography variant="caption" color="error">
                        {formik.errors.slot}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Scrollbar>
      <DialogActions sx={{ flexShrink: 0 }}>
        <Button
          variant="outlined"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => {
            handleClose(null, false);
          }}
        >
          Cancel
        </Button>
        <LoadingButton
          loading={isAddLoading}
          type="submit"
          variant="contained"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          size="small"
        >
          Submit
        </LoadingButton>
      </DialogActions>
      <CustomDialog
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6">Slot</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="This is the Exam Slots section, where you can create slots for the entrance exam by configuring the student limit, room number, and other necessary parameters."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        open={dialog.value}
        handleClose={dialog.onFalse}
      >
        <SlotsForm handleClose={dialog.onFalse} editData={null} />
      </CustomDialog>

      <CustomDialog
        open={addExamTypeDialog.value}
        handleClose={() => {
          addExamTypeDialog.onFalse();
        }}
        title="Exam Type"
      >
        <ExamTypeForm
          handleClose={() => {
            handleCloseExamType(null, false);
          }}
          editData={null}
        />
      </CustomDialog>
      {/* </BackPopUpChecked> */}
    </form>
  );
};

/**
 * Form component for handling entrance exam results
 * @param {Object} editData - Data of the exam result to be edited
 * @param {Function} handleClose - Callback function to handle form closure
 */
const ResultForm = ({
  editData,
  handleClose,
}: {
  editData: any;
  handleClose: (e: any, isSubmit: boolean) => void;
}) => {
  /**
   * Formik instance for form handling with validation and submission logic
   */
  const formik = useFormik({
    initialValues: {
      obtainedMarks: editData?.marksObtained ?? null,
      totalMarks: editData?.totalMarks,
      status: editData?.status,
      passingMarks: editData?.passingMark,
    },
    validateOnChange: true,
    validationSchema: Yup.object({
      obtainedMarks: Yup.string()
        .test(
          'is-less-than-total',
          'Obtained marks must be less than total marks',
          (value, context) => {
            const { totalMarks } = context.parent;
            return value == null || (totalMarks != null && value <= totalMarks);
          }
        )
        .required('Obtained marks is required'),
      passingMarks: Yup.string()
        .test(
          'is-less-than-total',
          'Passing marks must be less than total marks',
          (value, context) => {
            const { totalMarks } = context.parent;
            return value == null || (totalMarks != null && value <= totalMarks);
          }
        )
        .required('Passing marks is required'),
      totalMarks: Yup.string().required('Total marks is required'),
    }),
    onSubmit: async (values) => {
      console.log(values);
      try {
        await updateMarks({
          id: editData.id,
          body: {
            entranceExamSlotId: editData.entranceExamSlotId,
            studentEnrollmentId: editData.studentEnrollmentId,
            examDate: editData.examDate,
            // examType: editData.examType,
            passingMark: values.passingMarks,
            marksObtained: values.obtainedMarks,
            totalMarks: values.totalMarks,
            // examScheduleType: editData.examScheduleType,
          },
        }).unwrap();
        shikshaMitraToast.success({
          message: `${editData?.name || ''} marks updated successfully`,
        });
        handleClose(null, true);
      } catch (error) {
        console.log(error);
      }
    },
  });

  /**
   * Custom hook for handling API mutation to update exam marks
   * Returns update function and loading state
   */
  const [updateMarks, { isLoading }] = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useUpdateEntranceExamMutation,
  });

  return (
    <>
      <DialogScrollContent>
        <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
          <Box display="flex" flexDirection="column" gap={2}>
            <ShakingTextField
              error={formik.touched.totalMarks && Boolean(formik.errors.totalMarks)}
            >
              <TextField
                label="Total Marks *"
                size="small"
                fullWidth
                type="number"
                name="totalMarks"
                value={formik.values.totalMarks}
                onChange={formik.handleChange}
                error={formik.touched.totalMarks && Boolean(formik.errors.totalMarks)}
                helperText={(formik.touched.totalMarks && formik.errors.totalMarks) as string}
              />
            </ShakingTextField>
            <ShakingTextField
              error={formik.touched.passingMarks && Boolean(formik.errors.passingMarks)}
            >
              <TextField
                label="Passing Marks *"
                size="small"
                fullWidth
                name="passingMarks"
                type="number"
                value={formik.values.passingMarks}
                onChange={formik.handleChange}
                error={formik.touched.passingMarks && Boolean(formik.errors.passingMarks)}
                helperText={(formik.touched.passingMarks && formik.errors.passingMarks) as string}
              />
            </ShakingTextField>
            <ShakingTextField
              error={formik.touched.obtainedMarks && Boolean(formik.errors.obtainedMarks)}
            >
              <TextField
                label="Obtained Marks *"
                size="small"
                fullWidth
                type="number"
                name="obtainedMarks"
                value={formik.values.obtainedMarks}
                onChange={formik.handleChange}
                error={formik.touched.obtainedMarks && Boolean(formik.errors.obtainedMarks)}
                helperText={(formik.touched.obtainedMarks && formik.errors.obtainedMarks) as string}
              />
            </ShakingTextField>
            {/* <Typography variant="caption" color="error">
              {formik.errors.obtainedMarks as string}
            </Typography> */}

            {/* <Box>
              <FormControlLabel
                control={
                  <Radio
                    checked={formik.values.status === 1}
                    onChange={() => formik.setFieldValue('status', 1)}
                  />
                }
                label="Pass"
              />
              <FormControlLabel
                control={
                  <Radio
                    checked={formik.values.status === 2}
                    onChange={() => formik.setFieldValue('status', 2)}
                  />
                }
                label="Fail"
              />
            </Box> */}
          </Box>
        </BackPopUpChecked>
      </DialogScrollContent>
      <DialogActions>
        <Button
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          variant="outlined"
          onClick={() => handleClose(null, false)}
        >
          Cancel
        </Button>
        <LoadingButton
          size="small"
          loading={isLoading}
          onClick={(e: any) => formik.handleSubmit(e)}
          variant="contained"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </>
  );
};
