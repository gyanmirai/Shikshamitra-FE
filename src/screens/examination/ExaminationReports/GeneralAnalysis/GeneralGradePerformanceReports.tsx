'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, Division, Standards, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { examScheduledStatus } from 'src/enums/exam-scheduled-status';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';
import { Box, Grid, Card, Button, TextField, Autocomplete } from '@mui/material';
import { useCreateAcademicReportExportMutation } from 'src/redux/academicAPI/AcademicReportApi';
import { useGetExamsQuery } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';
import {
  ExamReportTitle,
  ExamReportApiTypeMap,
  GeneralGradePerformanceReportMap,
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
  organizations: '',
  standards: '',
  divisions: [] as string[],
  exam: '',
};

// =============================================================================

const GeneralGradePerformanceReports = ({
  report,
  onSuccess,
}: {
  report: string;
  onSuccess?: () => void;
}) => {
  const mappedReport = GeneralGradePerformanceReportMap.find((opt) => opt.label === report)
    ?.name as ExamReportTitle;

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [reportRequest, setReportRequest] = useState<any>(null);
  const [submitType, setSubmitType] = useState<'preview' | 'export'>('preview');

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
      const requestPayload = {
        reportType: ExamReportApiTypeMap[mappedReport],
        filters: {
          classIds: values.standards ? [values.standards] : [],
          divisionIds: values.divisions.filter((id) => id !== 'all'),
          examId: values.exam || null,
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
    setAllOrganization(cloneDeep(medium.educationMediumStages));
  }, [medium?.educationMediumStages]);

  // ---- org â†’ class ------------------------------------------------------------
  useEffect(() => {
    const selectedOrgId = formik.values.organizations;

    if (!selectedOrgId) {
      setAllClass([]);
      formik.setFieldValue('standards', '');
      return;
    }

    const selectedOrg = allOrganization.find((org: any) => org.id === selectedOrgId);
    setAllClass(Array.isArray(selectedOrg?.standards) ? selectedOrg.standards : []);
    formik.setFieldValue('standards', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allOrganization, formik.values.organizations]);

  // ---- class â†’ division -------------------------------------------------------
  useEffect(() => {
    const selectedClassId = formik.values.standards;

    if (!selectedClassId) {
      setAllDivision([]);
      formik.setFieldValue('divisions', []);
      return;
    }

    const selectedClass = allClass.find((c: any) => c?.id === selectedClassId);
    const divs = selectedClass?.divisions || [];
    setAllDivision(divs);
    const ids = divs.map((d: any) => d.id);
    formik.setFieldValue('divisions', ids.length > 0 ? ['all', ...ids] : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allClass, formik.values.standards]);

  // =============================================================================

  return (
    <Box sx={{ mt: 2 }}>
      <Card>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              {/* ORGANIZATION (single, required) */}
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

              {/* CLASS (single) */}
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
                      disabled={!formik.values.standards}
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

export default GeneralGradePerformanceReports;
