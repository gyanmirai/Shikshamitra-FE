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
import { useLazyGetEmployeeQuery } from 'src/redux/hr/employeeApi';
import { useGetRoomsQuery } from 'src/redux/InstituteSetup/RoomApi/RoomApi';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useCreateAcademicReportExportMutation } from 'src/redux/academicAPI/AcademicReportApi';
import { useGetCoreSubjectsByMediumQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi';
import {
  TimetableReportTitle,
  TimetableReportApiTypeMap,
  TimetableReportTitleOptions,
} from 'src/enums/timetable-reports';

import TimetableReportPreviewDrawer from './TimetableReportPreviewDrawer';
import { getTimetableValidationSchema } from './timetableReportValidation';

// ─── Types ─────────────────────────────────────────────────────────────────

interface TimetableReportFormValues {
  report: TimetableReportTitle;
  organization: string;
  classes: string[];
  divisions: string[];
  teacher: string;
  roomNo: string;
  subject: string;
}

type EmployeeOption = { id: string; label: string };

// ─── Initial values ─────────────────────────────────────────────────────────

const initialValues: TimetableReportFormValues = {
  report: '' as unknown as TimetableReportTitle,
  organization: '',
  classes: [],
  divisions: [],
  teacher: '',
  roomNo: '',
  subject: '',
};

// ─── Field visibility map ────────────────────────────────────────────────────
/**
 * Lists every field rendered for each report type.
 * Only fields listed here are visible/validated.
 */
const TimetableReportFieldsMap: Record<number, string[]> = {
  [TimetableReportTitle.ClassWiseTimetableReport]: ['organization', 'classes', 'divisions'],
  [TimetableReportTitle.TeacherWiseTimetableReport]: ['organization', 'teacher'],
  [TimetableReportTitle.RoomUtilizationReport]: ['organization', 'roomNo'],
  [TimetableReportTitle.SubjectWiseTimetableDistribution]: [
    'organization',
    'classes',
    'divisions',
    'subject',
  ],
  [TimetableReportTitle.FreePeriodsReport]: [
    'organization',
    'classes',
    'divisions',
    'teacher',
    'roomNo',
  ],
  [TimetableReportTitle.TimetableChangeLogReport]: [
    'organization',
    'classes',
    'divisions',
    'teacher',
  ],
};

// ─── Required-fields map ─────────────────────────────────────────────────────
/**
 * Subset of visible fields that must have a value before submission.
 * All other visible fields are optional.
 */
const TimetableReportRequiredFieldsMap: Record<number, string[]> = {
  // Organization required; class required; division optional
  [TimetableReportTitle.ClassWiseTimetableReport]: ['organization', 'classes'],

  // Organization and teacher both required
  [TimetableReportTitle.TeacherWiseTimetableReport]: ['organization', 'teacher'],

  // Organization and room both required
  [TimetableReportTitle.RoomUtilizationReport]: ['organization', 'roomNo'],

  // Only organization required; class, division, subject optional
  [TimetableReportTitle.SubjectWiseTimetableDistribution]: ['organization'],

  // Organization and room required; class, division, teacher optional
  [TimetableReportTitle.FreePeriodsReport]: ['organization', 'roomNo'],

  // Only organization required; class, division, teacher optional
  [TimetableReportTitle.TimetableChangeLogReport]: ['organization'],
};

// ─── Component ───────────────────────────────────────────────────────────────

const TimetableReportForm = ({
  report,
  onSuccess,
}: {
  report: TimetableReportTitle;
  onSuccess?: () => void;
}) => {
  // ── Redux state ──
  const { currentMedium: medium, currentYear } = useSelector(
    (state: RootState) => state.globalState
  );

  // ── Org / Class / Division derived from medium ──
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  // ── Drawer & request state ──
  const [previewOpen, setPreviewOpen] = useState(false);
  const [reportRequest, setReportRequest] = useState<any>(null);
  const [submitType, setSubmitType] = useState<'preview' | 'export'>('preview');

  // ── Dynamic validation ──
  const [dynamicSchema, setDynamicSchema] = useState(getTimetableValidationSchema([], []));

  // ── Export mutation ──
  const [createExport, { isLoading: isExportCreating }] = useQueryAndMutation<
    typeof useCreateAcademicReportExportMutation
  >({
    type: 'mutation',
    currentQueryAndMutation: useCreateAcademicReportExportMutation,
    popupConfig: { error: true, errorMessage: 'Failed to initiate export' },
  });

  // ── Formik ──────────────────────────────────────────────────────────────────
  const formik = useFormik({
    initialValues: {
      ...initialValues,
      report: report as unknown as TimetableReportTitle,
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

      const requestPayload = {
        reportType: TimetableReportApiTypeMap[report],
        filters: {
          academicYearId: currentYear?.id || null,
          classIds: classIds.length > 0 ? classIds : null,
          divisionIds: divisionIds.length > 0 ? divisionIds : null,
          teacherIds: values.teacher ? [values.teacher] : null,
          roomIds: values.roomNo ? [values.roomNo] : null,
          subjectIds: values.subject ? [values.subject] : null,
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

  // ── Derived field lists ──────────────────────────────────────────────────────
  const currentFields = useMemo(() => TimetableReportFieldsMap[report as number] || [], [report]);

  const currentRequiredFields = useMemo(
    () => TimetableReportRequiredFieldsMap[report as number] || [],
    [report]
  );

  // Helpers
  const showField = (fieldName: string) => currentFields.includes(fieldName);
  const isRequired = (fieldName: string) => currentRequiredFields.includes(fieldName);

  // ── Room API ─────────────────────────────────────────────────────────────────
  const { data: roomsData, isLoading: isRoomsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRoomsQuery,
    options: {
      // Only fetch when a room filter is visible for the selected report
      skip: !currentFields.includes('roomNo'),
    },
  });

  const roomOptions: any[] = useMemo(
    () =>
      roomsData?.items ??
      roomsData?.data?.items ??
      roomsData?.records ??
      (Array.isArray(roomsData) ? roomsData : []),
    [roomsData]
  );

  // ── Subject API ──────────────────────────────────────────────────────────────
  const { data: subjectData, isLoading: isSubjectLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCoreSubjectsByMediumQuery,
    params: { academicMediumId: (medium as Medium)?.id },
    options: {
      skip: !currentFields.includes('subject') || !(medium as Medium)?.id,
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

  // ── Teacher API (paginated search) ───────────────────────────────────────────
  const [getTeacherOptions] = useLazyGetEmployeeQuery();
  const seenTeacherIdsRef = useRef<Set<string>>(new Set());

  /**
   * Stable fetch callback passed to PaginatedSearchSelect.
   * Uses deduplication via seenTeacherIdsRef to prevent duplicates across pages.
   */
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

  // Local object state for PaginatedSearchSelect (stores { id, label })
  const [teacherObj, setTeacherObj] = useState<EmployeeOption | null>(null);

  // ── Effects ──────────────────────────────────────────────────────────────────

  // Rebuild validation schema when field sets change
  useEffect(() => {
    setDynamicSchema(getTimetableValidationSchema(currentFields, currentRequiredFields));
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

  // Reset teacher selection when report changes
  useEffect(() => {
    setTeacherObj(null);
    formik.setFieldValue('teacher', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report]);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ mt: 2 }}>
      <Card>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              {/* Organisation */}
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
              )}

              {/* Class */}
              {showField('classes') && (
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
                        const wasAllPreviouslySelected = (
                          formik.values.classes as string[]
                        ).includes('all');

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
              )}

              {/* Division — hidden when "All" classes or no classes selected */}
              {showField('divisions') &&
                !(formik.values.classes as string[]).includes('all') &&
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

              {/* Teacher — paginated search; only for relevant reports */}
              {showField('teacher') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.teacher && formik.errors.teacher)}>
                    <PaginatedSearchSelect
                      label={`Teacher${isRequired('teacher') ? ' *' : ''}`}
                      fetchOptions={fetchTeacherOptions}
                      value={teacherObj}
                      onChange={(_: unknown, newValue: EmployeeOption | null) => {
                        setTeacherObj(newValue);
                        formik.setFieldValue('teacher', newValue ? newValue.id : '');
                      }}
                      onBlur={() => formik.setFieldTouched('teacher', true)}
                      getOptionLabel={(option: EmployeeOption) => option?.label || ''}
                      isOptionEqualToValue={(option: EmployeeOption, value: EmployeeOption) =>
                        option.id === value.id
                      }
                      debounceMs={400}
                      minChars={0}
                      size="small"
                      fullWidth
                      error={formik.touched.teacher && Boolean(formik.errors.teacher)}
                      helperText={(formik.touched.teacher && formik.errors.teacher) as string}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Room — dynamic from API; only for relevant reports */}
              {showField('roomNo') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.roomNo && formik.errors.roomNo)}>
                    <CustomSelect
                      id="room-dropdown"
                      value={formik.values.roomNo}
                      onBlur={() => formik.setFieldTouched('roomNo', true)}
                      onChange={(val) => formik.setFieldValue('roomNo', val)}
                      size="small"
                      label={`Room${isRequired('roomNo') ? ' *' : ''}`}
                      name="roomNo"
                      error={formik.touched.roomNo && Boolean(formik.errors.roomNo)}
                      helperText={(formik.touched.roomNo && formik.errors.roomNo) as string}
                      options={roomOptions}
                      labelKey="roomName"
                      valueKey="id"
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                      isLoading={isRoomsLoading}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Subject — dynamic from API; only for Subject-wise Distribution */}
              {showField('subject') && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.subject && formik.errors.subject)}>
                    <CustomSelect
                      id="subject-dropdown"
                      value={formik.values.subject}
                      onBlur={() => formik.setFieldTouched('subject', true)}
                      onChange={(val) => formik.setFieldValue('subject', val)}
                      size="small"
                      label={`Subject${isRequired('subject') ? ' *' : ''}`}
                      name="subject"
                      error={formik.touched.subject && Boolean(formik.errors.subject)}
                      helperText={(formik.touched.subject && formik.errors.subject) as string}
                      options={subjectOptions}
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                      disabled={!formik.values.organization}
                      isLoading={isSubjectLoading}
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
      <TimetableReportPreviewDrawer
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        reportRequest={reportRequest}
        reportTitle={TimetableReportTitleOptions.find((opt) => opt.name === report)?.label || ''}
      />
    </Box>
  );
};

export default TimetableReportForm;
