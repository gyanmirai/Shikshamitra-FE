'use client';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { DateTimePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { upcomingEventvalidationSchema } from './validationSchema';

import type { AddEventProps } from './type';

const AddEvent: React.FC<AddEventProps> = ({ onSubmit, initialValues = null, isEdit = false }) => {
  /**
   * Custom hook to fetch class data using the useGetClassQuery mutation
   */
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  /**
   * Array of predefined organization options with their values and labels
   */
  const allOrganizations = [
    { value: 'Pre Primary', label: 'Pre Primary' },
    { value: 'Primary', label: 'Primary' },
    { value: 'Secondary', label: 'Secondary' },
    { value: 'Higher Secondary', label: 'Higher Secondary' },
  ];

  /**
   * State to track if all organizations are selected
   * Initialized based on if initial organization values length matches total organizations
   */
  const [isAllOrganizationSelected, setIsAllOrganizationSelected] = useState(
    initialValues?.organization?.length === allOrganizations.length
  );

  /**
   * State to track if all classes are selected
   * Initialized based on if initial class values length matches total classes
   */
  const [isAllClassesSelected, setIsAllClassesSelected] = useState(
    initialValues?.className?.length === classData?.items?.length
  );

  /**
   * Handles changes in organization selection
   * @param selectedValues - Array of selected organization values
   * If 'all' or 'deselectAll' is selected:
   * - Toggles between selecting all organizations or none
   * For normal selection:
   * - Updates selected organizations and checks if all are selected
   */
  const handleOrganizationChange = (selectedValues: string[]) => {
    if (selectedValues.includes('all') || selectedValues.includes('deselectAll')) {
      const allOrganizationValues = allOrganizations.map((org) => org.value);
      if (isAllOrganizationSelected) {
        formik.setFieldValue('organization', []);
      } else {
        formik.setFieldValue('organization', allOrganizationValues);
      }
      setIsAllOrganizationSelected(!isAllOrganizationSelected);
    } else {
      formik.setFieldValue('organization', selectedValues);
      setIsAllOrganizationSelected(selectedValues.length === allOrganizations.length);
    }
  };

  /**
   * Handles changes in class selection
   * @param selectedValues - Array of selected class values
   * If 'all' or 'deselectAll' is selected:
   * - Toggles between selecting all classes or none
   * For normal selection:
   * - Updates selected classes and checks if all are selected
   */
  const handleClass = (selectedValues: string[]) => {
    const allClassesValues = classData?.items?.map((org: any) => org.name);
    if (selectedValues.includes('all') || selectedValues.includes('deselectAll')) {
      if (isAllClassesSelected) {
        formik.setFieldValue('className', []);
      } else {
        formik.setFieldValue('className', allClassesValues);
      }
      setIsAllClassesSelected(!isAllClassesSelected);
    } else {
      formik.setFieldValue('className', selectedValues);
      setIsAllClassesSelected(selectedValues.length === allClassesValues.length);
    }
  };

  const formik = useFormik({
    initialValues: {
      eventTitle: initialValues?.eventTitle || '',
      eventVenue: initialValues?.eventVenue || '',
      audience: initialValues?.audience || [],
      organization: initialValues?.organization || [],
      className: initialValues?.className || [],
      eventStartDate: initialValues?.eventStartDate ? dayjs(initialValues?.eventStartDate) : null,
      eventEndDate: initialValues?.eventEndDate ? dayjs(initialValues?.eventEndDate) : null,
      eventType: initialValues?.eventType || '',
      description: initialValues?.description || '',
      eventOrganizer: initialValues?.eventOrganizer || '',
      eventBudget: initialValues?.eventBudget || '',
    },
    validationSchema: upcomingEventvalidationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
      <Box display="flex" flexDirection="column" gap={2} height="100%">
        <Scrollbar sx={{ p: 2, height: '100%' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={!!(formik.touched.eventTitle && formik.errors.eventTitle) || false}
              >
                <TextField
                  fullWidth
                  label="Event Title"
                  name="eventTitle"
                  value={formik.values.eventTitle}
                  onChange={formik.handleChange}
                  error={formik.touched.eventTitle && Boolean(formik.errors.eventTitle)}
                  helperText={formik.touched.eventTitle && formik.errors.eventTitle}
                  size="small"
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={!!(formik.touched.eventVenue && formik.errors.eventVenue) || false}
              >
                <TextField
                  fullWidth
                  label="Event Venue"
                  name="eventVenue"
                  value={formik.values.eventVenue}
                  onChange={formik.handleChange}
                  error={formik.touched.eventVenue && Boolean(formik.errors.eventVenue)}
                  helperText={formik.touched.eventVenue && formik.errors.eventVenue}
                  size="small"
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={!!(formik.touched.organization && formik.errors.organization) || false}
              >
                <CustomSelect
                  label="Select Organizations"
                  options={[
                    {
                      value: isAllOrganizationSelected ? 'deselectAll' : 'all',
                      label: isAllOrganizationSelected ? 'Deselect All' : 'All',
                    },
                    ...allOrganizations,
                  ]}
                  value={formik.values.organization}
                  onChange={(val) => {
                    handleOrganizationChange(val as string[]);
                  }}
                  multiple
                  formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                  error={formik.touched.organization && Boolean(formik.errors.organization)}
                  helperText={
                    Array.isArray(formik.errors.organization)
                      ? formik.errors.organization.join(', ')
                      : (formik.touched.organization && formik.errors.organization) || undefined
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={!!(formik.touched.className && formik.errors.className) || false}
              >
                <CustomSelect
                  options={[
                    {
                      id: isAllClassesSelected ? 'deselectAll' : 'all',
                      name: isAllClassesSelected ? 'Deselect All' : 'All',
                    },
                    ...(classData?.items || []),
                  ]}
                  value={formik.values.className}
                  onChange={(val) => {
                    handleClass(val as string[]);
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
                error={!!(formik.touched.eventStartDate && formik.errors.eventStartDate) || false}
              >
                <DateTimePicker
                  label="Event Start Date"
                  name="eventStartDate"
                  format="DD/MM/YYYY HH:mm"
                  value={formik.values.eventStartDate}
                  onChange={(newValue) => {
                    formik.setFieldValue('eventStartDate', newValue);
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      error: formik.touched.eventStartDate && Boolean(formik.errors.eventStartDate),
                      helperText: formik.touched.eventStartDate && formik.errors.eventStartDate,
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={!!(formik.touched.eventEndDate && formik.errors.eventEndDate) || false}
              >
                <DateTimePicker
                  label="Event End Date"
                  name="eventEndDate"
                  format="DD/MM/YYYY HH:mm"
                  value={formik.values.eventEndDate}
                  onChange={(newValue) => {
                    formik.setFieldValue('eventEndDate', newValue);
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      error: formik.touched.eventEndDate && Boolean(formik.errors.eventEndDate),
                      helperText: formik.touched.eventEndDate && formik.errors.eventEndDate,
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={!!(formik.touched.eventType && formik.errors.eventType) || false}
              >
                <CustomSelect
                  options={[
                    { value: 'academic', label: 'Academic' },
                    { value: 'cultural', label: 'Cultural' },
                    { value: 'sports', label: 'Sports' },
                    { value: 'Parent Teacher Meeting', label: 'Parent Teacher Meeting' },
                  ]}
                  value={formik.values.eventType}
                  onChange={(val) => {
                    formik.setFieldValue('eventType', val as string);
                  }}
                  label="Event Type"
                  formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                  error={formik.touched.eventType && Boolean(formik.errors.eventType)}
                  helperText={
                    formik.touched.eventType && formik.errors.eventType
                      ? formik.errors.eventType
                      : undefined
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
                    formik.setFieldValue('audience', val as string[]);
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

            <Grid item xs={12}>
              <ShakingTextField
                error={!!(formik.touched.description && formik.errors.description) || false}
              >
                <TextField
                  fullWidth
                  label="Event Description"
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

            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={!!(formik.touched.eventOrganizer && formik.errors.eventOrganizer) || false}
              >
                <TextField
                  fullWidth
                  label="Event Organizer"
                  name="eventOrganizer"
                  value={formik.values.eventOrganizer}
                  onChange={formik.handleChange}
                  error={formik.touched.eventOrganizer && Boolean(formik.errors.eventOrganizer)}
                  helperText={formik.touched.eventOrganizer && formik.errors.eventOrganizer}
                  size="small"
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={!!(formik.touched.eventBudget && formik.errors.eventBudget) || false}
              >
                <TextField
                  fullWidth
                  label="Event Budget"
                  name="eventBudget"
                  value={formik.values.eventBudget}
                  onChange={formik.handleChange}
                  error={formik.touched.eventBudget && Boolean(formik.errors.eventBudget)}
                  helperText={formik.touched.eventBudget && formik.errors.eventBudget}
                  size="small"
                />
              </ShakingTextField>
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

export default AddEvent;
