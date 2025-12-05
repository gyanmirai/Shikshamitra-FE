'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';
import { ExamReportTitle, ExamReportTitleOptions } from 'src/enums/examination-reports';
import {
  Box,
  Grid,
  Card,
  Chip,
  Button,
  Checkbox,
  TextField,
  Autocomplete,
  ListItemText,
} from '@mui/material';

import { getExamValidationSchema } from './getExamReportValidationSchema';

export interface ExamReportInitialValues {
  report: ExamReportTitle; // Single-select (report type)
  organizations: string[]; // Multi-select (org)
  standards: string[]; // Multi-select (class/standard)
  standard: string;
  division: string;
  organization: string;
  divisions: string[]; // Multi-select (division)
  exam: string | null; // Single-select exam
  exams: string[]; // Multi-select exam (for reports needing it)
  subjects: string[]; // Multi-select subject
  subject: string; // Single-select subject
  grade: string[]; // Multi-select grade (Bright Student reports)
  minMark: string | null; // Optional
  maxMark: string | null; // Optional
  students: string[]; // Multi-select student (optional)
}

export const examReportInitialValues: ExamReportInitialValues = {
  report: '' as unknown as ExamReportTitle,
  organizations: [],
  standards: [],
  standard: '',
  division: '',
  organization: '',
  divisions: [],
  exam: null, // for single exam selection
  exams: [], // for multi-select exam reports
  subjects: [],
  subject: '', // for single-select subject
  grade: [],
  minMark: null,
  maxMark: null,
  students: [],
};

const examCommonFields = ['organizations', 'standards', 'divisions'];

export const ExamReportFieldsMap = {
  // Average Subject Mark Analysis
  AverageSubjectMarkAnalysis: [...examCommonFields, 'exam', 'subjects_optional'],

  // Bright Student Analysis
  BrightStudentAnalysis: [...examCommonFields, 'exam', 'grade'],

  // Bright Student List Subject Wise
  BrightStudentListSubjectWise: [...examCommonFields, 'exam', 'subjects', 'grade'],

  // Gender Wise Grade Analysis
  GenderWiseGradeAnalysis: [...examCommonFields, 'exam'],

  // Mark List With All Subject
  MarkListWithAllSubject: [...examCommonFields, 'exam'],

  // Result List
  ResultList: [...examCommonFields, 'exam'],

  // Subject Average Class Mark Analysis Division Wise
  SubjectAverageClassMarkAnalysisDivisionWise: [...examCommonFields, 'exam', 'divisions_optional'],

  // ResultListConsolidateVerify
  ResultListConsolidateVerify: [
    ...examCommonFields,
    'exams', // multi exam
  ],

  // ResultListConsolidateWithMarkGrade
  ResultListConsolidateWithMarkGrade: [...examCommonFields, 'exam'],

  // ResultListConsolidateWithMarks
  ResultListConsolidateWithMarks: [...examCommonFields, 'exam'],

  // ResultListConsolidateWithMarksSiddhiKrupa
  ResultListConsolidateWithMarksSiddhiKrupa: [...examCommonFields, 'exam'],

  // ResultListOneGrade
  ResultListOneGrade: [...examCommonFields, 'exam'],

  // ResultListOneMark
  ResultListOneMark: [...examCommonFields, 'exam'],

  // ResultListTwoMark
  ResultListTwoMark: [...examCommonFields, 'exam'],

  // ResultListWithSubject
  ResultListWithSubject: [...examCommonFields, 'exam', 'subjects'],

  // ResultListWithSubjectFailedDetails
  ResultListWithSubjectFailedDetails: [...examCommonFields, 'exam', 'subjects'],

  // ResultListWithSubjectGrade
  ResultListWithSubjectGrade: [...examCommonFields, 'exam', 'subjects'],

  // ResultListWithSubjectSmall
  ResultListWithSubjectSmall: [...examCommonFields, 'exam', 'subjects'],

  // ResultListWithSubjectWithGrace
  ResultListWithSubjectWithGrace: [...examCommonFields, 'exam', 'subjects'],

  // Result Over All Synopsis
  ResultOverAllSynopsis: [...examCommonFields, 'exam'],

  // Result Statistics Report
  ResultStatisticsReport: [...examCommonFields],

  // Result With All Subject List
  ResultWithAllSubjectList: [...examCommonFields, 'exam'],

  // ResultListOverallGradeAnalysis
  ResultListOverallGradeAnalysis: [...examCommonFields, 'exam'],

  // ResultListPassFailAnalysisSubjectWise
  ResultListPassFailAnalysisSubjectWise: [...examCommonFields, 'exam'],

  // ResultListPassFailOverAllAnalysis
  ResultListPassFailOverAllAnalysis: [...examCommonFields, 'exam'],

  // ResultListSubjectGradeAnalysis
  ResultListSubjectGradeAnalysis: [...examCommonFields, 'exam'],

  // StudentAllBatchResult
  StudentAllBatchResult: [...examCommonFields],

  // StudentAllExamResult
  StudentAllExamResult: ['organization_single', 'standard_single', 'division_single'],

  // StudentGradeAnalysis
  StudentGradeAnalysis: [...examCommonFields, 'exam'],

  // StudentGradeAnalysisSubjectWise
  StudentGradeAnalysisSubjectWise: [...examCommonFields, 'exam', 'subjects_optional'],

  // Subject Wise Grade List
  SubjectWiseGradeList: [
    ...examCommonFields,
    'exam',
    'subject', // single subject
    'minMark_optional',
    'maxMark_optional',
  ],

  // Weak Student Analysis
  WeakStudentAnalysis: [...examCommonFields, 'exams'],

  // Weak Student Analysis Subject Wise
  WeakStudentAnalysisSubjectWise: [
    ...examCommonFields,
    'exam',
    'subject', // single subject
  ],
};

const ExaminationReportComponent = () => {
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  const [dynamicSchema, setDynamicSchema] = useState(getExamValidationSchema([]));

  const formik = useFormik({
    initialValues: examReportInitialValues,
    enableReinitialize: true,
    validationSchema: dynamicSchema,
    onSubmit: (values, { setSubmitting }) => {
      window.alert('Report Generated Successfully!');
      setSubmitting(false);
    },
  });

  const currentFields = useMemo(() => {
    const key =
      typeof formik.values.report === 'number'
        ? ExamReportTitle[formik.values.report]
        : formik.values.report;

    return ExamReportFieldsMap[key as keyof typeof ExamReportFieldsMap] || [];
  }, [formik.values.report]);

  // -----------------------------------------------
  // UPDATE VALIDATION SCHEMA WHEN FIELDS CHANGE
  // -----------------------------------------------
  useEffect(() => {
    const schema = getExamValidationSchema(currentFields);
    setDynamicSchema(schema);
  }, [currentFields]);

  // -----------------------------------------------
  // FETCH ORGANIZATIONS FROM MEDIUM
  // -----------------------------------------------
  useEffect(() => {
    if (!medium?.educationMediumStages) {
      setAllOrganization([]);
      return;
    }

    // Deep clone original list
    const orgList = cloneDeep(medium.educationMediumStages);

    // Add "All" option at the top
    const updatedOrganizations = [
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
      ...orgList,
    ];

    setAllOrganization(updatedOrganizations);
  }, [medium?.educationMediumStages]);

  useEffect(() => {
    const selectedOrgs = formik.values.organizations.filter((id) => id !== 'all');

    if (selectedOrgs.length === 0) {
      setAllClass([]);
      formik.setFieldValue('standards', []);
      return;
    }

    const filteredOrganizations = allOrganization?.filter((org: any) =>
      selectedOrgs.includes(org.id)
    );

    const allStandards: any[] = [];
    filteredOrganizations?.forEach((org: any) => {
      if (org.standards && Array.isArray(org.standards)) {
        allStandards.push(...org.standards);
      }
    });

    setAllClass(allStandards);

    if (allStandards.length > 0) {
      const allClassIds = allStandards.map((cls: any) => cls.id);
      formik.setFieldValue('standards', ['all', ...allClassIds]);
    } else {
      formik.setFieldValue('standards', []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.organizations]);

  // useEffect for Classes -> Divisions
  useEffect(() => {
    const selected = formik.values.standards.filter((id) => id !== 'all');

    if (!selected || selected.length === 0) {
      setAllDivision([]);
      formik.setFieldValue('divisions', []);
      return;
    }

    // Single class selected - show all divisions
    if (selected.length === 1) {
      const cl = allClass.find((c: any) => c?.id === selected[0]);
      const divs = cl?.divisions || [];
      setAllDivision(divs);

      const ids = divs.map((d: any) => d.id);
      formik.setFieldValue('divisions', ids.length > 0 ? ['all', ...ids] : []);
    }
    // Multiple classes or "all" selected - only show "All" option
    else {
      // Set empty array for divisions, only "All" will be shown in options
      setAllDivision([]);
      // Only set "all" in the value
      formik.setFieldValue('divisions', ['all']);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allClass, formik.values.standards]);

  // -----------------------------------------------
  // Helper
  // -----------------------------------------------
  const showField = (field: string) => currentFields.includes(field);

  // ---------------------------------------------------------------
  // RENDER COMPONENT UI
  // ---------------------------------------------------------------
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Exam Reports"
        links={[
          { name: 'Student', href: '/student/enrollment/dashboard/' },
          { name: 'Student Records', href: '/student/overview/' },
          { name: 'Exam Reports' },
        ]}
        sx={{ mb: 2 }}
      />

      <Card>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              {/* REPORT SELECTION */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <ShakingTextField error={!!formik.errors.report && !!formik.touched.report}>
                  <CustomTooltip placement="top" title={ExamReportTitle[formik.values.report]}>
                    <Autocomplete
                      options={ExamReportTitleOptions}
                      getOptionLabel={(o: any) => o.label}
                      isOptionEqualToValue={(o, v) => o.name === v.name}
                      value={
                        ExamReportTitleOptions.find((opt) => opt.name === formik.values.report) ||
                        null
                      }
                      onChange={(event, newValue) => {
                        if (newValue) {
                          formik.setFieldValue('report', newValue.name);
                        } else {
                          formik.setFieldValue('report', '');
                        }
                        formik.setFieldTouched('report', true);

                        // Reset dependent fields
                        formik.setValues({
                          ...examReportInitialValues,
                          report: newValue?.name as ExamReportTitle,
                        });
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Report *"
                          size="small"
                          fullWidth
                          error={formik.touched.report && Boolean(formik.errors.report)}
                          helperText={(formik.touched.report && formik.errors.report) as string}
                        />
                      )}
                    />
                  </CustomTooltip>
                </ShakingTextField>
              </Grid>

              {/* ORGANIZATION */}
              {showField('organizations') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={!!formik.errors.organizations && !!formik.touched.organizations}
                  >
                    <ResponsiveMultiSelect
                      label="Organizations"
                      options={[
                        { id: 'all', name: 'All' },
                        ...allOrganization.filter((o) => o.id !== 'all'),
                      ]}
                      value={formik.values.organizations}
                      getOptionLabel={(opt) => opt?.name}
                      getOptionValue={(opt) => opt?.id}
                      onChange={(selectedValues) => {
                        const allRealIds = allOrganization
                          .filter((o) => o.id !== 'all')
                          .map((o) => o.id);

                        const hasAllInSelection = selectedValues.includes('all');
                        const wasAllPreviouslySelected =
                          formik.values.organizations.includes('all');

                        let finalValues: string[] = [];

                        if (hasAllInSelection && !wasAllPreviouslySelected) {
                          finalValues = ['all', ...allRealIds];
                        } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                          finalValues = [];
                        } else if (hasAllInSelection && wasAllPreviouslySelected) {
                          finalValues = selectedValues.filter((id) => id !== 'all');
                        } else {
                          const allIndividuallySelected = allRealIds.every((id) =>
                            selectedValues.includes(id)
                          );

                          if (
                            allIndividuallySelected &&
                            selectedValues.length === allRealIds.length
                          ) {
                            finalValues = ['all', ...allRealIds];
                          } else {
                            finalValues = selectedValues;
                          }
                        }

                        formik.setFieldValue('organizations', finalValues);
                      }}
                      error={!!(formik.touched.organizations && formik.errors.organizations)}
                      helperText={
                        formik.touched.organizations &&
                        typeof formik.errors.organizations === 'string'
                          ? formik.errors.organizations
                          : undefined
                      }
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('organization_single') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField
                    error={!!formik.errors.organization && !!formik.touched.organization}
                  >
                    <CustomSelect
                      label="Organization *"
                      options={allOrganization}
                      labelKey="name"
                      valueKey="id"
                      value={formik.values.organization}
                      onChange={(val) => {
                        formik.setFieldValue('organization', val);
                        formik.setFieldValue('standard', '');
                        formik.setFieldValue('division', '');

                        const org = allOrganization.find((o) => o.id === val);
                        setAllClass(org?.standards || []);
                      }}
                      error={formik.touched.organization && Boolean(formik.errors.organization)}
                      helperText={
                        (formik.touched.organization && formik.errors.organization) as string
                      }
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* CLASS / STANDARD */}
              {showField('standards') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={!!formik.errors.standards && !!formik.touched.standards}>
                    <ResponsiveMultiSelect
                      label="Class *"
                      options={[{ id: 'all', name: 'All' }, ...allClass]}
                      value={formik.values.standards}
                      getOptionLabel={(opt) => opt?.name}
                      getOptionValue={(opt) => opt?.id}
                      disabled={formik.values.organizations.length === 0}
                      onChange={(selectedValues) => {
                        const allRealIds = allClass.map((c) => c.id);
                        const hasAllInSelection = selectedValues.includes('all');
                        const wasAllPreviouslySelected = formik.values.standards.includes('all');

                        let finalValues: string[] = [];

                        if (hasAllInSelection && !wasAllPreviouslySelected) {
                          finalValues = ['all', ...allRealIds];
                        } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                          finalValues = [];
                        } else if (hasAllInSelection && wasAllPreviouslySelected) {
                          finalValues = selectedValues.filter((id) => id !== 'all');
                        } else {
                          const selectedRealIds = selectedValues.filter((id) => id !== 'all');

                          if (
                            selectedRealIds.length === allRealIds.length &&
                            allRealIds.every((id) => selectedRealIds.includes(id))
                          ) {
                            finalValues = ['all', ...allRealIds];
                          } else {
                            finalValues = selectedRealIds;
                          }
                        }

                        formik.setFieldValue('standards', finalValues);
                      }}
                      error={formik.touched.standards && Boolean(formik.errors.standards)}
                      helperText={(formik.touched.standards && formik.errors.standards) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('standard_single') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={!!formik.errors.standard && !!formik.touched.standard}>
                    <CustomSelect
                      label="Class *"
                      options={allClass}
                      labelKey="name"
                      valueKey="id"
                      disabled={!formik.values.organization}
                      value={formik.values.standard}
                      onChange={(val) => {
                        formik.setFieldValue('standard', val);
                        formik.setFieldTouched('standard', false);
                        const cl = allClass.find((c: any) => c?.id === val);
                        setAllDivision(cl?.divisions || []);
                        formik.setFieldValue('division', '');
                      }}
                      error={formik.touched.standard && Boolean(formik.errors.standard)}
                      helperText={(formik.touched.standard && formik.errors.standard) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* DIVISIONS */}
              {showField('divisions') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={!!formik.errors.divisions && !!formik.touched.divisions}>
                    <ResponsiveMultiSelect
                      label="Division *"
                      options={[{ id: 'all', name: 'All' }, ...allDivision]}
                      value={formik.values.divisions}
                      getOptionLabel={(opt) => opt?.name}
                      getOptionValue={(opt) => opt?.id}
                      disabled={formik.values.standards.length === 0}
                      onChange={(selectedValues) => {
                        const selected = formik.values.standards.filter((id) => id !== 'all');

                        // If multiple classes selected, only allow "all"
                        if (selected.length > 1 || formik.values.standards.includes('all')) {
                          formik.setFieldValue('divisions', ['all']);
                          return;
                        }

                        // Single class selected - allow individual division selection
                        const allRealIds = allDivision.map((d) => d.id);
                        const hasAllInSelection = selectedValues.includes('all');
                        const wasAllPreviouslySelected = formik.values.divisions.includes('all');

                        let finalValues: string[] = [];

                        if (hasAllInSelection && !wasAllPreviouslySelected) {
                          finalValues = ['all', ...allRealIds];
                        } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                          finalValues = [];
                        } else if (hasAllInSelection && wasAllPreviouslySelected) {
                          finalValues = selectedValues.filter((id) => id !== 'all');
                        } else {
                          const selectedRealIds = selectedValues.filter((id) => id !== 'all');

                          if (
                            selectedRealIds.length === allRealIds.length &&
                            allRealIds.every((id) => selectedRealIds.includes(id))
                          ) {
                            finalValues = ['all', ...allRealIds];
                          } else {
                            finalValues = selectedRealIds;
                          }
                        }

                        formik.setFieldValue('divisions', finalValues);
                      }}
                      error={formik.touched.divisions && Boolean(formik.errors.divisions)}
                      helperText={(formik.touched.divisions && formik.errors.divisions) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('division_single') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={!!formik.errors.division && !!formik.touched.division}>
                    <CustomSelect
                      label="Division *"
                      options={allDivision}
                      labelKey="name"
                      disabled={!formik.values.standard}
                      valueKey="id"
                      value={formik.values.division}
                      onChange={(val) => formik.setFieldValue('division', val)}
                      error={formik.touched.division && Boolean(formik.errors.division)}
                      helperText={(formik.touched.division && formik.errors.division) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Single Exam */}
              {showField('exam') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={!!formik.errors.exam && !!formik.touched.exam}>
                    <Autocomplete
                      options={[
                        { id: 'unit1', name: 'Unit Test 1' },
                        { id: 'unit2', name: 'Unit Test 2' },
                        { id: 'half', name: 'Half Yearly' },
                        { id: 'annual', name: 'Annual Exam' },
                      ]}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value?.id}
                      value={
                        [
                          { id: 'unit1', name: 'Unit Test 1' },
                          { id: 'unit2', name: 'Unit Test 2' },
                          { id: 'half', name: 'Half Yearly' },
                          { id: 'annual', name: 'Annual Exam' },
                        ].find((opt) => opt.id === formik.values.exam) || null
                      }
                      onChange={(event, newValue) => {
                        formik.setFieldValue('exam', newValue ? newValue.id : null);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Exam *"
                          fullWidth
                          size="small"
                          error={formik.touched.exam && Boolean(formik.errors.exam)}
                          helperText={(formik.touched.exam && formik.errors.exam) as string}
                        />
                      )}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Multi Exam */}
              {showField('exams') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={!!formik.errors.exams && !!formik.touched.exams}>
                    <Autocomplete
                      multiple
                      options={[
                        { id: 'unit1', name: 'Unit Test 1' },
                        { id: 'unit2', name: 'Unit Test 2' },
                        { id: 'half', name: 'Half Yearly' },
                        { id: 'annual', name: 'Annual Exam' },
                      ]}
                      renderOption={(props, option, { selected }) => (
                        <li {...props}>
                          <Checkbox checked={selected} size="small" style={{ marginRight: 8 }} />
                          <ListItemText primary={option.name} />
                        </li>
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            label={option.name}
                            size="small"
                            variant="soft"
                          />
                        ))
                      }
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      value={formik.values.exams.map((id) => ({ id, name: id }))}
                      onChange={(_e, newVal) =>
                        formik.setFieldValue(
                          'exams',
                          newVal.map((v) => v.id)
                        )
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Exams *"
                          size="small"
                          fullWidth
                          error={formik.touched.exams && Boolean(formik.errors.exams)}
                          helperText={(formik.touched.exams && formik.errors.exams) as string}
                        />
                      )}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Subjects (Multi) */}
              {showField('subjects') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={!!formik.errors.subjects && !!formik.touched.subjects}>
                    <Autocomplete
                      multiple
                      options={[
                        { id: 'math', name: 'Math' },
                        { id: 'eng', name: 'English' },
                        { id: 'science', name: 'Science' },
                      ]}
                      renderOption={(props, option, { selected }) => (
                        <li {...props}>
                          <Checkbox checked={selected} size="small" style={{ marginRight: 8 }} />
                          <ListItemText primary={option.name} />
                        </li>
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            label={option.name}
                            size="small"
                            variant="soft"
                          />
                        ))
                      }
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      value={formik.values.subjects.map((id) => ({ id, name: id }))}
                      onChange={(_e, newVal) =>
                        formik.setFieldValue(
                          'subjects',
                          newVal.map((v) => v.id)
                        )
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Subjects *"
                          size="small"
                          fullWidth
                          error={formik.touched.subjects && Boolean(formik.errors.subjects)}
                          helperText={(formik.touched.subjects && formik.errors.subjects) as string}
                        />
                      )}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Single Subject */}
              {showField('subject') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={!!formik.errors.subject && !!formik.touched.subject}>
                    <CustomSelect
                      label="Subject *"
                      options={[
                        { id: 'math', name: 'Math' },
                        { id: 'eng', name: 'English' },
                      ]}
                      labelKey="name"
                      valueKey="id"
                      value={formik.values.subject}
                      onChange={(val) => formik.setFieldValue('subject', val)}
                      error={formik.touched.subject && Boolean(formik.errors.subject)}
                      helperText={(formik.touched.subject && formik.errors.subject) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Min Mark */}
              {showField('minMark_optional') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={!!formik.errors.minMark && !!formik.touched.minMark}>
                    <TextField
                      label="Min Mark"
                      fullWidth
                      size="small"
                      value={formik.values.minMark || ''}
                      onChange={(e) => formik.setFieldValue('minMark', e.target.value)}
                      error={formik.touched.minMark && Boolean(formik.errors.minMark)}
                      helperText={(formik.touched.minMark && formik.errors.minMark) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Max Mark */}
              {showField('maxMark_optional') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={!!formik.errors.maxMark && !!formik.touched.maxMark}>
                    <TextField
                      label="Max Mark"
                      fullWidth
                      size="small"
                      value={formik.values.maxMark || ''}
                      onChange={(e) => formik.setFieldValue('maxMark', e.target.value)}
                      error={formik.touched.maxMark && Boolean(formik.errors.maxMark)}
                      helperText={(formik.touched.maxMark && formik.errors.maxMark) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Grade Multi */}
              {showField('grade') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={!!formik.errors.grade && !!formik.touched.grade}>
                    <CustomSelect
                      label="Grade *"
                      multiple
                      options={[
                        { id: 'A', name: 'A' },
                        { id: 'B', name: 'B' },
                        { id: 'C', name: 'C' },
                        { id: 'D', name: 'D' },
                      ]}
                      labelKey="name"
                      valueKey="id"
                      value={formik.values.grade}
                      onChange={(val) => formik.setFieldValue('grade', val)}
                      error={formik.touched.grade && Boolean(formik.errors.grade)}
                      helperText={(formik.touched.grade && formik.errors.grade) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Students Optional */}
              {showField('students_optional') && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <ShakingTextField error={!!formik.errors.students && !!formik.touched.students}>
                    <CustomSelect
                      label="Students (Optional)"
                      multiple
                      options={[
                        { id: 'stu1', name: 'Student A' },
                        { id: 'stu2', name: 'Student B' },
                      ]}
                      value={formik.values.students}
                      onChange={(val) => formik.setFieldValue('students', val)}
                      error={formik.touched.students && Boolean(formik.errors.students)}
                      helperText={(formik.touched.students && formik.errors.students) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* SUBMIT */}
              <Grid size={{ xs: 12 }} justifyContent="flex-end" display="flex">
                <Button
                  type="submit"
                  variant="contained"
                  size="small"
                  startIcon={<Iconify icon={GlobalIcons.generateReport} />}
                  disabled={
                    formik.values.report === ('' as unknown as ExamReportTitle) ||
                    formik.values.report === null ||
                    formik.values.report === undefined
                  }
                  sx={{ px: '32px' }}
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

export default ExaminationReportComponent;
