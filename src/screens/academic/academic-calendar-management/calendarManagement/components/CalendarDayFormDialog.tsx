'use client';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { RootState } from 'src/redux/store';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { TimePicker } from '@mui/x-date-pickers';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { FormSectionCard } from 'src/components/form-section-card';
import { datePickerToDateTimeOffset } from 'src/utils/dateConvertor';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetRoomsQuery } from 'src/redux/InstituteSetup/RoomApi/RoomApi';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetExaminationTypesQuery } from 'src/redux/academicAPI/ExaminationApi/examSetting/exam-type-api';
import {
  useGetExamsQuery,
  useGetExamScheduleQuery,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';
import {
  DayType,
  CalendarStatus,
  DAY_TYPE_COLORS,
  DAY_TYPE_OPTIONS,
  HOLIDAY_CATEGORY_OPTIONS,
} from 'src/enums/academic-calendar';
import {
  useCreateCalendarDayMutation,
  useUpdateCalendarDayMutation,
} from 'src/redux/academicAPI/AcademicCalendarApi/academic-calendar-api';
import {
  Box,
  Grid,
  Stack,
  Button,
  Select,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  Autocomplete,
  DialogActions,
  FormHelperText,
} from '@mui/material';

import CalendarDayTextFields from './CalendarDayTextFields';
import { normalizeCalendarDayTitle } from '../calendarDayText';
import { CalendarDayDateFields } from './CalendarDayDateFields';
import { calendarDayValidationSchema } from '../validationSchema';
import { CalendarDayScopeSection } from './CalendarDayScopeSection';
import { getSyncedExamId, calendarDayInitialValues } from '../initialValues';
import { useCalendarLinkedExamSync } from '../hooks/useCalendarLinkedExamSync';
import {
  type CalendarDayNamedOption,
  ensureSelectedCalendarDayOption,
} from '../calendarDayOptions';

interface Props {
  open: boolean;
  onClose: () => void;
  calendarId: string;
  calendarStatus: CalendarStatus;
  academicMediumId?: string;
  editData?: any;
  prefillDate?: string;
  canDelete?: boolean;
  deleting?: boolean;
  onDelete?: (editData: any) => void | Promise<void>;
  standards?: {
    id: string;
    name: string;
    unavailable?: boolean;
    divisions?: { id: string; name: string }[];
  }[];
  divisions?: { id: string; name: string }[];
}

const DAY_TYPE_ICONS: Record<DayType, string> = {
  [DayType.WorkingDay]: 'mdi:briefcase-check-outline',
  [DayType.Holiday]: 'mdi:flag-outline',
  [DayType.Vacation]: 'mdi:beach',
  [DayType.HalfDay]: 'mdi:clock-time-four-outline',
  [DayType.Event]: 'mdi:party-popper',
  [DayType.Exam]: 'mdi:file-document-edit-outline',
  [DayType.PTM]: 'mdi:account-group-outline',
  [DayType.EmergencyClosure]: 'mdi:alert-octagon-outline',
};

interface CalendarExamOption extends CalendarDayNamedOption {
  examTypeId?: string;
  standardId?: string;
  standardName?: string;
}

const CalendarDayFormDialog = ({
  open,
  onClose,
  calendarId,
  calendarStatus,
  academicMediumId,
  editData,
  prefillDate,
  canDelete = false,
  deleting = false,
  onDelete,
  standards = [],
  divisions = [],
}: Props) => {
  const deleteDialog = useBoolean();
  const isPublished = calendarStatus === CalendarStatus.Published;
  const [createDay, { isLoading: creating }] = useCreateCalendarDayMutation();
  const [updateDay, { isLoading: updating }] = useUpdateCalendarDayMutation();
  const isLoading = creating || updating || deleting;

  const dispatch = useDispatch();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const mediumId = academicMediumId || currentMedium?.id;

  const handleCloseDialog = (_event?: {}, _reason?: 'backdropClick' | 'escapeKeyDown') => {
    onClose();
    dispatch(setIsChanges(false));
  };

  const formik = useFormik({
    initialValues: calendarDayInitialValues(
      editData ?? (prefillDate ? { date: prefillDate } : undefined)
    ),
    enableReinitialize: true,
    validationSchema: calendarDayValidationSchema(isPublished),
    onSubmit: async (values) => {
      const dayType = Number(values.dayType);
      const isEvent = dayType === DayType.Event;
      const isHalfDayType = dayType === DayType.HalfDay;
      const isExam = dayType === DayType.Exam;
      const isPtm = dayType === DayType.PTM;
      const hasLinkedExam = isExam && Boolean(values.linkedExamId);
      const isSingleClass = !values.appliesToAll && values.standardIds.length === 1;
      const payload: any = {
        ...values,
        title: normalizeCalendarDayTitle(values.title),
        date: datePickerToDateTimeOffset(values.date ? dayjs(values.date) : null),
        dayType: Number(values.dayType),
        holidayCategory: values.holidayCategory !== '' ? Number(values.holidayCategory) : null,
        standardIds: values.appliesToAll ? null : values.standardIds,
        standardId: isSingleClass ? values.standardIds[0] : null,
        divisionId: isSingleClass ? values.divisionId || null : null,
        startTime: isEvent || isHalfDayType || isPtm ? values.startTime || null : null,
        endTime: isEvent || isHalfDayType || isPtm ? values.endTime || null : null,
        venue: isEvent ? values.venue || null : null,
        examTypeId: isExam ? values.examTypeId || null : null,
        linkedExamId: isExam && values.linkedExamId ? values.linkedExamId : null,
        examStartTime: hasLinkedExam ? values.examStartTime || null : null,
        examEndTime: hasLinkedExam ? values.examEndTime || null : null,
        ptmMode: isPtm ? values.ptmMode || null : null,
        roomId: isPtm && values.roomId ? values.roomId : null,
        meetingLink: isPtm ? values.meetingLink || null : null,
        endDate:
          dayType === DayType.Vacation && values.endDate
            ? datePickerToDateTimeOffset(dayjs(values.endDate))
            : null,
      };

      try {
        if (editData) {
          await updateDay({ id: editData.id, body: payload }).unwrap();
          shikshaMitraToast.success({ message: 'Calendar day updated successfully' });
        } else {
          await createDay({ calendarId, body: payload }).unwrap();
          shikshaMitraToast.success({ message: 'Calendar day added successfully' });
        }
        handleCloseDialog();
        formik.resetForm();
      } catch (error) {
        shikshaMitraToast.error({
          message: parseApiProblemDetail(error).detail || 'Failed to save calendar day',
        });
      }
    },
  });

  const dayTypeNum = Number(formik.values.dayType);
  const isHoliday = dayTypeNum === DayType.Holiday;
  const isVacation = dayTypeNum === DayType.Vacation;
  const isHalfDay = dayTypeNum === DayType.HalfDay;
  const isEvent = dayTypeNum === DayType.Event;
  const isExam = dayTypeNum === DayType.Exam;
  const isPtm = dayTypeNum === DayType.PTM;
  const { ptmMode } = formik.values;
  const showRoom = isPtm && ['inPerson', 'hybrid'].includes(ptmMode);
  const showMeetingLink = isPtm && ['online', 'hybrid'].includes(ptmMode);

  const { data: examTypesResponse } = useGetExaminationTypesQuery(
    { academicMediumId: mediumId, includeArchived: false },
    { skip: !mediumId || Number(formik.values.dayType) !== DayType.Exam }
  );
  const { data: examsResponse } = useGetExamsQuery(
    { academicMediumId: mediumId, skipCount: 0, maxResultCount: 1000 },
    { skip: !mediumId || Number(formik.values.dayType) !== DayType.Exam }
  );
  const { currentData: examScheduleResponse, isFetching: isExamScheduleFetching } =
    useGetExamScheduleQuery(
      { examId: formik.values.linkedExamId },
      { skip: !isExam || !formik.values.linkedExamId }
    );
  const {
    data: roomsResponse,
    isLoading: roomsLoading,
    isFetching: roomsFetching,
  } = useGetRoomsQuery(
    { skipCount: 0, maxResultCount: 1000 },
    { skip: Number(formik.values.dayType) !== DayType.PTM }
  );

  const examTypes = useMemo(
    () =>
      ensureSelectedCalendarDayOption(
        (examTypesResponse?.items ?? examTypesResponse ?? []).map((examType: any) => ({
          id: examType.id,
          name: examType.examType || examType.name,
        })),
        formik.values.examTypeId,
        editData?.examTypeName,
        'Unavailable exam type'
      ),
    [editData?.examTypeName, examTypesResponse, formik.values.examTypeId]
  );
  const exams = useMemo(
    () =>
      ensureSelectedCalendarDayOption<CalendarExamOption>(
        (examsResponse?.items ?? examsResponse ?? []).map((exam: any) => ({
          id: exam.examId || exam.id,
          name: exam.examName || exam.name,
          examTypeId: exam.examTypeId,
          standardId: exam.standardId,
          standardName: exam.standardName,
        })),
        formik.values.linkedExamId,
        editData?.linkedExamName,
        'Unavailable exam'
      ),
    [editData?.linkedExamName, examsResponse, formik.values.linkedExamId]
  );
  const availableStandards = useMemo(
    () =>
      ensureSelectedCalendarDayOption(
        standards,
        formik.values.standardIds[0],
        editData?.standardName,
        'Unavailable class'
      ),
    [editData?.standardName, formik.values.standardIds, standards]
  );
  const selectedExam = exams.find((exam) => exam.id === formik.values.linkedExamId);
  const persistedLinkedExamId = editData?.linkedExamId || getSyncedExamId(editData?.description);
  const rooms = roomsResponse?.items ?? roomsResponse ?? [];
  const roomOptions = rooms.map((room: any) => {
    const labelParts = [room.buildingName, room.floorName, room.roomName || room.name].filter(
      Boolean
    );
    const groupParts = [room.buildingName, room.floorName].filter(Boolean);
    return {
      ...room,
      label: labelParts.join(' › ') || room.roomName || room.name || room.id,
      group: groupParts.join(' › ') || 'Rooms',
    };
  });

  useCalendarLinkedExamSync({
    enabled: open && isExam,
    formik,
    selectedExam,
    schedule: examScheduleResponse,
    persistedLinkedExamId,
  });

  const handleDayTypeChange = (value: DayType | '') => {
    formik.setFieldValue('dayType', value);
    const resetValues = {
      venue: '',
      startTime: '',
      endTime: '',
      examTypeId: '',
      linkedExamId: '',
      examStartTime: '',
      examEndTime: '',
      ptmMode: '',
      roomId: '',
      meetingLink: '',
    };
    Object.entries(resetValues).forEach(([field, fieldValue]) =>
      formik.setFieldValue(field, fieldValue)
    );
  };

  const rawTitle = editData
    ? `Edit Marker for ${dayjs(editData.date).format('DD-MM-YYYY')}`
    : prefillDate
      ? `Add Marker for ${dayjs(prefillDate).format('DD-MM-YYYY')}`
      : 'Add Calendar Day';

  const handleDelete = async () => {
    if (!editData || !onDelete) return;

    await onDelete(editData);
    deleteDialog.onFalse();
    dispatch(setIsChanges(false));
  };

  return (
    <>
      <CustomDialog
        open={open}
        handleClose={handleCloseDialog}
        title={rawTitle}
        titleInfo="Configure calendar markers such as holidays, vacations, events, exams, or half days."
        maxWidth="md"
      >
        <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
          <DialogScrollContent
            onSubmit={() => {
              formik.handleSubmit();
            }}
          >
            <Stack spacing={1.5}>
              <FormSectionCard
                icon="solar:calendar-add-linear"
                title="Marker Details"
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
                descriptionTooltip="Choose the day type, schedule, and information shown on the academic calendar."
              >
                <Grid container spacing={1.5}>
                  {/* Day Type */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl
                      fullWidth
                      size="small"
                      error={formik.touched.dayType && Boolean(formik.errors.dayType)}
                    >
                      <InputLabel id="calendar-marker-day-type-label" required>
                        Day type
                      </InputLabel>
                      <Select
                        label="Day type"
                        labelId="calendar-marker-day-type-label"
                        required
                        name="dayType"
                        value={formik.values.dayType}
                        onChange={(event) => handleDayTypeChange(event.target.value as DayType)}
                        onBlur={formik.handleBlur}
                        renderValue={(selected) => {
                          const opt = DAY_TYPE_OPTIONS.find((o) => o.value === selected);
                          if (!opt) return '';
                          const color = DAY_TYPE_COLORS[selected as DayType] ?? '#9e9e9e';
                          const icon =
                            DAY_TYPE_ICONS[selected as DayType] ?? 'mdi:calendar-outline';
                          return (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Iconify icon={icon} width={16} sx={{ color }} />
                              <Typography variant="body2" fontWeight={600}>
                                {opt.label}
                              </Typography>
                            </Box>
                          );
                        }}
                      >
                        {DAY_TYPE_OPTIONS.filter(
                          (o) =>
                            o.value !== DayType.WorkingDay &&
                            o.value !== DayType.EmergencyClosure &&
                            o.value !== DayType.Exam
                        ).map((opt) => {
                          const color = DAY_TYPE_COLORS[opt.value as DayType] ?? '#9e9e9e';
                          const icon =
                            DAY_TYPE_ICONS[opt.value as DayType] ?? 'mdi:calendar-outline';
                          return (
                            <MenuItem key={opt.value} value={opt.value}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Iconify icon={icon} width={18} sx={{ color }} />
                                <Typography variant="body2">{opt.label}</Typography>
                              </Box>
                            </MenuItem>
                          );
                        })}
                      </Select>
                      {formik.touched.dayType && formik.errors.dayType && (
                        <FormHelperText>{formik.errors.dayType as string}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  <CalendarDayDateFields
                    formik={formik}
                    isVacation={isVacation}
                    calendarId={calendarId}
                    academicMediumId={mediumId}
                  />

                  {/* Holiday Category — only for Holiday */}
                  {isHoliday && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl
                        fullWidth
                        size="small"
                        error={
                          formik.touched.holidayCategory && Boolean(formik.errors.holidayCategory)
                        }
                      >
                        <InputLabel>Holiday Category *</InputLabel>
                        <Select
                          label="Holiday Category *"
                          name="holidayCategory"
                          value={formik.values.holidayCategory}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        >
                          {HOLIDAY_CATEGORY_OPTIONS.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {formik.touched.holidayCategory && formik.errors.holidayCategory && (
                          <FormHelperText>{formik.errors.holidayCategory as string}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                  )}

                  {/* Start / End Time — only for HalfDay */}
                  {isHalfDay && (
                    <>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TimePicker
                          label="Start Time *"
                          value={
                            formik.values.startTime
                              ? dayjs(`2000-01-01T${formik.values.startTime}`)
                              : null
                          }
                          onChange={(val) =>
                            formik.setFieldValue('startTime', val ? val.format('HH:mm:ss') : '')
                          }
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: 'small',
                              error: formik.touched.startTime && Boolean(formik.errors.startTime),
                              helperText:
                                formik.touched.startTime && (formik.errors.startTime as string),
                            },
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TimePicker
                          label="End Time *"
                          value={
                            formik.values.endTime
                              ? dayjs(`2000-01-01T${formik.values.endTime}`)
                              : null
                          }
                          onChange={(val) =>
                            formik.setFieldValue('endTime', val ? val.format('HH:mm:ss') : '')
                          }
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: 'small',
                              error: formik.touched.endTime && Boolean(formik.errors.endTime),
                              helperText:
                                formik.touched.endTime && (formik.errors.endTime as string),
                            },
                          }}
                        />
                      </Grid>
                    </>
                  )}

                  {/* Event details */}
                  {isEvent && (
                    <>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TimePicker
                          label="Start Time"
                          value={
                            formik.values.startTime
                              ? dayjs(`2000-01-01T${formik.values.startTime}`)
                              : null
                          }
                          onChange={(val) =>
                            formik.setFieldValue('startTime', val ? val.format('HH:mm:ss') : '')
                          }
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: 'small',
                              error: Boolean(formik.touched.startTime && formik.errors.startTime),
                              helperText:
                                formik.touched.startTime && (formik.errors.startTime as string),
                            },
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TimePicker
                          label="End Time"
                          value={
                            formik.values.endTime
                              ? dayjs(`2000-01-01T${formik.values.endTime}`)
                              : null
                          }
                          onChange={(val) =>
                            formik.setFieldValue('endTime', val ? val.format('HH:mm:ss') : '')
                          }
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: 'small',
                              error: Boolean(formik.touched.endTime && formik.errors.endTime),
                              helperText:
                                formik.touched.endTime && (formik.errors.endTime as string),
                            },
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Venue"
                          name="venue"
                          value={formik.values.venue}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.venue && Boolean(formik.errors.venue)}
                          helperText={formik.touched.venue && (formik.errors.venue as string)}
                          placeholder="Optional venue"
                        />
                      </Grid>
                    </>
                  )}

                  {/* Exam details */}
                  {isExam && (
                    <>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl
                          fullWidth
                          size="small"
                          error={formik.touched.examTypeId && Boolean(formik.errors.examTypeId)}
                        >
                          <InputLabel>Exam Type *</InputLabel>
                          <Select
                            label="Exam Type *"
                            name="examTypeId"
                            value={formik.values.examTypeId}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          >
                            {examTypes.map((examType) => (
                              <MenuItem key={examType.id} value={examType.id}>
                                {examType.name}
                              </MenuItem>
                            ))}
                          </Select>
                          {formik.touched.examTypeId && formik.errors.examTypeId && (
                            <FormHelperText>{formik.errors.examTypeId as string}</FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Linked Exam</InputLabel>
                          <Select
                            label="Linked Exam"
                            name="linkedExamId"
                            value={formik.values.linkedExamId}
                            onChange={(event) => {
                              const linkedExamId = event.target.value;
                              formik.setFieldValue('linkedExamId', linkedExamId);
                              formik.setFieldValue('examStartTime', '');
                              formik.setFieldValue('examEndTime', '');
                              if (!linkedExamId) {
                                formik.setFieldValue('appliesToAll', true);
                                formik.setFieldValue('standardIds', []);
                                formik.setFieldValue('divisionId', '');
                              }
                            }}
                          >
                            <MenuItem value="">None</MenuItem>
                            {exams.map((exam) => (
                              <MenuItem key={exam.id} value={exam.id}>
                                {exam.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      {formik.values.linkedExamId && (
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="caption" color="text.secondary">
                            {isExamScheduleFetching
                              ? 'Loading date and time from the linked exam…'
                              : `Class: ${selectedExam?.standardName || 'Taken automatically from the linked exam'}. Date and time are also taken from its schedule.`}
                          </Typography>
                        </Grid>
                      )}
                    </>
                  )}

                  {/* PTM details */}
                  {isPtm && (
                    <>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl
                          fullWidth
                          size="small"
                          error={formik.touched.ptmMode && Boolean(formik.errors.ptmMode)}
                        >
                          <InputLabel>PTM Mode *</InputLabel>
                          <Select
                            label="PTM Mode *"
                            name="ptmMode"
                            value={formik.values.ptmMode}
                            onChange={(event) => {
                              formik.setFieldValue('ptmMode', event.target.value);
                              if (event.target.value === 'online')
                                formik.setFieldValue('roomId', '');
                              if (event.target.value === 'inPerson')
                                formik.setFieldValue('meetingLink', '');
                            }}
                            onBlur={formik.handleBlur}
                          >
                            <MenuItem value="inPerson">In-Person</MenuItem>
                            <MenuItem value="online">Online</MenuItem>
                            <MenuItem value="hybrid">Hybrid</MenuItem>
                          </Select>
                          {formik.touched.ptmMode && formik.errors.ptmMode && (
                            <FormHelperText>{formik.errors.ptmMode as string}</FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TimePicker
                          label="PTM Start Time *"
                          value={
                            formik.values.startTime
                              ? dayjs(`2000-01-01T${formik.values.startTime}`)
                              : null
                          }
                          onChange={(val) =>
                            formik.setFieldValue('startTime', val ? val.format('HH:mm:ss') : '')
                          }
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: 'small',
                              error: Boolean(formik.touched.startTime && formik.errors.startTime),
                              helperText:
                                formik.touched.startTime && (formik.errors.startTime as string),
                            },
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TimePicker
                          label="PTM End Time *"
                          value={
                            formik.values.endTime
                              ? dayjs(`2000-01-01T${formik.values.endTime}`)
                              : null
                          }
                          onChange={(val) =>
                            formik.setFieldValue('endTime', val ? val.format('HH:mm:ss') : '')
                          }
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: 'small',
                              error: Boolean(formik.touched.endTime && formik.errors.endTime),
                              helperText:
                                formik.touched.endTime && (formik.errors.endTime as string),
                            },
                          }}
                        />
                      </Grid>
                      {showRoom && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Autocomplete
                            fullWidth
                            size="small"
                            loading={roomsLoading || roomsFetching}
                            options={roomOptions}
                            groupBy={(option) => option.group}
                            getOptionLabel={(option) => option.label}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            value={
                              roomOptions.find((room: any) => room.id === formik.values.roomId) ||
                              null
                            }
                            onChange={(_event, value) =>
                              formik.setFieldValue('roomId', value?.id || '')
                            }
                            onBlur={() => formik.setFieldTouched('roomId', true)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Room *"
                                error={formik.touched.roomId && Boolean(formik.errors.roomId)}
                                helperText={
                                  formik.touched.roomId && (formik.errors.roomId as string)
                                }
                              />
                            )}
                          />
                        </Grid>
                      )}
                      {showMeetingLink && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Meeting Link *"
                            name="meetingLink"
                            value={formik.values.meetingLink}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.meetingLink && Boolean(formik.errors.meetingLink)}
                            helperText={
                              formik.touched.meetingLink && (formik.errors.meetingLink as string)
                            }
                            placeholder="https://..."
                          />
                        </Grid>
                      )}
                    </>
                  )}

                  <CalendarDayTextFields
                    title={formik.values.title}
                    description={formik.values.description}
                    titleError={formik.touched.title ? formik.errors.title : undefined}
                    descriptionError={
                      formik.touched.description ? formik.errors.description : undefined
                    }
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </Grid>
              </FormSectionCard>

              {!(isExam && formik.values.linkedExamId) && (
                <CalendarDayScopeSection
                  formik={formik}
                  availableStandards={availableStandards}
                  standards={standards}
                />
              )}

              {isPublished && (
                <FormSectionCard
                  icon="solar:document-text-linear"
                  title="Change reason"
                  description="Explain this update because the academic calendar is already published."
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="Change Reason *"
                    name="changeReason"
                    value={formik.values.changeReason}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.changeReason && Boolean(formik.errors.changeReason)}
                    helperText={
                      formik.touched.changeReason
                        ? (formik.errors.changeReason as string)
                        : 'Required because calendar is already published'
                    }
                    multiline
                    rows={3}
                    placeholder="Reason for adding/modifying this calendar day..."
                  />
                </FormSectionCard>
              )}
            </Stack>
          </DialogScrollContent>
        </BackPopUpChecked>

        <DialogActions
          sx={{ p: 2, boxShadow: 'var(--shadows-10)', justifyContent: 'space-between' }}
        >
          <Box>
            {editData && canDelete && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                disabled={isLoading}
                startIcon={<Iconify icon={GlobalIcons.delete} width={16} height={16} />}
                onClick={deleteDialog.onTrue}
              >
                Delete Day
              </Button>
            )}
          </Box>
          <Stack direction="row" gap={1}>
            <CancelButton onClick={() => handleCloseDialog()} />
            <SubmitButton
              type="button"
              loading={creating || updating || isExamScheduleFetching}
              disabled={deleting || isExamScheduleFetching}
              onClick={() => formik.handleSubmit()}
              buttonText="Submit"
              startIcon={
                <Iconify
                  icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
                  width={16}
                  height={16}
                />
              }
            />
          </Stack>
        </DialogActions>
      </CustomDialog>

      <ConfirmDialog
        open={deleteDialog.value}
        onClose={deleteDialog.onFalse}
        title="Delete Day"
        content={
          <>
            Are you sure you want to delete <strong>{editData?.title || 'this day marker'}</strong>?
            This action will be recorded in audit logs.
          </>
        }
        action={
          <LoadingButton
            loading={deleting}
            variant="contained"
            color="error"
            size="small"
            onClick={handleDelete}
          >
            Delete
          </LoadingButton>
        }
      />
    </>
  );
};

export default CalendarDayFormDialog;
