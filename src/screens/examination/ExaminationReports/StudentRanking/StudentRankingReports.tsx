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
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { examScheduledStatus } from 'src/enums/exam-scheduled-status';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';
import { useCreateAcademicReportExportMutation } from 'src/redux/academicAPI/AcademicReportApi';
import { useGetExamsQuery } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';
import { useGetExamGradeOptionsQuery } from 'src/redux/academicAPI/ExaminationApi/RecordMarksApi/recordMarksApi';
import { useGetSubjectLookupQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi';
import { SubjectAssignmentStatus } from 'src/screens/academic/curriculum-management/subjectAssignment/enum/subjectType';
import {
  ExamReportTitle,
  ExamReportApiTypeMap,
  StudentRankingBrightWeakReportMap,
} from 'src/enums/examination-reports';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

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

const StudentRankingReportFieldsMap: Partial<Record<ExamReportTitle, string[]>> = {
  [ExamReportTitle.BrightStudentAnalysis]: [
    'organizations',
    'standards',
    'divisions',
    'exam',
    'grade',
  ],
  [ExamReportTitle.BrightStudentListSubjectWise]: [
    'organizations',
    'standards',
    'divisions',
    'subject',
    'exam',
    'grade',
  ],
  [ExamReportTitle.WeakStudentAnalysis]: ['organizations', 'standards', 'divisions', 'exam'],
  [ExamReportTitle.WeakStudentAnalysisSubjectWise]: [
    'organizations',
    'standards',
    'divisions',
    'subject',
    'exam',
  ],
  [ExamReportTitle.StudentGradeAnalysis]: ['organizations', 'standards', 'divisions', 'exam'],
  [ExamReportTitle.ResultListPassFailOverAllAnalysis]: [
    'organizations',
    'standard_single',
    'divisions',
    'exam',
  ],
  [ExamReportTitle.ResultListOverallGradeAnalysis]: [
    'organizations',
    'standard_single',
    'divisions',
    'exam',
  ],
};

const StudentRankingReportRequiredFieldsMap: Partial<Record<ExamReportTitle, string[]>> = {
  [ExamReportTitle.BrightStudentAnalysis]: ['organizations', 'standards', 'exam', 'grade'],
  [ExamReportTitle.BrightStudentListSubjectWise]: [
    'organizations',
    'standards',
    'subject',
    'exam',
    'grade',
  ],
  [ExamReportTitle.WeakStudentAnalysis]: ['organizations', 'standards', 'exam'],
  [ExamReportTitle.WeakStudentAnalysisSubjectWise]: [
    'organizations',
    'standards',
    'subject',
    'exam',
  ],
  [ExamReportTitle.StudentGradeAnalysis]: ['organizations', 'standards', 'exam'],
  [ExamReportTitle.ResultListPassFailOverAllAnalysis]: ['organizations', 'standard_single', 'exam'],
  [ExamReportTitle.ResultListOverallGradeAnalysis]: ['organizations', 'standard_single', 'exam'],
};

const examReportInitialValues = {
  report: '' as unknown as ExamReportTitle,
  organizations: '',
  standards: '',
  standard: '',
  divisions: [] as string[],
  exam: '',
  subject: '',
  grade: [] as string[],
};

const StudentRankingReports = ({
  report,
  onSuccess,
}: {
  report: string;
  onSuccess?: () => void;
}) => {
  const mappedReport = StudentRankingBrightWeakReportMap.find((opt) => opt.label === report)
    ?.name as ExamReportTitle;

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [reportRequest, setReportRequest] = useState<any>(null);
  const [submitType, setSubmitType] = useState<'preview' | 'export'>('preview');

  const currentFields = useMemo(
    () => StudentRankingReportFieldsMap[mappedReport] || [],
    [mappedReport]
  );
  const currentRequiredFields = useMemo(
    () => StudentRankingReportRequiredFieldsMap[mappedReport] || [],
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
        : values.standards
          ? [values.standards]
          : [];

      const requestPayload = {
        reportType: ExamReportApiTypeMap[mappedReport],
        filters: {
          classIds: standardIds,
          divisionIds: values.divisions.filter((id) => id !== 'all'),
          examId: values.exam || null,
          subjectIds: values.subject ? [values.subject] : null,
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

  const selectedClassIds = useMemo(() => {
    if (showField('standard_single')) {
      return formik.values.standard ? [formik.values.standard] : [];
    }

    return formik.values.standards ? [formik.values.standards] : [];
  }, [formik.values.standards, formik.values.standard, showField]);

  const selectedDivisionIds = useMemo(
    () => formik.values.divisions.filter((id) => id !== 'all'),
    [formik.values.divisions]
  );

  const shouldLoadExams = showField('exam') && Boolean((medium as Medium)?.id);
  const shouldLoadSubjects =
    showField('subject') && Boolean((medium as Medium)?.id) && selectedClassIds.length > 0;

  const shouldLoadGrades =
    showField('grade') &&
    Boolean(formik.values.exam) &&
    selectedClassIds.length > 0 &&
    (!showField('subject') || Boolean(formik.values.subject));

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

  const classId = formik.values.standards || '';

  const {
    data: coreSubjectData,
    isLoading: isCoreSubjectLoading,
    isError: isCoreSubjectError,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectLookupQuery,
    params: { academicMediumId: (medium as Medium)?.id, includeArchived: false },
    options: {
      skip: !shouldLoadSubjects || !!classId,
    },
  });

  const {
    data: subjectOptionsData,
    isLoading: isSubjectOptionsLoading,
    isFetching: isSubjectOptionsFetching,
    isError: isSubjectOptionsError,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentsQuery,
    params: {
      academicMediumId: medium?.id,
      standardId: classId,
      status: SubjectAssignmentStatus.Published,
    },
    options: {
      skip: !shouldLoadSubjects || !classId,
    },
  });

  const isSubjectLoading = classId ? isSubjectOptionsLoading : isCoreSubjectLoading;
  const isSubjectFetching = classId ? isSubjectOptionsFetching : false;
  const isSubjectError = classId ? isSubjectOptionsError : isCoreSubjectError;

  const allParamsReadyForGrade = shouldLoadGrades;

  const {
    data: gradingData,
    isLoading: isGradeLoading,
    isFetching: isGradeFetching,
    isError: isGradeError,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamGradeOptionsQuery,
    params: {
      ExamId: formik.values.exam,
      SubjectId: formik.values.subject || undefined,
      DivisionId: selectedDivisionIds[0] || undefined,
      StandardId: selectedClassIds[0] || undefined,
    },
    options: {
      skip: !allParamsReadyForGrade,
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

  const subjectOptions = useMemo(() => {
    if (classId) {
      const allOptions: { id: string; name: string }[] = [];
      subjectOptionsData?.data?.items?.forEach((item: any) => {
        if (item.status === SubjectAssignmentStatus.Draft) return;

        if (item.subjects?.length > 1 && item.electiveGroupName) {
          item.subjects.forEach((sub: any, index: number) => {
            const subId = sub.subjectId || String(index);
            if (!allOptions.some((opt) => opt.id === subId)) {
              allOptions.push({
                id: subId,
                name: sub.subjectName || `${item.electiveGroupName} ${index + 1}`,
              });
            }
          });
        } else {
          const sub = item.subjects?.[0];
          const subId = sub?.subjectId || item.id;
          const subName = sub?.subject?.name || sub?.subjectName || '';
          if (subId && !allOptions.some((opt) => opt.id === subId)) {
            allOptions.push({
              id: subId,
              name: subName,
            });
          }
        }
      });
      return allOptions.filter((option) => option.id && option.name);
    }

    const coreItems =
      coreSubjectData?.data?.items ??
      coreSubjectData?.items ??
      coreSubjectData?.records ??
      (Array.isArray(coreSubjectData) ? coreSubjectData : []);

    return coreItems
      .map((item: any) => ({
        id: item?.id ?? '',
        name: item?.name ?? '',
      }))
      .filter((option: { id: string; name: string }) => option.id && option.name);
  }, [classId, subjectOptionsData, coreSubjectData]);

  const gradeOptions = useMemo(() => {
    const gradeSet = new Set<string>();
    (gradingData ?? []).forEach((rawGrade: string) => {
      if (rawGrade === null || rawGrade === undefined) return;
      const normalizedGrade = String(rawGrade).trim();
      if (!normalizedGrade) return;
      gradeSet.add(normalizedGrade);
    });

    return Array.from(gradeSet)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
      .map((grade) => ({ id: grade, name: grade }));
  }, [gradingData]);

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

    setAllOrganization(cloneDeep(medium.educationMediumStages));
  }, [medium?.educationMediumStages]);

  useEffect(() => {
    const selectedOrgId = formik.values.organizations;

    if (!selectedOrgId) {
      setAllClass([]);
      formik.setFieldValue('standards', '');
      formik.setFieldValue('standard', '');
      formik.setFieldValue('divisions', []);
      formik.setFieldValue('subject', '');
      formik.setFieldValue('exam', '');
      formik.setFieldValue('grade', []);
      return;
    }

    const selectedOrg = allOrganization.find((org: any) => org.id === selectedOrgId);
    setAllClass(Array.isArray(selectedOrg?.standards) ? selectedOrg.standards : []);
    formik.setFieldValue('standards', '');
    formik.setFieldValue('standard', '');
    formik.setFieldValue('subject', '');
    formik.setFieldValue('grade', []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allOrganization, formik.values.organizations]);

  useEffect(() => {
    if (selectedClassIds.length === 0) {
      setAllDivision([]);
      formik.setFieldValue('divisions', []);
      formik.setFieldValue('subject', '');
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

    formik.setFieldValue('subject', '');
    formik.setFieldValue('grade', []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allClass, selectedClassIds.join(',')]);

  useEffect(() => {
    formik.setFieldValue('grade', []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.exam]);

  useEffect(() => {
    if (!showField('subject')) return;
    if (
      formik.values.subject &&
      !subjectOptions.some((subject: { id: string }) => subject.id === formik.values.subject)
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
            <Grid container spacing={1}>
              {showField('organizations') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={!!formik.errors.organizations && !!formik.touched.organizations}
                  >
                    <CustomSelect
                      label={`Organization${isRequired('organizations') ? ' *' : ''}`}
                      options={allOrganization}
                      value={formik.values.organizations}
                      labelKey="name"
                      valueKey="id"
                      onChange={(val) => formik.setFieldValue('organizations', val as string)}
                      onBlur={() => formik.setFieldTouched('organizations', true)}
                      error={formik.touched.organizations && Boolean(formik.errors.organizations)}
                      helperText={
                        formik.touched.organizations &&
                        typeof formik.errors.organizations === 'string'
                          ? formik.errors.organizations
                          : undefined
                      }
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('standards') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.standards && !!formik.touched.standards}>
                    <CustomSelect
                      label={`Class${isRequired('standards') ? ' *' : ''}`}
                      options={allClass}
                      value={formik.values.standards}
                      labelKey="name"
                      valueKey="id"
                      disabled={!formik.values.organizations}
                      onChange={(val) => formik.setFieldValue('standards', val as string)}
                      onBlur={() => formik.setFieldTouched('standards', true)}
                      error={formik.touched.standards && Boolean(formik.errors.standards)}
                      helperText={(formik.touched.standards && formik.errors.standards) as string}
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
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
                        formik.setFieldValue('subject', '');
                        formik.setFieldValue('grade', []);
                      }}
                      error={formik.touched.standard && Boolean(formik.errors.standard)}
                      helperText={(formik.touched.standard && formik.errors.standard) as string}
                      disabled={!formik.values.organizations}
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
                      disabled={!formik.values.standards}
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

              {showField('subject') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.subject && !!formik.touched.subject}>
                    <CustomSelect
                      label={`Subject${isRequired('subject') ? ' *' : ''}`}
                      options={subjectOptions}
                      labelKey="name"
                      valueKey="id"
                      value={formik.values.subject}
                      onChange={(value) => {
                        formik.setFieldValue('subject', value);
                        formik.setFieldValue('grade', []);
                      }}
                      error={formik.touched.subject && Boolean(formik.errors.subject)}
                      helperText={(formik.touched.subject && formik.errors.subject) as string}
                      disabled={!shouldLoadSubjects}
                      isLoading={isSubjectLoading || isSubjectFetching}
                      noOptionsMessage={subjectNoOptionsMessage}
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

              <Grid size={12} display="flex" justifyContent="flex-end" gap={1}>
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

export default StudentRankingReports;
