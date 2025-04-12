import dayjs from 'dayjs';
import { useState } from 'react';
import { useFormik } from 'formik';

import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Radio,
  Button,
  Switch,
  FormLabel,
  TextField,
  RadioGroup,
  FormControl,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { validationSchema } from './validationSchema';

import type { AddNewMeetingProps } from './type';

const AddNewMeeting: React.FC<AddNewMeetingProps> = ({
  onClose,
  onSubmit,
  initialValues,
  isEdit,
}: AddNewMeetingProps) => {
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const divisionOption = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
  ];

  const allOrganizations = [
    { value: 'Pre Primary', label: 'Pre Primary' },
    { value: 'Primary', label: 'Primary' },
    { value: 'Secondary', label: 'Secondary' },
    { value: 'Higher Secondary', label: 'Higher Secondary' },
  ];

  const classOptions = [{ value: '1', label: '1' }];

  // Track if all divisions are selected by comparing initial division length with available division options
  const [isAllDivSelected, setIsAllDivSelected] = useState(
    initialValues?.division?.length === divisionOption.length
  );

  // Track if all organizations are selected by comparing initial organization length with available organization options
  const [isAllOrgSelected, setIsAllOrgSelected] = useState(
    initialValues?.organization?.length === allOrganizations.length
  );

  // Track if all classes are selected by comparing initial division length with available class options
  const [isAllClassSelected, setIsAllClassSelected] = useState(
    initialValues?.division?.length === classOptions.length
  );

  const formik = useFormik({
    initialValues: {
      title: initialValues?.title || '',
      status: initialValues?.status || '',
      audience: initialValues?.audience || [],
      organization: initialValues?.organization || [],
      className: initialValues?.className || [],
      division: initialValues?.division || [],
      students: initialValues?.students || [],
      meetingDate: initialValues?.meetingDate ? dayjs(initialValues?.meetingDate) : dayjs(),
      meetingTime: initialValues?.meetingTime ? dayjs(initialValues?.meetingTime) : null,
      meetingAgenda: initialValues?.meetingAgenda || '',
      link: initialValues?.link || '',
      meetingType: initialValues?.meetingType || '',
      classRoom: initialValues?.classRoom || '',
      isRecurring: initialValues?.isRecurring || false,
      day: initialValues?.day || '',
      repeatFrequency: initialValues?.repeatFrequency || '',
      repeatUntil: initialValues?.repeatUntil ? dayjs(initialValues?.repeatUntil) : null,
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit({
        ...values,
        status: 'Scheduled',
      });
    },
  });

  /**
   * Handles the selection/deselection of divisions
   * If 'all' or 'deselectAll' is selected, toggles all divisions
   * Otherwise updates selected divisions and checks if all divisions are selected
   * @param selectedValues - Array of selected division values
   */
  const handleDivisionChange = (selectedValues: string[]) => {
    if (selectedValues.includes('all') || selectedValues.includes('deselectAll')) {
      const allDivision = divisionOption.map((org) => org.value);
      if (isAllDivSelected) {
        formik.setFieldValue('division', []);
      } else {
        formik.setFieldValue('division', allDivision);
      }
      setIsAllDivSelected(!isAllDivSelected);
    } else {
      formik.setFieldValue('division', selectedValues);
      setIsAllDivSelected(selectedValues.length === divisionOption.length);
    }
  };

  /**
   * Handles the selection/deselection of organizations
   * If 'all' or 'deselectAll' is selected, toggles all organizations
   * Otherwise updates selected organizations and checks if all organizations are selected
   * @param selectedValues - Array of selected organization values
   */
  const handleOrganizationChange = (selectedValues: string[]) => {
    if (selectedValues.includes('all') || selectedValues.includes('deselectAll')) {
      const allOrganizationValues = allOrganizations.map((org) => org.value);
      if (isAllOrgSelected) {
        formik.setFieldValue('organization', []);
      } else {
        formik.setFieldValue('organization', allOrganizationValues);
      }
      setIsAllOrgSelected(!isAllOrgSelected);
    } else {
      formik.setFieldValue('organization', selectedValues);
      setIsAllOrgSelected(selectedValues.length === allOrganizations.length);
    }
  };

  /**
   * Renders recurring meeting fields based on selected repeat frequency
   * Handles Daily, Weekly, and Monthly recurring patterns with appropriate form fields
   * @returns JSX elements for the selected recurring pattern
   */
  const renderRecurringFields = () => {
    switch (formik.values.repeatFrequency) {
      case 'Daily':
        return (
          <>
            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={!!(formik.touched.meetingTime && formik.errors.meetingTime) || false}
              >
                <TimePicker
                  label="Meeting Time"
                  format="HH:mm"
                  name="meetingTime"
                  value={formik.values.meetingTime}
                  onChange={(newValue) => {
                    formik.setFieldValue('meetingTime', newValue);
                  }}
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
            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={!!(formik.touched.repeatUntil && formik.errors.repeatUntil) || false}
              >
                <DatePicker
                  label="Last Date"
                  name="repeatUntil"
                  format="DD/MM/YYYY"
                  value={formik.values.repeatUntil}
                  onChange={(newValue) => {
                    formik.setFieldValue('repeatUntil', newValue);
                  }}
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
            <Grid item xs={12} md={6}>
              <ShakingTextField error={!!(formik.touched.day && formik.errors.day) || false}>
                <CustomSelect
                  label="Select Day"
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
                  onChange={(val) => {
                    formik.setFieldValue('day', val);
                  }}
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
            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={!!(formik.touched.meetingTime && formik.errors.meetingTime) || false}
              >
                <TimePicker
                  label="Meeting Time"
                  format="HH:mm"
                  name="meetingTime"
                  value={formik.values.meetingTime}
                  onChange={(newValue) => {
                    formik.setFieldValue('meetingTime', newValue);
                  }}
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
            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={!!(formik.touched.repeatUntil && formik.errors.repeatUntil) || false}
              >
                <DatePicker
                  label="Last Date"
                  name="repeatUntil"
                  value={formik.values.repeatUntil}
                  onChange={(newValue) => {
                    formik.setFieldValue('repeatUntil', newValue);
                  }}
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
            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={!!(formik.touched.meetingDate && formik.errors.meetingDate) || false}
              >
                <DatePicker
                  label="Meeting Date"
                  name="meetingDate"
                  format="DD/MM/YYYY"
                  value={formik.values.meetingDate}
                  onChange={(newValue) => {
                    formik.setFieldValue('meetingDate', newValue);
                  }}
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
            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={!!(formik.touched.repeatUntil && formik.errors.repeatUntil) || false}
              >
                <DatePicker
                  label="Last Date"
                  name="repeatUntil"
                  value={formik.values.repeatUntil}
                  onChange={(newValue) => {
                    formik.setFieldValue('repeatUntil', newValue);
                  }}
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
      default:
        return null;
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
                  helperText={
                    formik.touched.title && typeof formik.errors.title === 'string'
                      ? formik.errors.title
                      : undefined
                  }
                  size="small"
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
                    { value: 'Teachers', label: 'Teachers' },
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
                      : formik.touched.audience && typeof formik.errors.audience === 'string'
                        ? formik.errors.audience
                        : undefined
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12}>
              <ShakingTextField
                error={!!(formik.touched.meetingAgenda && formik.errors.meetingAgenda) || false}
              >
                <TextField
                  fullWidth
                  label="Meeting Agenda"
                  name="meetingAgenda"
                  multiline
                  value={formik.values.meetingAgenda}
                  onChange={formik.handleChange}
                  error={formik.touched.meetingAgenda && Boolean(formik.errors.meetingAgenda)}
                  helperText={
                    formik.touched.meetingAgenda && typeof formik.errors.meetingAgenda === 'string'
                      ? formik.errors.meetingAgenda
                      : undefined
                  }
                  size="small"
                  rows={4}
                />
              </ShakingTextField>
            </Grid>

            {formik.values.audience.includes('Teachers') && (
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.organization && formik.errors.organization) || false}
                >
                  <CustomSelect
                    label="Select Organizations"
                    options={[
                      {
                        value: isAllOrgSelected ? 'deselectAll' : 'all',
                        label: isAllOrgSelected ? 'Deselect All' : 'All',
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
                        : formik.touched.organization &&
                            typeof formik.errors.organization === 'string'
                          ? formik.errors.organization
                          : undefined
                    }
                  />
                </ShakingTextField>
              </Grid>
            )}

            {(formik.values.audience.includes('Students') ||
              formik.values.audience.includes('Parents')) && (
              <>
                <Grid item xs={12} sm={6}>
                  <ShakingTextField
                    error={!!(formik.touched.className && formik.errors.className) || false}
                  >
                    <CustomSelect
                      options={[
                        {
                          value: isAllClassSelected ? 'deselectAll' : 'all',
                          label: isAllClassSelected ? 'Deselect All' : 'All',
                        },
                        ...classOptions,
                      ]}
                      value={formik.values.className}
                      onChange={(val) => {
                        formik.setFieldValue('className', val);
                      }}
                      label="Select Class"
                      isLoading={isLoading}
                      multiple
                      formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                      error={formik.touched.className && Boolean(formik.errors.className)}
                      helperText={
                        Array.isArray(formik.errors.className)
                          ? formik.errors.className.join(', ')
                          : formik.touched.className && typeof formik.errors.className === 'string'
                            ? formik.errors.className
                            : undefined
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
                          value: isAllDivSelected ? 'deselectAll' : 'all',
                          label: isAllDivSelected ? 'Deselect All' : 'All',
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
                          : formik.touched.division && typeof formik.errors.division === 'string'
                            ? formik.errors.division
                            : undefined
                      }
                    />
                  </ShakingTextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <ShakingTextField
                    error={!!(formik.touched.students && formik.errors.students) || false}
                  >
                    <CustomSelect
                      label="Select Students"
                      options={[
                        { value: 'student1', label: 'Student 1' },
                        { value: 'student2', label: 'Student 2' },
                        { value: 'student3', label: 'Student 3' },
                        { value: 'student4', label: 'Student 4' },
                      ]}
                      value={formik.values.students}
                      onChange={(val) => {
                        formik.setFieldValue('students', val);
                      }}
                      multiple
                      formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                      error={formik.touched.students && Boolean(formik.errors.students)}
                      helperText={
                        Array.isArray(formik.errors.students)
                          ? formik.errors.students.join(', ')
                          : formik.touched.students && typeof formik.errors.students === 'string'
                            ? formik.errors.students
                            : undefined
                      }
                    />
                  </ShakingTextField>
                </Grid>
              </>
            )}

            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={!!(formik.touched.audience && formik.errors.audience) || false}
              >
                <FormLabel component="legend">Meeting Mode</FormLabel>
                <FormControl
                  component="fieldset"
                  error={formik.touched.meetingType && Boolean(formik.errors.meetingType)}
                >
                  <RadioGroup
                    row
                    name="meetingType"
                    value={formik.values.meetingType}
                    onChange={(e) => {
                      const mode = e.target.value;
                      formik.setFieldValue('meetingType', mode); // Sync meetingType with mode
                    }}
                  >
                    <FormControlLabel value="virtual" control={<Radio />} label="Virtual" />
                    <FormControlLabel value="offline" control={<Radio />} label="Offline" />
                  </RadioGroup>
                </FormControl>
              </ShakingTextField>
            </Grid>
            {formik.values.meetingType === 'virtual' && (
              <Grid item xs={12} md={6}>
                <ShakingTextField error={!!(formik.touched.link && formik.errors.link) || false}>
                  <TextField
                    fullWidth
                    label="Meeting Link"
                    name="link"
                    value={formik.values.link}
                    onChange={formik.handleChange}
                    size="small"
                    error={formik.touched.link && Boolean(formik.errors.link)}
                    helperText={
                      formik.touched.link && typeof formik.errors.link === 'string'
                        ? formik.errors.link
                        : undefined
                    }
                  />
                </ShakingTextField>
              </Grid>
            )}

            {formik.values.meetingType === 'offline' && (
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.classRoom && formik.errors.classRoom) || false}
                >
                  <CustomSelect
                    label="Select Classroom"
                    options={[
                      { value: 'A101', label: 'A101' },
                      { value: 'A102', label: 'A102' },
                      { value: 'B101', label: 'B102' },
                    ]}
                    value={formik.values.classRoom}
                    onChange={(val) => {
                      formik.setFieldValue('classRoom', val);
                    }}
                    formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                    error={formik.touched.classRoom && Boolean(formik.errors.classRoom)}
                    helperText={
                      formik.touched.classRoom && typeof formik.errors.classRoom === 'string'
                        ? formik.errors.classRoom
                        : undefined
                    }
                  />
                </ShakingTextField>
              </Grid>
            )}
            <Grid item xs={12} md={6}>
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
            {formik.values.isRecurring && (
              <>
                <Grid item xs={12} md={6}>
                  <ShakingTextField
                    error={
                      !!(formik.touched.repeatFrequency && formik.errors.repeatFrequency) || false
                    }
                  >
                    <CustomSelect
                      label="Select Frequency"
                      options={[
                        { value: 'Daily', label: 'Daily' },
                        { value: 'Weekly', label: 'Weekly' },
                        { value: 'Monthly', label: 'Monthly' },
                      ]}
                      value={formik.values.repeatFrequency}
                      onChange={(val) => {
                        formik.setFieldValue('repeatFrequency', val);
                        // Reset specific fields when changing frequency
                        formik.setFieldValue('day', '');
                        formik.setFieldValue('meetingDate', dayjs());
                        formik.setFieldValue('meetingTime', null);
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
            {!formik.values.isRecurring && (
              <>
                <Grid item xs={12} md={6}>
                  <ShakingTextField
                    error={!!(formik.touched.meetingDate && formik.errors.meetingDate) || false}
                  >
                    <DatePicker
                      label="Meeting Date"
                      name="meetingDate"
                      format="DD/MM/YYYY"
                      value={formik.values.meetingDate}
                      onChange={(newValue) => {
                        formik.setFieldValue('meetingDate', newValue);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          error: formik.touched.meetingDate && Boolean(formik.errors.meetingDate),
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
                <Grid item xs={12} md={6}>
                  <ShakingTextField
                    error={!!(formik.touched.meetingTime && formik.errors.meetingTime) || false}
                  >
                    <TimePicker
                      label="Meeting Time"
                      format="HH:mm"
                      name="meetingTime"
                      value={formik.values.meetingTime}
                      onChange={(newValue) => {
                        formik.setFieldValue('meetingTime', newValue);
                      }}
                      views={['hours', 'minutes']}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          error: formik.touched.meetingTime && Boolean(formik.errors.meetingTime),
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
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Box>
    </form>
  );
};

export default AddNewMeeting;
