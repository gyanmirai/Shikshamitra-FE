'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, Division, Standards, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Grid, Card, Button, TextField } from '@mui/material';
import { examScheduledStatus } from 'src/enums/exam-scheduled-status';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';
import { useCreateAcademicReportExportMutation } from 'src/redux/academicAPI/AcademicReportApi';
import { useGetExamsQuery } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';
import { useGetExamMarksQuery } from 'src/redux/academicAPI/ExaminationApi/RecordMarksApi/recordMarksApi';
import {
  ExamReportTitle,
  ExamReportApiTypeMap,
  StandardResultListReportMap,
} from 'src/enums/examination-reports';
import { useGetCoreSubjectsByMediumQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi';

import { getExamValidationSchema } from '../getExamReportValidationSchema';
import ExaminationReportPreviewDrawer from '../ExaminationReportPreviewDrawer';

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

// Helper to get display values for UI - shows only 'all' chip when all items selected
const getDisplayValues = (values: string[]): string[] => {
  if (values.includes('all')) {
    return ['all'];
  }
  return values;
};

const getApiItems = (response: any): any[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.records)) return response.records;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const getDynamicSubjectColumnsFromMarksData = (
  response: any
): Array<{ key: string; label: string }> => {
  const subjectMap = new Map<string, string>();

  getApiItems(response).forEach((item: any) => {
    const maybeSubjectId = item?.subjectId ?? item?.subject?.id ?? item?.subject?.subjectId;
    const maybeSubjectName =
      item?.subjectName ?? item?.subject?.name ?? item?.subject?.subjectName ?? item?.name;

    if (maybeSubjectId && maybeSubjectName) {
      subjectMap.set(String(maybeSubjectId), String(maybeSubjectName));
    }

    const nestedSubjects = Array.isArray(item?.subjects) ? item.subjects : [];
    nestedSubjects.forEach((subject: any) => {
      const subjectId = subject?.subjectId ?? subject?.id;
      const subjectName = subject?.subjectName ?? subject?.name;
      if (subjectId && subjectName) {
        subjectMap.set(String(subjectId), String(subjectName));
      }
    });
  });

  return Array.from(subjectMap.entries())
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
};

const StandardResultListReportFieldsMap: Partial<Record<ExamReportTitle, string[]>> = {
  [ExamReportTitle.ResultList]: ['organizations', 'standard_single', 'divisions', 'exam'],
  [ExamReportTitle.ResultListOneGrade]: [
    'organizations',
    'standard_single',
    'divisions',
    'exam',
    'grade',
  ],
  [ExamReportTitle.ResultListOneMark]: [
    'organizations',
    'standard_single',
    'divisions',
    'exam',
    'minMark',
    'maxMark',
  ],
  [ExamReportTitle.ResultListTwoMark]: [
    'organizations',
    'standards',
    'divisions',
    'exam',
    'subjects',
  ],
  [ExamReportTitle.MarkListWithAllSubject]: ['organizations', 'standards', 'divisions', 'exam'],
  [ExamReportTitle.ResultWithAllSubjectList]: ['organizations', 'standards', 'divisions', 'exam'],
  [ExamReportTitle.ResultOverAllSynopsis]: ['organizations', 'standards', 'divisions', 'exam'],
};

const StandardResultListReportRequiredFieldsMap: Partial<Record<ExamReportTitle, string[]>> = {
  [ExamReportTitle.ResultList]: ['organizations', 'standard_single', 'exam'],
  [ExamReportTitle.ResultListOneGrade]: ['organizations', 'standard_single', 'exam', 'grade'],
  [ExamReportTitle.ResultListOneMark]: [
    'organizations',
    'standard_single',
    'exam',
    'minMark',
    'maxMark',
  ],
  [ExamReportTitle.ResultListTwoMark]: ['organizations', 'standards', 'exam'],
  [ExamReportTitle.MarkListWithAllSubject]: ['organizations', 'standards', 'exam'],
  [ExamReportTitle.ResultWithAllSubjectList]: ['organizations', 'standards', 'exam'],
  [ExamReportTitle.ResultOverAllSynopsis]: ['organizations', 'standards', 'exam'],
};

const examReportInitialValues = {
  report: '' as unknown as ExamReportTitle,
  organizations: [] as string[],
  standards: [] as string[],
  standard: '',
  divisions: [] as string[],
  exam: '',
  subjects: [] as string[],
  grade: [] as string[],
  minMark: '',
  maxMark: '',
};

const StandardResultListReports = ({
  report,
  onSuccess,
}: {
  report: string;
  onSuccess?: () => void;
}) => {
  const mappedReport = StandardResultListReportMap.find((opt) => opt.label === report)
    ?.name as ExamReportTitle;

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [reportRequest, setReportRequest] = useState<any>(null);
  const [submitType, setSubmitType] = useState<'preview' | 'export'>('preview');

  const currentFields = useMemo(
    () => StandardResultListReportFieldsMap[mappedReport] || [],
    [mappedReport]
  );

  const currentRequiredFields = useMemo(
    () => StandardResultListReportRequiredFieldsMap[mappedReport] || [],
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

  const [createExport, { isLoading: isExportCreating }] = useQueryAndMutation<
    typeof useCreateAcademicReportExportMutation
  >({
    type: 'mutation',
    currentQueryAndMutation: useCreateAcademicReportExportMutation,
    popupConfig: { error: true, errorMessage: 'Failed to initiate export' },
  });

  const formik = useFormik({
    initialValues: {
      ...examReportInitialValues,
      report: mappedReport,
    },
    enableReinitialize: true,
    validationSchema: dynamicSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const standardIds = showField('standard_single')
        ? values.standard
          ? [values.standard]
          : []
        : values.standards.filter((id) => id !== 'all');

      const requestPayload = {
        reportType: ExamReportApiTypeMap[mappedReport],
        filters: {
          classIds: standardIds,
          divisionIds: values.divisions.filter((id) => id !== 'all'),
          examId: values.exam || null,
          subjectIds:
            values.subjects.filter((id) => id !== 'all').length > 0
              ? values.subjects.filter((id) => id !== 'all')
              : null,
          grade: values.grade.length > 0 ? values.grade[0] : null,
          minMarks: values.minMark || null,
          maxMarks: values.maxMark || null,
        },
      };

      if (submitType === 'preview') {
        setReportRequest(requestPayload);
        setPreviewOpen(true);
      } else if (submitType === 'export') {
        try {
          const res = await createExport({ ...requestPayload, format: 'pdf' }).unwrap();
          shikshaMitraToast.success({
            message: `Export job queued successfully! Status: ${res.status || 'Queued'}`,
          });
          if (onSuccess) onSuccess();
        } catch {
          // Error is handled by popupConfig
        }
      }
      setSubmitting(false);
    },
  });

  const selectedClassIds = useMemo(() => {
    if (showField('standard_single')) {
      return formik.values.standard ? [formik.values.standard] : [];
    }

    return formik.values.standards.filter((id) => id !== 'all');
  }, [formik.values.standard, formik.values.standards, showField]);

  const selectedDivisionIds = useMemo(
    () => formik.values.divisions.filter((id) => id !== 'all'),
    [formik.values.divisions]
  );

  const shouldLoadExams = showField('exam') && Boolean((medium as Medium)?.id);
  const shouldLoadSubjects =
    showField('subjects') && Boolean((medium as Medium)?.id) && selectedClassIds.length > 0;
  const shouldLoadGrades =
    showField('grade') && Boolean(formik.values.exam) && selectedClassIds.length > 0;

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
      skip: !shouldLoadExams,
    },
  });

  const {
    data: subjectData,
    isLoading: isSubjectLoading,
    isFetching: isSubjectFetching,
    isError: isSubjectError,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCoreSubjectsByMediumQuery,
    params: { academicMediumId: (medium as Medium)?.id },
    options: {
      skip: !shouldLoadSubjects,
    },
  });

  const gradeQuery = useMemo(
    () => ({
      page: 1,
      pageSize: 500,
    }),
    []
  );

  const {
    data: gradingData,
    isLoading: isGradeLoading,
    isFetching: isGradeFetching,
    isError: isGradeError,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamMarksQuery,
    params: {
      ExamId: formik.values.exam,
      SubjectId: undefined,
      DivisionId: selectedDivisionIds[0] || undefined,
      StandardId: selectedClassIds[0] || undefined,
      ...gradeQuery,
    },
    options: {
      skip: !shouldLoadGrades,
    },
  });

  const examOptions = useMemo(
    () =>
      getApiItems(examData)
        .map((exam: any) => ({
          id: exam.examId ?? exam.id ?? '',
          name: exam.examName ?? exam.name ?? '',
        }))
        .filter((option: { id: string; name: string }) => option.id && option.name),
    [examData]
  );

  const subjectOptions = useMemo(
    () =>
      getApiItems(subjectData)
        .map((subject: any) => ({
          id: subject.subjectId ?? subject.id ?? '',
          name: subject.subjectName ?? subject.name ?? '',
        }))
        .filter((option: { id: string; name: string }) => option.id && option.name),
    [subjectData]
  );

  const gradeOptions = useMemo(() => {
    const gradeSet = new Set<string>();

    getApiItems(gradingData).forEach((item: any) => {
      const rawGrade = item?.grade;
      if (rawGrade === null || rawGrade === undefined) return;
      const normalizedGrade = String(rawGrade).trim();
      if (!normalizedGrade) return;
      gradeSet.add(normalizedGrade);
    });

    return Array.from(gradeSet)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
      .map((grade) => ({ id: grade, name: grade }));
  }, [gradingData]);

  const dynamicSubjectColumns = useMemo(
    () => getDynamicSubjectColumnsFromMarksData(gradingData),
    [gradingData]
  );

  const examNoOptionsMessage = useMemo(() => {
    if (isExamError) return 'Unable to load exams';
    if (shouldLoadExams && !isExamLoading && !isExamFetching && examOptions.length === 0) {
      return 'No exams found';
    }
    return 'No data available';
  }, [examOptions.length, isExamError, isExamFetching, isExamLoading, shouldLoadExams]);

  const subjectNoOptionsMessage = useMemo(() => {
    if (isSubjectError) return 'Unable to load subjects';
    if (
      shouldLoadSubjects &&
      !isSubjectLoading &&
      !isSubjectFetching &&
      subjectOptions.length === 0
    ) {
      return 'No subjects found';
    }
    return 'No data available';
  }, [
    isSubjectError,
    shouldLoadSubjects,
    isSubjectLoading,
    isSubjectFetching,
    subjectOptions.length,
  ]);

  const gradeNoOptionsMessage = useMemo(() => {
    if (isGradeError) return 'Unable to load grades';
    if (shouldLoadGrades && !isGradeLoading && !isGradeFetching && gradeOptions.length === 0) {
      return 'No grades found';
    }
    return 'No data available';
  }, [isGradeError, shouldLoadGrades, isGradeLoading, isGradeFetching, gradeOptions.length]);

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
      formik.setFieldValue('subjects', []);
      formik.setFieldValue('exam', '');
      formik.setFieldValue('grade', []);
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

    formik.setFieldValue('subjects', []);
    formik.setFieldValue('grade', []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allOrganization, formik.values.organizations, currentFields]);

  useEffect(() => {
    if (selectedClassIds.length === 0) {
      setAllDivision([]);
      formik.setFieldValue('divisions', []);
      formik.setFieldValue('subjects', []);
      formik.setFieldValue('grade', []);
      return;
    }

    if (selectedClassIds.length === 1) {
      const selectedClass = allClass.find((item: any) => item.id === selectedClassIds[0]);
      const divisions = selectedClass?.divisions || [];
      setAllDivision(divisions);
      const divisionIds = divisions.map((item: any) => item.id);
      formik.setFieldValue('divisions', divisionIds.length > 0 ? ['all', ...divisionIds] : []);
    } else {
      const allDivisions = allClass
        .filter((item: any) => selectedClassIds.includes(item.id))
        .flatMap((item: any) => (Array.isArray(item.divisions) ? item.divisions : []));
      const uniqueDivisions = Array.from(new Map(allDivisions.map((d: any) => [d.id, d])).values());
      setAllDivision(uniqueDivisions as Division[]);
      const divisionIds = uniqueDivisions.map((d: any) => d.id);
      formik.setFieldValue('divisions', divisionIds.length > 0 ? ['all', ...divisionIds] : []);
    }

    formik.setFieldValue('subjects', []);
    formik.setFieldValue('grade', []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allClass, selectedClassIds.join(',')]);

  useEffect(() => {
    formik.setFieldValue('grade', []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.exam]);

  useEffect(() => {
    if (!showField('subjects')) return;

    const validIds = new Set(subjectOptions.map((subject) => subject.id));
    const nextSubjects = formik.values.subjects.filter((id) => id === 'all' || validIds.has(id));

    if (nextSubjects.length !== formik.values.subjects.length) {
      formik.setFieldValue('subjects', nextSubjects);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectOptions, currentFields]);

  useEffect(() => {
    if (!showField('grade')) return;

    const validIds = new Set(gradeOptions.map((grade) => grade.id));
    const nextGrades = formik.values.grade.filter((id) => validIds.has(id));

    if (nextGrades.length !== formik.values.grade.length) {
      formik.setFieldValue('grade', nextGrades);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gradeOptions, currentFields]);

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
                      value={getDisplayValues(formik.values.organizations)}
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
                      value={getDisplayValues(formik.values.standards)}
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
                      onChange={(value) => {
                        formik.setFieldValue('standard', value);
                        formik.setFieldValue('divisions', []);
                        formik.setFieldValue('subjects', []);
                        formik.setFieldValue('grade', []);
                      }}
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
                      value={getDisplayValues(formik.values.divisions)}
                      getOptionLabel={(option: any) => option?.name}
                      getOptionValue={(option: any) => option?.id}
                      disabled={selectedClassIds.length === 0}
                      onChange={(selectedValues) => {
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

              {showField('exam') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.exam && !!formik.touched.exam}>
                    <CustomSelect
                      label={`Exam${isRequired('exam') ? ' *' : ''}`}
                      options={examOptions}
                      labelKey="name"
                      valueKey="id"
                      value={formik.values.exam}
                      onChange={(value) => formik.setFieldValue('exam', value)}
                      error={formik.touched.exam && Boolean(formik.errors.exam)}
                      helperText={(formik.touched.exam && formik.errors.exam) as string}
                      disabled={!shouldLoadExams}
                      isLoading={isExamLoading || isExamFetching}
                      noOptionsMessage={examNoOptionsMessage}
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('subjects') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.subjects && !!formik.touched.subjects}>
                    <ResponsiveMultiSelect
                      label={`Subject${isRequired('subjects') ? ' *' : ''}`}
                      options={subjectOptions}
                      value={formik.values.subjects}
                      getOptionLabel={(option: any) => option?.name ?? ''}
                      getOptionValue={(option: any) => option?.id ?? ''}
                      disabled={!shouldLoadSubjects}
                      isLoading={isSubjectLoading || isSubjectFetching}
                      onChange={(selectedValues) => {
                        formik.setFieldValue('subjects', selectedValues);
                      }}
                      error={formik.touched.subjects && Boolean(formik.errors.subjects)}
                      helperText={
                        ((formik.touched.subjects && formik.errors.subjects) as string)
                          ? ((formik.touched.subjects && formik.errors.subjects) as string)
                          : subjectNoOptionsMessage === 'No subjects found' && shouldLoadSubjects
                            ? 'No subjects found for selected class'
                            : undefined
                      }
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('grade') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.grade && !!formik.touched.grade}>
                    <ResponsiveMultiSelect
                      label={`Grade${isRequired('grade') ? ' *' : ''}`}
                      options={gradeOptions}
                      value={formik.values.grade}
                      getOptionLabel={(option: any) => option?.name ?? ''}
                      getOptionValue={(option: any) => option?.id ?? ''}
                      disabled={!shouldLoadGrades}
                      isLoading={isGradeLoading || isGradeFetching}
                      onChange={(selectedValues) => {
                        formik.setFieldValue('grade', selectedValues);
                      }}
                      error={formik.touched.grade && Boolean(formik.errors.grade)}
                      helperText={
                        ((formik.touched.grade && formik.errors.grade) as string)
                          ? ((formik.touched.grade && formik.errors.grade) as string)
                          : gradeNoOptionsMessage === 'No grades found' && shouldLoadGrades
                            ? 'No grades found for selected filters'
                            : undefined
                      }
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('minMark') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.minMark && !!formik.touched.minMark}>
                    <TextField
                      label={`Min Marks${isRequired('minMark') ? ' *' : ''}`}
                      size="small"
                      fullWidth
                      value={formik.values.minMark}
                      onChange={(event) => formik.setFieldValue('minMark', event.target.value)}
                      onBlur={() => formik.setFieldTouched('minMark', true)}
                      error={formik.touched.minMark && Boolean(formik.errors.minMark)}
                      helperText={(formik.touched.minMark && formik.errors.minMark) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('maxMark') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.maxMark && !!formik.touched.maxMark}>
                    <TextField
                      label={`Max Marks${isRequired('maxMark') ? ' *' : ''}`}
                      size="small"
                      fullWidth
                      value={formik.values.maxMark}
                      onChange={(event) => formik.setFieldValue('maxMark', event.target.value)}
                      onBlur={() => formik.setFieldTouched('maxMark', true)}
                      error={formik.touched.maxMark && Boolean(formik.errors.maxMark)}
                      helperText={(formik.touched.maxMark && formik.errors.maxMark) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              <Grid size={12} display="flex" justifyContent="flex-end" gap={1.5}>
                <Button
                  startIcon={<Iconify icon="mdi:eye-outline" />}
                  variant="outlined"
                  size="small"
                  type="submit"
                  onClick={() => setSubmitType('preview')}
                >
                  Preview
                </Button>
                <Button
                  startIcon={<Iconify icon="mdi:tray-arrow-down" />}
                  variant="contained"
                  size="small"
                  type="submit"
                  loading={isExportCreating}
                  onClick={() => setSubmitType('export')}
                >
                  Queue Export
                </Button>
              </Grid>
            </Grid>
          </Box>
        </form>
      </Card>
      <ExaminationReportPreviewDrawer
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        reportRequest={reportRequest}
        reportTitle={report || ''}
      />
    </Box>
  );
};

export default StandardResultListReports;
