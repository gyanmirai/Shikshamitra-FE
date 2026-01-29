'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useMemo } from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Editor } from 'src/components/editor';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CustomSelect from 'src/components/custom-select';
import FileUploader from 'src/components/custom-upload';
import { shikshaMitraToast } from 'src/components/toast';
import { useGetRolesQuery } from 'src/redux/role/roleApi';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { DatePicker, DateTimePicker, MobileTimePicker } from '@mui/x-date-pickers';
import { useGetEventTypeOptionsQuery } from 'src/redux/calendar/events/eventTypeApi';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import {
  useGetEventByIdQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
} from 'src/redux/calendar/events/eventApi';
import {
  Box,
  Grid,
  Chip,
  Button,
  Switch,
  Checkbox,
  TextField,
  Autocomplete,
  DialogActions,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import RecurringScheduleForm from './components/RecurringScheduleForm';
import { getEventInitialValues } from './components/getEventInitialValues';
import { eventAnnouncementValidationSchema } from './components/getValidationEventSchema';

import type { IAddEventProps } from './type';

const AddEvent: React.FC<IAddEventProps> = ({ initialValues = null, onClose, isEdit = false }) => {
  const theme = useTheme();
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const { data: roleData, isLoading: isRoleDataLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRolesQuery,
  });
  const { data: eventData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEventByIdQuery,
    params: { id: initialValues?.id || '' },
    options: { skip: !isEdit || !initialValues?.id },
  });
  const {
    data: eventTypeData,
    isLoading: isEventTypeDataLoading,
    isFetching: isEventTypeDataFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEventTypeOptionsQuery,
  });
  const [createEvent, { isLoading: addEventTypeLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateEventMutation,
    params: { academicYearId: currentYear?.id || '' },
  });

  const [updateEvent, { isLoading: updateEventTypeLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateEventMutation,
  });

  const openRecurringDialog = useBoolean();
  // State to store list of all organizations/branches
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const dispatch = useDispatch();

  const handleCloseDialog = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        openRecurringDialog.onFalse();
        dispatch(setIsChanges(false));
      }, 200); // Delay for dialog transition
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      resetState();
    } else if (!isChanges) {
      resetState();
    }
  };
  const formikInitialValues = useMemo(
    () => getEventInitialValues(eventData, currentYear),
    [eventData, currentYear]
  );
  const formik = useFormik({
    initialValues: formikInitialValues,
    validationSchema: eventAnnouncementValidationSchema(currentYear),
    enableReinitialize: true,
    onSubmit: async (values) => {
      const isEditMode = !!eventData;

      const recurrenceJson = values.isRecurring
        ? JSON.stringify({
            repeatFrequency: values.repeatFrequency,
            customInterval: values.customInterval,
            customIntervalCount: values.customIntervalCount,
            customDays: values.customDays,
            monthlyOption: values.monthlyOption,
            onDay: values.onDay,
            onTheWeek: values.onTheWeek,
            onTheDay: values.onTheDay,
            repeatUntil: values.repeatUntil,
          })
        : '';

      // ----------------------------
      // Base payload (Swagger-safe)
      // ----------------------------
      const payload: any = {
        academicYearId: currentYear?.id,
        title: values.title,
        eventTypeId: values.type,
        description: values.description,
        poster: values.attachment ?? '',
        mode: values.eventMode === 'online' ? 0 : 1,
        ...(values.eventMode === 'offline' && {
          venue: values.venue,
        }),
        isRecurring: values.isRecurring,
        startTime: values.startTime
          ? dayjs(values.startTime).format('HH:mm')
          : dayjs().format('HH:mm'),
        endTime: values.endTime
          ? dayjs(values.endTime).format('HH:mm')
          : dayjs().add(1, 'hour').format('HH:mm'),
        audienceIds: values.audience,
      };

      if (values.isRecurring) {
        payload.recurrenceJson = recurrenceJson;
      }
      // ----------------------------
      // Meeting date (REQUIRED)
      // ----------------------------
      if (values.meetingDate && dayjs(values.meetingDate).isValid()) {
        payload.meetingDate = dayjs(values.meetingDate).format('YYYY-MM-DD');
      }

      // ----------------------------
      // Time (REQUIRED by API)
      // ----------------------------
      if (values.startTime && dayjs(values.startTime).isValid()) {
        payload.startTime = dayjs(values.startTime).format('HH:mm');
      }

      if (values.endTime && dayjs(values.endTime).isValid()) {
        payload.endTime = dayjs(values.endTime).format('HH:mm');
      }

      // ----------------------------
      // Remove undefined keys
      // ----------------------------
      Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

      try {
        if (isEditMode) {
          await updateEvent({
            id: eventData?.id,
            ...payload,
          }).unwrap();

          shikshaMitraToast.success({
            message: `Event: ${values.title} has been successfully updated`,
          });
        } else {
          await createEvent({
            params: {
              academicYearId: currentYear?.id,
            },
            data: payload,
          }).unwrap();

          shikshaMitraToast.success({
            message: `Event: ${values.title} has been successfully created`,
          });
        }

        onClose(null, true);
      } catch (error: any) {
        shikshaMitraToast.error({
          message: error?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} event`,
        });
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" height="100%">
          <Scrollbar
            sx={{
              p: 2,
              height: '100%',
              '& .simplebar-wrapper': {
                display: 'flex',
                flexDirection: 'column',
              },
            }}
          >
            <Grid size={{ xs: 12 }}>
              <SectionCard title="Basic Information">
                <Grid size={{ xs: 12, md: 6, sm: 3 }}>
                  <ShakingTextField error={!!(formik.touched.title && formik.errors.title)}>
                    <TextField
                      fullWidth
                      label="Title *"
                      name="title"
                      value={formik.values.title}
                      onChange={(e) => {
                        const value = e.target.value
                          // Remove everything except letters and spaces
                          .replace(/[^a-zA-Z\s]/g, '')
                          // Capitalize each word
                          .split(' ')
                          .map((word) =>
                            word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                          )
                          .join(' ');
                        formik.setFieldValue('title', value);
                      }}
                      error={formik.touched.title && Boolean(formik.errors.title)}
                      helperText={formik.touched.title && formik.errors.title}
                      size="small"
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12, md: 6, sm: 3 }}>
                  <ShakingTextField error={!!(formik.touched.type && formik.errors.type)}>
                    <CustomSelect
                      label="Event Type *"
                      isLoading={isEventTypeDataLoading || isEventTypeDataFetching}
                      options={eventTypeData?.items}
                      value={formik.values.type}
                      onChange={(val) => {
                        formik.setFieldValue('type', val);
                        const selectedType = eventTypeData?.items.find(
                          (item: any) => item.id === val
                        );
                        formik.setFieldValue('typeName', selectedType?.name || '');
                      }}
                      formControlProps={{ fullWidth: true, sx: { minWidth: 200 } }}
                      error={formik.touched.type && Boolean(formik.errors.type)}
                      helperText={
                        formik.touched.type && formik.errors.type ? formik.errors.type : undefined
                      }
                      valueKey="id"
                      labelKey="name"
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12, md: 6, sm: 3 }}>
                  <ShakingTextField error={!!(formik.touched.type && formik.errors.type)}>
                    <Autocomplete
                      multiple
                      loading={isRoleDataLoading}
                      disableCloseOnSelect
                      options={roleData?.items || []}
                      getOptionLabel={(option) => option?.name || ''}
                      value={formik.values.audience
                        .map((val: any) => roleData?.items.find((opt: any) => opt.id === val))
                        .filter(Boolean)}
                      onChange={(_, newValue) =>
                        formik.setFieldValue(
                          'audience',
                          newValue.map((opt) => opt?.id)
                        )
                      }
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            key={option?.id}
                            label={option?.name}
                            size="small"
                            color="default"
                            variant="soft"
                            sx={{ height: 22 }}
                          />
                        ))
                      }
                      renderOption={(props, option, { selected }) => (
                        <li {...props} key={option?.id}>
                          <Checkbox
                            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                            checkedIcon={<CheckBoxIcon fontSize="small" />}
                            checked={selected}
                          />
                          {option?.name}
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Audience *"
                          fullWidth
                          size="small"
                          error={formik.touched.audience && Boolean(formik.errors.audience)}
                          helperText={formik.touched.audience && formik.errors.audience}
                        />
                      )}
                      sx={{ minWidth: 300 }}
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <ShakingTextField
                    error={!!(formik.touched.description && formik.errors.description)}
                  >
                    <Editor
                      value={formik.values.description}
                      onChange={(value) => {
                        formik.setFieldValue('description', value);
                      }}
                      placeholder="Description"
                      sx={{
                        border: `1px solid ${theme.vars.palette.grey[500]}`,
                        borderRadius: 1,
                        '&:hover': { borderColor: theme.vars.palette.text.primary },
                        ...(!!formik.touched.description &&
                          !!formik.errors.description && {
                            borderColor: theme.palette.error.main,
                          }),
                        '&:focus-within': {
                          borderColor: theme.vars.palette.text.primary,
                          borderWidth: 2,
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <FileUploader
                    value={formik.values.attachment as any}
                    multiple={false}
                    showVisibleDocumentCount={1}
                    onChange={(value) => formik.setFieldValue('attachment', value)}
                    primaryText="Click to upload event poster"
                    secondaryText="Maximum file size is 5MB"
                  />
                </Grid>
              </SectionCard>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <SectionCard title="Scheduling">
                {formik.values.typeName === 'Meeting' ? (
                  <Grid size={{ xs: 12, md: 3 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formik.values.isRecurring}
                          onChange={(e) => {
                            formik.setFieldValue('isRecurring', e.target.checked);
                            if (!e.target.checked) {
                              formik.setFieldValue('repeatFrequency', '');
                              formik.setFieldValue('repeatUntil', null);
                              formik.setFieldValue('day', '');
                            }
                          }}
                        />
                      }
                      label="Repeat Meeting"
                    />
                  </Grid>
                ) : (
                  <>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <ShakingTextField
                        error={!!(formik.touched.startDate && formik.errors.startDate) || false}
                      >
                        <DateTimePicker
                          label="Start Date-Time *"
                          format="DD/MM/YYYY hh:mm"
                          value={dayjs(formik.values.startDate)}
                          onChange={(newValue) => {
                            formik.setFieldValue('startDate', newValue);
                            formik.setFieldTouched('startDate', false);

                            // Recalculate duration if endDate already selected
                            if (newValue && formik.values.endDate) {
                              const start = dayjs(newValue);
                              const end = dayjs(formik.values.endDate);

                              const diffInHours = end.diff(start, 'hour');
                              const diffInDays = end.diff(start, 'day');

                              if (diffInHours >= 24) {
                                formik.setFieldValue('durationUnit', 'days');
                                formik.setFieldValue('duration', Math.max(0, diffInDays));
                              } else {
                                formik.setFieldValue('durationUnit', 'hours');
                                formik.setFieldValue('duration', Math.max(0, diffInHours));
                              }
                            }
                          }}
                          minDateTime={dayjs(currentYear?.startDate)} // <- disables past date and time
                          maxDate={dayjs(currentYear?.endDate)}
                          sx={{ minWidth: 180, width: '100%' }}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: 'small',
                              error:
                                !!(formik.touched.startDate && formik.errors.startDate) || false,
                              helperText:
                                formik.touched.startDate &&
                                typeof formik.errors.startDate === 'string'
                                  ? formik.errors.startDate
                                  : undefined,
                            },
                          }}
                        />
                      </ShakingTextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <ShakingTextField
                        error={!!(formik.touched.endDate && formik.errors.endDate) || false}
                      >
                        <DateTimePicker
                          label="End Date-Time *"
                          format="DD/MM/YYYY hh:mm"
                          minDateTime={dayjs(currentYear?.startDate)} // <- disables past date and time
                          maxDate={dayjs(currentYear?.endDate)}
                          value={dayjs(formik.values.endDate)}
                          onChange={(newValue) => {
                            formik.setFieldValue('endDate', newValue);
                            formik.setFieldTouched('endDate', false);
                            // Recalculate duration if startDate already selected
                            if (newValue && formik.values.startDate) {
                              const start = dayjs(formik.values.startDate);
                              const end = dayjs(newValue);

                              const diffInHours = end.diff(start, 'hour');
                              const diffInDays = end.diff(start, 'day');

                              if (diffInHours >= 24) {
                                formik.setFieldValue('durationUnit', 'days');
                                formik.setFieldValue('duration', Math.max(0, diffInDays));
                              } else {
                                formik.setFieldValue('durationUnit', 'hours');
                                formik.setFieldValue('duration', Math.max(0, diffInHours));
                              }
                            }
                          }}
                          sx={{ minWidth: 180, width: '100%' }}
                          slotProps={{
                            textField: {
                              size: 'small',
                              error: !!(formik.touched.endDate && formik.errors.endDate) || false,
                              helperText: formik.touched.endDate && formik.errors.endDate,
                            },
                          }}
                        />
                      </ShakingTextField>
                    </Grid>
                  </>
                )}

                {formik.values.isRecurring && (
                  <>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <ShakingTextField
                        error={!!(formik.touched.repeatFrequency && formik.errors.repeatFrequency)}
                      >
                        <CustomSelect
                          label="Select Frequency *"
                          options={[
                            { value: 'Daily', label: 'Daily' },
                            { value: 'Weekly', label: 'Weekly' },
                            { value: 'Monthly', label: 'Monthly' },
                            { value: 'Custom', label: 'Custom' },
                          ]}
                          value={formik.values.repeatFrequency}
                          onChange={(val) => {
                            formik.setFieldValue('repeatFrequency', val);
                            formik.setFieldValue('day', '');
                            formik.setFieldValue('meetingDate', dayjs());
                            formik.setFieldValue('meetingTime', null);
                            formik.setFieldTouched('repeatFrequency', false);
                            openRecurringDialog.onTrue();
                          }}
                          formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                          error={
                            formik.touched.repeatFrequency && Boolean(formik.errors.repeatFrequency)
                          }
                          helperText={
                            formik.touched.repeatFrequency &&
                            typeof formik.errors.repeatFrequency === 'string'
                              ? formik.errors.repeatFrequency
                              : undefined
                          }
                        />
                      </ShakingTextField>
                    </Grid>

                    <CustomDialog
                      title="Recurring Schedule"
                      open={openRecurringDialog.value}
                      handleClose={() => openRecurringDialog.onFalse()}
                      maxWidth="sm"
                    >
                      <RecurringScheduleForm
                        initialValues={formik.values}
                        onClose={handleCloseDialog}
                        onSubmit={(values) => {
                          formik.setValues({
                            ...formik.values,
                            ...values, // merge recurring data
                          });
                          openRecurringDialog.onFalse();
                        }}
                      />
                    </CustomDialog>
                  </>
                )}

                {!formik.values.isRecurring && formik.values.typeName === 'Meeting' && (
                  <>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <ShakingTextField
                        error={!!(formik.touched.meetingDate && formik.errors.meetingDate)}
                      >
                        <DatePicker
                          label="Meeting Date *"
                          name="meetingDate"
                          format="DD/MM/YYYY"
                          value={formik.values.meetingDate}
                          onChange={(newValue) => formik.setFieldValue('meetingDate', newValue)}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: 'small',
                              error:
                                formik.touched.meetingDate && Boolean(formik.errors.meetingDate),
                              helperText:
                                formik.touched.meetingDate &&
                                typeof formik.errors.meetingDate === 'string'
                                  ? formik.errors.meetingDate
                                  : undefined,
                            },
                          }}
                        />
                      </ShakingTextField>
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                      <ShakingTextField
                        error={!!(formik.touched.startTime && formik.errors.startTime)}
                      >
                        <MobileTimePicker
                          label="Start Time *"
                          format="HH:mm"
                          name="startTime"
                          value={formik.values.startTime}
                          onChange={(newValue) => formik.setFieldValue('startTime', newValue)}
                          views={['hours', 'minutes']}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: 'small',
                              error: formik.touched.startTime && Boolean(formik.errors.startTime),
                              helperText:
                                formik.touched.startTime &&
                                typeof formik.errors.startTime === 'string'
                                  ? formik.errors.startTime
                                  : undefined,
                            },
                          }}
                        />
                      </ShakingTextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <ShakingTextField error={!!(formik.touched.endTime && formik.errors.endTime)}>
                        <MobileTimePicker
                          label="End Time *"
                          format="HH:mm"
                          name="endTime"
                          value={formik.values.endTime}
                          onChange={(newValue) => {
                            formik.setFieldValue('endTime', newValue);
                          }}
                          views={['hours', 'minutes']}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: 'small',
                              error: formik.touched.endTime && Boolean(formik.errors.endTime),
                              helperText:
                                formik.touched.endTime && typeof formik.errors.endTime === 'string'
                                  ? formik.errors.endTime
                                  : undefined,
                            },
                          }}
                        />
                      </ShakingTextField>
                    </Grid>
                  </>
                )}

                {formik.values.recurrenceSummary && (
                  <Grid size={{ xs: 12 }}>
                    <Box
                      sx={{
                        borderRadius: 1,
                        textAlign: 'center',
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      {formik.values.recurrenceSummary}
                    </Box>
                  </Grid>
                )}
              </SectionCard>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <SectionCard
                title="Event Mode"
                paperProps={{
                  sx: {
                    m: 0,
                  },
                }}
              >
                <Grid size={{ xs: 12 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <span>Offline</span>
                    <Switch
                      checked={formik.values.eventMode === 'online'}
                      onChange={(e) =>
                        formik.setFieldValue('eventMode', e.target.checked ? 'online' : 'offline')
                      }
                      size="small"
                    />
                    <span>Online</span>
                    {formik.touched.eventMode && formik.errors.eventMode && (
                      <FormHelperText error sx={{ pr: 3 }}>
                        {String(formik.errors.eventMode)}
                      </FormHelperText>
                    )}
                  </Box>
                </Grid>
                {formik.values.eventMode === 'online' ? (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <ShakingTextField
                      error={!!(formik.touched.onlineLink && formik.errors.onlineLink)}
                    >
                      <TextField
                        fullWidth
                        label="Online Meeting Link *"
                        name="onlineLink"
                        size="small"
                        value={formik.values.onlineLink}
                        onChange={formik.handleChange}
                        error={formik.touched.onlineLink && Boolean(formik.errors.onlineLink)}
                        helperText={formik.touched.onlineLink && formik.errors.onlineLink}
                      />
                    </ShakingTextField>
                  </Grid>
                ) : (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <ShakingTextField error={!!(formik.touched.venue && formik.errors.venue)}>
                      <TextField
                        fullWidth
                        label="Venue *"
                        size="small"
                        name="venue"
                        value={formik.values.venue}
                        error={formik.touched.venue && Boolean(formik.errors.venue)}
                        helperText={formik.touched.venue && formik.errors.venue}
                        onChange={(e) => {
                          const value = e.target.value
                            // Remove everything except letters and spaces
                            .replace(/[^a-zA-Z0-9\s]/g, '')
                            // Capitalize each word
                            .split(' ')
                            .map((word) =>
                              word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                            )
                            .join(' ');
                          formik.setFieldValue('venue', value);
                        }}
                      />
                    </ShakingTextField>
                  </Grid>
                )}
              </SectionCard>
            </Grid>
          </Scrollbar>
          <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onClose(null, false)}
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="contained"
              size="small"
              type="submit"
              loading={addEventTypeLoading || updateEventTypeLoading}
              startIcon={
                <Iconify
                  icon={initialValues ? GlobalIcons.edit : GlobalIcons.submit}
                  width={initialValues ? 16 : 20}
                  height={initialValues ? 16 : 20}
                />
              }
            >
              {initialValues ? 'Update' : 'Submit'}
            </LoadingButton>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default AddEvent;
