'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import { Box, Grid, Card, Button } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetEmployeeQuery } from 'src/redux/hr/employeeApi';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useCreateAcademicReportExportMutation } from 'src/redux/academicAPI/AcademicReportApi';
import { useGetCoreSubjectsByMediumQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi';
import { SubjectAssignmentStatus } from 'src/screens/academic/curriculum-management/subjectAssignment/enum/subjectType';
import {
  HomeworkReportTitle,
  HomeworkReportApiTypeMap,
  HomeworkReportTitleOptions,
} from 'src/enums/homework-wise-reports';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import HomeworkReportPreviewDrawer from '../HomeworkReportPreviewDrawer';
import { getHomeworkValidationSchema } from './HomeworkTypeReportValidation';

type EmployeeOption = { id: string; label: string };

interface HomeworkReportFormValues {
  report: HomeworkReportTitle;
  organization: string;
  class: string;
  divisions: string[];
  subjects: string[];
  teachers: string[];
  students: string[];
  fromDate: dayjs.Dayjs | null;
  toDate: dayjs.Dayjs | null;
}

const homeworkInitialValues: HomeworkReportFormValues = {
  report: '' as unknown as HomeworkReportTitle,
  organization: '',
  class: '',
  divisions: [],
  subjects: [],
  teachers: [],
  students: [],
  fromDate: null,
  toDate: null,
};

const HomeworkReportFieldsMap: Record<HomeworkReportTitle, string[]> = {
  [HomeworkReportTitle.DailyHomeworkReport]: [
    'organization',
    'class',
    'divisions',
    'subjects',
    'teachers',
    'students',
    'fromDate',
    'toDate',
  ],
  [HomeworkReportTitle.ClassWiseHomeworkReport]: [
    'organization',
    'class',
    'divisions',
    'subjects',
    'fromDate',
    'toDate',
  ],
  [HomeworkReportTitle.SubjectWiseHomeworkReport]: [
    'organization',
    'subjects',
    'class',
    'divisions',
    'fromDate',
    'toDate',
  ],
  [HomeworkReportTitle.TeacherWiseHomeworkReport]: [
    'organization',
    'teachers',
    'subjects',
    'fromDate',
    'toDate',
  ],
  [HomeworkReportTitle.StudentWiseHomeworkSummaryReport]: [
    'organization',
    'class',
    'divisions',
    'students',
    'subjects',
    'fromDate',
    'toDate',
  ],
  [HomeworkReportTitle.HomeworkCompletionStatusReport]: [
    'organization',
    'class',
    'divisions',
    'subjects',
    'fromDate',
    'toDate',
  ],
  [HomeworkReportTitle.PendingHomeworkReport]: [
    'organization',
    'class',
    'divisions',
    'students',
    'subjects',
    'fromDate',
    'toDate',
  ],
  [HomeworkReportTitle.OverdueHomeworkReport]: [
    'organization',
    'class',
    'divisions',
    'students',
    'subjects',
    'fromDate',
    'toDate',
  ],
  [HomeworkReportTitle.HomeworkSubmissionHistoryReport]: [
    'organization',
    'students',
    'subjects',
    'class',
    'divisions',
    'fromDate',
    'toDate',
  ],
  [HomeworkReportTitle.HomeworkWithAttachmentsReport]: [
    'organization',
    'subjects',
    'class',
    'divisions',
    'fromDate',
    'toDate',
  ],
  [HomeworkReportTitle.HomeworkAcknowledgementReport]: [
    'organization',
    'class',
    'divisions',
    'students',
    'fromDate',
    'toDate',
  ],
};

const HomeworkReportRequiredFieldsMap: Record<HomeworkReportTitle, string[]> = {
  [HomeworkReportTitle.DailyHomeworkReport]: ['organization', 'class', 'fromDate', 'toDate'],
  [HomeworkReportTitle.ClassWiseHomeworkReport]: ['organization', 'class', 'fromDate', 'toDate'],
  [HomeworkReportTitle.SubjectWiseHomeworkReport]: [
    'organization',
    'subjects',
    'fromDate',
    'toDate',
  ],
  [HomeworkReportTitle.TeacherWiseHomeworkReport]: [
    'organization',
    'teachers',
    'subjects',
    'fromDate',
    'toDate',
  ],
  [HomeworkReportTitle.StudentWiseHomeworkSummaryReport]: [
    'organization',
    'students',
    'subjects',
    'fromDate',
    'toDate',
  ],
  [HomeworkReportTitle.HomeworkCompletionStatusReport]: ['organization', 'fromDate', 'toDate'],
  [HomeworkReportTitle.PendingHomeworkReport]: ['organization', 'fromDate', 'toDate'],
  [HomeworkReportTitle.OverdueHomeworkReport]: ['organization', 'divisions', 'fromDate', 'toDate'],
  [HomeworkReportTitle.HomeworkSubmissionHistoryReport]: ['organization', 'fromDate', 'toDate'],
  [HomeworkReportTitle.HomeworkWithAttachmentsReport]: ['organization', 'fromDate', 'toDate'],
  [HomeworkReportTitle.HomeworkAcknowledgementReport]: ['organization', 'fromDate', 'toDate'],
};

const HomeworkManagementReports = ({
  report,
  onSuccess,
}: {
  report: string;
  onSuccess?: () => void;
}) => {
  const mappedReport = HomeworkReportTitleOptions.find((opt) => opt.label === report)?.name;

  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  // ── Drawer & request state ──
  const [previewOpen, setPreviewOpen] = useState(false);
  const [reportRequest, setReportRequest] = useState<any>(null);
  const [submitType, setSubmitType] = useState<'preview' | 'export'>('preview');

  const [dynamicSchema, setDynamicSchema] = useState(
    getHomeworkValidationSchema([], [], currentYear)
  );

  // ── Export mutation ──
  const [createExport, { isLoading: isExportCreating }] = useQueryAndMutation<
    typeof useCreateAcademicReportExportMutation
  >({
    type: 'mutation',
    currentQueryAndMutation: useCreateAcademicReportExportMutation,
    popupConfig: { error: true, errorMessage: 'Failed to initiate export' },
  });

  const formik = useFormik({
    initialValues: {
      ...homeworkInitialValues,
      report: mappedReport as HomeworkReportTitle,
    },
    enableReinitialize: true,
    validationSchema: dynamicSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const requestPayload = {
        reportType: HomeworkReportApiTypeMap[mappedReport as HomeworkReportTitle],
        filters: {
          academicYearId: currentYear?.id || null,
          classIds: values.class ? [values.class] : null,
          divisionIds: values.divisions.length > 0 ? values.divisions : null,
          subjectIds: values.subjects.length > 0 ? values.subjects : null,
          teacherIds: values.teachers.length > 0 ? values.teachers : null,
          studentIds: values.students.length > 0 ? values.students : null,
          fromDate: values.fromDate ? dayjs(values.fromDate).format('YYYY-MM-DD') : null,
          toDate: values.toDate ? dayjs(values.toDate).format('YYYY-MM-DD') : null,
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
          if (onSuccess) {
            onSuccess();
          }
        } catch {
          // Error is handled by popupConfig
        }
      }
      setSubmitting(false);
    },
  });

  const currentFields = useMemo(
    () => HomeworkReportFieldsMap[mappedReport as HomeworkReportTitle] || [],
    [mappedReport]
  );

  const currentRequiredFields = useMemo(
    () => HomeworkReportRequiredFieldsMap[mappedReport as HomeworkReportTitle] || [],
    [mappedReport]
  );

  const showField = (fieldName: string) => currentFields.includes(fieldName);
  const isRequired = (fieldName: string) => currentRequiredFields.includes(fieldName);

  const classId = formik.values.class || '';

  // ── Subject API ──────────────────────────────────────────────────────────────
  const { data: coreSubjectData, isLoading: isCoreSubjectLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCoreSubjectsByMediumQuery,
    params: { academicMediumId: (medium as Medium)?.id },
    options: {
      skip: !currentFields.includes('subjects') || !(medium as Medium)?.id || !!classId,
    },
  });

  const {
    data: subjectOptionsData,
    isLoading: isSubjectOptionsLoading,
    isFetching: isSubjectOptionsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentsQuery,
    params: {
      academicMediumId: medium?.id,
      standardId: classId,
    },
    options: {
      skip: !currentFields.includes('subjects') || !medium?.id || !classId,
    },
  });

  const subjectOptions: any[] = useMemo(() => {
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
      return allOptions;
    }

    const coreItems =
      coreSubjectData?.data?.items ??
      coreSubjectData?.items ??
      coreSubjectData?.records ??
      (Array.isArray(coreSubjectData) ? coreSubjectData : []);

    return coreItems.map((item: any) => ({
      id: item?.id ?? '',
      name: item?.name ?? '',
    }));
  }, [classId, subjectOptionsData, coreSubjectData]);

  const [getTeacherOptions] = useLazyGetEmployeeQuery();
  const seenTeacherIdsRef = useRef<Set<string>>(new Set());

  const fetchTeacherOptions = useCallback(
    async (query: string, page: number = 1) => {
      if (page === 1) seenTeacherIdsRef.current = new Set();
      const res = await getTeacherOptions({ search: query, page }).unwrap();
      const hasMore = res.currentPage < res.totalPages;
      const data = (res?.items ?? [])
        .map((item: { id: string; fullName: string }) => ({ id: item.id, label: item.fullName }))
        .filter(({ id }: { id: string }) => {
          if (seenTeacherIdsRef.current.has(id)) return false;
          seenTeacherIdsRef.current.add(id);
          return true;
        });
      return { data, hasMore };
    },
    [getTeacherOptions]
  );

  const [teacherObjs, setTeacherObjs] = useState<EmployeeOption[]>([]);

  const [getStudents, { data: studentsData, isLoading: isStudentsLoading }] =
    useLazyGetFilterStudentsQuery();

  const studentOptions: any[] = useMemo(
    () =>
      studentsData?.items?.map((item: any) => ({
        id: item.id,
        name: [item.firstName, item.middleName, item.lastName].filter(Boolean).join(' '),
      })) || [],
    [studentsData?.items]
  );

  useEffect(() => {
    setDynamicSchema(
      getHomeworkValidationSchema(currentFields, currentRequiredFields, currentYear)
    );
  }, [currentFields, currentRequiredFields, currentYear]);

  useEffect(() => {
    setAllOrganization(cloneDeep(medium?.educationMediumStages || []));
  }, [medium?.educationMediumStages]);

  useEffect(() => {
    const standards =
      allOrganization.find((org: any) => org?.id === formik.values.organization)?.standards || [];
    setAllClass(standards);
  }, [allOrganization, formik.values.organization]);

  useEffect(() => {
    if (!formik.values.class) {
      setAllDivision([]);
      formik.setFieldValue('divisions', []);
      return;
    }
    const selectedClass = allClass.find((cls) => cls.id === formik.values.class);
    const divisions = selectedClass?.divisions || [];
    setAllDivision(divisions);
    formik.setFieldValue(
      'divisions',
      divisions.map((d) => d.id)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.class, allClass]);

  useEffect(() => {
    if (!currentFields.includes('students') || !formik.values.class) return;
    getStudents({ standardId: formik.values.class });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.class, currentFields]);

  useEffect(() => {
    if (!currentFields.includes('students')) return;
    if (!formik.values.class) return;
    if (studentOptions.length > 0) {
      formik.setFieldValue(
        'students',
        studentOptions.map((s: any) => s.id)
      );
    } else {
      formik.setFieldValue('students', []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentOptions, currentFields, formik.values.class]);

  useEffect(() => {
    setTeacherObjs([]);
    formik.setFieldValue('teachers', []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mappedReport]);

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
                        formik.setValues({
                          ...formik.values,
                          organization: val as string,
                          class: '',
                          divisions: [],
                          subjects: [],
                          teachers: [],
                          students: [],
                          fromDate: null,
                          toDate: null,
                        });
                        setTeacherObjs([]);
                      }}
                      onBlur={() => formik.setFieldTouched('organization', true)}
                      error={formik.touched.organization && Boolean(formik.errors.organization)}
                      helperText={
                        (formik.touched.organization && formik.errors.organization) as string
                      }
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { width: '100%' } }}
                      disabled={!medium}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('class') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.class && formik.errors.class)}>
                    <CustomSelect
                      options={allClass}
                      label={`Class${isRequired('class') ? ' *' : ''}`}
                      value={formik.values.class}
                      multiple={false}
                      onChange={(val) => {
                        const selectedClass = allClass.find((cls) => cls.id === val);
                        const divisions = selectedClass?.divisions || [];
                        setAllDivision(divisions);
                        formik.setValues({
                          ...formik.values,
                          class: val as string,
                          divisions: divisions.map((d) => d.id),
                          teachers: [],
                          students: [],
                          fromDate: null,
                          toDate: null,
                        });
                      }}
                      onBlur={() => formik.setFieldTouched('class', true)}
                      error={formik.touched.class && Boolean(formik.errors.class)}
                      helperText={(formik.touched.class && formik.errors.class) as string}
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { width: '100%' } }}
                      disabled={!formik.values.organization}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('divisions') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.divisions && formik.errors.divisions)}>
                    <CustomSelect
                      options={allDivision}
                      label={`Division${isRequired('divisions') ? ' *' : ''}`}
                      multiple
                      disabled={!formik.values.class}
                      value={formik.values.divisions}
                      onChange={(val) => {
                        formik.setValues({
                          ...formik.values,
                          divisions: val as string[],
                          teachers: [],
                          students: [],
                          fromDate: null,
                          toDate: null,
                        });
                      }}
                      onBlur={() => formik.setFieldTouched('divisions', true)}
                      error={formik.touched.divisions && Boolean(formik.errors.divisions)}
                      helperText={(formik.touched.divisions && formik.errors.divisions) as string}
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { width: '100%' } }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('subjects') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.subjects && formik.errors.subjects)}>
                    <ResponsiveMultiSelect
                      label={`Subject${isRequired('subjects') ? ' *' : ''}`}
                      options={subjectOptions}
                      value={formik.values.subjects}
                      getOptionLabel={(opt: any) => opt?.name ?? ''}
                      getOptionValue={(opt: any) => opt?.id ?? ''}
                      disabled={
                        !formik.values.organization || (showField('class') && !formik.values.class)
                      }
                      isLoading={
                        classId
                          ? isSubjectOptionsLoading || isSubjectOptionsFetching
                          : isCoreSubjectLoading
                      }
                      onChange={(selectedValues) => {
                        formik.setFieldValue('subjects', selectedValues);
                      }}
                      error={formik.touched.subjects && Boolean(formik.errors.subjects)}
                      helperText={(formik.touched.subjects && formik.errors.subjects) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('teachers') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.teachers && formik.errors.teachers)}>
                    <PaginatedSearchSelect
                      multiple
                      disableCloseOnSelect
                      label={`Teacher${isRequired('teachers') ? ' *' : ''}`}
                      fetchOptions={fetchTeacherOptions}
                      value={teacherObjs}
                      onChange={(_: unknown, newValues: EmployeeOption[]) => {
                        const vals = newValues || [];
                        setTeacherObjs(vals);
                        formik.setFieldValue(
                          'teachers',
                          vals.map((v) => v.id)
                        );
                      }}
                      onBlur={() => formik.setFieldTouched('teachers', true)}
                      getOptionLabel={(option: EmployeeOption) => option?.label || ''}
                      isOptionEqualToValue={(option: EmployeeOption, val: EmployeeOption) =>
                        option.id === val.id
                      }
                      debounceMs={400}
                      minChars={0}
                      size="small"
                      fullWidth
                      error={formik.touched.teachers && Boolean(formik.errors.teachers)}
                      helperText={(formik.touched.teachers && formik.errors.teachers) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('students') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.students && formik.errors.students)}>
                    <ResponsiveMultiSelect
                      label={`Student${isRequired('students') ? ' *' : ''}`}
                      options={studentOptions}
                      value={formik.values.students}
                      getOptionLabel={(opt: any) => opt?.name ?? ''}
                      getOptionValue={(opt: any) => opt?.id ?? ''}
                      disabled={showField('class') && !formik.values.class}
                      isLoading={isStudentsLoading}
                      onChange={(selectedValues) => {
                        formik.setFieldValue('students', selectedValues);
                      }}
                      error={formik.touched.students && Boolean(formik.errors.students)}
                      helperText={(formik.touched.students && formik.errors.students) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {showField('fromDate') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.fromDate && formik.errors.fromDate)}>
                    <DatePicker
                      label={`From Date${isRequired('fromDate') ? ' *' : ''}`}
                      format="DD/MM/YYYY"
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
                      label={`To Date${isRequired('toDate') ? ' *' : ''}`}
                      format="DD/MM/YYYY"
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

              <Grid size={12} display="flex" justifyContent="flex-end" gap={1.5}>
                <Button
                  startIcon={<Iconify icon="mdi:eye-outline" />}
                  type="submit"
                  variant="outlined"
                  size="small"
                  onClick={() => setSubmitType('preview')}
                >
                  Preview
                </Button>
                <Button
                  startIcon={<Iconify icon="mdi:tray-arrow-down" />}
                  type="submit"
                  variant="contained"
                  size="small"
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
      <HomeworkReportPreviewDrawer
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        reportRequest={reportRequest}
        reportTitle={report || ''}
      />
    </Box>
  );
};

export default HomeworkManagementReports;
