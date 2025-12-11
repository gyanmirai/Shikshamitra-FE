'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';
import { Box, Grid, Card, Button, TextField, Autocomplete } from '@mui/material';
import { ExamReportTitle, GeneralGradePerformanceReportMap } from 'src/enums/examination-reports';

import { getExamValidationSchema } from '../getExamReportValidationSchema';

const examCommonFields = ['organizations', 'standards', 'divisions'];

const GeneralGradePerformanceReportFieldsMap = {
  [ExamReportTitle.GenderWiseGradeAnalysis]: [...examCommonFields, 'exam'],
  [ExamReportTitle.ResultStatisticsReport]: [...examCommonFields],
};

const examReportInitialValues = {
  report: '' as unknown as ExamReportTitle,
  organizations: [] as string[],
  standards: [] as string[],
  standard: '',
  division: '',
  organization: '',
  divisions: [] as string[],
  exam: null,
  exams: [],
  subjects: [],
  subject: '',
  grade: [],
  minMark: null,
  maxMark: null,
  students: [],
};

const GeneralGradePerformanceReports = ({ report }: { report: string }) => {
  const mappedReport = GeneralGradePerformanceReportMap.find((opt) => opt.label === report)?.name;

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  const [dynamicSchema, setDynamicSchema] = useState(getExamValidationSchema([]));

  const formik = useFormik({
    initialValues: {
      ...examReportInitialValues,
      report: mappedReport as ExamReportTitle,
    },
    enableReinitialize: true,
    validationSchema: dynamicSchema,
    onSubmit: (values, { setSubmitting }) => {
      window.alert('Report Generated Successfully!');
      setSubmitting(false);
    },
  });

  const currentFields = useMemo(
    () =>
      GeneralGradePerformanceReportFieldsMap[
        mappedReport as keyof typeof GeneralGradePerformanceReportFieldsMap
      ] || [],
    [mappedReport]
  );

  useEffect(() => {
    const schema = getExamValidationSchema(currentFields);
    setDynamicSchema(schema);
  }, [currentFields]);

  useEffect(() => {
    if (!medium?.educationMediumStages) {
      setAllOrganization([]);
      return;
    }
    const orgList = cloneDeep(medium.educationMediumStages);
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

  useEffect(() => {
    const selected = formik.values.standards.filter((id) => id !== 'all');

    if (!selected || selected.length === 0) {
      setAllDivision([]);
      formik.setFieldValue('divisions', []);
      return;
    }

    if (selected.length === 1) {
      const cl = allClass.find((c: any) => c?.id === selected[0]);
      const divs = cl?.divisions || [];
      setAllDivision(divs);

      const ids = divs.map((d: any) => d.id);
      formik.setFieldValue('divisions', ids.length > 0 ? ['all', ...ids] : []);
    } else {
      setAllDivision([]);
      formik.setFieldValue('divisions', ['all']);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allClass, formik.values.standards]);

  const showField = (field: string) => currentFields.includes(field);

  return (
    <Box sx={{ mt: 2 }}>
      <Card>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              {/* ORGANIZATION */}
              {showField('organizations') && (
                <Grid size={{ xs: 12, sm: 6 }}>
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

              {/* CLASS / STANDARD */}
              {showField('standards') && (
                <Grid size={{ xs: 12, sm: 6 }}>
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

              {/* DIVISIONS */}
              {showField('divisions') && (
                <Grid size={{ xs: 12, sm: 6 }}>
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

                        if (selected.length > 1 || formik.values.standards.includes('all')) {
                          formik.setFieldValue('divisions', ['all']);
                          return;
                        }

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

              {/* Single Exam */}
              {showField('exam') && (
                <Grid size={{ xs: 12, sm: 6 }}>
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

              {/* Submit Button */}
              <Grid size={12} display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  size="small"
                  type="submit"
                  startIcon={<Iconify icon={GlobalIcons.report} />}
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

export default GeneralGradePerformanceReports;
