'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { DateTimePicker } from '@mui/x-date-pickers';
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
} from '@mui/material';

import { uuidv4 } from 'src/utils/uuidv4';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { getClassInitialValues } from './getClassInitialValues';
import { classWiseValidationSchema } from '../validationSchema';

import type { IClassWiseAnnouncementFormProps, IClassWiseAnnouncementFormikValues } from '../type';

const AnnouncementForm: React.FC<IClassWiseAnnouncementFormProps> = ({
  onSubmit,
  initialValues = null,
  isEdit = false,
}: IClassWiseAnnouncementFormProps) => {
  // Determines the announcement status based on scheduling and date
  // Returns 'Published' if not scheduled, 'Scheduled' if date is in future
  const determineStatus = (isScheduled: boolean, selectedDate: Dayjs | null) => {
    if (!isScheduled) return 'Published';
    if (!selectedDate) return 'Scheduled';

    const now = dayjs();
    return selectedDate.isAfter(now) ? 'Scheduled' : 'Published';
  };

  // Available division options for the announcement
  const divisionOption = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
  ];

  // Track if all divisions are selected by comparing initial division length with available options
  const [isAllSelected, setIsAllSelected] = useState(
    initialValues?.division?.length === divisionOption.length
  );

  const formik = useFormik<IClassWiseAnnouncementFormikValues>({
    initialValues: getClassInitialValues(initialValues),
    validationSchema: classWiseValidationSchema,
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
   * Fetches class data using a custom hook that combines query and mutation functionality
   * @returns {Object} An object containing class data and loading state
   * @property {Array} data - The fetched class data
   * @property {boolean} isLoading - Loading state indicator
   */
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  /**
   * Handles changes to the publish date and updates the announcement status accordingly
   * @param newDate - The new date selected by the user
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
   * Toggles notification preferences by adding or removing them from the selected preferences array
   * @param preference - The notification preference to toggle
   */
  const handleNotificationPreferenceChange = (preference: string) => {
    const currentPreferences = formik.values.notification_preferences;
    const updatedPreferences = currentPreferences.includes(preference)
      ? currentPreferences.filter((p) => p !== preference)
      : [...currentPreferences, preference];

    formik.setFieldValue('notification_preferences', updatedPreferences);
  };

  /**
   * Handles division selection changes including select all/deselect all functionality
   * @param selectedValues - Array of selected division values
   */
  const handleDivisionChange = (selectedValues: string[]) => {
    if (selectedValues.includes('all') || selectedValues.includes('deselectAll')) {
      const allDivision = divisionOption.map((org) => org.value);
      if (isAllSelected) {
        formik.setFieldValue('division', []);
      } else {
        formik.setFieldValue('division', allDivision);
      }
      setIsAllSelected(!isAllSelected);
    } else {
      formik.setFieldValue('division', selectedValues);
      setIsAllSelected(selectedValues.length === divisionOption.length);
    }
  };
  return (
    <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
      <Box display="flex" flexDirection="column" gap={2} height="100%">
        <Scrollbar sx={{ p: 2, height: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ShakingTextField error={!!(formik.touched.title && formik.errors.title) || false}>
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
            <Grid item xs={12} sm={6}>
              <ShakingTextField
                error={!!(formik.touched.className && formik.errors.className) || false}
              >
                <CustomSelect
                  options={classData?.items || []}
                  value={formik.values.className}
                  onChange={(val) => {
                    formik.setFieldValue('className', val);
                  }}
                  label="Class"
                  isLoading={isLoading}
                  multiple
                  labelKey="name"
                  valueKey="name"
                  formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                  error={formik.touched.className && Boolean(formik.errors.className)}
                  helperText={
                    Array.isArray(formik.errors.className)
                      ? formik.errors.className.join(', ')
                      : (formik.touched.className && formik.errors.className) || undefined
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={!!(formik.touched.division && formik.errors.division) || false}
              >
                <CustomSelect
                  label="Select Divisions"
                  options={[
                    {
                      value: isAllSelected ? 'deselectAll' : 'all',
                      label: isAllSelected ? 'Deselect All' : 'All',
                    },
                    ...divisionOption,
                  ]}
                  value={formik.values.division}
                  onChange={(val) => {
                    handleDivisionChange(val as string[]);
                  }}
                  multiple
                  formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                  error={formik.touched.division && Boolean(formik.errors.division)}
                  helperText={
                    Array.isArray(formik.errors.division)
                      ? formik.errors.division.join(', ')
                      : (formik.touched.division && formik.errors.division) || undefined
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <ShakingTextField
                error={!!(formik.touched.audience && formik.errors.audience) || false}
              >
                <CustomSelect
                  label="Select Audience"
                  options={[
                    { value: 'Students', label: 'Students' },
                    { value: 'Parents', label: 'Parents' },
                  ]}
                  multiple
                  value={formik.values.audience}
                  onChange={(val) => {
                    formik.setFieldValue('audience', val);
                  }}
                  formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                  error={formik.touched.audience && Boolean(formik.errors.audience)}
                  helperText={
                    Array.isArray(formik.errors.audience)
                      ? formik.errors.audience.join(', ')
                      : (formik.touched.audience && formik.errors.audience) || undefined
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={!!(formik.touched.expiryDate && formik.errors.expiryDate) || false}
              >
                <DateTimePicker
                  label="Expiry Date & Time"
                  value={formik.values.expiryDate}
                  onChange={(value) => {
                    formik.setFieldValue('expiryDate', value);
                  }}
                  format="DD-MM-YYYY HH:mm"
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

            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={!!(formik.touched.category && formik.errors.category) || false}
              >
                <CustomSelect
                  label="Select Category"
                  options={[
                    { value: 'academic', label: 'Academic' },
                    { value: 'administrative', label: 'Administrative' },
                    { value: 'extracurriculam', label: 'Extracurriculam' },
                  ]}
                  value={formik.values.category}
                  onChange={(val) => {
                    formik.setFieldValue('category', val);
                  }}
                  formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                  error={formik.touched.category && Boolean(formik.errors.category)}
                  helperText={(formik.touched.category && formik.errors.category) || undefined}
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={
                  !!(formik.touched.importance_level && formik.errors.importance_level) || false
                }
              >
                <CustomSelect
                  label="Importance Level"
                  options={[
                    { value: 'urgent', label: 'Urgent' },
                    { value: 'critical', label: 'Critical' },
                    { value: 'high', label: 'High' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'low', label: 'Low' },
                    { value: 'informational', label: 'Informational' },
                  ]}
                  placeholder="Announcement Importance level"
                  value={formik.values.importance_level}
                  onChange={(val) => {
                    formik.setFieldValue('importance_level', val);
                  }}
                  formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                  error={formik.touched.importance_level && Boolean(formik.errors.importance_level)}
                  helperText={
                    (formik.touched.importance_level && formik.errors.importance_level) || undefined
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.isScheduled}
                    onChange={(e) => {
                      formik.setFieldValue('isScheduled', e.target.checked);
                    }}
                  />
                }
                label="Schedule Announcement"
              />
            </Grid>
            {formik.values.isScheduled && (
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.className && formik.errors.className) || false}
                >
                  <DateTimePicker
                    label="Schedule Date & Time"
                    format="DD-MM-YYYY HH:mm"
                    value={formik.values.publishDate}
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

            <Grid item xs={12}>
              <ShakingTextField
                error={!!(formik.touched.description && formik.errors.description) || false}
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
            <Grid item xs={12}>
              <UploadBox
                onDrop={() => {}}
                placeholder={
                  <Box
                    sx={{
                      gap: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.disabled',
                      flexDirection: 'column',
                    }}
                  >
                    <Iconify icon="eva:cloud-upload-fill" width={40} />
                    <Typography variant="body2">Upload Document</Typography>
                  </Box>
                }
                sx={{
                  py: 2.5,
                  width: '100%',
                  height: 'auto',
                  borderRadius: 1.5,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <ShakingTextField error={!!(formik.touched.link && formik.errors.link) || false}>
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

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Notification Preferences
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.notification_preferences.includes('email')}
                      onChange={() => handleNotificationPreferenceChange('email')}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Iconify icon="mdi:email-outline" />
                      <Typography variant="body2">Email</Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.notification_preferences.includes('sms')}
                      onChange={() => handleNotificationPreferenceChange('sms')}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Iconify icon="mdi:message-outline" />
                      <Typography variant="body2">SMS</Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.notification_preferences.includes('app')}
                      onChange={() => handleNotificationPreferenceChange('app')}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Iconify icon="mdi:bell-outline" />
                      <Typography variant="body2">App Notification</Typography>
                    </Box>
                  }
                />
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
