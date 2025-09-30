'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import FileUploader from 'src/components/custom-upload';
import { shikshaMitraToast } from 'src/components/toast';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import {
  Box,
  Grid,
  Radio,
  Button,
  Switch,
  TextField,
  DialogActions,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import { getEventInitialValues } from './components/getEventInitialValues';
import { eventAnnouncementValidationSchema } from './components/getValidationEventSchema';

import type { IAddEventProps } from './type';

const AddEvent: React.FC<IAddEventProps> = ({ initialValues = null, onClose, isEdit = false }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  // Redux state for current board, medium and medium setter
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // State to store list of all organizations/branches
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);

  // State to store list of all classes/standards
  const [allClass, setAllClass] = useState<Standards[]>([]);

  // State to store list of all divisions
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  const formik = useFormik({
    initialValues: getEventInitialValues(initialValues),
    validationSchema: eventAnnouncementValidationSchema(currentYear),
    onSubmit: (values) => {
      if (initialValues) {
        shikshaMitraToast.success({
          message: `Event : ${values.title} updated successfully!`,
        });
      } else {
        shikshaMitraToast.success({
          message: `Event : ${values.title} added successfully!`,
        });
      }
      onClose(null, true);
    },
  });

  // Update organizations list when medium changes
  useEffect(() => {
    const orgs = cloneDeep(medium?.educationMediumStages || []);

    // Add "All" if not present
    if (!orgs.some((org: Organization) => org.id === 'all')) {
      orgs.unshift({
        id: 'all',
        name: 'All',
        creationTime: '',
        creatorId: '',
        lastModificationTime: '',
        lastModifierId: '',
        educationMediumId: '',
        standards: [],
      });
    }

    setAllOrganization(orgs);
  }, [medium?.educationMediumStages]);

  // Update divisions list when class selection changes
  useEffect(() => {
    if (formik.values.classes.length === 0) {
      setAllDivision([]);
      if (!isEdit) formik.setFieldValue('divisions', []); // only reset on create
      return;
    }

    if (formik.values.classes.length === 1 && formik.values.classes[0] !== 'all') {
      const selectedClass = allClass.find((cls: any) => cls?.id === formik.values.classes[0]);
      const divisions = selectedClass?.divisions || [];
      setAllDivision(divisions);

      if (!isEdit) {
        const divisionIds = divisions.map((div: any) => div.id);
        formik.setFieldValue('divisions', [...divisionIds]);
      }
    } else {
      setAllDivision([
        {
          id: 'all',
          name: 'All',
          creationTime: '',
          creatorId: '',
          lastModificationTime: '',
          lastModifierId: '',
          strength: 0,
          standardId: '',
        },
      ]);
      if (!isEdit) formik.setFieldValue('divisions', ['all']);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allClass, formik.values.classes]);

  // Update classes list when organization selection changes
  useEffect(() => {
    if (formik.values.organizations.length === 0) {
      setAllClass([]);
      if (!isEdit) formik.setFieldValue('classes', []); // only reset on create
      return;
    }

    const mergedStandards = formik.values.organizations.includes('all')
      ? allOrganization
          .filter((org: any) => org.id !== 'all')
          .flatMap((org: any) => org.standards || [])
      : formik.values.organizations
          .map(
            (orgId: string) =>
              allOrganization.find((org: any) => org?.id === orgId)?.standards || []
          )
          .flat();

    const withAll = [{ id: 'all', name: 'All', divisions: [] }, ...mergedStandards];
    setAllClass(withAll);

    if (!isEdit) formik.setFieldValue('classes', []); // only reset on create
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allOrganization, formik.values.organizations]);

  const renderRecurringFields = () => {
    switch (formik.values.repeatFrequency) {
      case 'Daily':
        return (
          <>
            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={!!(formik.touched.meetingTime && formik.errors.meetingTime)}>
                <TimePicker
                  label="Meeting Time *"
                  format="HH:mm"
                  name="meetingTime"
                  value={formik.values.meetingTime}
                  onChange={(newValue) => formik.setFieldValue('meetingTime', newValue)}
                  views={['hours', 'minutes']}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      error: formik.touched.meetingTime && Boolean(formik.errors.meetingTime),
                      helperText: formik.touched.meetingTime && formik.errors.meetingTime,
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={!!(formik.touched.repeatUntil && formik.errors.repeatUntil)}>
                <DatePicker
                  label="Last Date *"
                  name="repeatUntil"
                  format="DD/MM/YYYY"
                  value={formik.values.repeatUntil}
                  onChange={(newValue) => formik.setFieldValue('repeatUntil', newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      error: formik.touched.repeatUntil && Boolean(formik.errors.repeatUntil),
                      helperText: formik.touched.repeatUntil && formik.errors.repeatUntil,
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>
          </>
        );

      case 'Weekly':
        return (
          <>
            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={!!(formik.touched.day && formik.errors.day)}>
                <CustomSelect
                  label="Select Day *"
                  options={[
                    { value: 'Monday', label: 'Monday' },
                    { value: 'Tuesday', label: 'Tuesday' },
                    { value: 'Wednesday', label: 'Wednesday' },
                    { value: 'Thursday', label: 'Thursday' },
                    { value: 'Friday', label: 'Friday' },
                    { value: 'Saturday', label: 'Saturday' },
                    { value: 'Sunday', label: 'Sunday' },
                  ]}
                  value={formik.values.day}
                  onChange={(val) => formik.setFieldValue('day', val)}
                  formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                  error={formik.touched.day && Boolean(formik.errors.day)}
                  helperText={
                    formik.touched.day && typeof formik.errors.day === 'string'
                      ? formik.errors.day
                      : undefined
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={!!(formik.touched.meetingTime && formik.errors.meetingTime)}>
                <TimePicker
                  label="Meeting Time *"
                  format="HH:mm"
                  name="meetingTime"
                  value={formik.values.meetingTime}
                  onChange={(newValue) => formik.setFieldValue('meetingTime', newValue)}
                  views={['hours', 'minutes']}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      error: formik.touched.meetingTime && Boolean(formik.errors.meetingTime),
                      helperText: formik.touched.meetingTime && formik.errors.meetingTime,
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={!!(formik.touched.repeatUntil && formik.errors.repeatUntil)}>
                <DatePicker
                  label="Last Date *"
                  name="repeatUntil"
                  value={formik.values.repeatUntil}
                  onChange={(newValue) => formik.setFieldValue('repeatUntil', newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      error: formik.touched.repeatUntil && Boolean(formik.errors.repeatUntil),
                      helperText: formik.touched.repeatUntil && formik.errors.repeatUntil,
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>
          </>
        );

      case 'Monthly':
        return (
          <>
            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={!!(formik.touched.meetingDate && formik.errors.meetingDate)}>
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
                      error: formik.touched.meetingDate && Boolean(formik.errors.meetingDate),
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={!!(formik.touched.repeatUntil && formik.errors.repeatUntil)}>
                <DatePicker
                  label="Last Date *"
                  name="repeatUntil"
                  value={formik.values.repeatUntil}
                  onChange={(newValue) => formik.setFieldValue('repeatUntil', newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      error: formik.touched.repeatUntil && Boolean(formik.errors.repeatUntil),
                      helperText: formik.touched.repeatUntil && formik.errors.repeatUntil,
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>
          </>
        );

      case 'Custom':
        return (
          <>
            {/* Repeat every */}
            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField
                error={!!(formik.touched.customInterval && formik.errors.customInterval)}
              >
                <CustomSelect
                  label="Repeat Every"
                  options={[
                    { value: 'days', label: 'Day(s)' },
                    { value: 'weeks', label: 'Week(s)' },
                    { value: 'months', label: 'Month(s)' },
                  ]}
                  value={formik.values.customInterval}
                  onChange={(val) => formik.setFieldValue('customInterval', val)}
                  formControlProps={{ fullWidth: true }}
                  error={formik.touched.customInterval && Boolean(formik.errors.customInterval)}
                  helperText={
                    formik.touched.customInterval &&
                    typeof formik.errors.customInterval === 'string'
                      ? formik.errors.customInterval
                      : undefined
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Interval *"
                value={formik.values.customIntervalCount || ''}
                onChange={(e) => formik.setFieldValue('customIntervalCount', e.target.value)}
                error={
                  formik.touched.customIntervalCount && Boolean(formik.errors.customIntervalCount)
                }
                helperText={formik.touched.customIntervalCount && formik.errors.customIntervalCount}
              />
            </Grid>

            {/* For weekly custom, show days */}
            {formik.values.customInterval === 'weeks' && (
              <Grid size={{ xs: 12 }}>
                <CustomSelect
                  label="Select Days"
                  multiple
                  options={[
                    { value: 'Monday', label: 'Monday' },
                    { value: 'Tuesday', label: 'Tuesday' },
                    { value: 'Wednesday', label: 'Wednesday' },
                    { value: 'Thursday', label: 'Thursday' },
                    { value: 'Friday', label: 'Friday' },
                    { value: 'Saturday', label: 'Saturday' },
                    { value: 'Sunday', label: 'Sunday' },
                  ]}
                  value={formik.values.customDays || []}
                  onChange={(val) => formik.setFieldValue('customDays', val)}
                  formControlProps={{ fullWidth: true }}
                />
              </Grid>
            )}

            {/* For monthly custom, show "On day" OR "On the" */}
            {formik.values.customInterval === 'months' && (
              <>
                {/* On Day Option */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControlLabel
                    value="onDay"
                    control={<Radio />}
                    label="On day"
                    checked={formik.values.monthlyOption === 'onDay'}
                    onChange={() => formik.setFieldValue('monthlyOption', 'onDay')}
                  />
                </Grid>
                {formik.values.monthlyOption === 'onDay' && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      size="small"
                      name="onDay"
                      type="number"
                      label="On Day *"
                      fullWidth
                      value={formik.values.onDay ?? dayjs(formik.values.meetingDate).date()}
                      onChange={(e) => formik.setFieldValue('onDay', e.target.value)}
                    />
                  </Grid>
                )}

                {/* On The Option */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControlLabel
                    value="onThe"
                    control={<Radio />}
                    label="On the"
                    checked={formik.values.monthlyOption === 'onThe'}
                    onChange={() => formik.setFieldValue('monthlyOption', 'onThe')}
                  />
                </Grid>
                {formik.values.monthlyOption === 'onThe' && (
                  <>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <CustomSelect
                        options={[
                          { value: 'First', label: 'First' },
                          { value: 'Second', label: 'Second' },
                          { value: 'Third', label: 'Third' },
                          { value: 'Fourth', label: 'Fourth' },
                          { value: 'Last', label: 'Last' },
                        ]}
                        label="On Week *"
                        value={formik.values.onTheWeek || 'First'}
                        onChange={(val) => formik.setFieldValue('onTheWeek', val)}
                        formControlProps={{ fullWidth: true }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <CustomSelect
                        options={[
                          { value: 'Monday', label: 'Monday' },
                          { value: 'Tuesday', label: 'Tuesday' },
                          { value: 'Wednesday', label: 'Wednesday' },
                          { value: 'Thursday', label: 'Thursday' },
                          { value: 'Friday', label: 'Friday' },
                          { value: 'Saturday', label: 'Saturday' },
                          { value: 'Sunday', label: 'Sunday' },
                        ]}
                        label="On Day *"
                        value={formik.values.onTheDay || 'Monday'}
                        onChange={(val) => formik.setFieldValue('onTheDay', val)}
                        formControlProps={{ fullWidth: true }}
                      />
                    </Grid>
                  </>
                )}
              </>
            )}

            {/* Meeting time */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TimePicker
                label="Meeting Time *"
                format="HH:mm"
                value={formik.values.meetingTime}
                onChange={(newValue) => formik.setFieldValue('meetingTime', newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    error: formik.touched.meetingTime && Boolean(formik.errors.meetingTime),
                    helperText: formik.touched.meetingTime && formik.errors.meetingTime,
                  },
                }}
              />
            </Grid>

            {/* Repeat Until */}
            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                label="Last Date *"
                value={formik.values.repeatUntil}
                format="DD/MM/YYYY"
                onChange={(newValue) => formik.setFieldValue('repeatUntil', newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    error: formik.touched.repeatUntil && Boolean(formik.errors.repeatUntil),
                    helperText: formik.touched.repeatUntil && formik.errors.repeatUntil,
                  },
                }}
              />
            </Grid>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid size={{ xs: 12 }}>
              <SectionCard title="Basic Information">
                <Grid size={{ xs: 12, md: 4, sm: 3 }}>
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

                <Grid size={{ xs: 12, md: 4, sm: 3 }}>
                  <ShakingTextField error={!!(formik.touched.type && formik.errors.type)}>
                    <CustomSelect
                      label="Event Type *"
                      options={[
                        { value: 'meeting', label: 'Meeting' },
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

                <Grid size={{ xs: 12, md: 4, sm: 3 }}>
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
                      label="Description *"
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

            <Grid size={{ xs: 12 }}>
              <SectionCard title="Scheduling">
                {formik.values.type === 'meeting' ? (
                  <Grid size={{ xs: 12, md: 6 }}>
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
                              error:
                                !!(formik.touched.startDate && formik.errors.startDate) || false,
                              helperText:
                                formik.touched.startDate && formik.errors.startDate
                                  ? String(formik.errors.startDate)
                                  : undefined,
                            },
                          }}
                        />
                      </ShakingTextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <ShakingTextField
                        error={!!(formik.touched.endDate && formik.errors.endDate) || false}
                      >
                        <DatePicker
                          label="End Date *"
                          format="DD/MM/YYYY"
                          minDate={dayjs(formik.values.startDate)}
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
                  </>
                )}

                {formik.values.isRecurring && (
                  <>
                    <Grid size={{ xs: 12, md: 6 }}>
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
                    {renderRecurringFields()}
                  </>
                )}

                {!formik.values.isRecurring && formik.values.type === 'meeting' && (
                  <>
                    <Grid size={{ xs: 12, md: 6 }}>
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

                    <Grid size={{ xs: 12, md: 6 }}>
                      <ShakingTextField
                        error={!!(formik.touched.meetingTime && formik.errors.meetingTime)}
                      >
                        <TimePicker
                          label="Meeting Time *"
                          format="HH:mm"
                          name="meetingTime"
                          value={formik.values.meetingTime}
                          onChange={(newValue) => formik.setFieldValue('meetingTime', newValue)}
                          views={['hours', 'minutes']}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: 'small',
                              error:
                                formik.touched.meetingTime && Boolean(formik.errors.meetingTime),
                              helperText:
                                formik.touched.meetingTime &&
                                typeof formik.errors.meetingTime === 'string'
                                  ? formik.errors.meetingTime
                                  : undefined,
                            },
                          }}
                        />
                      </ShakingTextField>
                    </Grid>
                  </>
                )}
              </SectionCard>
            </Grid>
            <Grid size={{ xs: 12 }} mb={2}>
              <SectionCard title="Event Mode">
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
                        onChange={formik.handleChange}
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

export default AddEvent;
