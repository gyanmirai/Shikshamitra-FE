'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import React from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import FileUploader from 'src/components/custom-upload';
import ShakingTextField from 'src/components/shaking-text-field';
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

const channels = ['In-App', 'Email', 'SMS', 'Whatsapp'];

const AnnouncementForm: React.FC<ISchoolWiseAnnouncementFormProps> = ({
  initialValues = null,
  isEdit = false,
  onClose,
}) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

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
                      label="Select Audience"
                      options={[
                        { value: 'Staff', label: 'Staff' },
                        { value: 'Students', label: 'Students' },
                        { value: 'Parents', label: 'Parents' },
                      ]}
                      multiple
                      value={formik.values.audience}
                      onChange={(val) => formik.setFieldValue('audience', val)}
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
                    <TextField
                      fullWidth
                      label="Announcement Description"
                      name="description"
                      multiline
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      error={formik.touched.description && Boolean(formik.errors.description)}
                      helperText={formik.touched.description && formik.errors.description}
                      size="small"
                      rows={4}
                    />
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

            {/* Start Time DatePicker */}
            <Grid size={{ xs: 12 }}>
              <SectionCard title="Basic Information">
                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.startDate && formik.errors.startDate) || false}
                  >
                    <DatePicker
                      label="Start Date *"
                      format="DD/MM/YYYY"
                      value={dayjs(formik.values.startDate)}
                      onChange={(newValue) => {
                        formik.setFieldValue('startDate', newValue);
                      }}
                      minDate={dayjs(currentYear?.startDate)}
                      maxDate={dayjs(currentYear?.endDate)}
                      sx={{ minWidth: 180, width: '100%' }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          error: !!(formik.touched.startDate && formik.errors.startDate) || false,
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
                    <DatePicker
                      label="End Date *"
                      format="DD/MM/YYYY"
                      minDate={dayjs(currentYear?.startDate)}
                      maxDate={dayjs(currentYear?.endDate)}
                      value={dayjs(formik.values.endDate)}
                      onChange={(newValue) => {
                        formik.setFieldValue('endDate', newValue);
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

                <Grid size={{ xs: 12 }}>
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
              </SectionCard>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <SectionCard title="Delivery Channels">
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {['inApp', 'email', 'sms', 'whatsapp'].map((type) => {
                      const labels: Record<string, string> = {
                        inApp: 'In-App',
                        email: 'Email',
                        sms: 'SMS',
                        whatsapp: 'Whatsapp',
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
                    {formik.touched.notification_preferences &&
                      formik.errors.notification_preferences && (
                        <FormHelperText error sx={{ pr: 3 }}>
                          {String(formik.errors.notification_preferences)}
                        </FormHelperText>
                      )}
                  </Box>
                </Grid>
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
