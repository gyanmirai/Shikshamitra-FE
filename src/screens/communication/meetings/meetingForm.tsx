import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import FileUploader from 'src/components/custom-upload';
import { Iconify } from 'src/components/iconify/iconify';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import {
  Box,
  Grid,
  Button,
  Switch,
  TextField,
  DialogActions,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import { getInitialMeetingValues } from './initialValues';
import { meetingValidationSchema } from './validationSchema';

import type { AddNewMeetingProps } from './type';

const AddNewMeeting: React.FC<AddNewMeetingProps> = ({
  onClose,
  initialValues,
  isEdit,
}: AddNewMeetingProps) => {
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
    initialValues: getInitialMeetingValues(initialValues),
    validationSchema: meetingValidationSchema(currentYear),
    onSubmit: (values) => {
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
      // Reset divisions when no classes selected
      setAllDivision([]);
      formik.setFieldValue('divisions', []);
      return;
    }

    if (formik.values.classes.length === 1 && formik.values.classes[0] !== 'all') {
      // Handle single class selection
      const selectedClass = allClass.find((cls: any) => cls?.id === formik.values.classes[0]);
      const divisions = selectedClass?.divisions || [];
      setAllDivision(divisions);

      // Auto-select all divisions for the selected class
      const divisionIds = divisions.map((div: any) => div.id);
      formik.setFieldValue('divisions', [...divisionIds]);
    } else {
      // Handle multiple classes or "all" selection
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

      formik.setFieldValue('divisions', ['all']);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allClass, formik.values.classes]);

  // Update classes list when organization selection changes
  useEffect(() => {
    if (formik.values.organizations.length === 0) {
      setAllClass([]);
      formik.setFieldValue('classes', []);
      return;
    }

    if (formik.values.organizations.includes('all')) {
      // If "All" organizations selected → merge all org classes
      const mergedStandards = allOrganization
        .filter((org: any) => org.id !== 'all')
        .flatMap((org: any) => org.standards || []);

      // Add "All" option
      const withAll = [
        {
          id: 'all',
          name: 'All',
          creationTime: '',
          creatorId: '',
          lastModificationTime: '',
          lastModifierId: '',
          educationMediumStageId: '',
          divisions: [],
        },
        ...mergedStandards,
      ];

      setAllClass(withAll);
      // 🚫 Do not auto-select classes
      formik.setFieldValue('classes', []);
    } else {
      // Specific organizations selected → merge their classes
      const mergedStandards = formik.values.organizations
        .map(
          (orgId: string) => allOrganization.find((org: any) => org?.id === orgId)?.standards || []
        )
        .flat();

      // Add "All" option
      const withAll = [
        {
          id: 'all',
          name: 'All',
          creationTime: '',
          creatorId: '',
          lastModificationTime: '',
          lastModifierId: '',
          educationMediumStageId: '',
          divisions: [],
        },
        ...mergedStandards,
      ];

      setAllClass(withAll);
      // 🚫 Do not auto-select classes
      formik.setFieldValue('classes', []);
    }
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

                <Grid size={{ xs: 12, md: 4, sm: 3 }}>
                  <ShakingTextField error={!!(formik.touched.type && formik.errors.type)}>
                    <CustomSelect
                      label="Meeting Type *"
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

                <Grid size={{ xs: 12, md: 4, sm: 3 }}>
                  <ShakingTextField
                    error={!!(formik.touched.importance_level && formik.errors.importance_level)}
                  >
                    <CustomSelect
                      label="Importance Level *"
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
              <SectionCard title="Audience Selection">
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.organizations && formik.errors.organizations)}
                  >
                    <CustomSelect
                      options={allOrganization}
                      label="Organization *"
                      multiple
                      value={formik.values.organizations}
                      onChange={(val) => {
                        const value = val as string[];

                        const allOrgIds = allOrganization.map((org: any) => org.id);
                        const isAllClicked = value.includes('all');
                        const wasAllPreviouslySelected = (
                          formik.values.organizations as string[]
                        ).includes('all');

                        let selectedOrganizations: string[] = [];

                        if (isAllClicked && !wasAllPreviouslySelected) {
                          selectedOrganizations = [
                            'all',
                            ...allOrgIds.filter((id) => id !== 'all'),
                          ];
                        } else if (!isAllClicked && wasAllPreviouslySelected) {
                          selectedOrganizations = [];
                        } else if (isAllClicked && wasAllPreviouslySelected) {
                          const selectedWithoutAll = value.filter((id) => id !== 'all');
                          if (selectedWithoutAll.length === allOrgIds.length) {
                            selectedOrganizations = ['all', ...allOrgIds];
                          } else {
                            selectedOrganizations = selectedWithoutAll;
                          }
                        } else {
                          const selectedWithoutAll = value.filter((id) => id !== 'all');
                          if (selectedWithoutAll.length === allOrgIds.length) {
                            selectedOrganizations = ['all', ...allOrgIds];
                          } else {
                            selectedOrganizations = selectedWithoutAll;
                          }
                        }

                        formik.setFieldValue('organizations', selectedOrganizations);
                      }}
                      onBlur={() => formik.setFieldTouched('organizations', true)}
                      error={formik.touched.organizations && Boolean(formik.errors.organizations)}
                      helperText={
                        (formik.touched.organizations && formik.errors.organizations) as string
                      }
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                      disabled={!medium}
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={!!(formik.touched.classes && formik.errors.classes)}>
                    <CustomSelect
                      options={allClass}
                      label="Class *"
                      multiple
                      value={formik.values.classes}
                      onChange={(val) => {
                        const value = val as string[];

                        const allClassIds =
                          allClass?.filter((cls) => cls.id !== 'all').map((cls) => cls.id) || [];
                        const isAllClicked = value.includes('all');
                        const wasAllPreviouslySelected = (
                          formik.values.classes as string[]
                        ).includes('all');

                        if (isAllClicked && !wasAllPreviouslySelected) {
                          // "All" was just clicked - select all classes
                          formik.setFieldValue('classes', ['all', ...allClassIds]);
                        } else if (!isAllClicked && wasAllPreviouslySelected) {
                          // "All" was just unchecked - deselect all classes
                          formik.setFieldValue('classes', []);
                        } else if (isAllClicked && wasAllPreviouslySelected) {
                          // Individual item was selected/deselected while "All" was already selected
                          const selectedWithoutAll = value.filter((id) => id !== 'all');

                          if (selectedWithoutAll.length === allClassIds.length) {
                            // All individual items are selected, keep "All" selected
                            formik.setFieldValue('classes', ['all', ...allClassIds]);
                          } else {
                            // Not all individual items are selected, remove "All"
                            formik.setFieldValue('classes', selectedWithoutAll);
                          }
                        } else {
                          // "All" is not selected, handle individual selections
                          const selectedWithoutAll = value.filter((id) => id !== 'all');

                          if (selectedWithoutAll.length === allClassIds.length) {
                            // All individual items are selected, add "All"
                            formik.setFieldValue('classes', ['all', ...allClassIds]);
                          } else {
                            // Not all items selected, just keep individual selections
                            formik.setFieldValue('classes', selectedWithoutAll);
                          }
                        }
                      }}
                      onBlur={() => formik.setFieldTouched('classes', true)}
                      error={formik.touched.classes && Boolean(formik.errors.classes)}
                      helperText={(formik.touched.classes && formik.errors.classes) as string}
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                      disabled={!formik.values.organizations}
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  {!(formik.values.classes as string[]).includes('all') &&
                    formik.values.classes.length > 0 && (
                      <ShakingTextField
                        error={!!(formik.touched.divisions && formik.errors.divisions)}
                      >
                        <CustomSelect
                          options={allDivision}
                          label="Division *"
                          value={formik.values.divisions}
                          onChange={(val) => formik.setFieldValue('divisions', val)}
                          onBlur={() => formik.setFieldTouched('divisions', true)}
                          error={formik.touched.divisions && Boolean(formik.errors.divisions)}
                          helperText={
                            (formik.touched.divisions && formik.errors.divisions) as string
                          }
                          labelKey="name"
                          valueKey="id"
                          multiple={
                            !(formik.values.classes as string[]).includes('all') ||
                            formik.values.classes.length > 1
                          }
                          formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                          disabled={formik.values.classes.length === 0}
                        />
                      </ShakingTextField>
                    )}
                </Grid>

                <Grid size={{ xs: 12, md: 4, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.audience && formik.errors.audience)}>
                    <CustomSelect
                      label="Audience *"
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
              </SectionCard>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <SectionCard title="Scheduling & Control">
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
                          ]}
                          value={formik.values.repeatFrequency}
                          onChange={(val) => {
                            formik.setFieldValue('repeatFrequency', val);
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
                      checked={formik.values.mode === 'online'}
                      onChange={(e) =>
                        formik.setFieldValue('mode', e.target.checked ? 'online' : 'offline')
                      }
                      size="small"
                    />
                    <span>Online</span>
                    {formik.touched.mode && formik.errors.mode && (
                      <FormHelperText error sx={{ pr: 3 }}>
                        {String(formik.errors.mode)}
                      </FormHelperText>
                    )}
                  </Box>
                </Grid>
                {formik.values.mode === 'online' ? (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <ShakingTextField error={!!(formik.touched.link && formik.errors.link)}>
                      <TextField
                        fullWidth
                        label="Meeting Link *"
                        name="link"
                        size="small"
                        value={formik.values.link}
                        onChange={formik.handleChange}
                        error={formik.touched.link && Boolean(formik.errors.link)}
                        helperText={formik.touched.link && formik.errors.link}
                      />
                    </ShakingTextField>
                  </Grid>
                ) : (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <ShakingTextField
                      error={!!(formik.touched.classRoom && formik.errors.classRoom)}
                    >
                      <CustomSelect
                        label="Classroom *"
                        options={[
                          { value: 'A101', label: 'A101' },
                          { value: 'A102', label: 'A102' },
                          { value: 'B101', label: 'B102' },
                        ]}
                        value={formik.values.classRoom}
                        onChange={(val) => formik.setFieldValue('classRoom', val)}
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
              </SectionCard>
            </Grid>
          </Scrollbar>

          <DialogActions>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => {
                onClose(null, false);
              }}
              size="small"
              variant="outlined"
            >
              Cancel
            </Button>

            <Button
              size="small"
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              type="submit"
              variant="contained"
            >
              {isEdit ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default AddNewMeeting;
