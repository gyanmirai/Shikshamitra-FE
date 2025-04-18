'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';
import React, { useMemo, useState, useEffect, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import { Add, Upload } from '@mui/icons-material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { PickersDay, DateCalendar } from '@mui/x-date-pickers';
import {
  Box,
  Paper,
  Button,
  Divider,
  MenuItem,
  Checkbox,
  MenuList,
  useTheme,
  TextField,
  Typography,
  Autocomplete,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSearchParam } from 'src/hooks/use-search-param';

import { GlobalIcons } from 'src/utils/icons';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { ScheduleType, scheduleTypeOptions } from 'src/enums/schedule-type';
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
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import { ExamTypeForm } from '../setting/exam-type';
import { SlotsForm } from '../setting/entrance-exam-slots';

/**
 * Main component for managing entrance exam screens and functionalities
 */
const EntranceExamScreen = () => {
  // const [view, setView] = React.useState('calender');
  // State for managing search parameters (currently unused)
  const [searchParams, setSearchParam] = useSearchParam({ view: 'calender' });
  // State for storing the data of the entrance exam being edited
  const [editData, setEditData] = useState(null);
  // State for storing the ID of the student to be moved to admission
  const [moveId, setMoveId] = useState<string | null>(null);
  // State indicating whether there are unsaved changes in the form
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // useDispatch hook for dispatching Redux actions
  const dispatch = useDispatch();
  // State for controlling the visibility of the result dialog
  const resultDialog = useBoolean();
  // State for controlling the visibility of the move confirmation popup
  const confirmMovePopup = useBoolean();

  // Query for fetching entrance exam data
  const { data: entranceExamData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEntranceExamQuery,
  });
  // Mutation for moving a student to admission
  const [moveToAdmission] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useMoveToAdmissionMutation,
    popupConfig: {
      successMessage: 'Student moved to Admission successfully',
      success: true,
    },
  });
  // MUI theme object
  const theme = useTheme();

  // Computed table data derived from entranceExamData
  const tableData = useMemo(
    () =>
      entranceExamData?.items?.map((item: any) => ({
        ...item,
        date: dayjs(item.examDate).format('DD-MM-YYYY'),
        examTime: `${dayjs(item.entranceExamSlot.startDate).format('hh:mm A')} to ${dayjs(
          item.entranceExamSlot.endDate
        ).format('hh:mm A')}`,
        name: `${item.studentEnrollment.firstName} ${item.studentEnrollment.lastName}`,
        medium: item.studentEnrollment.educationMedium.name,
        class: item.studentEnrollment.standard.name,
        status:
          item.marksObtained === null
            ? 'Pending'
            : item.marksObtained >= item.passingMark
              ? 'Pass'
              : 'Fail',
        percentage:
          item.marksObtained === null
            ? 0
            : +((item.marksObtained / item.totalMarks) * 100 || 0).toFixed(2),
        obtainMarks: item.marksObtained ?? '-',
      })),
    [entranceExamData]
  );

  // Computed calendar data derived from entranceExamData
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

  // Callback function for rendering actions in each row of the table
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
          <Iconify icon="carbon:result" sx={{ height: '16px', width: '16px' }} />
          Upload Result
        </MenuItem>

        <MenuItem
          onClick={async () => {
            confirmMovePopup.onTrue();
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

  // Handler function for closing the result dialog
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

  // State for storing selected students
  const [selectedStudents, setSelectedStudents] = useState<any>([]);
  // State for controlling the send instant notification dialog
  const sendInstantNotificationDialogValue = useBoolean();

  // Handler function for opening the send instant notification dialog
  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };

  return (
    <Box>
      <CustomBreadcrumbs
        description="This is the Entrance Exam tab, where you can manage students appearing for the exam as part of the admission process."
        heading="Entrance Exam"
        links={[{ name: 'Student' }, { name: 'Student Enrollment' }, { name: 'Entrance Exam' }]}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button startIcon={<Upload />} variant="contained" size="small">
            Upload Results
          </Button>
        }
      />
      <Box mt={2}>
        <CustomizableTable
          onSendNotification={handlerSendNotification}
          showCheckbox={selectedStudents.length !== 0}
          tableId="entrance-exam-table"
          noDataText={<>No Entrance Exam Data Found </>}
          searchFieldProps={{
            placeholder: 'Search by Date, Student, Medium, Class, Status...',
            label: 'Search by Date, Student, Medium, Class, Status...',
            sx: {
              maxWidth: '400px',
              width: '100%',
            },
          }}
          isLoading={isLoading}
          columns={[
            {
              id: 'checkBox',
              align: 'left',
              minWidth: '60px',
              isSort: false,
              isFilter: false,
              label: '',
              renderColumn() {
                return (
                  <Checkbox
                    checked={tableData?.length && selectedStudents?.length === tableData?.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents(tableData || []);
                      } else {
                        setSelectedStudents([]);
                      }
                    }}
                  />
                );
              },
              render(value, row) {
                return (
                  <Checkbox
                    checked={!!selectedStudents.some((i: any) => i.id === row.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents([...selectedStudents, row]);
                      } else {
                        setSelectedStudents(selectedStudents.filter((i: any) => i.id !== row.id));
                      }
                    }}
                  />
                );
              },
            },
            { id: 'date', label: 'Date', filterType: 'date' },
            { id: 'examTime', label: 'Exam Time' },
            {
              id: 'name',
              label: 'Student',
            },
            {
              id: 'medium',
              label: 'Medium',
            },
            {
              id: 'class',
              label: 'Class',
            },
            {
              id: 'passingMark',
              label: 'Passing Marks',
              filterType: 'number',
            },
            {
              id: 'totalMarks',
              label: 'Total Marks',
              filterType: 'number',
            },
            {
              id: 'obtainMarks',
              label: 'Obtained Marks',
              filterType: 'number',
            },
            {
              id: 'percentage',
              label: 'Percentage',
              filterType: 'number',
              render(value, row) {
                return `${value}%`;
              },
            },
            {
              id: 'status',
              label: 'Status',
              filterType: 'enum',
              enumOptions: EntranceExamStatusOptions,
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
              label: 'Action',
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
        title="Result"
        handleClose={() => {
          setEditData(null);
          resultDialog.onFalse();
        }}
        open={resultDialog.value}
      >
        <ResultForm handleClose={handleClose} editData={editData} />
      </CustomDialog>

      <ConfirmDialog
        title="Move"
        content="Are you sure want to move in admission ?"
        action={
          <LoadingButton
            variant="contained"
            loading={isLoading}
            color="error"
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
  standardName,
  studentEnrollmentId,
  handleClose,
}: {
  studentName: string;
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
    passingMarks: Yup.number()
      .nullable()
      .test(
        'less-than-total',
        'Passing marks should be less than total marks',
        (value, context) => {
          const { totalMarks } = context.parent;
          return value == null || (totalMarks != null && value < totalMarks);
        }
      ),
    slot: Yup.string().required('At least one slot should be selected'),
  });

  // Query hook to fetch exam slots
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  // State for controlling the visibility of the add exam type dialog (currently unused)
  const addExamTypeDialog = useBoolean();

  // Fetch entrance exam slots using a custom hook
  const { data: slots } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEntranceExamSlotQuery,
  });

  // Mutation hook for scheduling an exam
  const [scheduleExam, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddEntranceExamMutation,
  });

  // Query hook to get student count for slots
  const [getStudentCountByDate] = useQueryAndMutation({
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
    enableReinitialize: true,
    initialValues: {
      examDate: null,
      examType: '',
      scheduleType: ScheduleType.Individual,
      totalMarks: 0,
      isConfirmed: false,
      slots: allSlots || [],
      slot: '',
      passingMarks: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await scheduleExam({
          entranceExamSlotId: values.slot,
          studentEnrollmentId,
          examDate: dateConvertor(dayjs(values.examDate).format(dateFormat)),
          examType: values.examType,
          totalMarks: values.totalMarks,
          examScheduleType: values.scheduleType,
          passingMark: values.passingMarks,
        }).unwrap();
        handleClose(null, true);
      } catch (error) {
        console.log(error);
      }
      console.log(values);
    },
  });

  // Effect to update slots when exam date changes
  useEffect(() => {
    if (slots?.items?.length && formik.values.examDate) {
      (async () => {
        const getAllSlot = await Promise.all(
          slots?.items?.map(async (slot: any) => ({
            ...slot,
            label: `${dayjs(slot.startDate).format('hh:mm A')} to ${dayjs(slot.endDate).format('hh:mm A')}`,
            value: slot.id,
            studentCount: await getStudentCount(
              slot.id,
              dateConvertor(dayjs(formik.values.examDate).format(dateFormat), true)
            ),
          }))
        );
        setAllSlots(getAllSlot);
      })();
    }
  }, [formik.values.examDate, getStudentCount, slots?.items]);

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
      <Box display="flex" flexDirection="column" pl={2}>
        <Typography variant="body2" gutterBottom>
          <b>Student Name : </b>
          {studentName}
        </Typography>
        <Typography variant="body2" gutterBottom>
          <b>Class : </b>
          {standardName}
        </Typography>
      </Box>
      <Scrollbar
        sx={{
          p: 3,
          bgcolor: 'background.neutral',
        }}
      >
        <Grid container spacing={2}>
          <Grid xs={5}>
            <Paper>
              <DateCalendar
                value={formik.values.examDate}
                onChange={(value) => formik.setFieldValue('examDate', value)}
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
          <Grid xs={7}>
            <Paper sx={{ p: 1, height: '100%' }}>
              <Grid container spacing={2}>
                <Grid xs={4}>
                  <Autocomplete
                    options={[
                      { id: 1, examType: 'abc' },
                      { id: 2, examType: 'xyz' },
                    ]}
                    autoFocus
                    getOptionLabel={(option) => option.examType}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Exam Type"
                        placeholder="Search Exam Type"
                        size="small"
                        fullWidth
                        sx={{ width: '100%', minWidth: '200px' }}
                      />
                    )}
                    onChange={(e, value) => {
                      formik.setFieldValue('examType', value?.examType);
                    }}
                  />
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    textAlign="right"
                    color="primary.main"
                    fontSize={12}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => {
                      addExamTypeDialog.onTrue();
                    }}
                  >
                    Add Exam Type
                  </Typography>
                </Grid>
                <Grid xs={4}>
                  <TextField
                    name="totalMarks"
                    type="number"
                    value={formik.values.totalMarks}
                    onChange={formik.handleChange}
                    label="Total Marks"
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid xs={4}>
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
                      formik.setFieldValue('examType', value?.id);
                    }}
                  />
                </Grid>
                <Grid xs={4}>
                  <TextField
                    name="passingMarks"
                    type="number"
                    value={formik.values.passingMarks}
                    onChange={formik.handleChange}
                    label="Passing Marks"
                    size="small"
                    fullWidth
                  />
                  <Typography variant="caption" color="error">
                    {formik.errors.passingMarks}
                  </Typography>
                </Grid>
                <Grid xs={12}>
                  <Divider sx={{ my: 0.5 }} />
                </Grid>
                <Grid xs={12}>
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1">Slots</Typography>
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
                      {formik.values.slots.map((slot: any, index: number) => (
                        <Grid xs={6} key={index}>
                          <FormControlLabel
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
                      ))}
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
        <LoadingButton
          loading={isAddLoading}
          type="submit"
          variant="contained"
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          style={{ marginTop: '1rem' }}
        >
          Submit
        </LoadingButton>
      </DialogActions>
      <CustomDialog title="Slots" open={dialog.value} handleClose={dialog.onFalse}>
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
    },
    validationSchema: Yup.object({
      obtainedMarks: Yup.string().test(
        'is-less-than-total',
        'Obtained marks must be less than total marks',
        (value, context) => {
          const { totalMarks } = context.parent;
          return value == null || (totalMarks != null && value <= totalMarks);
        }
      ),
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
            examType: editData.examType,
            marksObtained: values.obtainedMarks,
            totalMarks: values.totalMarks,
            examScheduleType: editData.examScheduleType,
            passingMark: editData.passingMark,
          },
        }).unwrap();
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
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Scrollbar
        sx={{
          p: 3,
          bgcolor: 'background.neutral',
          //   height: 'calc(100vh - 150px)',
        }}
      >
        <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Obtained Marks"
              size="small"
              fullWidth
              name="obtainedMarks"
              value={formik.values.obtainedMarks}
              onChange={formik.handleChange}
              error={formik.touched.obtainedMarks && Boolean(formik.errors.obtainedMarks)}
              // helperText={formik.touched.obtainedMarks && formik.errors.obtainedMarks}
            />
            <Typography variant="caption" color="error">
              {formik.errors.obtainedMarks as string}
            </Typography>
            <TextField
              label="Total Marks"
              disabled
              size="small"
              fullWidth
              name="totalMarks"
              value={formik.values.totalMarks}
              onChange={formik.handleChange}
            />
          </Box>
        </BackPopUpChecked>
      </Scrollbar>
      <DialogActions sx={{ flexShrink: 0 }}>
        <Button onClick={() => handleClose(null, false)} style={{ marginTop: '1rem' }}>
          Cancel
        </Button>
        <LoadingButton
          loading={isLoading}
          type="submit"
          variant="contained"
          color="primary"
          style={{ marginTop: '1rem' }}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </Box>
  );
};
