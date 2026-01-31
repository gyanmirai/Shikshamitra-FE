'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import isoWeek from 'dayjs/plugin/isoWeek';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { useSelector, useDispatch } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { PickersDay, DateCalendar } from '@mui/x-date-pickers';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';
import { useMoveToAdmissionMutation } from 'src/redux/student/registration/registration-api';
import { useGetEntranceExamSlotQuery } from 'src/redux/student/entrance-exam-slot/entrance-exam-slot-api';
import {
  EntranceExamStatusType,
  EntranceExamStatusOptions,
  EntranceExamStatusTypeColors,
} from 'src/enums/entranceExam-type';
import {
  Box,
  Grid,
  Paper,
  Radio,
  Button,
  MenuItem,
  MenuList,
  TextField,
  Typography,
  DialogActions,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import {
  useGetEntranceExamQuery,
  useAddEntranceExamMutation,
  useUpdateEntranceExamMutation,
  useLazyGetStudentForSlotByDateQuery,
} from 'src/redux/student/entrance-exam/entrance-exam-api';

import { ExamTypeForm } from '../setting/exam-type';
import { SlotsForm } from '../setting/entrance-exam-slots';

dayjs.extend(isoWeek);

/**
 * Main component for managing entrance exam screens and functionalities
 */
const EntranceExamScreen = () => {
  // Search params hook for view state management
  // const [searchParams, setSearchParam] = useSearchParam({ view: 'calender' });
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  // State for managing edit data and move operations
  const [editData, setEditData] = useState<any | null>(null);
  // State for storing the ID of the student to be moved to admission
  const [moveId, setMoveId] = useState<string | null>(null);
  // State for managing the start date filter for entrance exams
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().startOf('isoWeek'));

  // State for managing the end date filter for entrance exams
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  // Redux state and dispatch hooks
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
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
    params: {
      startDate: dateConvertor(startDate?.format(dateFormat) || '', true),
      endDate: dateConvertor(endDate?.format(dateFormat) || '', true),
      educationMediumId: currentMedium.id,
    },
    options: {
      skip: !currentMedium.id,
    },
  });

  // Mutation hook for moving students to admission
  const [moveToAdmission] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useMoveToAdmissionMutation,
    popupConfig: { successMessage: 'Student moved to Admission successfully.', success: true },
  });

  const tableData = useMemo(
    () =>
      entranceExamData?.items?.map((item: any) => ({
        // Spread original item to preserve all backend fields
        ...item,

        // Field mappings: Backend → Frontend
        class: item.standard, // standard → class
        date: dayjs(item.examDate).format('DD-MM-YYYY'), // examDate → date (formatted)
        passingMark: item.passingMarks, // passingMarks → passingMark
        status: item.examStatus, // examStatus → status

        // Computed fields
        examTime: `${dayjs(item.examStartTime).format('hh:mm A')} to ${dayjs(
          item.examEndTime
        ).format('hh:mm A')}`,

        // Pass-through fields (already match column IDs):
        // - studentName
        // - totalMarks
        // - obtainedMarks
        // - percentage
        // - progress
      })),
    [entranceExamData]
  );

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
            if (row.progress < 50) {
              shikshaMitraToast.error({
                message: 'Please Complete Required Fields of Registration Form',
              });
              popover.onClose();
              return;
            }
            confirmMovePopup.onTrue();
            setEditData(row);
            // dialog.onTrue();
            setMoveId(row.studentId);
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
      resultDialog.onFalse();
      setEditData(null);
      dispatch(setIsChanges(false));
    } else {
      resultDialog.onFalse();
      setEditData(null);
    }
  };

  // State for managing selected students
  const [selectedStudents] = useState<any>([]);

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

  const columns: IColumn[] = useMemo(
    () => [
      { id: 'studentName', label: 'Student Name', align: 'left', sticky: true, minWidth: 180 },

      // { id: 'board', label: 'Board', align: 'left' },
      // { id: 'medium', label: 'Medium', align: 'left' },
      { id: 'class', label: 'Class', align: 'left' },
      { id: 'date', label: 'Date', filterType: 'date' },
      { id: 'examTime', label: 'Exam Time', align: 'left', minWidth: '120px' },
      {
        id: 'totalMarks',
        label: 'Total Marks',
        filterType: 'number',
        align: 'left',
        minWidth: 140,
        render: (value) => value || '-',
      },
      {
        id: 'passingMark',
        label: 'Passing Marks',
        filterType: 'number',
        align: 'left',
        minWidth: 140,
        render: (value) => value || '-',
      },
      {
        id: 'obtainedMarks',
        label: 'Obtained Marks',
        filterType: 'number',
        align: 'left',
        minWidth: 150,
      },
      {
        id: 'progress',
        label: 'Progress',
        align: 'left',
        sticky: true,
        filterType: 'number',
        render(value, row) {
          return (
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress
                variant="determinate"
                value={value}
                size={50}
                thickness={3}
                sx={{ color: value < 50 ? 'warning.main' : 'success.main' }}
              />
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
        id: 'percentage',
        label: 'Percentage',
        filterType: 'number',
        sticky: true,
        align: 'left',
        render(value, row) {
          return (
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress
                variant="determinate"
                value={value}
                size={50}
                thickness={3}
                sx={{ color: value < 50 ? 'warning.main' : 'success.main' }}
              />
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
          const color = EntranceExamStatusTypeColors[value as EntranceExamStatusType] as LabelColor;
          return (
            <Label color={color}>{EntranceExamStatusType[value as EntranceExamStatusType]}</Label>
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
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        description="Manage students participation in entrance exams for the admission process."
        heading="Entrance Exam"
        links={[
          { name: 'Student', href: '/student/enrollment/dashboard/' },
          { name: 'Student Enrollment', href: '/student/enrollment/entrance-exam/?view=calender' },
          { name: 'Entrance Exam' },
        ]}
      />
      <Paper elevation={2} sx={{ display: 'flex', gap: 1, alignItems: 'center', px: 1, py: 1 }}>
        <Box display="flex" gap={2}>
          <CustomDateRangePicker
            label="Start Date - End Date"
            value={[startDate, endDate]}
            dateFormat="DD/MM/YYYY"
            onChange={(value) => {
              setStartDate(value[0]);
              setEndDate(value[1]);
            }}
          />
        </Box>
      </Paper>
      <CustomizableTable
        onSendNotification={handlerSendNotification}
        showCheckbox={selectedStudents.length !== 0}
        tableId="entrance-exam-table"
        noDataText={<>No Entrance Exam Data Found </>}
        isLoading={isLoading}
        columns={columns}
        data={tableData || []}
      />{' '}
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
              title="Input exam scores to save the student's result."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <ResultForm handleClose={handleClose} editData={editData} />
      </CustomDialog>
      <ConfirmDialog
        // title="Move"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Move</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="Manage student exam details and move eligible ones to admission."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        content={
          <>
            {editData?.status === EntranceExamStatusType.Pending ? (
              <>
                The entrance exam has not been conducted yet. Are you sure you want to proceed with
                moving <strong>{editData?.name || ''}</strong> to admission?
              </>
            ) : editData?.status === EntranceExamStatusType.Fail ? (
              <>
                The student has failed the entrance exam. Are you sure you want to proceed with
                moving <strong>{editData?.name || ''}</strong> to admission?
              </>
            ) : (
              <>
                Are you sure you want to move student <strong>{editData?.name || ''}</strong> to
                admission?
              </>
            )}
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
  educationBoard: string;
  educationMedium: string;
  standardName: string;
  studentEnrollmentId: string;
  handleClose: (_e: any, isSubmit: boolean) => void;
}) => {
  // State to store all available exam slots
  const [allSlots, setAllSlots] = useState<any[]>([]);
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Dialog state for slot management
  const dialog = useBoolean();

  // Validation schema for exam form fields
  const validationSchema = Yup.object({
    examDate: Yup.date().required('Exam date is required'),
    slot: Yup.string().required('At least one slot should be selected'),
  });

  // State for controlling the visibility of the add exam type dialog (currently unused)
  const addExamTypeDialog = useBoolean();

  // Fetch entrance exam slots using a custom hook
  // Query hook to fetch exam slots
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues: { examDate: dayjs(), isConfirmed: false, slots: allSlots || [], slot: '' },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await scheduleExam({
          studentId: studentEnrollmentId,
          body: {
            entranceExamSlotId: values.slot,
          },
        }).unwrap();
        shikshaMitraToast.success({
          message: `Extrance Exam Schedule of ${studentName} on ${dayjs(values.examDate).format('DD-MM-YYYY')}`,
        });
        handleClose(null, true);
      } catch (error) {
        console.error(error);
      }
    },
  });

  // Fetch entrance exam slots using a custom hook
  // Query hook to fetch exam slots
  const { data: slots, isLoading: isSlotsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEntranceExamSlotQuery,
    params: {
      academicYearId: currentYear?.id || '',
      startDate: dateConvertor(dayjs(formik.values.examDate).format(dateFormat), true),
      endDate: dateConvertor(dayjs(formik.values.examDate).format(dateFormat), true),
    },
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
        return 0;
      }
    },
    [getStudentCountByDate]
  );

  // Formik instance for form handling

  const handleGetAllStudentCount = useCallback(
    async (date: string) => {
      if (!slots?.items?.length) return;

      try {
        const formattedDate = dateConvertor(dayjs(date).format(dateFormat), true);

        const updatedSlots = await Promise.all(
          slots.items.map(async (slot: any) => {
            const label = `${dayjs(slot.startDate).format('hh:mm A')} to ${dayjs(slot.endDate).format('hh:mm A')}`;
            const studentCount = await getStudentCount(slot.id, formattedDate);

            return { ...slot, label, value: slot.id, studentCount };
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
    formik.setFieldValue('slots', slots?.items || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots]);

  const handleCloseExamType = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      addExamTypeDialog.onFalse();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      addExamTypeDialog.onFalse();
    }
  };

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValue={formik.values}>
      <DialogScrollContent style={{ height: '100%' }}>
        <Paper sx={{ p: 2, height: '100%' }}>
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
                {educationBoard}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Typography variant="subtitle2" color="text.primary">
                Medium :
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {educationMedium}
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
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '100%' }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 4 }}>
              <Paper sx={{ height: '100%' }}>
                <DateCalendar
                  value={formik.values.examDate}
                  onChange={(value) => {
                    formik.setFieldValue('examDate', value);
                    if (value) {
                      handleGetAllStudentCount(dayjs(value).format('YYYY-MM-DD'));
                    }
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
                  {formik.errors.examDate as string}
                </Typography>
              )}
            </Grid>

            <Grid size={{ xs: 8 }}>
              <Paper sx={{ p: 1, height: '100%' }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <Box>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        padding={2}
                      >
                        <Typography variant="h6">Slots</Typography>
                      </Box>

                      <Grid container spacing={2}>
                        {isStudentCountLoading || isSlotsLoading ? (
                          <Grid size={{ xs: 12 }}>
                            <Box className="loader" height={24} />
                          </Grid>
                        ) : formik.values.slots.length === 0 ? (
                          <EmptyContent title="No slots available." />
                        ) : (
                          formik.values.slots.map((slot: any, index: number) => (
                            <Grid size={{ xs: 6 }} key={index}>
                              <FormControlLabel
                                sx={{ marginLeft: 1 }}
                                control={
                                  <Radio
                                    checked={slot.id === formik.values.slot}
                                    size="small"
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        formik.setFieldValue('slot', slot.id);
                                      } else {
                                        formik.setFieldValue('slot', '');
                                      }
                                    }}
                                  />
                                }
                                label={`${slot.slotName} (${slot.startTime} - ${slot.endTime})`}
                              />
                              <Label variant="soft" color="success">
                                {slot.studentCount} / {slot.studentLimit}
                              </Label>
                            </Grid>
                          ))
                        )}
                      </Grid>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
              {formik.touched.slot && formik.errors.slot && (
                <Typography variant="caption" color="error">
                  {formik.errors.slot}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Scrollbar>
      </DialogScrollContent>
      <DialogActions>
        <Button
          variant="outlined"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => {
            handleClose(null, false);
          }}
          size="small"
        >
          Cancel
        </Button>
        <LoadingButton
          loading={isAddLoading}
          onClick={(e: any) => {
            formik.handleSubmit(e);
          }}
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
        <SlotsForm handleClose={dialog.onFalse} editData={null} date={null} />
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
    </BackPopUpChecked>
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
      obtainedMarks: Yup.number()
        .test(
          'is-less-than-total',
          'Obtained Marks must be less than total marks',
          (value, context) => {
            const { totalMarks } = context.parent;
            return value ? value <= totalMarks : true;
          }
        )
        .required('Obtained Marks is required'),
      passingMarks: Yup.number()
        .test(
          'is-less-than-total',
          'Passing Marks must be less than total marks',
          (value, context) => {
            const { totalMarks } = context.parent;
            return value ? value <= totalMarks : true;
          }
        )
        .required('Passing Marks is required'),
      totalMarks: Yup.number().required('Total Marks is required'),
    }),
    onSubmit: async (values) => {
      try {
        await updateMarks({
          id: editData.studentId,
          body: {
            totalMarks: values.totalMarks,
            passingMarks: values.passingMarks,
            obtainedMarks: values.obtainedMarks,
          },
        }).unwrap();
        shikshaMitraToast.success({
          message: `${editData?.studentName || ''}'s marks updated successfully`,
        });
        handleClose(null, true);
      } catch (error) {
        console.error(error);
      }
    },
  });

  /**
   * Custom hook for handling API mutation to update exam marks
   * Returns update function and loading state
   */
  const [updateMarks, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateEntranceExamMutation,
  });

  return (
    <>
      <DialogScrollContent>
        <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
          <Box display="flex" flexDirection="column" gap={3}>
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
