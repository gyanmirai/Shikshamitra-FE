'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { TimetableReportTitle } from 'src/enums/timetable-reports';
import { Box, Grid, Card, Button, TextField, Autocomplete } from '@mui/material';

import { getTimetableValidationSchema } from './timetableReportValidation';

interface TimetableReportFormValues {
  report: TimetableReportTitle; // Single-select (report type dropdown)
  organization: string; // Single-select (branch / school)
  classes: string[]; // Multi-select (array of class IDs or names)
  divisions: string[]; // Multi-select (array of division IDs or names)
  teacher: string; // Single-select (for teacher-based reports)
  roomNo: string; // Single-select (for room utilization)
  subject: string; // Single-select (for subject-wise report)
  changedBy: string; // Single-select (Admin / Teacher for change logs)
  fromDate: dayjs.Dayjs | null; // Date picker (start of range)
  toDate: dayjs.Dayjs | null; // Date picker (end of range)
}

const initialValues: TimetableReportFormValues = {
  report: '' as unknown as TimetableReportTitle,
  organization: '',
  classes: [],
  divisions: [],
  teacher: '',
  roomNo: '',
  subject: '',
  changedBy: '',
  fromDate: null,
  toDate: null,
};

const commonFields = ['organization', 'classes', 'divisions'];

const TimetableReportFieldsMap = {
  [TimetableReportTitle.ClassWiseTimetableReport]: [...commonFields, 'fromDate', 'toDate'],

  [TimetableReportTitle.TeacherWiseTimetableReport]: ['teacher', 'fromDate', 'toDate'],

  [TimetableReportTitle.RoomUtilizationReport]: ['roomNo', 'fromDate', 'toDate'],

  [TimetableReportTitle.SubjectWiseTimetableDistribution]: [...commonFields, 'subject', 'teacher'],

  [TimetableReportTitle.FreePeriodsReport]: [
    'roomNo', // can be Class or Teacher
    'fromDate',
    'toDate',
  ],

  [TimetableReportTitle.TimetableChangeLogReport]: [
    'fromDate',
    'toDate',
    'changedBy', // Admin / Teacher
  ],
};

const TimetableReportForm = ({ report }: { report: TimetableReportTitle }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Redux state for current board, medium and medium setter
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // State to store list of all organizations/branches
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);

  // State to store list of all classes/standards
  const [allClass, setAllClass] = useState<Standards[]>([]);

  // State to store list of all divisions
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  // State to store dynamic validation schema based on selected report type
  const [dynamicSchema, setDynamicSchema] = useState(getTimetableValidationSchema([], currentYear));

  // Initialize formik form with validation and submit handler
  const formik = useFormik({
    initialValues: {
      ...initialValues,
      report: report as unknown as TimetableReportTitle,
    },
    enableReinitialize: true,
    validationSchema: dynamicSchema,
    onSubmit: (val, { setSubmitting }) => {
      window.alert('submitted...');
      setSubmitting(false);
    },
  });

  // Memoized computation of required fields based on selected report type
  const currentFields = useMemo(
    () => TimetableReportFieldsMap[report as keyof typeof TimetableReportFieldsMap] || [],
    [report]
  );

  // Update validation schema whenever required fields change
  useEffect(() => {
    const newSchema = getTimetableValidationSchema(currentFields, currentYear);
    setDynamicSchema(newSchema);
  }, [currentFields, currentYear]);

  // Update organizations list when medium changes
  useEffect(() => {
    setAllOrganization(cloneDeep(medium?.educationMediumStages || []));
  }, [medium?.educationMediumStages]);

  // Update classes list when organization selection changes
  useEffect(() => {
    const standards =
      allOrganization.find((org: any) => org?.id === formik.values.organization)?.standards || [];

    // Add "All" option if not present
    if (!standards.some((std) => std.id === 'all')) {
      standards.unshift({
        id: 'all',
        name: 'All',
        creationTime: '',
        creatorId: '',
        lastModificationTime: '',
        lastModifierId: '',
        educationMediumStageId: '',
        divisions: [],
      });
    }
    setAllClass(standards);
  }, [allOrganization, formik.values.organization]);

  // Helper function to check if a field should be displayed
  const showField = (fieldName: string) => currentFields.includes(fieldName);

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

  return (
    <Box sx={{ mt: 2 }}>
      <Card>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              {showField('organization') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.organization && formik.errors.organization)}
                  >
                    <CustomSelect
                      options={allOrganization}
                      label="Organization *"
                      value={formik.values.organization}
                      onChange={(val) => {
                        formik.setFieldValue('organization', val);

                        const standards =
                          allOrganization.find((org: any) => org?.id === val)?.standards || [];
                        const standardIds = standards.map((standard: any) => standard.id);

                        // Avoid duplicating 'all'
                        const uniqueClassIds = ['all', ...standardIds.filter((id) => id !== 'all')];

                        formik.setFieldValue('classes', uniqueClassIds);
                      }}
                      onBlur={() => formik.setFieldTouched('organization', true)}
                      error={formik.touched.organization && Boolean(formik.errors.organization)}
                      helperText={
                        (formik.touched.organization && formik.errors.organization) as string
                      }
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                      disabled={!medium}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('classes') && (
                <Grid size={{ xs: 12, sm: 6 }}>
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
                      disabled={!formik.values.organization}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('divisions') &&
                !(formik.values.classes as string[]).includes('all') &&
                formik.values.classes.length > 0 && (
                  <Grid size={{ xs: 12, sm: 6 }}>
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
                        helperText={(formik.touched.divisions && formik.errors.divisions) as string}
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
                  </Grid>
                )}

              {showField('subject') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.subject && formik.errors.subject)}>
                    <CustomSelect
                      labelId="subject-dropdown-label"
                      id="subject-dropdown"
                      value={formik.values.subject}
                      onBlur={() => formik.setFieldTouched('subject', true)}
                      onChange={(val) => formik.setFieldValue('subject', val)}
                      size="small"
                      label="Subject *"
                      name="subject"
                      error={formik.touched.subject && Boolean(formik.errors.subject)}
                      helperText={(formik.touched.subject && formik.errors.subject) as string}
                      options={[
                        { id: 'mathematics', name: 'Mathematics' },
                        { id: 'science', name: 'Science' },
                        { id: 'english', name: 'English' },
                        { id: 'socialStudies', name: 'Social Studies' },
                        { id: 'hindi', name: 'Hindi' },
                        { id: 'marathi', name: 'Marathi' },
                        { id: 'history', name: 'History' },
                        { id: 'geography', name: 'Geography' },
                        { id: 'physics', name: 'Physics' },
                        { id: 'chemistry', name: 'Chemistry' },
                        { id: 'biology', name: 'Biology' },
                        { id: 'computerScience', name: 'Computer Science' },
                      ]}
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('teacher') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.teacher && formik.errors.teacher)}>
                    <Autocomplete
                      id="teacher-dropdown"
                      options={[
                        { id: 't001', name: 'Ramesh Kumar' },
                        { id: 't002', name: 'Priya Sharma' },
                        { id: 't003', name: 'Anil Joshi' },
                        { id: 't004', name: 'Sunita Verma' },
                        { id: 't005', name: 'Rajesh Singh' },
                        { id: 't006', name: 'Anita Desai' },
                      ]}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value?.id}
                      value={
                        [
                          { id: 't001', name: 'Ramesh Kumar' },
                          { id: 't002', name: 'Priya Sharma' },
                          { id: 't003', name: 'Anil Joshi' },
                          { id: 't004', name: 'Sunita Verma' },
                          { id: 't005', name: 'Rajesh Singh' },
                          { id: 't006', name: 'Anita Desai' },
                        ].find((opt) => opt.id === formik.values.teacher) || null
                      }
                      onChange={(event, newValue) => {
                        formik.setFieldValue('teacher', newValue ? newValue.id : '');
                      }}
                      onBlur={() => formik.setFieldTouched('teacher', true)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Teacher *"
                          size="small"
                          fullWidth
                          error={formik.touched.teacher && Boolean(formik.errors.teacher)}
                          helperText={(formik.touched.teacher && formik.errors.teacher) as string}
                        />
                      )}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('roomNo') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.roomNo && formik.errors.roomNo)}>
                    <CustomSelect
                      labelId="room-dropdown-label"
                      id="room-dropdown"
                      value={formik.values.roomNo}
                      onBlur={() => formik.setFieldTouched('roomNo', true)}
                      onChange={(val) => formik.setFieldValue('roomNo', val)}
                      size="small"
                      label="Room No *"
                      name="roomNo"
                      error={formik.touched.roomNo && Boolean(formik.errors.roomNo)}
                      helperText={(formik.touched.roomNo && formik.errors.roomNo) as string}
                      options={[
                        { id: 'r001', name: 'Room 101' },
                        { id: 'r002', name: 'Room 102' },
                        { id: 'r003', name: 'Room 103' },
                        { id: 'r004', name: 'Room 104' },
                        { id: 'r005', name: 'Room 105' },
                        { id: 'r006', name: 'Room 106' },
                      ]}
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('fromDate') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.fromDate && formik.errors.fromDate)}>
                    <DatePicker
                      label="From Date *"
                      disableFuture
                      minDate={dayjs(currentYear?.startDate)}
                      maxDate={dayjs(currentYear?.endDate)}
                      value={formik.values.fromDate}
                      onChange={(date) => formik.setFieldValue('fromDate', date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          error: formik.touched.fromDate && Boolean(formik.errors.fromDate),
                          helperText: (formik.touched.fromDate && formik.errors.fromDate) as string,
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('toDate') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.toDate && formik.errors.toDate)}>
                    <DatePicker
                      label="To Date *"
                      disableFuture
                      minDate={dayjs(currentYear?.startDate)}
                      maxDate={dayjs(currentYear?.endDate)}
                      value={formik.values.toDate}
                      onChange={(date) => formik.setFieldValue('toDate', date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                          error: formik.touched.toDate && Boolean(formik.errors.toDate),
                          helperText: (formik.touched.toDate && formik.errors.toDate) as string,
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              <Grid size={12} justifyContent="flex-end" display="flex">
                <Button
                  startIcon={<Iconify icon={GlobalIcons.generateReport} />}
                  type="submit"
                  variant="contained"
                  size="small"
                >
                  Generate Report
                </Button>
              </Grid>
            </Grid>
          </Box>
        </form>
      </Card>
    </Box>
  );
};

export default TimetableReportForm;
