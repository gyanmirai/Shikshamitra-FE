'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, Division, Standards, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { examScheduledStatus } from 'src/enums/exam-scheduled-status';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';
import { Box, Grid, Card, Button, TextField, Autocomplete } from '@mui/material';
import { ExamReportTitle, GeneralGradePerformanceReportMap } from 'src/enums/examination-reports';
import { useGetExamsQuery } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';

import { getExamValidationSchema } from '../getExamReportValidationSchema';

// ---- helper: resolve toggle-all multi-select values -------------------------
const resolveMultiSelectValues = (
  selectedValues: string[],
  previousValues: string[],
  allRealIds: string[]
): string[] => {
  const hasAllInSelection = selectedValues.includes('all');
  const wasAllPreviouslySelected = previousValues.includes('all');

  if (hasAllInSelection && !wasAllPreviouslySelected) return ['all', ...allRealIds];
  if (!hasAllInSelection && wasAllPreviouslySelected) return [];
  if (hasAllInSelection && wasAllPreviouslySelected)
    return selectedValues.filter((id) => id !== 'all');

  const selectedRealIds = selectedValues.filter((id) => id !== 'all');
  if (
    selectedRealIds.length === allRealIds.length &&
    allRealIds.every((id) => selectedRealIds.includes(id))
  ) {
    return ['all', ...allRealIds];
  }
  return selectedRealIds;
};

const getApiItems = (response: any): any[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.records)) return response.records;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

// ---- per-report field config ------------------------------------------------
const GeneralGradePerformanceReportFieldsMap: Partial<Record<ExamReportTitle, string[]>> = {
  [ExamReportTitle.GenderWiseGradeAnalysis]: ['organizations', 'standards', 'divisions', 'exam'],
  [ExamReportTitle.ResultStatisticsReport]: ['organizations', 'standards', 'divisions', 'exam'],
};

const GeneralGradePerformanceReportRequiredFieldsMap: Partial<Record<ExamReportTitle, string[]>> = {
  [ExamReportTitle.GenderWiseGradeAnalysis]: ['organizations', 'standards', 'exam'],
  [ExamReportTitle.ResultStatisticsReport]: ['organizations', 'standards', 'exam'],
};

// ---- initial values ---------------------------------------------------------
const examReportInitialValues = {
  report: '' as unknown as ExamReportTitle,
  organizations: [] as string[],
  standards: [] as string[],
  divisions: [] as string[],
  exam: '',
};

// =============================================================================

const GeneralGradePerformanceReports = ({ report }: { report: string }) => {
  const mappedReport = GeneralGradePerformanceReportMap.find((opt) => opt.label === report)
    ?.name as ExamReportTitle;

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  const currentFields = useMemo(
    () => GeneralGradePerformanceReportFieldsMap[mappedReport] || [],
    [mappedReport]
  );
  const currentRequiredFields = useMemo(
    () => GeneralGradePerformanceReportRequiredFieldsMap[mappedReport] || [],
    [mappedReport]
  );

  const showField = (field: string) => currentFields.includes(field);
  const isRequired = (field: string) => currentRequiredFields.includes(field);

  const [dynamicSchema, setDynamicSchema] = useState(
    getExamValidationSchema(currentFields, currentRequiredFields)
  );

  const formik = useFormik({
    initialValues: { ...examReportInitialValues, report: mappedReport },
    enableReinitialize: true,
    validationSchema: dynamicSchema,
    onSubmit: (_values, { setSubmitting }) => {
      window.alert('Report Generated Successfully!');
      setSubmitting(false);
    },
  });

  // ---- exam API (lazy via skip) -----------------------------------------------
  const shouldLoadExams = showField('exam') && Boolean((medium as Medium)?.id);

  const { data: examData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamsQuery,
    params: {
      AcademicMediumId: (medium as Medium)?.id,
      Status: examScheduledStatus.Completed,
    },
    options: { skip: !shouldLoadExams },
  });

  const examOptions = useMemo(
    () =>
      getApiItems(examData).map((item: any) => ({
        id: item.id ?? item.examId,
        name: item.examName ?? item.name,
      })),
    [examData]
  );

  // ---- update validation schema on report switch ------------------------------
  useEffect(() => {
    setDynamicSchema(getExamValidationSchema(currentFields, currentRequiredFields));
  }, [currentFields, currentRequiredFields]);

  // ---- populate org list from medium ------------------------------------------
  useEffect(() => {
    if (!medium?.educationMediumStages) {
      setAllOrganization([]);
      return;
    }
    const orgList = cloneDeep(medium.educationMediumStages);
    setAllOrganization([
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
    ]);
  }, [medium?.educationMediumStages]);

  // ---- org â†’ class ------------------------------------------------------------
  useEffect(() => {
    const selectedOrgs = formik.values.organizations.filter((id) => id !== 'all');

    if (selectedOrgs.length === 0) {
      setAllClass([]);
      formik.setFieldValue('standards', []);
      return;
    }

    const filteredOrgs = allOrganization.filter((org: any) => selectedOrgs.includes(org.id));
    const allStandards: any[] = [];
    filteredOrgs.forEach((org: any) => {
      if (Array.isArray(org.standards)) allStandards.push(...org.standards);
    });
    setAllClass(allStandards);

    if (allStandards.length > 0) {
      formik.setFieldValue('standards', ['all', ...allStandards.map((c: any) => c.id)]);
    } else {
      formik.setFieldValue('standards', []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.organizations]);

  // ---- class â†’ division -------------------------------------------------------
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

  // =============================================================================

  return (
    <Box sx={{ mt: 2 }}>
      <Card>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              {/* ORGANIZATION (multi, required) */}
              {showField('organizations') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={!!formik.errors.organizations && !!formik.touched.organizations}
                  >
                    <ResponsiveMultiSelect
                      label={`Organizations${isRequired('organizations') ? ' *' : ''}`}
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
                        formik.setFieldValue(
                          'organizations',
                          resolveMultiSelectValues(
                            selectedValues,
                            formik.values.organizations,
                            allRealIds
                          )
                        );
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

              {/* CLASS (required multi) */}
              {showField('standards') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.standards && !!formik.touched.standards}>
                    <ResponsiveMultiSelect
                      label={`Class${isRequired('standards') ? ' *' : ''}`}
                      options={[{ id: 'all', name: 'All' }, ...allClass]}
                      value={formik.values.standards}
                      getOptionLabel={(opt) => opt?.name}
                      getOptionValue={(opt) => opt?.id}
                      disabled={formik.values.organizations.length === 0}
                      onChange={(selectedValues) => {
                        const allRealIds = allClass.map((c) => c.id);
                        formik.setFieldValue(
                          'standards',
                          resolveMultiSelectValues(
                            selectedValues,
                            formik.values.standards,
                            allRealIds
                          )
                        );
                      }}
                      error={!!(formik.touched.standards && formik.errors.standards)}
                      helperText={
                        formik.touched.standards && typeof formik.errors.standards === 'string'
                          ? formik.errors.standards
                          : undefined
                      }
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* DIVISION (optional multi) */}
              {showField('divisions') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.divisions && !!formik.touched.divisions}>
                    <ResponsiveMultiSelect
                      label={`Division${isRequired('divisions') ? ' *' : ''}`}
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
                        formik.setFieldValue(
                          'divisions',
                          resolveMultiSelectValues(
                            selectedValues,
                            formik.values.divisions,
                            allRealIds
                          )
                        );
                      }}
                      error={!!(formik.touched.divisions && formik.errors.divisions)}
                      helperText={
                        formik.touched.divisions && typeof formik.errors.divisions === 'string'
                          ? formik.errors.divisions
                          : undefined
                      }
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* EXAM (required single, API-driven) */}
              {showField('exam') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.exam && !!formik.touched.exam}>
                    <Autocomplete
                      options={examOptions}
                      getOptionLabel={(option: any) => option.name}
                      isOptionEqualToValue={(option: any, value: any) => option.id === value?.id}
                      value={examOptions.find((e) => e.id === formik.values.exam) || null}
                      onChange={(_event, newValue: any) => {
                        formik.setFieldValue('exam', newValue ? newValue.id : '');
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={`Exam${isRequired('exam') ? ' *' : ''}`}
                          fullWidth
                          size="small"
                          error={!!(formik.touched.exam && formik.errors.exam)}
                          helperText={(formik.touched.exam && formik.errors.exam) as string}
                        />
                      )}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Submit */}
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
