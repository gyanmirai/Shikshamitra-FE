'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { uuidv4 } from 'src/utils/uuidv4';
import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { DateTimePicker } from '@mui/x-date-pickers';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import {
  Box,
  Grid,
  Switch,
  Button,
  Checkbox,
  TextField,
  Typography,
  DialogActions,
  FormHelperText,
  InputAdornment,
  FormControlLabel,
  // eslint-disable-next-line import/no-duplicates
} from '@mui/material';

import { validationSchema } from './validationSchema';
import { getSchoolInitialValues } from './components/getSchoolInitialValues';

import type { ISchoolWiseAnnouncementFormProps } from './type';

const AnnouncementForm: React.FC<ISchoolWiseAnnouncementFormProps> = ({
  onSubmit,
  initialValues = null,
  isEdit = false,
}) => {
  // List of available organizations/schools
  const allOrganizations = [
    { value: 'Pre Primary', label: 'Pre Primary' },
    { value: 'Primary', label: 'Primary' },
    { value: 'Secondary', label: 'Secondary' },
    { value: 'Higher Secondary', label: 'Higher Secondary' },
  ];

  // State to track if all organizations are selected
  const [isAllSelected, setIsAllSelected] = useState(
    initialValues?.organization?.length === allOrganizations.length
  );

  /**
   * Determines the status of the announcement based on scheduling and publish date
   * @param isScheduled - Boolean indicating if announcement is scheduled
   * @param selectedDate - Selected publish date
   * @returns 'Published' if not scheduled or date is in past, 'Scheduled' if date is in future
   */
  const determineStatus = (isScheduled: boolean, selectedDate: Dayjs | null) => {
    if (!isScheduled) return 'Published';
    if (!selectedDate) return 'Scheduled';

    const now = dayjs();
    return selectedDate.isAfter(now) ? 'Scheduled' : 'Published';
  };

  const formik = useFormik({
    initialValues: getSchoolInitialValues(initialValues),
    validationSchema,
    onSubmit: (values) => {
      onSubmit({
        ...values,
        id: uuidv4(),
        publishDate: values.isScheduled ? values.publishDate : dayjs(),
        status: determineStatus(values.isScheduled, values.publishDate),
      });
    },
  });

  /**
   * Handles changes to the publish date
   * Updates the form values with new date and recalculates announcement status
   * @param newDate - The newly selected date
   */
  const handleDateChange = (newDate: Dayjs | null) => {
    if (newDate) {
      const newStatus = determineStatus(formik.values.isScheduled, newDate);
      formik.setValues({
        ...formik.values,
        publishDate: newDate,
        status: newStatus,
      });
    }
  };

  /**
   * Handles changes to organization selection
   * Manages bulk selection/deselection of all organizations and individual selections
   * Updates the form values and tracks if all organizations are selected
   * @param selectedValues - Array of selected organization values
   */
  const handleOrganizationChange = (selectedValues: string[]) => {
    if (selectedValues.includes('all') || selectedValues.includes('deselectAll')) {
      const allOrganizationValues = allOrganizations.map((org) => org.value);
      if (isAllSelected) {
        formik.setFieldValue('organization', []);
      } else {
        formik.setFieldValue('organization', allOrganizationValues);
      }
      setIsAllSelected(!isAllSelected);
    } else {
      formik.setFieldValue('organization', selectedValues);
      setIsAllSelected(selectedValues.length === allOrganizations.length);
    }
  };

  /**
   * Handles changes to notification preferences
   * Toggles individual notification preferences on/off
   * @param preference - The notification preference to toggle
   */
  const handleNotificationPreferenceChange = (preference: string) => {
    const currentPreferences = formik.values.notification_preferences;
    const updatedPreferences = currentPreferences.includes(preference)
      ? currentPreferences.filter((p) => p !== preference)
      : [...currentPreferences, preference];

    formik.setFieldValue('notification_preferences', updatedPreferences);
  };
  return (
    <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
      <Box display="flex" flexDirection="column" gap={2} height="100%">
        <Scrollbar sx={{ p: 2, height: '100%' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={!!(formik.touched.title && formik.errors.title)}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                  size="small"
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField
                error={!!(formik.touched.organization && formik.errors.organization)}
              >
                <CustomSelect
                  label="Select Organizations"
                  options={[
                    {
                      value: isAllSelected ? 'deselectAll' : 'all',
                      label: isAllSelected ? 'Deselect All' : 'All',
                    },
                    ...allOrganizations,
                  ]}
                  value={formik.values.organization}
                  onChange={(val) => handleOrganizationChange(val as string[])}
                  multiple
                  formControlProps={{ fullWidth: true, sx: { minWidth: 200 } }}
                  error={formik.touched.organization && Boolean(formik.errors.organization)}
                  helperText={
                    Array.isArray(formik.errors.organization)
                      ? formik.errors.organization.join(', ')
                      : (formik.touched.organization && formik.errors.organization) || undefined
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
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

            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={!!(formik.touched.expiryDate && formik.errors.expiryDate)}>
                <DateTimePicker
                  label="Expiry Date & Time"
                  value={formik.values.expiryDate}
                  onChange={(newDate) => formik.setFieldValue('expiryDate', newDate)}
                  format="DD/MM/YYYY HH:mm"
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: formik.touched.expiryDate && Boolean(formik.errors.expiryDate),
                      helperText: formik.touched.expiryDate && formik.errors.expiryDate,
                    },
                  }}
                  disablePast
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={!!(formik.touched.category && formik.errors.category)}>
                <CustomSelect
                  label="Select Category"
                  options={[
                    { value: 'academic', label: 'Academic' },
                    { value: 'administrative', label: 'Administrative' },
                    { value: 'extracurriculam', label: 'Extracurriculam' },
                  ]}
                  value={formik.values.category}
                  onChange={(val) => formik.setFieldValue('category', val)}
                  formControlProps={{ fullWidth: true, sx: { minWidth: 200 } }}
                  error={formik.touched.category && Boolean(formik.errors.category)}
                  helperText={
                    formik.touched.category && formik.errors.category
                      ? formik.errors.category
                      : undefined
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField
                error={!!(formik.touched.importance_level && formik.errors.importance_level)}
              >
                <CustomSelect
                  label="Importance Level"
                  options={[
                    { value: 'urgent', label: 'Urgent' },
                    { value: 'critical', label: 'Critical' },
                  ]}
                  value={formik.values.importance_level}
                  onChange={(val) => formik.setFieldValue('importance_level', val)}
                  formControlProps={{ fullWidth: true, sx: { minWidth: 200 } }}
                  error={formik.touched.importance_level && Boolean(formik.errors.importance_level)}
                  helperText={
                    formik.touched.importance_level && formik.errors.importance_level
                      ? formik.errors.importance_level
                      : undefined
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.isScheduled}
                    onChange={(e) => formik.setFieldValue('isScheduled', e.target.checked)}
                  />
                }
                label="Schedule Announcement"
              />
            </Grid>

            {formik.values.isScheduled && (
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.publishDate && formik.errors.publishDate)}
                >
                  <DateTimePicker
                    label="Schedule Date & Time"
                    value={formik.values.publishDate}
                    format="DD/MM/YYYY HH:mm"
                    onChange={handleDateChange}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error: formik.touched.publishDate && Boolean(formik.errors.publishDate),
                      },
                    }}
                    disablePast
                  />
                </ShakingTextField>
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <ShakingTextField error={!!(formik.touched.description && formik.errors.description)}>
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
              <UploadBox
                onDrop={() => {}}
                placeholder={
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.5,
                      color: 'text.disabled',
                    }}
                  >
                    <Iconify icon="eva:cloud-upload-fill" width={40} />
                    <Typography variant="body2">Upload Document</Typography>
                  </Box>
                }
                sx={{ py: 2.5, width: '100%', height: 'auto', borderRadius: 1.5 }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={!!(formik.touched.link && formik.errors.link)}>
                <TextField
                  fullWidth
                  label="Link"
                  name="link"
                  value={formik.values.link}
                  onChange={formik.handleChange}
                  error={formik.touched.link && Boolean(formik.errors.link)}
                  helperText={formik.touched.link && formik.errors.link}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="typcn:attachment" />
                      </InputAdornment>
                    ),
                  }}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom>
                Notification Preferences
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {['email', 'sms', 'app'].map((type) => {
                  const icons: Record<string, string> = {
                    email: 'mdi:email-outline',
                    sms: 'mdi:message-outline',
                    app: 'mdi:bell-outline',
                  };
                  const labels: Record<string, string> = {
                    email: 'Email',
                    sms: 'SMS',
                    app: 'App Notification',
                  };
                  return (
                    <FormControlLabel
                      key={type}
                      control={
                        <Checkbox
                          checked={formik.values.notification_preferences.includes(type)}
                          onChange={() => handleNotificationPreferenceChange(type)}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Iconify icon={icons[type]} />
                          <Typography variant="body2">{labels[type]}</Typography>
                        </Box>
                      }
                    />
                  );
                })}
              </Box>
              {formik.touched.notification_preferences &&
                formik.errors.notification_preferences && (
                  <FormHelperText error>
                    {String(formik.errors.notification_preferences)}
                  </FormHelperText>
                )}
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button type="submit" variant="contained">
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Box>
    </form>
  );
};

export default AnnouncementForm;
