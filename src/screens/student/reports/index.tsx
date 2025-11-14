'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import React, { useMemo, useState, useEffect } from 'react';
import { Box, Grid, Card, Button, TextField } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmployeeCastType, EmployeeCastTypeArray } from 'src/enums/employee-cast';
import { StudentReportTitle, StudentReportTitleOptions } from 'src/enums/studentRecordsReports';

import { getValidationSchema } from './validationSchema';

const initialValues = {
  report: '', // Single-select (e.g., report type dropdown)
  department: '', // Single-select (e.g., employee/student department)
  status: '', // Single-select (e.g., Active, Inactive, Left, etc.)
  organization: '', // Single-select (e.g., organization or branch)
  classes: [], // Multi-select (array of class IDs or names)
  divisions: [], // Multi-select (array of division IDs or names)
  fromRollNo: '', // Text or number input (roll number range start)
  toRollNo: '', // Text or number input (roll number range end)
  month: [], // Multi-select (array of selected months)
  category: [], // Multi-select (e.g., caste/category: SC, ST, OBC, General)
  fromDate: null, // Date picker (start date) — use null for date fields
  toDate: null, // Date picker (end date)
  gender: [],
  age: '', // Text or number input (age or age range)
  fromAge: '',
  toAge: '',
  religion: [],
};

const commonFields = ['organization', 'classes', 'divisions'];

const reportFieldsMap = {
  [StudentReportTitle.AddressLabelReport]: [
    ...commonFields,
    'students',
    'fromRollNo',
    'toRollNo',
    'houseGroup',
  ],
  [StudentReportTitle.StudentContactList]: [
    ...commonFields,
    'students',
    'fromRollNo',
    'toRollNo',
    'houseGroup',
  ],
  [StudentReportTitle.AllBirthdayWishListReport]: [
    ...commonFields,
    'students',
    'fromRollNo',
    'toRollNo',
    'houseGroup',
    'fromDate',
    'toDate',
  ],
  [StudentReportTitle.BirthdayReport]: [
    ...commonFields,
    'students',
    'fromRollNo',
    'toRollNo',
    'houseGroup',
    'month',
  ],
  [StudentReportTitle.LeftStudentList]: [
    ...commonFields,
    'students',
    'fromRollNo',
    'toRollNo',
    'houseGroup',
    'fromDate',
    'toDate',
  ],
  [StudentReportTitle.NewStudentAdmissionReport]: [
    ...commonFields,
    'students',
    'fromRollNo',
    'toRollNo',
    'houseGroup',
  ],
  [StudentReportTitle.StudentDetailInformationForm]: [
    ...commonFields,
    'students',
    'fromRollNo',
    'toRollNo',
    'houseGroup',
  ],
  [StudentReportTitle.StudentDetailList]: [
    ...commonFields,
    'students',
    'fromRollNo',
    'toRollNo',
    'houseGroup',
  ],
  [StudentReportTitle.StudentListReport]: [
    ...commonFields,
    'students',
    'fromRollNo',
    'toRollNo',
    'houseGroup',
  ],
  [StudentReportTitle.StudentListDivisionWiseSerialNo]: [...commonFields, 'students', 'houseGroup'],
  [StudentReportTitle.StudentListIDNoWise]: [
    ...commonFields,
    'students',
    'fromRollNo',
    'toRollNo',
    'houseGroup',
  ],
  [StudentReportTitle.StudentRegister]: [
    ...commonFields,
    'students',
    'fromRollNo',
    'toRollNo',
    'houseGroup',
  ],
  [StudentReportTitle.StudentRegisterWithAddress]: [
    ...commonFields,
    'students',
    'fromRollNo',
    'toRollNo',
    'houseGroup',
  ],
  [StudentReportTitle.StudentStrengthDivisionWiseSummary]: [...commonFields, 'toDate'],
  [StudentReportTitle.AgeWiseSummary]: [...commonFields],
  [StudentReportTitle.VerifyStudentData]: [...commonFields, 'fromDate', 'toDate'],
  [StudentReportTitle.GenderwiseStudentStrengthSummary]: [...commonFields],
  [StudentReportTitle.AgewiseList]: [...commonFields],
  [StudentReportTitle.AdmissionCategorywiseList]: [...commonFields, 'category'],
  [StudentReportTitle.GenderWiseReport]: [...commonFields, 'gender'],
  [StudentReportTitle.ReligionWiseReport]: [...commonFields, 'religion'],
  // [StudentReportTitle.FeesCategorywiseSummary]: [...commonFields],
  [StudentReportTitle.GenderwiseSummary]: [...commonFields],
};

const StudentReportsScreen = () => {
  // Redux state for current board, medium and medium setter
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // State to store list of all organizations/branches
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);

  // State to store list of all classes/standards
  const [allClass, setAllClass] = useState<Standards[]>([]);

  // State to store list of all divisions
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  // State to store dynamic validation schema based on selected report type
  const [dynamicSchema, setDynamicSchema] = useState(getValidationSchema([]));

  // Initialize formik form with validation and submit handler
  const formik = useFormik({
    initialValues,
    validationSchema: dynamicSchema,
    enableReinitialize: true,
    onSubmit: (val, { setSubmitting }) => {
      alert(JSON.stringify(val, null, 2));
      setSubmitting(false);
    },
  });

  // Memoized computation of required fields based on selected report type
  const currentFields = useMemo(
    () => reportFieldsMap[formik.values.report as unknown as StudentReportTitle] || [],
    [formik.values.report]
  );

  // Update validation schema whenever required fields change
  useEffect(() => {
    const newSchema = getValidationSchema(currentFields);
    setDynamicSchema(newSchema);
  }, [currentFields]);

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
    <Box>
      <CustomBreadcrumbs
        heading="Reports"
        links={[
          { name: 'Student', href: '/student/enrollment/dashboard/' },
          { name: 'Student Records', href: '/student/overview/' },
          { name: 'Reports' },
        ]}
        sx={{ mb: 2 }}
      />
      <Card>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <CustomSelect
                  options={StudentReportTitleOptions}
                  label="Report *"
                  labelKey="label"
                  valueKey="name"
                  value={formik.values.report}
                  onChange={(val) => {
                    formik.setFieldValue('report', val);
                  }}
                  onBlur={() => formik.setFieldTouched('report', true)}
                  error={formik.touched.report && Boolean(formik.errors.report)}
                  helperText={(formik.touched.report && formik.errors.report) as string}
                  formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                  helperText={(formik.touched.organization && formik.errors.organization) as string}
                  labelKey="name"
                  valueKey="id"
                  formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                  disabled={!medium}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                    const wasAllPreviouslySelected = (formik.values.classes as string[]).includes(
                      'all'
                    );

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
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                {!(formik.values.classes as string[]).includes('all') &&
                  formik.values.classes.length > 0 && (
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
                  )}
              </Grid>

              {showField('fromRollNo') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    name="fromRollNo"
                    value={formik.values.fromRollNo}
                    type="number"
                    label="From Roll No *"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    size="small"
                    fullWidth
                    disabled={formik.values.divisions.length === 0}
                    error={formik.touched.fromRollNo && Boolean(formik.errors.fromRollNo)}
                    helperText={(formik.touched.fromRollNo && formik.errors.fromRollNo) as string}
                  />
                </Grid>
              )}
              {showField('toRollNo') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    name="toRollNo"
                    type="number"
                    value={formik.values.toRollNo}
                    label="To Roll No *"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    size="small"
                    disabled={!formik.values.fromRollNo}
                    fullWidth
                    error={formik.touched.toRollNo && Boolean(formik.errors.toRollNo)}
                    helperText={(formik.touched.toRollNo && formik.errors.toRollNo) as string}
                  />
                </Grid>
              )}

              {showField('month') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <CustomSelect
                    label="Month *"
                    options={[
                      { id: '1', name: 'January' },
                      { id: '2', name: 'February' },
                      { id: '3', name: 'March' },
                      { id: '4', name: 'April' },
                      { id: '5', name: 'May' },
                      { id: '6', name: 'June' },
                      { id: '7', name: 'July' },
                      { id: '8', name: 'August' },
                      { id: '9', name: 'September' },
                      { id: '10', name: 'October' },
                      { id: '11', name: 'November' },
                      { id: '12', name: 'December' },
                    ]}
                    name="month"
                    labelKey="name"
                    valueKey="id"
                    multiple
                    value={formik.values.month || []}
                    onBlur={() => formik.setFieldTouched('month', true)} // ✅ Add this line
                    onChange={(val) => {
                      formik.setFieldValue('month', val);
                      if (val.length === 0) {
                        formik.setFieldTouched('month', true); // ✅ important
                      }
                    }}
                    error={formik.touched.month && Boolean(formik.errors.month)}
                    helperText={(formik.touched.month && formik.errors.month) as string}
                  />
                </Grid>
              )}

              {showField('fromDate') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <DatePicker
                    label="From Date *"
                    disableFuture
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
                </Grid>
              )}

              {showField('toDate') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <DatePicker
                    label="To Date *"
                    disableFuture
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
                </Grid>
              )}

              {showField('fromAge') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    label="From Age *"
                    type="number"
                    name="fromAge"
                    value={formik.values.fromAge}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.fromAge && Boolean(formik.errors.fromAge)}
                    helperText={(formik.touched.fromAge && formik.errors.fromAge) as string}
                    fullWidth
                  />
                </Grid>
              )}

              {showField('toAge') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    label="To Age *"
                    type="number"
                    name="toAge"
                    value={formik.values.toAge}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    fullWidth
                    error={formik.touched.toAge && Boolean(formik.errors.toAge)}
                    helperText={(formik.touched.toAge && formik.errors.toAge) as string}
                    onKeyDown={(e) => {
                      if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </Grid>
              )}

              {showField('category') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <CustomSelect
                    labelId="category-dropdown-label"
                    id="category-dropdown"
                    value={formik.values.category}
                    onBlur={() => formik.setFieldTouched('category', true)} // ✅ Add this line
                    onChange={(val) => formik.setFieldValue('category', val)}
                    size="small"
                    label="Category *"
                    name="category"
                    error={formik.touched.category && Boolean(formik.errors.category)}
                    helperText={(formik.touched.category && formik.errors.category) as string}
                    options={EmployeeCastTypeArray.map((i, index) => ({
                      value: index,
                      label: EmployeeCastType[index],
                    }))}
                    multiple
                    formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                  />
                </Grid>
              )}

              {showField('gender') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <CustomSelect
                    label="Gender *"
                    options={[
                      { id: 'male', name: 'Male' },
                      { id: 'female', name: 'Female' },
                      { id: 'other', name: 'Other' },
                    ]}
                    value={formik.values.gender}
                    onChange={(val) => formik.setFieldValue('gender', val)}
                    onBlur={() => formik.setFieldTouched('gender', true)}
                    error={formik.touched.gender && Boolean(formik.errors.gender)}
                    helperText={(formik.touched.gender && formik.errors.gender) as string}
                    labelKey="name"
                    valueKey="id"
                    multiple
                    formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                  />
                </Grid>
              )}

              {showField('religion') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <CustomSelect
                    label="Religion *"
                    options={[
                      { id: 'Hinduism', name: 'Hinduism' },
                      { id: 'Islam', name: 'Islam' },
                      { id: 'Christianity', name: 'Christianity' },
                      { id: 'Sikhism', name: 'Sikhism' },
                      { id: 'Buddhism', name: 'Buddhism' },
                      { id: 'Jainism', name: 'Jainism' },
                      { id: 'Judaism', name: 'Judaism' },
                      { id: 'Zoroastrianism', name: 'Zoroastrianism' },
                    ]}
                    value={formik.values.religion}
                    onChange={(val) => formik.setFieldValue('religion', val)}
                    onBlur={() => formik.setFieldTouched('religion', true)}
                    error={formik.touched.religion && Boolean(formik.errors.religion)}
                    helperText={(formik.touched.religion && formik.errors.religion) as string}
                    labelKey="name"
                    valueKey="id"
                    multiple
                    formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                  />
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

export default StudentReportsScreen;
