'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, Division, Standards, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';
import { Box, Grid, Card, Button, TextField, Autocomplete } from '@mui/material';
import { useCreateAcademicReportExportMutation } from 'src/redux/academicAPI/AcademicReportApi';
import {
  ExamReportTitle,
  ExamReportApiTypeMap,
  StudentWiseResultReportMap,
} from 'src/enums/examination-reports';

import { getExamValidationSchema } from '../getExamReportValidationSchema';
import ExaminationReportPreviewDrawer from '../ExaminationReportPreviewDrawer';

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

// Helper to get display values for UI - shows only 'all' chip when all items selected
const getDisplayValues = (values: string[]): string[] => {
  if (values.includes('all')) {
    return ['all'];
  }
  return values;
};

// ---- per-report field config ------------------------------------------------
const StudentWiseResultReportFieldsMap: Partial<Record<ExamReportTitle, string[]>> = {
  [ExamReportTitle.StudentAllBatchResult]: ['organizations', 'students', 'standards', 'divisions'],
  [ExamReportTitle.StudentAllExamResult]: ['organizations', 'student', 'standards', 'divisions'],
};

const StudentWiseResultReportRequiredFieldsMap: Partial<Record<ExamReportTitle, string[]>> = {
  [ExamReportTitle.StudentAllBatchResult]: ['organizations', 'students'],
  [ExamReportTitle.StudentAllExamResult]: ['organizations', 'student'],
};

// ---- initial values ---------------------------------------------------------
const examReportInitialValues = {
  report: '' as unknown as ExamReportTitle,
  organizations: [] as string[],
  standards: [] as string[],
  divisions: [] as string[],
  students: [] as string[],
  student: '',
};

// =============================================================================

const StudentWiseResultReports = ({
  report,
  onSuccess,
}: {
  report: string;
  onSuccess?: () => void;
}) => {
  const mappedReport = StudentWiseResultReportMap.find((opt) => opt.label === report)
    ?.name as ExamReportTitle;

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [reportRequest, setReportRequest] = useState<any>(null);
  const [submitType, setSubmitType] = useState<'preview' | 'export'>('preview');

  const currentFields = useMemo(
    () => StudentWiseResultReportFieldsMap[mappedReport] || [],
    [mappedReport]
  );
  const currentRequiredFields = useMemo(
    () => StudentWiseResultReportRequiredFieldsMap[mappedReport] || [],
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
    initialValues: { ...examReportInitialValues, report: mappedReport },
    enableReinitialize: true,
    validationSchema: dynamicSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const standardIds = values.standards.filter((id) => id !== 'all');

      const requestPayload = {
        reportType: ExamReportApiTypeMap[mappedReport],
        filters: {
          classIds: standardIds,
          divisionIds: values.divisions.filter((id) => id !== 'all'),
          studentIds:
            values.students.filter((id) => id !== 'all').length > 0
              ? values.students.filter((id) => id !== 'all')
              : values.student
                ? [values.student]
                : null,
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

  // ---- lazy student API -------------------------------------------------------
  const [getStudents, { data: studentsData, isLoading: isStudentsLoading }] =
    useLazyGetFilterStudentsQuery();

  const studentOptions = useMemo(
    () =>
      studentsData?.items?.map((item: any) => ({
        id: item.id,
        name: [item.firstName, item.middleName, item.lastName].filter(Boolean).join(' '),
      })) || [],
    [studentsData?.items]
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

  // ---- org → class; trigger student lazy load --------------------------------
  useEffect(() => {
    const selectedOrgs = formik.values.organizations.filter((id) => id !== 'all');

    if (selectedOrgs.length === 0) {
      setAllClass([]);
      formik.setFieldValue('standards', []);
      formik.setFieldValue('students', []);
      formik.setFieldValue('student', '');
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

    // load students scoped to the first selected org and medium
    const needsStudents = showField('students') || showField('student');
    if (needsStudents && (medium as Medium)?.id) {
      getStudents({
        academicMediumId: (medium as Medium).id,
        educationMediumStageId: selectedOrgs[0],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.organizations]);

  // ---- class → division -------------------------------------------------------
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
      const allDivisions = allClass
        .filter((item: any) => selected.includes(item.id))
        .flatMap((item: any) => (Array.isArray(item.divisions) ? item.divisions : []));
      const uniqueDivisions = Array.from(new Map(allDivisions.map((d: any) => [d.id, d])).values());
      setAllDivision(uniqueDivisions as Division[]);
      const ids = uniqueDivisions.map((d: any) => d.id);
      formik.setFieldValue('divisions', ids.length > 0 ? ['all', ...ids] : []);
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
                      value={getDisplayValues(formik.values.organizations)}
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

              {/* STUDENTS (multi, required) — StudentAllBatchResult */}
              {showField('students') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.students && !!formik.touched.students}>
                    <ResponsiveMultiSelect
                      label={`Student${isRequired('students') ? ' *' : ''}`}
                      options={studentOptions}
                      value={getDisplayValues(formik.values.students)}
                      getOptionLabel={(opt: any) => opt?.name}
                      getOptionValue={(opt: any) => opt?.id}
                      disabled={formik.values.organizations.length === 0 || isStudentsLoading}
                      onChange={(selectedValues) => {
                        const allRealIds = studentOptions.map((s: any) => s.id);
                        formik.setFieldValue(
                          'students',
                          resolveMultiSelectValues(
                            selectedValues,
                            formik.values.students,
                            allRealIds
                          )
                        );
                      }}
                      error={!!(formik.touched.students && formik.errors.students)}
                      helperText={
                        formik.touched.students && typeof formik.errors.students === 'string'
                          ? formik.errors.students
                          : undefined
                      }
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* STUDENT (single, required) — StudentAllExamResult */}
              {showField('student') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.student && !!formik.touched.student}>
                    <Autocomplete
                      options={studentOptions}
                      loading={isStudentsLoading}
                      getOptionLabel={(option: any) => option.name}
                      isOptionEqualToValue={(option: any, value: any) => option.id === value?.id}
                      value={
                        studentOptions.find((s: any) => s.id === formik.values.student) || null
                      }
                      disabled={formik.values.organizations.length === 0}
                      onChange={(_event, newValue: any) => {
                        formik.setFieldValue('student', newValue ? newValue.id : '');
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={`Student${isRequired('student') ? ' *' : ''}`}
                          fullWidth
                          size="small"
                          error={!!(formik.touched.student && formik.errors.student)}
                          helperText={(formik.touched.student && formik.errors.student) as string}
                        />
                      )}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* CLASS (optional multi) */}
              {showField('standards') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!formik.errors.standards && !!formik.touched.standards}>
                    <ResponsiveMultiSelect
                      label={`Class${isRequired('standards') ? ' *' : ''}`}
                      options={[{ id: 'all', name: 'All' }, ...allClass]}
                      value={getDisplayValues(formik.values.standards)}
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
                      value={getDisplayValues(formik.values.divisions)}
                      getOptionLabel={(opt) => opt?.name}
                      getOptionValue={(opt) => opt?.id}
                      disabled={formik.values.standards.length === 0}
                      onChange={(selectedValues) => {
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

              {/* Submit */}
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

export default StudentWiseResultReports;
