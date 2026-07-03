'use client';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { alpha, useTheme } from '@mui/material/styles';
import { shikshaMitraToast } from 'src/components/toast';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
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
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  DialogActions,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import { calendarDayInitialValues } from '../initialValues';
import { calendarDayValidationSchema } from '../validationSchema';

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
        date: values.date ? dayjs(values.date).toISOString() : null,
        dayType: Number(values.dayType),
        holidayCategory: values.holidayCategory !== '' ? Number(values.holidayCategory) : null,
        standardIds: values.appliesToAll ? null : values.standardIds,
        standardId: isSingleClass ? values.standardIds[0] : null,
        divisionId: isSingleClass ? values.divisionId || null : null,
        startTime: values.startTime || null,
        endTime: values.endTime || null,
        endDate:
          Number(values.dayType) === DayType.Vacation && values.endDate
            ? dayjs(values.endDate).toISOString()
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
        onClose();
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
  const isEvent = dayTypeNum === DayType.Event;
  const isExam = dayTypeNum === DayType.Exam;
  const isPtm = dayTypeNum === DayType.PTM;

  const title = editData
    ? `Edit Marker for ${dayjs(editData.date).format('DD MMM YYYY')}`
    : prefillDate
      ? `Add Marker for ${dayjs(prefillDate).format('DD MMM YYYY')}`
      : 'Add Calendar Day';

  const handleDelete = async () => {
    if (!editData || !onDelete) return;

    await onDelete(editData);
    deleteDialog.onFalse();
  };

  return (
    <>
      <CustomDialog open={open} handleClose={onClose} title={title} maxWidth="sm">
        <DialogScrollContent>
          <Grid container spacing={2.5}>
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
              value={formik.values.date ? dayjs(formik.values.date) : null}
              onChange={(val) => formik.setFieldValue('date', val ? val.toISOString() : null)}
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
                value={formik.values.endDate ? dayjs(formik.values.endDate) : null}
                minDate={formik.values.date ? dayjs(formik.values.date) : undefined}
                onChange={(val) => formik.setFieldValue('endDate', val ? val.toISOString() : null)}
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
                    formik.values.startTime ? dayjs(`2000-01-01T${formik.values.startTime}`) : null
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
              value={formik.values.description}
              onChange={formik.handleChange}
              placeholder="Optional details or notes..."
            />
          </Grid>

          {/* Scope Card block */}
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                backgroundColor: alpha(theme.palette.primary.main, 0.01),
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={800}
                sx={{
                  mb: 1.5,
                  color: 'primary.main',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Scope & Visibility
              </Typography>
              <Stack spacing={2}>
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
                            const {value} = e.target;
                            const selected =
                              typeof value === 'string' ? value.split(',') : value;
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
                        <FormControl fullWidth size="small">
                          <InputLabel>Division (optional)</InputLabel>
                          <Select
                            label="Division (optional)"
                            name="divisionId"
                            value={formik.values.divisionId}
                            onChange={formik.handleChange}
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
            </Box>
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

        <DialogActions
          sx={{ p: 2, boxShadow: 'var(--shadows-10)', justifyContent: 'space-between' }}
        >
          <Box>
            {editData && canDelete && (
              <LoadingButton
                variant="outlined"
                color="error"
                size="small"
                loading={deleting}
                disabled={creating || updating}
                startIcon={<Iconify icon={GlobalIcons.delete} width={16} height={16} />}
                onClick={deleteDialog.onTrue}
              >
                Delete Day
              </LoadingButton>
            )}
          </Box>
          <Stack direction="row" gap={1}>
            <Button
              variant="outlined"
              size="small"
              onClick={onClose}
              disabled={isLoading}
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              size="small"
              loading={creating || updating}
              disabled={deleting}
              startIcon={
                <Iconify
                  icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
                  width={16}
                  height={16}
                />
              }
              onClick={(e: any) => formik.handleSubmit(e)}
            >
              {editData ? 'Update Day' : 'Add Day'}
            </LoadingButton>
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
