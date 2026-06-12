'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, Division, Standards, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { Box, Grid, Card, Button } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { examScheduledStatus } from 'src/enums/exam-scheduled-status';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';
import { useCreateAcademicReportExportMutation } from 'src/redux/academicAPI/AcademicReportApi';
import { useGetExamsQuery } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';
import { useGetGradeScalingsQuery } from 'src/redux/academicAPI/ExaminationApi/examSetting/grade-scalling-api';
import { useGetCoreSubjectsByMediumQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi';
import {
  ExamReportTitle,
  ExamReportApiTypeMap,
  SubjectPerformanceAnalysisReportMap,
} from 'src/enums/examination-reports';

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

const SubjectPerformanceReportFieldsMap: Record<ExamReportTitle, string[]> = {
  [ExamReportTitle.AverageSubjectMarkAnalysis]: [
    'organizations',
    'standards',
    'divisions',
    'exam',
    'subjects',
  ],
  [ExamReportTitle.SubjectAverageClassMarkAnalysisDivisionWise]: [
    'organizations',
    'standards',
    'divisions',
    'exam',
    'subjects',
  ],
  [ExamReportTitle.StudentGradeAnalysisSubjectWise]: [
    'organizations',
    'standards',
    'divisions',
    'subjects',
    'exam',
  ],
  [ExamReportTitle.SubjectWiseGradeList]: [
    'organizations',
    'standards',
    'divisions',
    'subject',
    'exam',
    'grade',
  ],
  [ExamReportTitle.ResultListPassFailAnalysisSubjectWise]: [
    'organizations',
    'standards',
    'divisions',
    'exam',
    'subjects',
  ],
  [ExamReportTitle.ResultListSubjectGradeAnalysis]: [
    'organizations',
    'standards',
    'divisions',
    'exam',
    'subjects',
  ],
  [ExamReportTitle.ResultListWithSubject]: ['organizations', 'standards', 'divisions', 'exam'],
  [ExamReportTitle.ResultListWithSubjectFailedDetails]: [
    'organizations',
    'standards',
    'divisions',
    'exam',
  ],
  [ExamReportTitle.ResultListWithSubjectGrade]: [
    'organizations',
    'standards',
    'divisions',
    'subjects',
    'exam',
  ],
  [ExamReportTitle.ResultListWithSubjectSmall]: ['organizations', 'standards', 'divisions', 'exam'],
  [ExamReportTitle.ResultListWithSubjectWithGrace]: [
    'organizations',
    'standards',
    'divisions',
    'exam',
    'subjects',
  ],
  [ExamReportTitle.BrightStudentAnalysis]: [],
  [ExamReportTitle.BrightStudentListSubjectWise]: [],
  [ExamReportTitle.GenderWiseGradeAnalysis]: [],
  [ExamReportTitle.MarkListWithAllSubject]: [],
  [ExamReportTitle.ResultList]: [],
  [ExamReportTitle.ResultListConsolidateVerify]: [],
  [ExamReportTitle.ResultListConsolidateWithMarkGrade]: [],
  [ExamReportTitle.ResultListConsolidateWithMarks]: [],
  [ExamReportTitle.ResultListConsolidateWithMarksSiddhiKrupa]: [],
  [ExamReportTitle.ResultListOneGrade]: [],
  [ExamReportTitle.ResultListOneMark]: [],
  [ExamReportTitle.ResultListTwoMark]: [],
  [ExamReportTitle.ResultOverAllSynopsis]: [],
  [ExamReportTitle.ResultStatisticsReport]: [],
  [ExamReportTitle.ResultWithAllSubjectList]: [],
  [ExamReportTitle.ResultListOverallGradeAnalysis]: [],
  [ExamReportTitle.ResultListPassFailOverAllAnalysis]: [],
  [ExamReportTitle.StudentAllBatchResult]: [],
  [ExamReportTitle.StudentAllExamResult]: [],
  [ExamReportTitle.StudentGradeAnalysis]: [],
  [ExamReportTitle.WeakStudentAnalysis]: [],
  [ExamReportTitle.WeakStudentAnalysisSubjectWise]: [],
};

const SubjectPerformanceReportRequiredFieldsMap: Record<ExamReportTitle, string[]> = {
  [ExamReportTitle.AverageSubjectMarkAnalysis]: ['organizations', 'standards', 'divisions', 'exam'],
  [ExamReportTitle.SubjectAverageClassMarkAnalysisDivisionWise]: [
    'organizations',
    'standards',
    'divisions',
    'exam',
  ],
  [ExamReportTitle.StudentGradeAnalysisSubjectWise]: [
    'organizations',
    'standards',
    'subjects',
    'exam',
  ],
  [ExamReportTitle.SubjectWiseGradeList]: ['organizations', 'standards', 'subject', 'exam'],
  [ExamReportTitle.ResultListPassFailAnalysisSubjectWise]: [
    'organizations',
    'standards',
    'subjects',
    'exam',
  ],
  [ExamReportTitle.ResultListSubjectGradeAnalysis]: [
    'organizations',
    'standards',
    'subjects',
    'exam',
  ],
  [ExamReportTitle.ResultListWithSubject]: ['organizations', 'standards', 'exam'],
  [ExamReportTitle.ResultListWithSubjectFailedDetails]: ['organizations', 'standards', 'exam'],
  [ExamReportTitle.ResultListWithSubjectGrade]: ['organizations', 'standards', 'subjects', 'exam'],
  [ExamReportTitle.ResultListWithSubjectSmall]: ['organizations', 'standards', 'exam'],
  [ExamReportTitle.ResultListWithSubjectWithGrace]: ['organizations', 'standards', 'exam'],
  [ExamReportTitle.BrightStudentAnalysis]: [],
  [ExamReportTitle.BrightStudentListSubjectWise]: [],
  [ExamReportTitle.GenderWiseGradeAnalysis]: [],
  [ExamReportTitle.MarkListWithAllSubject]: [],
  [ExamReportTitle.ResultList]: [],
  [ExamReportTitle.ResultListConsolidateVerify]: [],
  [ExamReportTitle.ResultListConsolidateWithMarkGrade]: [],
  [ExamReportTitle.ResultListConsolidateWithMarks]: [],
  [ExamReportTitle.ResultListConsolidateWithMarksSiddhiKrupa]: [],
  [ExamReportTitle.ResultListOneGrade]: [],
  [ExamReportTitle.ResultListOneMark]: [],
  [ExamReportTitle.ResultListTwoMark]: [],
  [ExamReportTitle.ResultOverAllSynopsis]: [],
  [ExamReportTitle.ResultStatisticsReport]: [],
  [ExamReportTitle.ResultWithAllSubjectList]: [],
  [ExamReportTitle.ResultListOverallGradeAnalysis]: [],
  [ExamReportTitle.ResultListPassFailOverAllAnalysis]: [],
  [ExamReportTitle.StudentAllBatchResult]: [],
  [ExamReportTitle.StudentAllExamResult]: [],
  [ExamReportTitle.StudentGradeAnalysis]: [],
  [ExamReportTitle.WeakStudentAnalysis]: [],
  [ExamReportTitle.WeakStudentAnalysisSubjectWise]: [],
};

const examReportInitialValues = {
  report: '' as unknown as ExamReportTitle,
  organizations: [] as string[],
  standards: [] as string[],
  divisions: [] as string[],
  exam: '',
  subjects: [] as string[],
  subject: '',
  grade: [] as string[],
};

const SubjectPerformanceReports = ({
  report,
  onSuccess,
}: {
  report: string;
  onSuccess?: () => void;
}) => {
  const mappedReport = SubjectPerformanceAnalysisReportMap.find((opt) => opt.label === report)
    ?.name as ExamReportTitle;

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [reportRequest, setReportRequest] = useState<any>(null);
  const [submitType, setSubmitType] = useState<'preview' | 'export'>('preview');

  const currentFields = useMemo(
    () => SubjectPerformanceReportFieldsMap[mappedReport] || [],
    [mappedReport]
  );

  const currentRequiredFields = useMemo(
    () => SubjectPerformanceReportRequiredFieldsMap[mappedReport] || [],
    [mappedReport]
  );

  const showField = (field: string) => currentFields.includes(field);
  const isRequired = (field: string) => currentRequiredFields.includes(field);

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
      const requestPayload = {
        reportType: ExamReportApiTypeMap[mappedReport],
        filters: {
          classIds: values.standards.filter((id) => id !== 'all'),
          divisionIds: values.divisions.filter((id) => id !== 'all'),
          examId: values.exam || null,
          subjectIds:
            values.subjects.filter((id) => id !== 'all').length > 0
              ? values.subjects.filter((id) => id !== 'all')
              : values.subject
                ? [values.subject]
                : null,
          grade: values.grade.length > 0 ? values.grade[0] : null,
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

  const shouldLoadExams = showField('exam') && Boolean((medium as Medium)?.id);
  const shouldLoadSubjects =
    (showField('subjects') || showField('subject')) &&
    Boolean((medium as Medium)?.id) &&
    formik.values.standards.filter((id) => id !== 'all').length > 0;
  const shouldLoadGrades = showField('grade') && Boolean((medium as Medium)?.id);

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
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCoreSubjectsByMediumQuery,
    params: { academicMediumId: (medium as Medium)?.id },
    options: {
      skip: !shouldLoadSubjects,
    },
  });

  const {
    data: gradeScalingData,
    isLoading: isGradeLoading,
    isFetching: isGradeFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetGradeScalingsQuery,
    params: { academicMediumId: (medium as Medium)?.id },
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
    getApiItems(gradeScalingData).forEach((scale: any) => {
      (scale?.gradingScale ?? []).forEach((gradeItem: any) => {
        if (gradeItem?.grade) {
          gradeSet.add(String(gradeItem.grade));
        }
      });
    });

    return Array.from(gradeSet).map((grade) => ({ id: grade, name: grade }));
  }, [gradeScalingData]);

  const examNoOptionsMessage = useMemo(() => {
    if (isExamError) return 'Unable to load exams';
    if (shouldLoadExams && !isExamLoading && !isExamFetching && examOptions.length === 0) {
      return 'No exams found';
    }
    return 'No data available';
  }, [examOptions.length, isExamError, isExamFetching, isExamLoading, shouldLoadExams]);

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
      formik.setFieldValue('divisions', []);
      formik.setFieldValue('subjects', []);
      formik.setFieldValue('subject', '');
      return;
    }

    const standards = allOrganization
      .filter((org: any) => selectedOrgIds.includes(org.id))
      .flatMap((org: any) => (Array.isArray(org.standards) ? org.standards : []));

    setAllClass(standards);

    const allClassIds = standards.map((item: any) => item.id);
    formik.setFieldValue('standards', allClassIds.length > 0 ? ['all', ...allClassIds] : []);
    formik.setFieldValue('subjects', []);
    formik.setFieldValue('subject', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allOrganization, formik.values.organizations]);

  useEffect(() => {
    const selectedClassIds = formik.values.standards.filter((id) => id !== 'all');

    if (selectedClassIds.length === 0) {
      setAllDivision([]);
      formik.setFieldValue('divisions', []);
      formik.setFieldValue('subjects', []);
      formik.setFieldValue('subject', '');
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
    formik.setFieldValue('subject', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allClass, formik.values.standards]);

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
    if (!showField('subject')) return;
    if (
      formik.values.subject &&
      !subjectOptions.some((subject) => subject.id === formik.values.subject)
    ) {
      formik.setFieldValue('subject', '');
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

              {showField('divisions') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.divisions && !!formik.touched.divisions}>
                    <ResponsiveMultiSelect
                      label={`Division${isRequired('divisions') ? ' *' : ''}`}
                      options={[{ id: 'all', name: 'All' }, ...allDivision]}
                      value={getDisplayValues(formik.values.divisions)}
                      getOptionLabel={(option: any) => option?.name}
                      getOptionValue={(option: any) => option?.id}
                      disabled={formik.values.standards.length === 0}
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
                      helperText={(formik.touched.subjects && formik.errors.subjects) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('subject') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.subject && !!formik.touched.subject}>
                    <CustomSelect
                      label={`Subject${isRequired('subject') ? ' *' : ''}`}
                      options={subjectOptions}
                      labelKey="name"
                      valueKey="id"
                      value={formik.values.subject}
                      onChange={(value) => formik.setFieldValue('subject', value)}
                      error={formik.touched.subject && Boolean(formik.errors.subject)}
                      helperText={(formik.touched.subject && formik.errors.subject) as string}
                      disabled={!shouldLoadSubjects}
                      isLoading={isSubjectLoading || isSubjectFetching}
                      noOptionsMessage="No subjects found"
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
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
                      helperText={(formik.touched.grade && formik.errors.grade) as string}
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

export default SubjectPerformanceReports;
