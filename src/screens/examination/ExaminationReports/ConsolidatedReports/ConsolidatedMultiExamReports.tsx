'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, Division, Standards, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { Box, Grid, Card, Alert, Button } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { examScheduledStatus } from 'src/enums/exam-scheduled-status';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';
import { ExamReportTitle, ConsolidatedMultiExamReportMap } from 'src/enums/examination-reports';
import { useGetExamsQuery } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';

import { getExamValidationSchema } from '../getExamReportValidationSchema';

const resolveMultiSelectValues = (
  selectedValues: string[],
  previousValues: string[],
  allRealIds: string[]
): string[] => {
  const hasAllInSelection = selectedValues.includes('all');
  const wasAllPreviouslySelected = previousValues.includes('all');

  if (hasAllInSelection && !wasAllPreviouslySelected) {
    return ['all', ...allRealIds];
  }

  if (!hasAllInSelection && wasAllPreviouslySelected) {
    return [];
  }

  if (hasAllInSelection && wasAllPreviouslySelected) {
    return selectedValues.filter((id) => id !== 'all');
  }

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

const ConsolidatedMultiExamReportFieldsMap: Partial<Record<ExamReportTitle, string[]>> = {
  [ExamReportTitle.ResultListConsolidateVerify]: [
    'organizations',
    'standards',
    'divisions',
    'examGroups',
  ],
  [ExamReportTitle.ResultListConsolidateWithMarkGrade]: [
    'organizations',
    'standard_single',
    'divisions',
    'examGroup',
  ],
  [ExamReportTitle.ResultListConsolidateWithMarks]: [
    'organizations',
    'standard_single',
    'divisions',
    'examGroup',
  ],
  [ExamReportTitle.ResultListConsolidateWithMarksSiddhiKrupa]: [
    'organizations',
    'standards',
    'divisions',
    'placeholder_todo',
  ],
};

const ConsolidatedMultiExamReportRequiredFieldsMap: Partial<Record<ExamReportTitle, string[]>> = {
  [ExamReportTitle.ResultListConsolidateVerify]: ['organizations', 'standards', 'examGroups'],
  [ExamReportTitle.ResultListConsolidateWithMarkGrade]: [
    'organizations',
    'standard_single',
    'examGroup',
  ],
  [ExamReportTitle.ResultListConsolidateWithMarks]: [
    'organizations',
    'standard_single',
    'examGroup',
  ],
  [ExamReportTitle.ResultListConsolidateWithMarksSiddhiKrupa]: [],
};

const examReportInitialValues = {
  report: '' as unknown as ExamReportTitle,
  organizations: [] as string[],
  standards: [] as string[],
  standard: '',
  divisions: [] as string[],
  examGroup: '',
  examGroups: [] as string[],
};

const ConsolidatedMultiExamReports = ({ report }: { report: string }) => {
  const mappedReport = ConsolidatedMultiExamReportMap.find((opt) => opt.label === report)
    ?.name as ExamReportTitle;

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  const currentFields = useMemo(
    () => ConsolidatedMultiExamReportFieldsMap[mappedReport] || [],
    [mappedReport]
  );

  const currentRequiredFields = useMemo(
    () => ConsolidatedMultiExamReportRequiredFieldsMap[mappedReport] || [],
    [mappedReport]
  );

  const showField = useCallback((field: string) => currentFields.includes(field), [currentFields]);
  const isRequired = useCallback(
    (field: string) => currentRequiredFields.includes(field),
    [currentRequiredFields]
  );

  const [dynamicSchema, setDynamicSchema] = useState(
    getExamValidationSchema(currentFields, currentRequiredFields)
  );

  const formik = useFormik({
    initialValues: {
      ...examReportInitialValues,
      report: mappedReport,
    },
    enableReinitialize: true,
    validationSchema: dynamicSchema,
    onSubmit: (values, { setSubmitting }) => {
      if (mappedReport === ExamReportTitle.ResultListConsolidateWithMarksSiddhiKrupa) {
        window.alert('Awaiting business clarification from Jayesh Bhai.');
        setSubmitting(false);
        return;
      }

      const selectedGroupIds =
        values.examGroups.length > 0 ? values.examGroups : [values.examGroup];
      const selectedExams = examItems.filter((exam) =>
        selectedGroupIds.includes(
          String(exam.examTypeId ?? exam.examType ?? exam.examTypeName ?? '')
        )
      );

      const dynamicExamColumns = selectedExams
        .map((exam) => ({
          key: String(exam.examId ?? exam.id ?? ''),
          label: String(exam.examName ?? exam.name ?? ''),
        }))
        .filter((column) => column.key && column.label);

      const reportPayload = {
        ...values,
        dynamicExamColumns,
      };

      window.alert('Report Generated Successfully!');
      setSubmitting(false);
    },
  });

  const selectedClassIds = useMemo(() => {
    if (showField('standard_single')) {
      return formik.values.standard ? [formik.values.standard] : [];
    }

    return formik.values.standards.filter((id) => id !== 'all');
  }, [formik.values.standard, formik.values.standards, showField]);

  const shouldLoadExamGroups =
    (showField('examGroup') || showField('examGroups')) && Boolean((medium as Medium)?.id);

  const {
    data: examData,
    isLoading: isExamLoading,
    isFetching: isExamFetching,
    isError: isExamError,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamsQuery,
    params: {
      AcademicMediumId: (medium as Medium)?.id,
      Status: examScheduledStatus.Completed,
    },
    options: {
      skip: !shouldLoadExamGroups,
    },
  });

  const examItems = useMemo(() => getApiItems(examData), [examData]);

  const examGroupOptions = useMemo(() => {
    const groupMap = new Map<string, string>();

    examItems.forEach((exam: any) => {
      const groupId = String(exam.examTypeId ?? exam.examType ?? exam.examTypeName ?? '').trim();
      const groupName = String(exam.examTypeName ?? exam.examType ?? exam.examTypeId ?? '').trim();

      if (!groupId || !groupName) return;
      if (!groupMap.has(groupId)) {
        groupMap.set(groupId, groupName);
      }
    });

    return Array.from(groupMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  }, [examItems]);

  const dynamicExamColumns = useMemo(() => {
    const selectedGroupIds =
      formik.values.examGroups.length > 0
        ? formik.values.examGroups
        : formik.values.examGroup
          ? [formik.values.examGroup]
          : [];

    if (selectedGroupIds.length === 0) return [] as Array<{ key: string; label: string }>;

    return examItems
      .filter((exam: any) =>
        selectedGroupIds.includes(
          String(exam.examTypeId ?? exam.examType ?? exam.examTypeName ?? '')
        )
      )
      .map((exam: any) => ({
        key: String(exam.examId ?? exam.id ?? ''),
        label: String(exam.examName ?? exam.name ?? ''),
      }))
      .filter((column: { key: string; label: string }) => column.key && column.label)
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
  }, [examItems, formik.values.examGroup, formik.values.examGroups]);

  const examGroupNoOptionsMessage = useMemo(() => {
    if (isExamError) return 'Unable to load exam groups';
    if (
      shouldLoadExamGroups &&
      !isExamLoading &&
      !isExamFetching &&
      examGroupOptions.length === 0
    ) {
      return 'No exam groups found';
    }
    return 'No data available';
  }, [examGroupOptions.length, isExamError, isExamFetching, isExamLoading, shouldLoadExamGroups]);

  useEffect(() => {
    setDynamicSchema(getExamValidationSchema(currentFields, currentRequiredFields));
  }, [currentFields, currentRequiredFields]);

  useEffect(() => {
    if (!medium?.educationMediumStages) {
      setAllOrganization([]);
      return;
    }

    const organizations = cloneDeep(medium.educationMediumStages);
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
      ...organizations,
    ]);
  }, [medium?.educationMediumStages]);

  useEffect(() => {
    const selectedOrgIds = formik.values.organizations.filter((id) => id !== 'all');

    if (selectedOrgIds.length === 0) {
      setAllClass([]);
      formik.setFieldValue('standards', []);
      formik.setFieldValue('standard', '');
      formik.setFieldValue('divisions', []);
      formik.setFieldValue('examGroup', '');
      formik.setFieldValue('examGroups', []);
      return;
    }

    const standards = allOrganization
      .filter((org: any) => selectedOrgIds.includes(org.id))
      .flatMap((org: any) => (Array.isArray(org.standards) ? org.standards : []));

    setAllClass(standards);

    const allClassIds = standards.map((item: any) => item.id);

    if (showField('standard_single')) {
      formik.setFieldValue('standard', '');
      formik.setFieldValue('standards', []);
    } else {
      formik.setFieldValue('standards', allClassIds.length > 0 ? ['all', ...allClassIds] : []);
      formik.setFieldValue('standard', '');
    }

    formik.setFieldValue('examGroup', '');
    formik.setFieldValue('examGroups', []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allOrganization, formik.values.organizations, currentFields]);

  useEffect(() => {
    if (selectedClassIds.length === 0) {
      setAllDivision([]);
      formik.setFieldValue('divisions', []);
      return;
    }

    if (selectedClassIds.length === 1) {
      const selectedClass = allClass.find((item: any) => item.id === selectedClassIds[0]);
      const divisions = selectedClass?.divisions || [];
      setAllDivision(divisions);
      const divisionIds = divisions.map((item: any) => item.id);
      formik.setFieldValue('divisions', divisionIds.length > 0 ? ['all', ...divisionIds] : []);
    } else {
      setAllDivision([]);
      formik.setFieldValue('divisions', ['all']);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allClass, selectedClassIds.join(',')]);

  useEffect(() => {
    const validGroupIds = new Set(examGroupOptions.map((option) => option.id));

    if (formik.values.examGroup && !validGroupIds.has(formik.values.examGroup)) {
      formik.setFieldValue('examGroup', '');
    }

    const nextGroups = formik.values.examGroups.filter((id) => validGroupIds.has(id));
    if (nextGroups.length !== formik.values.examGroups.length) {
      formik.setFieldValue('examGroups', nextGroups);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examGroupOptions]);

  return (
    <Box sx={{ mt: 2 }}>
      <Card>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              {showField('organizations') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={!!formik.errors.organizations && !!formik.touched.organizations}
                  >
                    <ResponsiveMultiSelect
                      label={`Organization${isRequired('organizations') ? ' *' : ''}`}
                      options={[
                        { id: 'all', name: 'All' },
                        ...allOrganization.filter((organization) => organization.id !== 'all'),
                      ]}
                      value={formik.values.organizations}
                      getOptionLabel={(option: any) => option?.name}
                      getOptionValue={(option: any) => option?.id}
                      onChange={(selectedValues) => {
                        const allRealIds = allOrganization
                          .filter((organization) => organization.id !== 'all')
                          .map((organization) => organization.id);

                        const nextValues = resolveMultiSelectValues(
                          selectedValues,
                          formik.values.organizations,
                          allRealIds
                        );

                        formik.setFieldValue('organizations', nextValues);
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

              {showField('standards') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.standards && !!formik.touched.standards}>
                    <ResponsiveMultiSelect
                      label={`Class${isRequired('standards') ? ' *' : ''}`}
                      options={[{ id: 'all', name: 'All' }, ...allClass]}
                      value={formik.values.standards}
                      getOptionLabel={(option: any) => option?.name}
                      getOptionValue={(option: any) => option?.id}
                      disabled={formik.values.organizations.length === 0}
                      onChange={(selectedValues) => {
                        const allRealIds = allClass.map((item) => item.id);

                        const nextValues = resolveMultiSelectValues(
                          selectedValues,
                          formik.values.standards,
                          allRealIds
                        );

                        formik.setFieldValue('standards', nextValues);
                      }}
                      error={formik.touched.standards && Boolean(formik.errors.standards)}
                      helperText={(formik.touched.standards && formik.errors.standards) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('standard_single') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.standard && !!formik.touched.standard}>
                    <CustomSelect
                      label={`Class${isRequired('standard_single') ? ' *' : ''}`}
                      options={allClass}
                      labelKey="name"
                      valueKey="id"
                      value={formik.values.standard}
                      onChange={(value) => formik.setFieldValue('standard', value)}
                      error={formik.touched.standard && Boolean(formik.errors.standard)}
                      helperText={(formik.touched.standard && formik.errors.standard) as string}
                      disabled={formik.values.organizations.length === 0}
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('divisions') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.divisions && !!formik.touched.divisions}>
                    <ResponsiveMultiSelect
                      label={`Division${isRequired('divisions') ? ' *' : ''}`}
                      options={[{ id: 'all', name: 'All' }, ...allDivision]}
                      value={formik.values.divisions}
                      getOptionLabel={(option: any) => option?.name}
                      getOptionValue={(option: any) => option?.id}
                      disabled={selectedClassIds.length === 0}
                      onChange={(selectedValues) => {
                        if (
                          selectedClassIds.length > 1 ||
                          formik.values.standards.includes('all')
                        ) {
                          formik.setFieldValue('divisions', ['all']);
                          return;
                        }

                        const allRealIds = allDivision.map((item) => item.id);

                        const nextValues = resolveMultiSelectValues(
                          selectedValues,
                          formik.values.divisions,
                          allRealIds
                        );

                        formik.setFieldValue('divisions', nextValues);
                      }}
                      error={formik.touched.divisions && Boolean(formik.errors.divisions)}
                      helperText={(formik.touched.divisions && formik.errors.divisions) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('examGroups') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={!!formik.errors.examGroups && !!formik.touched.examGroups}
                  >
                    <ResponsiveMultiSelect
                      label={`Exam Group${isRequired('examGroups') ? ' *' : ''}`}
                      options={examGroupOptions}
                      value={formik.values.examGroups}
                      getOptionLabel={(option: any) => option?.name ?? ''}
                      getOptionValue={(option: any) => option?.id ?? ''}
                      disabled={!shouldLoadExamGroups}
                      isLoading={isExamLoading || isExamFetching}
                      onChange={(selectedValues) =>
                        formik.setFieldValue('examGroups', selectedValues)
                      }
                      error={formik.touched.examGroups && Boolean(formik.errors.examGroups)}
                      helperText={
                        ((formik.touched.examGroups && formik.errors.examGroups) as string)
                          ? ((formik.touched.examGroups && formik.errors.examGroups) as string)
                          : examGroupNoOptionsMessage === 'No exam groups found' &&
                              shouldLoadExamGroups
                            ? 'No exam groups found'
                            : undefined
                      }
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('examGroup') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.examGroup && !!formik.touched.examGroup}>
                    <CustomSelect
                      label={`Exam Group${isRequired('examGroup') ? ' *' : ''}`}
                      options={examGroupOptions}
                      labelKey="name"
                      valueKey="id"
                      value={formik.values.examGroup}
                      onChange={(value) => formik.setFieldValue('examGroup', value)}
                      error={formik.touched.examGroup && Boolean(formik.errors.examGroup)}
                      helperText={(formik.touched.examGroup && formik.errors.examGroup) as string}
                      disabled={!shouldLoadExamGroups}
                      isLoading={isExamLoading || isExamFetching}
                      noOptionsMessage={examGroupNoOptionsMessage}
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {(mappedReport === ExamReportTitle.ResultListConsolidateVerify ||
                mappedReport === ExamReportTitle.ResultListConsolidateWithMarks) &&
                dynamicExamColumns.length > 0 && (
                  <Grid size={12}>
                    <Alert severity="success">
                      Dynamic exam columns prepared:{' '}
                      {dynamicExamColumns.map((column) => column.label).join(', ')}
                    </Alert>
                  </Grid>
                )}

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

export default ConsolidatedMultiExamReports;
