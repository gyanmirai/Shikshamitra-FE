'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import React from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { DateTimePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import FileUploader from 'src/components/custom-upload';
import { useGetRolesQuery } from 'src/redux/role/roleApi';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import {
  Box,
  Grid,
  Button,
  Checkbox,
  TextField,
  Typography,
  DialogActions,
  FormHelperText,
  FormControlLabel,
  // eslint-disable-next-line import/no-duplicates
} from '@mui/material';

import { schoolWiseValidationSchema } from './validationSchema';
import { getSchoolWiseAnnouncementInitialValues } from './components/getSchoolInitialValues';

import type { ISchoolWiseAnnouncementFormProps } from './type';

export const audienceOptions = [
  { value: 'Staff', name: 'Staff', color: '#4CAF50' },
  { value: 'Students', name: 'Students', color: '#2196F3' },
  { value: 'Parents', name: 'Parents', color: '#FF9800' },
  { value: 'Teachers', name: 'Teachers', color: '#9C27B0' },
];

const AnnouncementForm: React.FC<ISchoolWiseAnnouncementFormProps> = ({
  initialValues = null,
  isEdit = false,
  onClose,
}) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  // Roles API
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRolesQuery,
  });
  const formik = useFormik({
    initialValues: getSchoolWiseAnnouncementInitialValues(initialValues),
    validationSchema: schoolWiseValidationSchema(currentYear),
    onSubmit: (values) => {
      onClose(null, true);
    },
  });
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
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
                      label="Announcement Type *"
                      options={[
                        { value: 'academic', label: 'Academic' },
                        { value: 'administrative', label: 'Administrative' },
                        { value: 'extracurriculam', label: 'Extracurriculam' },
                      ]}
                      value={formik.values.type}
                      onChange={(val) => formik.setFieldValue('type', val)}
                      formControlProps={{ fullWidth: true, sx: { minWidth: 200 } }}
                      error={formik.touched.type && Boolean(formik.errors.type)}
                      helperText={
                        formik.touched.type && formik.errors.type ? formik.errors.type : undefined
                      }
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12, md: 6, sm: 3 }}>
                  <ShakingTextField error={!!(formik.touched.audience && formik.errors.audience)}>
                    <CustomSelect
                      label="Select Audience *"
                      options={audienceOptions}
                      multiple
                      value={formik.values.audience.map((aud) => aud.name)} // show only names in the UI
                      onChange={(val) => {
                        const selectedObjects = audienceOptions.filter((opt) =>
                          (val as string[]).includes(opt.name)
                        );
                        formik.setFieldValue('audience', selectedObjects);
                      }}
                      labelKey="name"
                      formControlProps={{ fullWidth: true, sx: { minWidth: 200 } }}
                      error={formik.touched.audience && Boolean(formik.errors.audience)}
                      helperText={
                        Array.isArray(formik.errors.audience)
                          ? formik.errors.audience.join(', ')
                          : (formik.touched.audience && formik.errors.audience) || undefined
                      }
                    />
                  </ShakingTextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6, sm: 3 }}>
                  <ShakingTextField
                    error={!!(formik.touched.importance_level && formik.errors.importance_level)}
                  >
                    <CustomSelect
                      label="Importance Level"
                      options={[
                        { value: 'urgent', label: 'Urgent' },
                        { value: 'critical', label: 'Critical' },
                      ]}
                      value={formik.values.importance_level as string}
                      onChange={(val) => formik.setFieldValue('importance_level', val as string)}
                      formControlProps={{ fullWidth: true, sx: { minWidth: 200 } }}
                      error={
                        formik.touched.importance_level && Boolean(formik.errors.importance_level)
                      }
                      helperText={
                        formik.touched.importance_level && formik.errors.importance_level
                          ? formik.errors.importance_level
                          : undefined
                      }
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <ShakingTextField
                    error={!!(formik.touched.description && formik.errors.description)}
                  >
                    {/* <Editor
                      value={formik.values.description}
                      onChange={(value) => {
                        formik.setFieldValue('description', value);
                      }}
                      placeholder="Description *"
                      sx={{
                        border: `1px solid ${theme.vars.palette.grey[500]}`,
                        borderRadius: 1,
                        '&:hover': { borderColor: theme.vars.palette.text.primary },
                        ...(!!formik.errors.description && {
                          borderColor: theme.palette.error.main,
                        }),
                        '&:focus-within': {
                          borderColor: theme.vars.palette.text.primary,
                          borderWidth: 2,
                        },
                      }}
                    /> */}
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <FileUploader
                    value={formik.values.attachment as any}
                    multiple={false}
                    showVisibleDocumentCount={1}
                    onChange={(value) => formik.setFieldValue('attachment', value)}
                    primaryText="Please Upload Your File"
                    secondaryText="Maximum file size is 5MB"
                  />
                </Grid>
              </SectionCard>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <SectionCard title="Delivery Channels">
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {['In-App', 'Email', 'SMS', 'Whatsapp'].map((type) => {
                      const labels: Record<string, string> = {
                        'In-App': 'In-App',
                        Email: 'Email',
                        SMS: 'SMS',
                        Whatsapp: 'Whatsapp',
                      };

                      return (
                        <FormControlLabel
                          key={type}
                          control={
                            <Checkbox
                              checked={formik.values.notification_preferences.includes(type)}
                              onChange={() => {
                                const current = formik.values.notification_preferences || [];
                                if (current.includes(type)) {
                                  formik.setFieldValue(
                                    'notification_preferences',
                                    current.filter((c: string) => c !== type)
                                  );
                                } else {
                                  formik.setFieldValue('notification_preferences', [
                                    ...current,
                                    type,
                                  ]);
                                }
                              }}
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant="body2">{labels[type]}</Typography>
                            </Box>
                          }
                        />
                      );
                    })}
                  </Box>

                  {/* Helper Text inside SectionCard */}
                  {formik.touched.notification_preferences &&
                    formik.errors.notification_preferences && (
                      <FormHelperText error sx={{ mt: 1, position: 'unset' }}>
                        {String(formik.errors.notification_preferences)}
                      </FormHelperText>
                    )}
                </Grid>
              </SectionCard>
            </Grid>

            {/* Start Time DatePicker */}
            <Grid size={{ xs: 12 }}>
              <SectionCard title="Scheduling">
                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.startDate && formik.errors.startDate) || false}
                  >
                    <DateTimePicker
                      label="Start Date-Time *"
                      format="DD/MM/YYYY hh:mm"
                      value={dayjs(formik.values.startDate)}
                      onChange={(newValue) => {
                        formik.setFieldValue('startDate', newValue);

                        // Calculate duration in days between start and end date
                        if (newValue && formik.values.startDate) {
                          const start = dayjs(formik.values.startDate);
                          const end = dayjs(newValue);
                          const durationInDays = end.diff(start, 'day');
                          formik.setFieldValue('duration', Math.max(0, durationInDays));
                        }
                      }}
                      minDateTime={dayjs()} // <- disables past date and time
                      maxDate={dayjs(currentYear?.endDate)}
                      sx={{ minWidth: 180, width: '100%' }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          error: !!(formik.touched.startDate && formik.errors.startDate),
                          helperText: formik.touched.startDate && formik.errors.startDate,
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>

                {/* End Time DatePicker */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.endDate && formik.errors.endDate) || false}
                  >
                    <DateTimePicker
                      label="End Date-Time *"
                      format="DD/MM/YYYY hh:mm"
                      minDate={dayjs(currentYear?.startDate)}
                      maxDate={dayjs(currentYear?.endDate)}
                      value={dayjs(formik.values.endDate)}
                      onChange={(newValue) => {
                        formik.setFieldValue('endDate', newValue);
                        formik.setFieldTouched('endDate', false);
                        // Calculate duration in days between start and end date
                        if (newValue && formik.values.startDate) {
                          const start = dayjs(formik.values.startDate);
                          const end = dayjs(newValue);
                          const durationInDays = end.diff(start, 'day');
                          formik.setFieldValue('duration', Math.max(0, durationInDays));
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

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Duration (in days) *"
                    name="duration"
                    type="number"
                    value={formik.values.duration}
                    disabled
                    InputProps={{
                      inputProps: { min: 0 },
                    }}
                    error={formik.touched.duration && Boolean(formik.errors.duration)}
                    helperText={formik.touched.duration && formik.errors.duration}
                    size="small"
                  />
                </Grid>

                {formik.values.notification_preferences.includes('inApp') && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.isAllowAcknoledgement}
                          onChange={(e) =>
                            formik.setFieldValue('isAllowAcknoledgement', e.target.checked)
                          }
                        />
                      }
                      label="Allow Acknowledgement? (checkbox → recipients click “I’ve read this”)"
                    />
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
            <Button
              variant="contained"
              size="small"
              type="submit"
              startIcon={
                <Iconify
                  icon={initialValues ? GlobalIcons.edit : GlobalIcons.submit}
                  width={initialValues ? 16 : 20}
                  height={initialValues ? 16 : 20}
                />
              }
            >
              {initialValues ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default AnnouncementForm;
