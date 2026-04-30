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
import sortQueryString from 'src/utils/sort-query-string';
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
  useGetEntranceExamQuery,
  useAddEntranceExamMutation,
  useUpdateEntranceExamMutation,
  useLazyGetStudentForSlotByDateQuery,
} from 'src/redux/student/entrance-exam/entrance-exam-api';
import {
  Box,
  Paper,
  Radio,
  Avatar,
  Button,
  Divider,
  MenuItem,
  MenuList,
  TextField,
  Typography,
  DialogActions,
  LinearProgress,
  CircularProgress,
} from '@mui/material';

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
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs().endOf('day'));
  // Redux state and dispatch hooks
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  // useDispatch hook for dispatching Redux actions
  const dispatch = useDispatch();

  // Dialog control hooks
  const resultDialog = useBoolean();
  const viewDialog = useBoolean();
  // State for controlling the visibility of the move confirmation popup
  const confirmMovePopup = useBoolean();
  const [viewData, setViewData] = useState<any | null>(null);

  const [query, setQuery] = useState({
    sorting: '',
    skipCount: 0,
    maxResultCount: 10,
  });

  // Query hook for fetching entrance exam data
  const {
    data: entranceExamData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEntranceExamQuery,
    params: {
      startDate: dateConvertor(startDate?.format(dateFormat) || '', true),
      endDate: dateConvertor(endDate?.format(dateFormat) || '', true),
      educationMediumId: currentMedium.id,
      ...query,
    },
    options: {
      skip: !currentMedium.id,
    },
  });

  // Mutation hook for moving students to admission
  const [moveToAdmission, { isLoading: isMoveLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useMoveToAdmissionMutation,
    popupConfig: { successMessage: 'Student moved to Admission successfully.', success: true },
  });

  const tableData = useMemo(
    () =>
      entranceExamData?.data?.items?.map((item: any) => ({
        // Spread original item to preserve all backend fields
        ...item,

        // Field mappings: Backend → Frontend
        class: item.standard, // standard → class
        date: dayjs(item.examDate).format('DD-MM-YYYY'), // examDate → date (formatted)
        passingMark: item.passingMarks, // passingMarks → passingMark
        status: item.examStatus, // examStatus → status

        // Computed fields
        examTime: item.examTime,
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
          <Iconify icon="mdi:arrow-right-circle-outline" sx={{ height: '16px', width: '16px' }} />
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
      { id: 'formNo', label: 'Form No.', align: 'left' },
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
        label: 'Profile Completion',
        align: 'left',
        filterType: 'number',
        render(value, row) {
          const isNum = value !== '' && value !== null && !Number.isNaN(Number(value));
          const displayValue = isNum ? parseFloat(Number(value).toFixed(2)) : value;
          const ringValue = isNum ? Number(value) : 0;
          return (
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress
                variant="determinate"
                value={ringValue}
                size={50}
                thickness={3}
                sx={{ color: ringValue < 50 ? 'warning.main' : 'success.main' }}
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
                  {displayValue}%
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
        minWidth: '100px',
        align: 'left',
        render(value, row) {
          const isNum = value !== '' && value !== null && !Number.isNaN(Number(value));
          const displayValue = isNum ? parseFloat(Number(value).toFixed(2)) : 0;
          const ringValue = isNum ? Number(value) : 0;
          return (
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress
                variant="determinate"
                value={ringValue}
                size={50}
                thickness={3}
                sx={{ color: ringValue < 50 ? 'warning.main' : 'success.main' }}
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
                  {displayValue}%
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
        minWidth: 100,
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
          <ThreeDotsActions
            placement="right-top"
            actions={(props) => actions(props, row)}
            showViewIcon
            handleViewClick={() => {
              setViewData(row);
              viewDialog.onTrue();
            }}
          />
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
          { name: 'Student', href: '/student/dashboard/' },
          { name: 'Student Enrollment', href: '/student/dashboard/' },
          { name: 'Entrance Exam' },
        ]}
      />
      <Paper
        elevation={2}
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          px: 1,
          py: 1,
          mb: 1,
          borderRadius: '15px',
        }}
      >
        <Box display="flex" gap={2}>
          <CustomDateRangePicker
            label="Start Date - End Date"
            value={[startDate, endDate]}
            dateFormat="DD/MM/YYYY"
            onChange={(value) => {
              setStartDate(value[0]);
              setEndDate(value[1] ? value[1].endOf('day') : null);
            }}
          />
        </Box>
      </Paper>
      <CustomizableTable
        tableTitle="Entrance Exam"
        onSendNotification={handlerSendNotification}
        showCheckbox={selectedStudents.length !== 0}
        tableId="entrance-exam-table"
        noDataText={<>No Entrance Exam Data Found </>}
        isLoading={isLoading || isFetching || isMoveLoading}
        columns={columns}
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
            <Typography variant="h5">Move to Admission</Typography>
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
      <CustomDialog
        open={viewDialog.value}
        handleClose={() => {
          setViewData(null);
          viewDialog.onFalse();
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Entrance Exam Details</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="View detailed entrance exam information for the selected student."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        maxWidth="sm"
      >
        <EntranceExamViewDetails
          data={viewData}
          onClose={() => {
            setViewData(null);
            viewDialog.onFalse();
          }}
        />
      </CustomDialog>
    </Box>
  );
};

export default EntranceExamScreen;

const EntranceExamViewDetails = ({ data, onClose }: { data: any; onClose: () => void }) => {
  if (!data) return null;

  const initials = (data.studentName || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0].toUpperCase())
    .join('');

  const totalMarks = Number(data.totalMarks) || 0;
  const obtainedMarks =
    data.obtainedMarks !== null && data.obtainedMarks !== undefined
      ? Number(data.obtainedMarks)
      : null;
  const passingMark = Number(data.passingMark) || 0;
  const percentage =
    data.percentage !== null && data.percentage !== undefined && data.percentage !== ''
      ? parseFloat(Number(data.percentage).toFixed(2))
      : null;
  const progress =
    data.progress !== null && data.progress !== undefined && data.progress !== ''
      ? parseFloat(Number(data.progress).toFixed(2))
      : 0;

  const passLinePercent = totalMarks > 0 ? (passingMark / totalMarks) * 100 : 0;
  const barValue = Math.min(percentage ?? 0, 100);
  const diff = obtainedMarks !== null ? obtainedMarks - passingMark : null;

  const statusColor = EntranceExamStatusTypeColors[
    data.status as EntranceExamStatusType
  ] as LabelColor;
  const statusLabel = EntranceExamStatusType[data.status as EntranceExamStatusType];
  const isPass = statusLabel === 'Pass';

  const detailRows = [
    { label: 'Form No.', value: data.formNo || '—' },
    { label: 'Exam Date', value: data.date || '—' },
    { label: 'Exam Time', value: data.examTime || '—' },
  ];

  return (
    <>
      <DialogScrollContent>
        <Box display="flex" flexDirection="column" gap={2}>
          {/* Header card */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'background.neutral',
            }}
          >
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: 'primary.lighter',
                color: 'primary.main',
                fontWeight: 700,
                fontSize: '1rem',
              }}
            >
              {initials}
            </Avatar>
            <Box flex={1}>
              <Typography variant="subtitle1" fontWeight={700} lineHeight={1.3}>
                {data.studentName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {data.class} · {data.date}
              </Typography>
            </Box>
            <Label color={statusColor}>{statusLabel}</Label>
          </Box>

          {/* Marks stats grid */}
          <Box
            display="grid"
            gridTemplateColumns="1fr 1fr 1fr"
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            {[
              { label: 'TOTAL', value: totalMarks, color: 'text.primary' },
              {
                label: 'OBTAINED',
                value: obtainedMarks ?? '—',
                color: isPass ? 'success.main' : 'error.main',
              },
              { label: 'PASSING', value: passingMark, color: 'text.primary' },
            ].map((stat, i) => (
              <Box
                key={stat.label}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  py: 2,
                  borderRight: i < 2 ? '1px solid' : 'none',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="h4" fontWeight={700} color={stat.color} lineHeight={1}>
                  {stat.value}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.disabled"
                  fontWeight={600}
                  sx={{ letterSpacing: 1, mt: 0.5 }}
                >
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Performance bar */}
          {percentage !== null && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.75}>
                <Typography variant="body2" fontWeight={600}>
                  Performance
                </Typography>
                <Typography
                  variant="body2"
                  color={isPass ? 'success.main' : 'error.main'}
                  fontWeight={600}
                >
                  {percentage}%
                  {diff !== null && (
                    <Box
                      component="span"
                      sx={{ ml: 0.5, color: 'text.secondary', fontWeight: 400 }}
                    >
                      · {diff >= 0 ? `+${diff} above pass` : `${Math.abs(diff)} below pass`}
                    </Box>
                  )}
                </Typography>
              </Box>

              {/* Bar with pass-line marker */}
              <Box sx={{ position: 'relative' }}>
                <Box
                  sx={{
                    position: 'relative',
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'action.hover',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      width: `${barValue}%`,
                      borderRadius: 4,
                      bgcolor: isPass ? 'success.main' : 'error.main',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </Box>
                {passLinePercent > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -2,
                      left: `${passLinePercent}%`,
                      transform: 'translateX(-50%)',
                      width: 2,
                      height: 12,
                      bgcolor: 'error.main',
                      borderRadius: 1,
                    }}
                  />
                )}
              </Box>

              {/* Bar labels */}
              <Box
                display="flex"
                justifyContent="space-between"
                mt={0.5}
                sx={{ position: 'relative' }}
              >
                <Typography variant="caption" color="text.disabled">
                  0
                </Typography>
                {passLinePercent > 0 && (
                  <Typography
                    variant="caption"
                    color="error.main"
                    sx={{
                      position: 'absolute',
                      left: `${passLinePercent}%`,
                      transform: 'translateX(-50%)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Pass line: {passingMark}
                  </Typography>
                )}
                <Typography variant="caption" color="text.disabled">
                  {totalMarks}
                </Typography>
              </Box>
            </Box>
          )}

          <Divider />

          {/* Detail rows */}
          {detailRows.map((row) => (
            <Box key={row.label} display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {row.label}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {row.value}
              </Typography>
            </Box>
          ))}

          {/* Profile Completion */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Profile Completion
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  width: 80,
                  height: 6,
                  borderRadius: 3,
                  bgcolor: 'action.hover',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    bgcolor: progress >= 50 ? 'success.main' : 'warning.main',
                  },
                }}
              />
              <Typography
                variant="body2"
                fontWeight={700}
                color={progress >= 50 ? 'success.main' : 'warning.main'}
              >
                {progress}%
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogScrollContent>

      <DialogActions>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={onClose}
        >
          Close
        </Button>
      </DialogActions>
    </>
  );
};

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
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box
        sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}
      >
        {/* Student info bar */}
        <Paper sx={{ p: 2, flexShrink: 0 }}>
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
                {standardName}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Main two-column layout */}
        <Box
          sx={{
            display: 'flex',
            flex: 1,
            overflow: 'hidden',
            bgcolor: 'background.neutral',
            minHeight: 480,
          }}
        >
          {/* Left — Calendar */}
          <Box
            sx={{
              width: 320,
              minWidth: 280,
              bgcolor: 'background.paper',
              borderRight: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
            }}
          >
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
                  const hasSlots = (slots?.items || []).some(
                    (s: any) =>
                      dayjs(s.startDateTime).format('YYYY-MM-DD') === day.format('YYYY-MM-DD')
                  );
                  return (
                    <Box
                      sx={{
                        position: 'relative',
                        display: 'inline-flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <PickersDay {...props} />
                      {hasSlots && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 1,
                            width: 5,
                            height: 5,
                            borderRadius: '50%',
                            bgcolor: props.selected ? 'common.white' : 'success.light',
                          }}
                        />
                      )}
                    </Box>
                  );
                },
              }}
            />
            {formik.touched.examDate && formik.errors.examDate && (
              <Typography variant="caption" color="error" sx={{ px: 2, pb: 1 }}>
                {formik.errors.examDate as string}
              </Typography>
            )}
            {/* Legend */}
            <Box sx={{ display: 'flex', gap: 2, px: 2.5, pb: 2.5, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                <Typography variant="caption" color="text.secondary">
                  Today / Selected
                </Typography>
              </Box>
              {/* <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.light' }} />
                <Typography variant="caption" color="text.secondary">
                  Slots available
                </Typography>
              </Box> */}
            </Box>
          </Box>

          {/* Right — Slots + Booking Summary */}
          <Scrollbar
            sx={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                p: 2.5,
                gap: 2,
              }}
            >
              {/* Section header */}
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Available slots
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {dayjs(formik.values.examDate).format('dddd, D MMMM YYYY')}
                </Typography>
              </Box>

              {/* Slot cards */}
              {isStudentCountLoading || isSlotsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <Box className="loader" height={24} />
                </Box>
              ) : formik.values.slots.length === 0 ? (
                <EmptyContent title="No slots available." />
              ) : (
                formik.values.slots.map((slot: any, index: number) => {
                  const isSelected = slot.id === formik.values.slot;
                  const enrolled = slot.enrolledStudents || 0;
                  const total = slot.studentLimit || 0;
                  const available = total - enrolled;
                  const fillPercent = total ? Math.round((enrolled / total) * 100) : 0;
                  const isAlmostFull = available <= Math.ceil(total * 0.15);
                  const duration = dayjs(slot.endDateTime).diff(
                    dayjs(slot.startDateTime),
                    'minute'
                  );

                  return (
                    <Box
                      key={slot.id || index}
                      onClick={() => formik.setFieldValue('slot', isSelected ? '' : slot.id)}
                      sx={{
                        cursor: 'pointer',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: isSelected ? 'success.main' : 'divider',
                        bgcolor: 'background.paper',
                        overflow: 'hidden',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        boxShadow: isSelected ? '0 0 0 1px rgba(34,197,94,0.15)' : 'none',
                        '&:hover': {
                          borderColor: isSelected ? 'success.main' : 'text.secondary',
                        },
                      }}
                    >
                      {isSelected && (
                        <Box sx={{ height: 3, bgcolor: 'success.main', width: '100%' }} />
                      )}
                      <Box sx={{ p: 2 }}>
                        {/* Top row: slot name + radio */}
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            mb: 0.5,
                          }}
                        >
                          <Box>
                            <Typography
                              variant="subtitle1"
                              fontWeight={700}
                              color={isSelected ? 'success.main' : 'text.primary'}
                            >
                              {slot.slotName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {dayjs(slot.startDateTime).format('hh:mm A')} –{' '}
                              {dayjs(slot.endDateTime).format('hh:mm A')}
                            </Typography>
                          </Box>
                          <Radio
                            checked={isSelected}
                            size="small"
                            sx={{
                              color: isSelected ? 'success.main' : 'text.disabled',
                              '&.Mui-checked': { color: 'success.main' },
                              p: 0,
                            }}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => formik.setFieldValue('slot', isSelected ? '' : slot.id)}
                          />
                        </Box>

                        {/* Info chips + available count */}
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 2,
                            mt: 1.5,
                            mb: 1.5,
                            flexWrap: 'wrap',
                            alignItems: 'center',
                          }}
                        >
                          {duration > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Iconify
                                icon="mdi:clock-outline"
                                sx={{ width: 14, height: 14, color: 'text.disabled' }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {duration} min
                              </Typography>
                            </Box>
                          )}
                          {slot.roomNo && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Iconify
                                icon="mdi:door-open"
                                sx={{ width: 14, height: 14, color: 'text.disabled' }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                Room {slot.roomNo}
                              </Typography>
                            </Box>
                          )}
                          {total > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Iconify
                                icon="mdi:account-group-outline"
                                sx={{ width: 14, height: 14, color: 'text.disabled' }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {total} seats total
                              </Typography>
                            </Box>
                          )}
                          <Box sx={{ ml: 'auto', textAlign: 'right' }}>
                            <Typography
                              variant="h5"
                              fontWeight={800}
                              lineHeight={1}
                              color={isAlmostFull ? 'warning.main' : 'success.main'}
                            >
                              {available}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              available
                            </Typography>
                          </Box>
                        </Box>

                        {/* Seats-filled progress bar */}
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Seats filled
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {enrolled} / {total}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: 'action.hover',
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              sx={{
                                height: '100%',
                                width: `${fillPercent}%`,
                                borderRadius: 3,
                                bgcolor: isAlmostFull ? 'warning.main' : 'success.main',
                                transition: 'width 0.4s ease',
                              }}
                            />
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  );
                })
              )}

              {/* Booking summary — always rendered, visible only when slot is selected */}
              {(() => {
                const selected = formik.values.slots.find((s: any) => s.id === formik.values.slot);
                const available = selected
                  ? (selected.studentLimit || 0) - (selected.enrolledStudents || 0)
                  : 0;
                const slotDuration = selected
                  ? dayjs(selected.endDateTime).diff(dayjs(selected.startDateTime), 'minute')
                  : 0;
                return (
                  <Box
                    sx={{
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: formik.values.slot ? 'divider' : 'transparent',
                      p: 2,
                      mt: 0.5,
                      opacity: formik.values.slot ? 1 : 0,
                      pointerEvents: formik.values.slot ? 'auto' : 'none',
                      transition: 'opacity 0.2s ease',
                    }}
                  >
                    <Typography
                      variant="overline"
                      color="text.secondary"
                      fontWeight={700}
                      sx={{ letterSpacing: 1.5 }}
                    >
                      Booking Summary
                    </Typography>
                    {selected && (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mt: 1.5 }}>
                          <Iconify
                            icon="mdi:calendar-check"
                            sx={{ mt: 0.25, color: 'text.secondary', width: 18, height: 18 }}
                          />
                          <Box>
                            <Typography variant="body2" fontWeight={700}>
                              {dayjs(formik.values.examDate).format('dddd, D MMMM YYYY')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {selected.slotName} ·{' '}
                              {dayjs(selected.startDateTime).format('hh:mm A')} –{' '}
                              {dayjs(selected.endDateTime).format('hh:mm A')}
                            </Typography>
                            {selected.roomNo && (
                              <Typography variant="body2" color="text.secondary">
                                Room {selected.roomNo} · {slotDuration} min duration
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1.5 }}>
                          <Iconify
                            icon="mdi:account-check-outline"
                            sx={{ color: 'success.main', width: 16, height: 16 }}
                          />
                          <Typography variant="caption" color="success.main" fontWeight={600}>
                            {available} seat{available !== 1 ? 's' : ''} still available
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                );
              })()}

              {formik.touched.slot && formik.errors.slot && (
                <Typography variant="caption" color="error">
                  {formik.errors.slot}
                </Typography>
              )}
            </Box>
          </Scrollbar>
        </Box>
      </Box>

      <DialogActions
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          px: 2.5,
          py: 1.5,
          justifyContent: 'flex-end',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
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
            onClick={(e: any) => formik.handleSubmit(e)}
            type="submit"
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            size="small"
            disabled={!formik.values.slot}
          >
            Confirm
          </LoadingButton>
        </Box>
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
      obtainedMarks: editData?.obtainedMarks ?? null,
      totalMarks: editData?.totalMarks,
      status: editData?.status,
      passingMarks: editData?.passingMarks,
    },
    validateOnChange: true,
    validationSchema: Yup.object({
      obtainedMarks: Yup.number()
        .max(999, 'Maximum allowed value is 999')
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
        .max(999, 'Maximum allowed value is 999')
        .test(
          'is-less-than-total',
          'Passing Marks must be less than total marks',
          (value, context) => {
            const { totalMarks } = context.parent;
            return value ? value <= totalMarks : true;
          }
        )
        .required('Passing Marks is required'),
      totalMarks: Yup.number()
        .max(999, 'Maximum allowed value is 999')
        .required('Total Marks is required'),
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
                onChange={(e) => {
                  if (e.target.value.length <= 3) {
                    formik.handleChange(e);
                  }
                }}
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
                onChange={(e) => {
                  if (e.target.value.length <= 3) {
                    formik.handleChange(e);
                  }
                }}
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
                onChange={(e) => {
                  if (e.target.value.length <= 3) {
                    formik.handleChange(e);
                  }
                }}
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
