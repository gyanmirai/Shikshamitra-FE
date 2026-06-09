'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, Division, Standards, Organization } from 'src/types/school';

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
import { useGetCoreSubjectsByMediumQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi';
import {
  CurriculumReportTitle,
  CurriculumReportApiTypeMap,
  CurriculumReportTitleOptions,
} from 'src/enums/curriuculum-reports';
import { useGetChaptersByStandardQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api';

import CurriculumReportPreviewDrawer from './CurriculumReportPreviewDrawer';
import { getCurriculumValidationSchema } from './getCurriculumReportsValidationSchema';

interface CurriculumReportInitialValues {
  report: CurriculumReportTitle;
  organization: string;
  classes: string[];
  divisions: string[];
  subjects: string[];
  chapters: string[];
}

const initialValues: CurriculumReportInitialValues = {
  report: '' as unknown as CurriculumReportTitle,
  organization: '',
  classes: [],
  divisions: [],
  subjects: [],
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
      const classIds = values.classes.includes('all')
        ? allClass.filter((c) => c.id !== 'all').map((c) => c.id)
        : values.classes;

      const divisionIds = values.divisions.includes('all')
        ? allDivision.filter((d) => d.id !== 'all').map((d) => d.id)
        : values.divisions;

      const subjectIds = values.subjects.includes('all')
        ? subjectOptions.filter((s) => s.id !== 'all').map((s) => s.id)
        : values.subjects;

      const requestPayload = {
        reportType: CurriculumReportApiTypeMap[report],
        filters: {
          academicYearId: currentYear?.id || null,
          classIds: classIds.length > 0 ? classIds : null,
          divisionIds: divisionIds.length > 0 ? divisionIds : null,
          subjectIds: subjectIds.length > 0 ? subjectIds : null,
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

  // ─── Dynamic subject API ───────────────────────────────────────────────────
  const { data: subjectData, isLoading: isSubjectLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCoreSubjectsByMediumQuery,
    params: { academicMediumId: (medium as Medium)?.id },
    options: {
      skip: !(medium as Medium)?.id,
    },
  });

  const subjectOptions: any[] = useMemo(
    () =>
      subjectData?.data?.items ??
      subjectData?.items ??
      subjectData?.records ??
      (Array.isArray(subjectData) ? subjectData : []),
    [subjectData]
  );

  // ─── Dynamic chapter API ───────────────────────────────────────────────────
  // Chapters depend on the first real (non-"all") selected class and the first selected subject.
  const classId = useMemo(() => {
    const nonAllClasses = (formik.values.classes as string[]).filter((id) => id !== 'all');
    return nonAllClasses[0] ?? '';
  }, [formik.values.classes]);

  const subjectId = useMemo(
    () => (formik.values.subjects as string[])[0] ?? '',
    [formik.values.subjects]
  );

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

    if (!standards.some((std) => std.id === 'all')) {
      standards.unshift({
        id: 'all',
        name: 'All',
        creationTime: '',
        creatorId: '',
        lastModificationTime: '',
        lastModifierId: '',
        educationMediumStageId: '',
        divisions: [],
      });
    }
    setAllClass(standards);
  }, [allOrganization, formik.values.organization]);

  // Sync division list from selected class(es); auto-select when applicable
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (formik.values.classes.length === 0) {
      setAllDivision([]);
      formik.setFieldValue('divisions', []);
      return;
    }

    if (formik.values.classes.length === 1 && formik.values.classes[0] !== 'all') {
      const selectedClass = allClass.find((cls: any) => cls?.id === formik.values.classes[0]);
      const divisions = selectedClass?.divisions || [];
      setAllDivision(divisions);
      formik.setFieldValue(
        'divisions',
        divisions.map((div: any) => div.id)
      );
    } else {
      setAllDivision([
        {
          id: 'all',
          name: 'All',
          creationTime: '',
          creatorId: '',
          lastModificationTime: '',
          lastModifierId: '',
          strength: 0,
          standardId: '',
        },
      ]);
      formik.setFieldValue('divisions', ['all']);
    }
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
            <Grid container spacing={3}>
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

                      const standards =
                        allOrganization.find((org: any) => org?.id === val)?.standards || [];
                      const standardIds = standards.map((standard: any) => standard.id);
                      formik.setFieldValue('classes', [
                        'all',
                        ...standardIds.filter((id: string) => id !== 'all'),
                      ]);
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
                    multiple
                    value={formik.values.classes}
                    onChange={(val) => {
                      const value = val as string[];
                      const allClassIds =
                        allClass?.filter((cls) => cls.id !== 'all').map((cls) => cls.id) || [];
                      const isAllClicked = value.includes('all');
                      const wasAllPreviouslySelected = (formik.values.classes as string[]).includes(
                        'all'
                      );

                      if (isAllClicked && !wasAllPreviouslySelected) {
                        formik.setFieldValue('classes', ['all', ...allClassIds]);
                      } else if (!isAllClicked && wasAllPreviouslySelected) {
                        formik.setFieldValue('classes', []);
                      } else if (isAllClicked && wasAllPreviouslySelected) {
                        const selectedWithoutAll = value.filter((id) => id !== 'all');
                        if (selectedWithoutAll.length === allClassIds.length) {
                          formik.setFieldValue('classes', ['all', ...allClassIds]);
                        } else {
                          formik.setFieldValue('classes', selectedWithoutAll);
                        }
                      } else {
                        const selectedWithoutAll = value.filter((id) => id !== 'all');
                        if (selectedWithoutAll.length === allClassIds.length) {
                          formik.setFieldValue('classes', ['all', ...allClassIds]);
                        } else {
                          formik.setFieldValue('classes', selectedWithoutAll);
                        }
                      }
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

              {/* Division — hidden when "All" classes selected */}
              {!(formik.values.classes as string[]).includes('all') &&
                formik.values.classes.length > 0 && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <ShakingTextField
                      error={!!(formik.touched.divisions && formik.errors.divisions)}
                    >
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
                        multiple={
                          !(formik.values.classes as string[]).includes('all') ||
                          formik.values.classes.length > 1
                        }
                        formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                        disabled={formik.values.classes.length === 0}
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
                    multiple
                    labelKey="name"
                    valueKey="id"
                    formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                    disabled={!formik.values.organization}
                    isLoading={isSubjectLoading}
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
              <Grid size={12} justifyContent="flex-end" display="flex" gap={1.5}>
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
