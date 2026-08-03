'use client';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { alpha, useTheme } from '@mui/material/styles';
import { shikshaMitraToast } from 'src/components/toast';
import { TimePicker } from '@mui/x-date-pickers';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useCreateCalendarDayMutation,
  useUpdateCalendarDayMutation,
} from 'src/redux/academicAPI/AcademicCalendarApi/academic-calendar-api';
import {
  DayType,
  CalendarStatus,
  DAY_TYPE_COLORS,
  DAY_TYPE_OPTIONS,
  HOLIDAY_CATEGORY_OPTIONS,
} from 'src/enums/academic-calendar';
import {
  Box,
  Grid,
  Stack,
  Switch,
  Button,
  Select,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  DialogActions,
  FormHelperText,
  FormControlLabel,
  Paper,
  Checkbox,
} from '@mui/material';

import { calendarDayInitialValues } from '../initialValues';
import { calendarDayValidationSchema } from '../validationSchema';
import { RootState } from 'src/redux/store';

interface Props {
  open: boolean;
  onClose: () => void;
  calendarId: string;
  calendarStatus: CalendarStatus;
  editData?: any;
  prefillDate?: string;
  canDelete?: boolean;
  deleting?: boolean;
  onDelete?: (editData: any) => void | Promise<void>;
  standards?: { id: string; name: string; divisions?: { id: string; name: string }[] }[];
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

const CalendarDayFormDialog = ({
  open,
  onClose,
  calendarId,
  calendarStatus,
  editData,
  prefillDate,
  canDelete = false,
  deleting = false,
  onDelete,
  standards = [],
  divisions = [],
}: Props) => {
  const theme = useTheme();
  const deleteDialog = useBoolean();
  const isPublished = calendarStatus === CalendarStatus.Published;
  const [createDay, { isLoading: creating }] = useCreateCalendarDayMutation();
  const [updateDay, { isLoading: updating }] = useUpdateCalendarDayMutation();
  const isLoading = creating || updating || deleting;

  const dispatch = useDispatch();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

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
      const isSingleClass = !values.appliesToAll && values.standardIds.length === 1;
      const payload: any = {
        ...values,
        date: values.date ? dayjs(values.date).format('YYYY-MM-DDTHH:mm:ssZ') : null,
        dayType: Number(values.dayType),
        holidayCategory: values.holidayCategory !== '' ? Number(values.holidayCategory) : null,
        standardIds: values.appliesToAll ? null : values.standardIds,
        standardId: isSingleClass ? values.standardIds[0] : null,
        divisionId: isSingleClass ? values.divisionId || null : null,
        startTime: values.startTime || null,
        endTime: values.endTime || null,
        endDate:
          Number(values.dayType) === DayType.Vacation && values.endDate
            ? dayjs(values.endDate).format('YYYY-MM-DDTHH:mm:ssZ')
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
      } catch (err: any) {
        shikshaMitraToast.error({ message: err?.data?.detail || 'Failed to save' });
      }
    },
  });

  const dayTypeNum = Number(formik.values.dayType);
  const isHoliday = dayTypeNum === DayType.Holiday;
  const isVacation = dayTypeNum === DayType.Vacation;
  const isHalfDay = dayTypeNum === DayType.HalfDay;

  const rawTitle = editData
    ? `Edit Marker for ${dayjs(editData.date).format('DD-MM-YYYY')}`
    : prefillDate
      ? `Add Marker for ${dayjs(prefillDate).format('DD-MM-YYYY')}`
      : 'Add Calendar Day';

  const dialogTitle = (
    <Box
      display="flex"
      flexDirection="row"
      gap={1}
      alignItems="center"
      component="span"
      sx={{ fontWeight: 'normal' }}
    >
      <Box component="span" sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
        {rawTitle}
      </Box>
      <CustomTooltip
        arrow
        placement="right"
        title="Configure calendar day markers such as holidays, vacations, events, exams, or half days."
      >
        <Iconify
          icon={GlobalIcons.info}
          sx={{ cursor: 'pointer' }}
          color="info.main"
          width={18}
          height={18}
        />
      </CustomTooltip>
    </Box>
  );

  const handleDelete = async () => {
    if (!editData || !onDelete) return;

    await onDelete(editData);
    deleteDialog.onFalse();
    dispatch(setIsChanges(false));
  };

  return (
    <>
      <CustomDialog open={open} handleClose={handleCloseDialog} title={dialogTitle} maxWidth="sm">
        <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
          <DialogScrollContent onSubmit={() => { formik.handleSubmit(); }}>
            <Grid container spacing={2}>
              {/* Day Type */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl
                  fullWidth
                  size="small"
                  error={formik.touched.dayType && Boolean(formik.errors.dayType)}
                >
                  <InputLabel>Day Type *</InputLabel>
                  <Select
                    label="Day Type *"
                    name="dayType"
                    value={formik.values.dayType}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    renderValue={(selected) => {
                      const opt = DAY_TYPE_OPTIONS.find((o) => o.value === selected);
                      if (!opt) return '';
                      const color = DAY_TYPE_COLORS[selected as DayType] ?? '#9e9e9e';
                      const icon = DAY_TYPE_ICONS[selected as DayType] ?? 'mdi:calendar-outline';
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
                      (o) => o.value !== DayType.WorkingDay && o.value !== DayType.EmergencyClosure
                    ).map((opt) => {
                      const color = DAY_TYPE_COLORS[opt.value as DayType] ?? '#9e9e9e';
                      const icon = DAY_TYPE_ICONS[opt.value as DayType] ?? 'mdi:calendar-outline';
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

              {/* Date Picker */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  label={isVacation ? 'Start Date *' : 'Date *'}
                  format="DD-MM-YYYY"
                  value={formik.values.date ? dayjs(formik.values.date) : null}
                  blockedDayTypes={[]}
                  onChange={(val) =>
                    formik.setFieldValue('date', val ? val.format('YYYY-MM-DDTHH:mm:ssZ') : null)
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      error: formik.touched.date && Boolean(formik.errors.date),
                      helperText: formik.touched.date && (formik.errors.date as string),
                    },
                  }}
                />
              </Grid>

              {/* Holiday Category — only for Holiday */}
              {isHoliday && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl
                    fullWidth
                    size="small"
                    error={formik.touched.holidayCategory && Boolean(formik.errors.holidayCategory)}
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

              {/* End Date — only for Vacation */}
              {isVacation && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DatePicker
                    label="End Date *"
                    format="DD-MM-YYYY"
                    value={formik.values.endDate ? dayjs(formik.values.endDate) : null}
                    minDate={formik.values.date ? dayjs(formik.values.date) : undefined}
                    blockedDayTypes={[]}
                    onChange={(val) =>
                      formik.setFieldValue('endDate', val ? val.format('YYYY-MM-DDTHH:mm:ssZ') : null)
                    }
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        error: formik.touched.endDate && Boolean(formik.errors.endDate),
                        helperText: formik.touched.endDate && (formik.errors.endDate as string),
                      },
                    }}
                  />
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
                          helperText: formik.touched.startTime && (formik.errors.startTime as string),
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TimePicker
                      label="End Time *"
                      value={
                        formik.values.endTime ? dayjs(`2000-01-01T${formik.values.endTime}`) : null
                      }
                      onChange={(val) =>
                        formik.setFieldValue('endTime', val ? val.format('HH:mm:ss') : '')
                      }
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          error: formik.touched.endTime && Boolean(formik.errors.endTime),
                          helperText: formik.touched.endTime && (formik.errors.endTime as string),
                        },
                      }}
                    />
                  </Grid>
                </>
              )}

              {/* Title */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Title *"
                  name="title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                  placeholder="e.g. Independence Day, Diwali Break, Sports Day..."
                />
              </Grid>

              {/* Description */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  label="Description"
                  name="description"
                  value={
                    // Bug #5411: strip raw backend GUID strings (ExamId / auto-created) from view
                    formik.values.description
                      .replace(/\.?\s*Auto-created from examination schedule\.?/gi, '')
                      .replace(/\.?\s*ExamId:\s*[\w-]+/gi, '')
                      .trim()
                  }
                  onChange={formik.handleChange}
                  placeholder="Optional details or notes..."
                />
              </Grid>

              {/* Scope & Visibility Section */}
              <Grid size={{ xs: 12 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: { xs: 1.5, md: 2 },
                    borderRadius: 1.5,
                    bgcolor: (t) => alpha(t.palette.background.paper, 0.92),
                    borderColor: (t) => alpha(t.palette.divider, 0.9),
                    boxShadow: (t) => `0 10px 30px -24px ${alpha(t.palette.grey[500], 0.4)}`,
                  }}
                >
                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'primary.main',
                          bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                        }}
                      >
                        <Iconify icon="solar:eye-bold" width={18} height={18} />
                      </Box>
                      <Stack spacing={0.2}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          Scope & Visibility
                        </Typography>
                      </Stack>
                    </Stack>

                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={formik.values.appliesToAll}
                          onChange={(e) => {
                            formik.setFieldValue('appliesToAll', e.target.checked);
                            if (e.target.checked) {
                              formik.setFieldValue('standardIds', []);
                              formik.setFieldValue('divisionId', '');
                            }
                          }}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            Applies to all classes & divisions
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Toggle off to restrict this marker to specific classes or a section
                          </Typography>
                        </Box>
                      }
                    />

                    {!formik.values.appliesToAll && (
                      <Grid container spacing={2} sx={{ pt: 1 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <FormControl
                            fullWidth
                            size="small"
                            error={formik.touched.standardIds && Boolean(formik.errors.standardIds)}
                          >
                            <InputLabel>Class *</InputLabel>
                            <Select
                              multiple
                              label="Class *"
                              name="standardIds"
                              value={formik.values.standardIds}
                              onChange={(e) => {
                                const { value } = e.target;
                                const selected = typeof value === 'string' ? value.split(',') : value;
                                formik.setFieldValue('standardIds', selected);
                                if (selected.length !== 1) {
                                  formik.setFieldValue('divisionId', '');
                                }
                              }}
                              renderValue={(selected) =>
                                (selected as string[])
                                  .map((id) => standards.find((s) => s.id === id)?.name ?? id)
                                  .join(', ')
                              }
                            >
                              {standards.map((s) => (
                                <MenuItem key={s.id} value={s.id}>
                                  <Checkbox
                                    size="small"
                                    checked={formik.values.standardIds.includes(s.id)}
                                  />
                                  {s.name}
                                </MenuItem>
                              ))}
                            </Select>
                            {formik.touched.standardIds && formik.errors.standardIds && (
                              <FormHelperText>{formik.errors.standardIds as string}</FormHelperText>
                            )}
                          </FormControl>
                        </Grid>
                        {formik.values.standardIds.length === 1 && (
                          <Grid size={{ xs: 12, sm: 6 }}>
                            {/* Bug #5411: notched + shrink prevents label/placeholder collision */}
                            <FormControl fullWidth size="small">
                              <InputLabel id="division-select-label" shrink htmlFor="division-select">
                                Division
                              </InputLabel>
                              <Select
                                labelId="division-select-label"
                                inputProps={{ id: 'division-select' }}
                                label="Division"
                                name="divisionId"
                                value={formik.values.divisionId}
                                onChange={formik.handleChange}
                                displayEmpty
                                notched
                                renderValue={(selected) => {
                                  if (!selected) return <em style={{ opacity: 0.6, fontStyle: 'normal' }}>All Divisions (optional)</em>;
                                  const selectedDivision = standards
                                    .find((s) => s.id === formik.values.standardIds[0])
                                    ?.divisions?.find((d: any) => d.id === selected);
                                  return selectedDivision?.name ?? String(selected);
                                }}
                              >
                                <MenuItem value="">All Divisions</MenuItem>
                                {(
                                  standards.find((s) => s.id === formik.values.standardIds[0])
                                    ?.divisions || []
                                ).map((d: any) => (
                                  <MenuItem key={d.id} value={d.id}>
                                    {d.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                        )}
                      </Grid>
                    )}
                  </Stack>
                </Paper>
              </Grid>

              {/* Change Reason — required if published */}
              {isPublished && (
                <Grid size={{ xs: 12 }}>
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
                    sx={{
                      '& .MuiInputBase-root': {
                        backgroundColor: alpha(theme.palette.error.main, 0.01),
                      },
                    }}
                  />
                </Grid>
              )}
            </Grid>
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
              type="submit"
              loading={creating || updating}
              disabled={deleting}
              buttonText={editData ? 'Update Day' : 'Add Day'}
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
