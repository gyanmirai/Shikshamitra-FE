'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { toast } from 'sonner';
import { useFormik } from 'formik';
import { cloneDeep } from 'lodash';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { Box, Grid, Card, Button } from '@mui/material';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useCreateAcademicReportExportMutation } from 'src/redux/academicAPI/AcademicReportApi';
import { SubjectAssignmentStatus } from 'src/screens/academic/curriculum-management/subjectAssignment/enum/subjectType';
import {
  CurriculumReportTitle,
  CurriculumReportApiTypeMap,
  CurriculumReportTitleOptions,
} from 'src/enums/curriuculum-reports';
import { useGetChaptersByStandardQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import CurriculumReportPreviewDrawer from './CurriculumReportPreviewDrawer';
import { getCurriculumValidationSchema } from './getCurriculumReportsValidationSchema';

interface CurriculumReportInitialValues {
  report: CurriculumReportTitle;
  organization: string;
  classes: string;
  divisions: string[];
  subjects: string;
  chapters: string[];
}

const initialValues: CurriculumReportInitialValues = {
  report: '' as unknown as CurriculumReportTitle,
  organization: '',
  classes: '',
  divisions: [],
  subjects: '',
  chapters: [],
};

/**
 * Fields to render for each report type.
 * Only fields listed here will be visible.
 */
const CurriculumReportFieldsMap: Record<number, string[]> = {
  [CurriculumReportTitle.ChapterProgressReport]: [
    'organization',
    'classes',
    'divisions',
    'subjects',
    'chapters',
  ],
  [CurriculumReportTitle.SubjectWiseChapterCoverage]: [
    'organization',
    'classes',
    'divisions',
    'subjects',
  ],
  [CurriculumReportTitle.ChapterDescriptionSummary]: [
    'organization',
    'classes',
    'divisions',
    'subjects',
    'chapters',
  ],
  [CurriculumReportTitle.TimelineReport]: ['organization', 'classes', 'divisions', 'subjects'],
  [CurriculumReportTitle.ClassWiseChapterAssignmentReport]: [
    'organization',
    'classes',
    'divisions',
    'subjects',
  ],
  [CurriculumReportTitle.CurriculumCompletionReport]: [
    'organization',
    'classes',
    'divisions',
    'subjects',
  ],
  [CurriculumReportTitle.ChapterRevisionAndRevisitTracker]: [
    'organization',
    'classes',
    'divisions',
    'subjects',
    'chapters',
  ],
};

/**
 * Fields that must have a value before the form can be submitted.
 * All other visible fields are optional.
 */
const CurriculumReportRequiredFieldsMap: Record<number, string[]> = {
  // All four filters required
  [CurriculumReportTitle.ChapterProgressReport]: [
    'organization',
    'classes',
    'divisions',
    'subjects',
  ],
  [CurriculumReportTitle.SubjectWiseChapterCoverage]: [
    'organization',
    'classes',
    'divisions',
    'subjects',
  ],
  [CurriculumReportTitle.ChapterDescriptionSummary]: [
    'organization',
    'classes',
    'divisions',
    'subjects',
  ],
  // Only org + classes required; division & subject are optional
  [CurriculumReportTitle.TimelineReport]: ['organization', 'classes'],
  // Org + classes + subject required; division optional
  [CurriculumReportTitle.ClassWiseChapterAssignmentReport]: ['organization', 'classes', 'subjects'],
  // Only org required; everything else optional
  [CurriculumReportTitle.CurriculumCompletionReport]: ['organization'],
  // Org + classes required; division, subject, chapter optional
  [CurriculumReportTitle.ChapterRevisionAndRevisitTracker]: ['organization', 'classes'],
};

const CurriculumReportForm = ({
  report,
  onSuccess,
}: {
  report: CurriculumReportTitle;
  onSuccess?: () => void;
}) => {
  // Redux state
  const { currentMedium: medium, currentYear } = useSelector(
    (state: RootState) => state.globalState
  );

  // State for organisation / class / division dropdowns (derived from medium)
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  // Drawer & request state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [reportRequest, setReportRequest] = useState<any>(null);
  const [submitType, setSubmitType] = useState<'preview' | 'export'>('preview');

  // Dynamic validation schema that re-builds whenever the selected report changes
  const [dynamicSchema, setDynamicSchema] = useState(getCurriculumValidationSchema([], []));

  // Export mutation
  const [createExport, { isLoading: isExportCreating }] = useQueryAndMutation<
    typeof useCreateAcademicReportExportMutation
  >({
    type: 'mutation',
    currentQueryAndMutation: useCreateAcademicReportExportMutation,
    popupConfig: { error: true, errorMessage: 'Failed to initiate export' },
  });

  // ─── Formik ────────────────────────────────────────────────────────────────
  const formik = useFormik({
    initialValues: {
      ...initialValues,
      report: report as unknown as CurriculumReportTitle,
    },
    enableReinitialize: true,
    validationSchema: dynamicSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const classIds = values.classes ? [values.classes] : [];

      const divisionIds = values.divisions.includes('all')
        ? allDivision.filter((d) => d.id !== 'all').map((d) => d.id)
        : values.divisions;

      const subjectIds = values.subjects ? [values.subjects] : [];

      const requestPayload = {
        reportType: CurriculumReportApiTypeMap[report],
        filters: {
          academicYearId: currentYear?.id || null,
          classIds: classIds.length > 0 ? classIds : null,
          divisionIds: divisionIds.length > 0 ? divisionIds : null,
          subjectIds: subjectIds.length > 0 ? subjectIds : null,
          chapterIds: values.chapters.length > 0 ? values.chapters : null,
          revisionRequired:
            report === CurriculumReportTitle.ChapterRevisionAndRevisitTracker ? true : null,
        },
      };

      if (submitType === 'preview') {
        setReportRequest(requestPayload);
        setPreviewOpen(true);
      } else if (submitType === 'export') {
        try {
          const res = await createExport({ ...requestPayload, format: 'pdf' }).unwrap();
          toast.success(`Export job queued successfully! Status: ${res.status || 'Queued'}`);
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

  // ─── Derived field lists ───────────────────────────────────────────────────
  const currentFields = useMemo(() => CurriculumReportFieldsMap[report as number] || [], [report]);

  const currentRequiredFields = useMemo(
    () => CurriculumReportRequiredFieldsMap[report as number] || [],
    [report]
  );

  // Helper: is a field visible for the active report?
  const showField = (fieldName: string) => currentFields.includes(fieldName);

  // Helper: should the field label show a required asterisk?
  const isRequired = (fieldName: string) => currentRequiredFields.includes(fieldName);

  // ─── Derived select identifiers ────────────────────────────────────────────
  const classId = formik.values.classes || '';

  const subjectId = formik.values.subjects || '';

  // ─── Dynamic subject API ───────────────────────────────────────────────────
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
      skip: !medium?.id || !classId,
    },
  });

  const subjectOptions: any[] = useMemo(() => {
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
  }, [subjectOptionsData]);

  // ─── Dynamic chapter API ───────────────────────────────────────────────────
  const {
    data: chapterResponse,
    isLoading: isChapterLoading,
    isFetching: isChapterFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChaptersByStandardQuery,
    params: { standardId: classId, subjectId },
    options: {
      // Only fetch chapters for reports that actually show the chapter filter,
      // AND only when both a specific class and a subject are selected.
      skip: !currentFields.includes('chapters') || !classId || !subjectId,
    },
  });

  const chapterOptions: any[] = useMemo(
    () =>
      chapterResponse?.data?.items ??
      chapterResponse?.items ??
      chapterResponse?.records ??
      (Array.isArray(chapterResponse) ? chapterResponse : []),
    [chapterResponse]
  );

  // ─── Effects ───────────────────────────────────────────────────────────────

  // Rebuild validation schema when the visible/required field sets change
  useEffect(() => {
    setDynamicSchema(getCurriculumValidationSchema(currentFields, currentRequiredFields));
  }, [currentFields, currentRequiredFields]);

  // Sync organisation list from medium
  useEffect(() => {
    setAllOrganization(cloneDeep(medium?.educationMediumStages || []));
  }, [medium?.educationMediumStages]);

  // Sync class list from selected organisation
  useEffect(() => {
    const standards =
      allOrganization.find((org: any) => org?.id === formik.values.organization)?.standards || [];
    setAllClass(standards);
  }, [allOrganization, formik.values.organization]);

  // Sync division list from selected class; auto-select when applicable
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!formik.values.classes) {
      setAllDivision([]);
      formik.setFieldValue('divisions', []);
      return;
    }

    const selectedClass = allClass.find((cls: any) => cls?.id === formik.values.classes);
    const divisions = selectedClass?.divisions || [];
    setAllDivision(divisions);
    formik.setFieldValue(
      'divisions',
      divisions.map((div: any) => div.id)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allClass, formik.values.classes]);

  // Clear chapter selection when class or subject changes
  useEffect(() => {
    formik.setFieldValue('chapters', []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, subjectId]);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ mt: 2 }}>
      <Card>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={1}>
              {/* Organisation */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.organization && formik.errors.organization)}
                >
                  <CustomSelect
                    options={allOrganization}
                    label="Organization *"
                    value={formik.values.organization}
                    onChange={(val) => {
                      formik.setFieldValue('organization', val);
                      formik.setFieldValue('classes', '');
                      formik.setFieldValue('divisions', []);
                      formik.setFieldValue('subjects', '');
                    }}
                    onBlur={() => formik.setFieldTouched('organization', true)}
                    error={formik.touched.organization && Boolean(formik.errors.organization)}
                    helperText={
                      (formik.touched.organization && formik.errors.organization) as string
                    }
                    labelKey="name"
                    valueKey="id"
                    formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    disabled={!medium}
                  />
                </ShakingTextField>
              </Grid>

              {/* Class */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <ShakingTextField error={!!(formik.touched.classes && formik.errors.classes)}>
                  <CustomSelect
                    options={allClass}
                    label={`Class${isRequired('classes') ? ' *' : ''}`}
                    value={formik.values.classes}
                    onChange={(val) => {
                      formik.setFieldValue('classes', val as string);
                      formik.setFieldValue('divisions', []);
                      formik.setFieldValue('subjects', '');
                    }}
                    onBlur={() => formik.setFieldTouched('classes', true)}
                    error={formik.touched.classes && Boolean(formik.errors.classes)}
                    helperText={(formik.touched.classes && formik.errors.classes) as string}
                    labelKey="name"
                    valueKey="id"
                    formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    disabled={!formik.values.organization}
                  />
                </ShakingTextField>
              </Grid>

              {/* Division */}
              {formik.values.classes && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.divisions && formik.errors.divisions)}>
                    <CustomSelect
                      options={allDivision}
                      label={`Division${isRequired('divisions') ? ' *' : ''}`}
                      value={formik.values.divisions}
                      onChange={(val) => formik.setFieldValue('divisions', val)}
                      onBlur={() => formik.setFieldTouched('divisions', true)}
                      error={formik.touched.divisions && Boolean(formik.errors.divisions)}
                      helperText={(formik.touched.divisions && formik.errors.divisions) as string}
                      labelKey="name"
                      valueKey="id"
                      multiple
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                      disabled={!formik.values.classes}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Subject — loaded dynamically from API */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <ShakingTextField error={!!(formik.touched.subjects && formik.errors.subjects)}>
                  <CustomSelect
                    labelId="subjects-dropdown-label"
                    id="subjects-dropdown"
                    value={formik.values.subjects}
                    onBlur={() => formik.setFieldTouched('subjects', true)}
                    onChange={(val) => formik.setFieldValue('subjects', val)}
                    size="small"
                    label={`Subject${isRequired('subjects') ? ' *' : ''}`}
                    name="subjects"
                    error={formik.touched.subjects && Boolean(formik.errors.subjects)}
                    helperText={(formik.touched.subjects && formik.errors.subjects) as string}
                    options={subjectOptions}
                    labelKey="name"
                    valueKey="id"
                    formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    disabled={!formik.values.classes}
                    isLoading={isSubjectOptionsLoading || isSubjectOptionsFetching}
                  />
                </ShakingTextField>
              </Grid>

              {/* Chapter — optional; only shown for reports that require it */}
              {showField('chapters') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.chapters && formik.errors.chapters)}>
                    <CustomSelect
                      labelId="chapters-dropdown-label"
                      id="chapters-dropdown"
                      value={formik.values.chapters}
                      onBlur={() => formik.setFieldTouched('chapters', true)}
                      onChange={(val) => formik.setFieldValue('chapters', val)}
                      size="small"
                      label="Chapter"
                      name="chapters"
                      error={formik.touched.chapters && Boolean(formik.errors.chapters)}
                      helperText={(formik.touched.chapters && formik.errors.chapters) as string}
                      options={chapterOptions}
                      multiple
                      labelKey="chapterName"
                      valueKey="id"
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                      disabled={!classId || !subjectId}
                      isLoading={isChapterLoading || isChapterFetching}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Submit */}
              <Grid size={12} justifyContent="flex-end" display="flex" gap={1}>
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
      <CurriculumReportPreviewDrawer
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        reportRequest={reportRequest}
        reportTitle={CurriculumReportTitleOptions.find((opt) => opt.name === report)?.label || ''}
      />
    </Box>
  );
};

export default CurriculumReportForm;
