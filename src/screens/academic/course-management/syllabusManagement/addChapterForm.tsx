'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Editor } from 'src/components/editor';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import FileUploader from 'src/components/custom-upload';
import { fileData } from 'src/components/file-thumbnail';
import { shikshaMitraToast } from 'src/components/toast';
import { SingleFilePreview } from 'src/components/upload';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import DocumentPreviewDialog from 'src/components/preview-document/DocumentPreviewDialog';
import { useUploadCurriculumFileMutation } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import {
  useAddChapterMutation,
  useUpdateChapterMutation,
} from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api';
import {
  Box,
  Grid,
  Chip,
  Paper,
  Stack,
  Button,
  Drawer,
  Divider,
  MenuItem,
  Collapse,
  TextField,
  IconButton,
  Typography,
  DialogActions,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';

import { getChapterInitialValues } from './initialValues';
import { getChapterValidationSchema } from './validationSchema';
import {
  bloomOptions,
  difficultyOptions,
  visibilityOptions,
  reviewStatusOptions,
  mappingStatusOptions,
  publishStatusOptions,
  resourceStatusOptions,
  coverageStatusOptions,
} from './syllabusPlanningData';

import type { IChapterFormValues, IAddNewChapterProps } from './type';

// Component for adding or editing a chapter with form validation and file upload functionality
export const AddNewChapter: React.FC<IAddNewChapterProps> = ({
  onClose,
  onSubmit,
  isEdit = false,
  initialValues = null,
  className,
  subject,
  classId,
  subjectId,
  existingChapters = [],
}: IAddNewChapterProps) => {
  // State for managing uploaded documents and their metadata
  // const [documents, setDocuments] = useState<IDocument[]>(initialValues?.documents || []);
  // State for tracking files that have been uploaded but not yet processed
  const theme = useTheme();
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [previewFile, setPreviewFile] = useState<File | string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const [localFileNames, setLocalFileNames] = useState<Record<string, string>>({});
  const previewDialog = useBoolean();
  const additionalFieldsDrawer = useBoolean(false);
  const [addChapter, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddChapterMutation,
  });
  const [updateChapter, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateChapterMutation,
  });
  const [uploadCurriculumFile] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadCurriculumFileMutation,
  });

  const numberOrNull = (value: number | string) => (value === '' ? null : Number(value));
  const numberOrZero = (value: number | string) => (value === '' ? 0 : Number(value));

  const buildPlanningPayload = (values: IChapterFormValues) => ({
    unitName: values.unitName,
    termName: values.termName,
    topic: values.topic,
    estimatedTeachingDays: numberOrNull(values.estimatedTeachingDays),
    estimatedPeriods: numberOrNull(values.estimatedPeriods),
    revisionDays: numberOrNull(values.revisionDays),
    bufferDays: numberOrNull(values.bufferDays),
    difficultyLevel: values.difficultyLevel,
    bloomLevel: values.bloomLevel,
    tags: values.tags,
    learningOutcomes: values.learningOutcomes,
    skillsCovered: values.skillsCovered,
    prerequisites: values.prerequisites,
    teachingMethods: values.teachingMethods,
    classActivities: values.classActivities,
    completionCriteria: values.completionCriteria,
    teacherNotes: values.teacherNotes,
    studentSummary: values.studentSummary,
    parentSummary: values.parentSummary,
    referenceLinks: values.referenceLinks,
    worksheets: values.worksheets,
    audioVideoMaterials: values.audioVideoMaterials,
    boardDocuments: values.boardDocuments,
    assessmentMethod: values.assessmentMethod,
    questionTypes: values.questionTypes,
    marksWeightage: numberOrNull(values.marksWeightage),
    bloomCoverage: values.bloomCoverage,
    difficultyDistribution: values.difficultyDistribution,
    visibility: values.visibility,
    publishStatus: values.publishStatus,
    reviewStatus: values.reviewStatus,
    notifyOnPublish: values.notifyOnPublish,
    progressPercentage: numberOrZero(values.progressPercentage),
    coverageStatus: values.coverageStatus,
    lessonPlanStatus: values.lessonPlanStatus,
    homeworkStatus: values.homeworkStatus,
    assessmentStatus: values.assessmentStatus,
    resourceStatus: values.resourceStatus,
    questionCount: numberOrZero(values.questionCount),
    healthScore: numberOrZero(values.healthScore),
    isAiGenerated: values.isAiGenerated,
    copiedFromPreviousYear: values.copiedFromPreviousYear,
    templateSource: values.templateSource,
    dependencyChapterIds: values.dependencyChapterIds,
    versionLabel: values.versionLabel,
  });

  const getFileNameFromUrl = (file: string | File): string => {
    if (!file) return '';
    if (typeof file !== 'string') return file.name;
    if (localFileNames && localFileNames[file]) return localFileNames[file];

    const normalized = file.split('?')[0];
    const segments = normalized.split('/').filter(Boolean);
    let rawName = decodeURIComponent(segments[segments.length - 1] || '');

    if (rawName.length > 37 && rawName[36] === '_') {
      const maybeUuid = rawName.substring(0, 36);
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(maybeUuid)) {
        rawName = rawName.substring(37);
      }
    }

    return rawName;
  };

  const formik = useFormik<IChapterFormValues>({
    initialValues: getChapterInitialValues(initialValues),
    enableReinitialize: true,
    validationSchema: getChapterValidationSchema(currentYear, existingChapters, initialValues?.id),
    onSubmit: async (values) => {
      try {
        if (!classId || !subjectId) {
          shikshaMitraToast.error({
            message: 'Class and Subject must be selected before saving a chapter.',
          });
          return;
        }

        const documents = (values.documents ?? []).filter(
          (doc): doc is string => typeof doc === 'string' && Boolean(doc)
        );

        // Shared formatted dates
        const formattedStartDate = dateConvertor(
          values?.startDate?.format(dateFormat) || '',
          false
        );
        const formattedEndDate = dateConvertor(values?.endDate?.format(dateFormat) || '', false);
        const planningPayload = buildPlanningPayload(values);

        if (initialValues) {
          const updatePayload = {
            assignedSubjectId: subjectId,
            chapterNo: values.chapterNo,
            chapterName: values.chapterName.trim(),
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            description: values.description,
            documents,
            ...planningPayload,
          };

          await updateChapter({
            id: initialValues.id,
            body: updatePayload,
          }).unwrap();

          shikshaMitraToast.success({
            message: `Chapter ${values.chapterNo} updated successfully`,
          });
        } else {
          const postPayload = {
            chapterNo: values.chapterNo,
            chapterName: values.chapterName.trim(),
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            description: values.description,
            documents,
            ...planningPayload,
          };

          await addChapter({ standardId: classId, subjectId, body: [postPayload] }).unwrap();

          shikshaMitraToast.success({
            message: `Chapter ${values.chapterNo} added successfully`,
          });
        }
        onClose(null, true);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        shikshaMitraToast.error({
          message: `Failed to save chapter: ${errorMessage}`,
        });
      }
    },
  });

  const handleDropzoneChange = async (droppedFiles: any[]) => {
    const newFiles = droppedFiles.filter((f): f is File => f instanceof File);
    const existingFiles = droppedFiles
      .filter((f) => !(f instanceof File))
      .map((f) => (typeof f === 'string' ? f : f.url || f.filePath || ''))
      .filter(Boolean);

    if (newFiles.length === 0) {
      formik.setFieldValue('documents', existingFiles);
      formik.setFieldTouched('documents', true, false);
      return;
    }

    try {
      const uploadPromises = newFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('File', file);
        const response = await uploadCurriculumFile(formData).unwrap();
        return { data: response.data, name: file.name };
      });

      const results = await Promise.all(uploadPromises);

      const newDocs = [...existingFiles];
      const nameUpdates: Record<string, string> = {};

      results.forEach((res) => {
        if (res.data) {
          newDocs.push(res.data);
          nameUpdates[res.data] = res.name;
        }
      });

      setLocalFileNames((prev) => ({ ...prev, ...nameUpdates }));
      formik.setFieldValue('documents', newDocs);
      formik.setFieldTouched('documents', true, false);
      shikshaMitraToast.success({ message: 'Document(s) uploaded successfully' });
    } catch (error) {
      console.error('Upload failed:', error);
      shikshaMitraToast.error({ message: 'Upload failed' });
    }
  };

  const additionalFieldsCount = useMemo(() => {
    if (!formik.values) return 0;
    const keys: (keyof IChapterFormValues)[] = [
      'unitName',
      'termName',
      'topic',
      'tags',
      'estimatedTeachingDays',
      'estimatedPeriods',
      'revisionDays',
      'bufferDays',
      'learningOutcomes',
      'skillsCovered',
      'prerequisites',
      'teachingMethods',
      'classActivities',
      'completionCriteria',
      'description',
      'teacherNotes',
      'studentSummary',
      'parentSummary',
      'referenceLinks',
      'worksheets',
      'audioVideoMaterials',
      'boardDocuments',
      'assessmentMethod',
      'questionTypes',
    ];
    return keys.filter((key) => {
      const val = formik.values[key];
      return val !== null && val !== undefined && val !== '' && val !== 0;
    }).length;
  }, [formik.values]);

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={1} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            {/* ── Context Header ───────────────────────────────────── */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
                bgcolor: (t) => `rgba(${t.vars.palette.primary.mainChannel} / 0.06)`,
                border: (t) => `1px solid rgba(${t.vars.palette.primary.mainChannel} / 0.18)`,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexWrap: 'wrap',
              }}
            >
              <Iconify
                icon="mdi:book-education-outline"
                width={22}
                sx={{ color: 'primary.main', flexShrink: 0 }}
              />
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                  sx={{ textTransform: 'uppercase', letterSpacing: 0.8 }}
                >
                  Class
                </Typography>
                <Chip label={className} size="small" color="primary" variant="soft" />
              </Stack>
              <Divider orientation="vertical" flexItem />
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                  sx={{ textTransform: 'uppercase', letterSpacing: 0.8 }}
                >
                  Subject
                </Typography>
                <Chip label={subject} size="small" color="secondary" variant="soft" />
              </Stack>
              <Box sx={{ ml: 'auto' }}>
                <Chip
                  size="small"
                  variant="soft"
                  color={initialValues ? 'warning' : 'success'}
                  label={initialValues ? 'Editing Chapter' : 'New Chapter'}
                />
              </Box>
            </Paper>

            {/* ── Section 1 : Chapter Info ─────────────────────────── */}
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                mb: 3,
                borderRadius: 2,
                transition: 'box-shadow 0.2s ease',
                '&:hover': { boxShadow: 4 },
              }}
            >
              <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                <Iconify icon="mdi:information-outline" width={18} sx={{ color: 'primary.main' }} />
                <Typography variant="subtitle2" fontWeight={700}>
                  Chapter Info
                </Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={1}>
                {/* Chapter Number */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.chapterNo && formik.errors.chapterNo) || false}
                  >
                    <TextField
                      fullWidth
                      label="Chapter Number *"
                      name="chapterNo"
                      type="number"
                      placeholder="e.g. 1"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Iconify icon="mdi:pound" width={15} sx={{ color: 'text.disabled' }} />
                          </InputAdornment>
                        ),
                      }}
                      onKeyDown={(e) => {
                        if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      value={formik.values.chapterNo}
                      onChange={formik.handleChange}
                      size="small"
                      error={!!(formik.touched.chapterNo && formik.errors.chapterNo) || false}
                      helperText={formik.touched.chapterNo && formik.errors.chapterNo}
                    />
                  </ShakingTextField>
                </Grid>

                {/* Chapter Name */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.chapterName && formik.errors.chapterName) || false}
                  >
                    <TextField
                      fullWidth
                      label="Chapter Name *"
                      name="chapterName"
                      placeholder="e.g. Introduction to Algebra"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Iconify
                              icon="mdi:book-open-variant"
                              width={15}
                              sx={{ color: 'text.disabled' }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      value={formik.values.chapterName}
                      onChange={(e) => {
                        // const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                        formik.setFieldValue('chapterName', e.target.value);
                      }}
                      size="small"
                      error={!!(formik.touched.chapterName && formik.errors.chapterName) || false}
                      helperText={formik.touched.chapterName && formik.errors.chapterName}
                    />
                  </ShakingTextField>
                </Grid>

                {/* Chapter Start Date */}
                <Grid size={{ xs: 12, md: 6 }}>
                  {(() => {
                    const startDateError =
                      formik.touched.startDate || !!formik.values.startDate
                        ? formik.errors.startDate
                        : undefined;
                    return (
                      <ShakingTextField error={!!startDateError}>
                        <DatePicker
                          label="Expected Start Date for all Division"
                          format="DD/MM/YYYY"
                          value={formik.values.startDate}
                          standardId={classId}
                          disablePast
                          onChange={(newValue) => {
                            formik.setFieldValue('startDate', newValue);
                          }}
                          minDate={dayjs(currentYear?.startDate)}
                          maxDate={dayjs(currentYear?.endDate)}
                          sx={{ minWidth: 180, width: '100%' }}
                          helperText={
                            startDateError ||
                            (currentYear?.startDate && currentYear?.endDate
                              ? `Must be within ${dayjs(currentYear.startDate).format('DD/MM/YYYY')} – ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`
                              : undefined)
                          }
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: 'small',
                              placeholder: 'DD/MM/YYYY',
                              error: !!startDateError,
                              FormHelperTextProps: {
                                sx: {
                                  position: 'relative',
                                  bgcolor: 'transparent',
                                  border: 'none',
                                  boxShadow: 'none',
                                  px: 0,
                                  py: 0,
                                  mx: 1.75,
                                  mt: 0.5,
                                  fontSize: '0.75rem',
                                  fontWeight: 400,
                                  color: startDateError ? 'error.main' : 'text.secondary',
                                },
                              },
                            },
                          }}
                        />
                      </ShakingTextField>
                    );
                  })()}
                </Grid>

                {/* Chapter End Date */}
                <Grid size={{ xs: 12, md: 6 }}>
                  {(() => {
                    const endDateError =
                      formik.touched.endDate || !!formik.values.endDate
                        ? formik.errors.endDate
                        : undefined;
                    return (
                      <ShakingTextField error={!!endDateError}>
                        <DatePicker
                          label="Expected End Date for all Division"
                          format="DD/MM/YYYY"
                          disablePast
                          standardId={classId}
                          minDate={dayjs(currentYear?.startDate)}
                          maxDate={dayjs(currentYear?.endDate)}
                          value={formik.values.endDate}
                          onChange={(newValue) => {
                            formik.setFieldValue('endDate', newValue);
                          }}
                          sx={{ minWidth: 180, width: '100%' }}
                          helperText={
                            endDateError ||
                            (currentYear?.startDate && currentYear?.endDate
                              ? `Must be within ${dayjs(currentYear.startDate).format('DD/MM/YYYY')} – ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`
                              : undefined)
                          }
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: 'small',
                              placeholder: 'DD/MM/YYYY',
                              error: !!endDateError,
                              FormHelperTextProps: {
                                sx: {
                                  position: 'relative',
                                  bgcolor: 'transparent',
                                  border: 'none',
                                  boxShadow: 'none',
                                  px: 0,
                                  py: 0,
                                  mx: 1.75,
                                  mt: 0.5,
                                  fontSize: '0.75rem',
                                  fontWeight: 400,
                                  color: endDateError ? 'error.main' : 'text.secondary',
                                },
                              },
                            },
                          }}
                        />
                      </ShakingTextField>
                    );
                  })()}
                </Grid>
              </Grid>
            </Paper>

            {/* ── Section 2 : Additional Fields Trigger Card ──────────── */}
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                mb: 3,
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'text.primary',
                },
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
                gap={2}
              >
                <Stack direction="row" alignItems="center" gap={1.5}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 1.75,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'action.hover',
                      color: 'text.secondary',
                      flexShrink: 0,
                    }}
                  >
                    <Iconify icon="solar:pen-new-square-linear" width={24} />
                  </Box>
                  <Box>
                    <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                      <Typography variant="subtitle1" fontWeight={700}>
                        Content (Additional Fields)
                      </Typography>
                      {additionalFieldsCount > 0 && (
                        <Chip
                          label={`${additionalFieldsCount} Configured`}
                          size="small"
                          color="default"
                          variant="soft"
                          sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600 }}
                        />
                      )}
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Unit, Term, Pedagogy, Outcomes, Notes, Resources & Assessment Metrics
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  variant="outlined"
                  color="inherit"
                  size="medium"
                  onClick={additionalFieldsDrawer.onTrue}
                  startIcon={<Iconify icon="mingcute:add-line" width={18} />}
                  sx={{
                    borderRadius: 1.5,
                    px: 2.5,
                    py: 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Add Additional Fields
                </Button>
              </Stack>
            </Paper>

            {/* ── Section-Wise Right Drawer ─────────────────────────── */}
            <Drawer
              anchor="right"
              open={additionalFieldsDrawer.value}
              onClose={additionalFieldsDrawer.onFalse}
              PaperProps={{
                sx: {
                  width: { xs: '100%', sm: 660, md: 740 },
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '-8px 0 24px -4px rgba(0, 0, 0, 0.16)',
                },
              }}
            >
              {/* Drawer Header */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  px: 3,
                  py: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  bgcolor: (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.04),
                }}
              >
                <Stack direction="row" alignItems="center" gap={1.5}>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 1.25,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                    }}
                  >
                    <Iconify icon="solar:document-text-bold-duotone" width={22} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Content (Additional Fields)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Syllabus planning, pedagogy, materials & assessment metadata
                    </Typography>
                  </Box>
                </Stack>
                <IconButton onClick={additionalFieldsDrawer.onFalse} size="small">
                  <Iconify
                    icon="solar:close-circle-bold"
                    width={24}
                    sx={{ color: 'text.secondary' }}
                  />
                </IconButton>
              </Stack>

              {/* Drawer Body - Section-Wise Content */}
              <Scrollbar sx={{ p: 3, flex: 1 }}>
                <Stack spacing={3}>
                  {/* Section 1: Planning & Scheduling */}
                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
                      <Iconify
                        icon="solar:calendar-mark-bold-duotone"
                        width={20}
                        sx={{ color: 'primary.main' }}
                      />
                      <Typography variant="subtitle2" fontWeight={700}>
                        1. Planning & Scheduling
                      </Typography>
                    </Stack>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 2 }}
                    >
                      Define unit, term, topic name and time allocations
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={1.5}>
                      {[
                        { name: 'unitName', label: 'Unit', placeholder: 'e.g. Unit 1' },
                        { name: 'termName', label: 'Term', placeholder: 'e.g. Term 1' },
                        { name: 'topic', label: 'Topic', placeholder: 'Core topic or theme' },
                        { name: 'tags', label: 'Tags', placeholder: 'e.g. algebra, equations' },
                      ].map((field) => (
                        <Grid key={field.name} size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            size="small"
                            name={field.name}
                            label={field.label}
                            placeholder={field.placeholder}
                            value={(formik.values as any)[field.name]}
                            onChange={formik.handleChange}
                          />
                        </Grid>
                      ))}
                      {[
                        { name: 'estimatedTeachingDays', label: 'Teaching Days' },
                        { name: 'estimatedPeriods', label: 'Estimated Periods' },
                        { name: 'revisionDays', label: 'Revision Days' },
                        { name: 'bufferDays', label: 'Buffer Days' },
                      ].map((field) => (
                        <Grid key={field.name} size={{ xs: 12, sm: 3 }}>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            name={field.name}
                            label={field.label}
                            value={(formik.values as any)[field.name]}
                            onChange={formik.handleChange}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>

                  {/* Section 2: Pedagogy & Learning Objectives */}
                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
                      <Iconify
                        icon="solar:target-bold-duotone"
                        width={20}
                        sx={{ color: 'primary.main' }}
                      />
                      <Typography variant="subtitle2" fontWeight={700}>
                        2. Pedagogy & Learning Objectives
                      </Typography>
                    </Stack>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 2 }}
                    >
                      Difficulty level, taxonomy, outcomes and teaching methodology
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          name="difficultyLevel"
                          label="Difficulty"
                          value={formik.values.difficultyLevel}
                          onChange={formik.handleChange}
                        >
                          {difficultyOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          name="bloomLevel"
                          label="Bloom Level"
                          value={formik.values.bloomLevel}
                          onChange={formik.handleChange}
                        >
                          {bloomOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      {[
                        ['learningOutcomes', 'Learning Outcomes'],
                        ['skillsCovered', 'Skills Covered'],
                        ['prerequisites', 'Prerequisites'],
                        ['teachingMethods', 'Teaching Methods'],
                        ['classActivities', 'Class Activities'],
                        ['completionCriteria', 'Completion Criteria'],
                      ].map(([name, label]) => (
                        <Grid key={name} size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            size="small"
                            name={name}
                            label={label}
                            value={(formik.values as any)[name]}
                            onChange={formik.handleChange}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>

                  {/* Section 3: Rich Description */}
                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
                      <Iconify
                        icon="solar:notebook-bold-duotone"
                        width={20}
                        sx={{ color: 'primary.main' }}
                      />
                      <Typography variant="subtitle2" fontWeight={700}>
                        3. Chapter Overview & Detailed Description
                      </Typography>
                    </Stack>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 2 }}
                    >
                      Rich-text description of key topics and coverage
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Editor
                      value={formik.values.description}
                      onChange={(value) => formik.setFieldValue('description', value)}
                      placeholder="Describe what this chapter covers, key topics and learning outcomes…"
                      sx={{
                        border: `1px solid ${theme.vars.palette.grey[500]}`,
                        borderRadius: 1,
                        '&:hover': { borderColor: theme.vars.palette.text.primary },
                        ...(!!formik.errors.description && {
                          borderColor: theme.palette.error.main,
                        }),
                        '&:focus-within': {
                          borderColor: theme.vars.palette.text.primary,
                          borderWidth: 2,
                        },
                      }}
                    />
                  </Paper>

                  {/* Section 4: Summaries & Notes */}
                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
                      <Iconify
                        icon="solar:chat-round-call-bold-duotone"
                        width={20}
                        sx={{ color: 'primary.main' }}
                      />
                      <Typography variant="subtitle2" fontWeight={700}>
                        4. Summaries & Stakeholder Notes
                      </Typography>
                    </Stack>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 2 }}
                    >
                      Dedicated guidance for teachers, students, and parents
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={1.5}>
                      {[
                        ['teacherNotes', 'Teacher Notes'],
                        ['studentSummary', 'Student Summary'],
                        ['parentSummary', 'Parent Summary'],
                      ].map(([name, label]) => (
                        <Grid key={name} size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            size="small"
                            name={name}
                            label={label}
                            value={(formik.values as any)[name]}
                            onChange={formik.handleChange}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>

                  {/* Section 5: Resources & Study Materials */}
                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
                      <Iconify
                        icon="solar:library-bold-duotone"
                        width={20}
                        sx={{ color: 'primary.main' }}
                      />
                      <Typography variant="subtitle2" fontWeight={700}>
                        5. Resources & Study Materials
                      </Typography>
                    </Stack>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 2 }}
                    >
                      Links, worksheets, audio/video media, and board reference documents
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={1.5}>
                      {[
                        ['referenceLinks', 'Reference Links'],
                        ['worksheets', 'Worksheets'],
                        ['audioVideoMaterials', 'Audio/Video Materials'],
                        ['boardDocuments', 'Board Documents'],
                      ].map(([name, label]) => (
                        <Grid key={name} size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            size="small"
                            name={name}
                            label={label}
                            value={(formik.values as any)[name]}
                            onChange={formik.handleChange}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>

                  {/* Section 6: Assessment & Metrics */}
                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
                      <Iconify
                        icon="solar:chart-square-bold-duotone"
                        width={20}
                        sx={{ color: 'primary.main' }}
                      />
                      <Typography variant="subtitle2" fontWeight={700}>
                        6. Assessment & Weightage Metrics
                      </Typography>
                    </Stack>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 2 }}
                    >
                      Exam weightage, question counts, bloom coverage and progress metrics
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={1.5}>
                      {[
                        ['assessmentMethod', 'Assessment Method'],
                        ['questionTypes', 'Question Types'],
                        ['bloomCoverage', 'Bloom Coverage'],
                        ['difficultyDistribution', 'Difficulty Distribution'],
                      ].map(([name, label]) => (
                        <Grid key={name} size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            size="small"
                            name={name}
                            label={label}
                            value={(formik.values as any)[name]}
                            onChange={formik.handleChange}
                          />
                        </Grid>
                      ))}
                      {[
                        ['marksWeightage', 'Marks Weightage'],
                        ['questionCount', 'Question Count'],
                        ['progressPercentage', 'Progress %'],
                        ['healthScore', 'Health Score'],
                      ].map(([name, label]) => (
                        <Grid key={name} size={{ xs: 12, sm: 3 }}>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            name={name}
                            label={label}
                            value={(formik.values as any)[name]}
                            onChange={formik.handleChange}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>

                  {/* Section 7: Status & Advanced Configuration */}
                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
                      <Iconify
                        icon="solar:settings-bold-duotone"
                        width={20}
                        sx={{ color: 'primary.main' }}
                      />
                      <Typography variant="subtitle2" fontWeight={700}>
                        7. Status & Advanced Configuration
                      </Typography>
                    </Stack>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 2 }}
                    >
                      Workflow statuses, version labels, and dependencies
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={1.5}>
                      {[
                        ['reviewStatus', 'Review Status', reviewStatusOptions],
                        ['visibility', 'Visibility', visibilityOptions],
                        ['coverageStatus', 'Coverage Status', coverageStatusOptions],
                        ['resourceStatus', 'Resource Status', resourceStatusOptions],
                        ['lessonPlanStatus', 'Lesson Plan', mappingStatusOptions],
                        ['homeworkStatus', 'Homework', mappingStatusOptions],
                        ['assessmentStatus', 'Assessment Status', mappingStatusOptions],
                      ].map(([name, label, options]) => (
                        <Grid key={name as string} size={{ xs: 12, sm: 3 }}>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            name={name as string}
                            label={label as string}
                            value={(formik.values as any)[name as string]}
                            onChange={formik.handleChange}
                          >
                            {(options as string[]).map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                      ))}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          name="templateSource"
                          label="Template Source"
                          value={formik.values.templateSource}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                          fullWidth
                          size="small"
                          name="versionLabel"
                          label="Version"
                          value={formik.values.versionLabel}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                          fullWidth
                          size="small"
                          name="dependencyChapterIds"
                          label="Dependencies"
                          value={formik.values.dependencyChapterIds}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Stack>
              </Scrollbar>

              {/* Drawer Sticky Footer */}
              <Box
                sx={{
                  p: 2,
                  px: 3,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadows-10)',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {additionalFieldsCount > 0
                    ? `${additionalFieldsCount} additional fields configured`
                    : 'No additional fields set'}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={additionalFieldsDrawer.onFalse}
                  startIcon={<Iconify icon="mdi:check" />}
                  sx={{ px: 3 }}
                >
                  Done & Save
                </Button>
              </Box>
            </Drawer>

            {/* ── Section 3 : Attachments ──────────────────────────── */}
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 2,
                transition: 'box-shadow 0.2s ease',
                '&:hover': { boxShadow: 4 },
              }}
            >
              <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                <Iconify icon="mdi:paperclip" width={18} sx={{ color: 'primary.main' }} />
                <Typography variant="subtitle2" fontWeight={700}>
                  Attachments
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  — PDFs, images, slides
                </Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />

              <FileUploader
                multiple
                showVisibleDocumentCount={6}
                onChange={handleDropzoneChange}
                onPreview={(file: any) => {
                  const url =
                    file instanceof File
                      ? URL.createObjectURL(file)
                      : file?.url || file?.filePath || (typeof file === 'string' ? file : '');
                  setPreviewDoc(url);
                }}
                value={formik.values.documents?.map((doc: any) => {
                  if (typeof doc === 'string') {
                    return {
                      url: doc,
                      name: getFileNameFromUrl(doc),
                      size: undefined,
                    };
                  }
                  return doc;
                })}
                primaryText="Drag & drop files here, or click to browse"
              />
            </Paper>
          </Scrollbar>

          {/* ── Sticky Footer ────────────────────────────────────── */}
          <DialogActions
            sx={{
              p: 2,
              gap: 1,
              borderTop: (t) => `1px solid ${t.vars.palette.divider}`,
              boxShadow: 'var(--shadows-10)',
              bgcolor: 'background.paper',
            }}
          >
            <Button
              type="button"
              variant="outlined"
              size="small"
              color="inherit"
              onClick={() => {
                onClose(null, false);
              }}
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              sx={{
                transition: 'all 0.2s ease',
                '&:hover': { boxShadow: 2 },
              }}
            >
              Cancel
            </Button>
            <Button
              startIcon={
                <Iconify
                  icon={initialValues ? 'mdi:update' : GlobalIcons.submit}
                  width={initialValues ? 16 : 20}
                  height={initialValues ? 16 : 20}
                />
              }
              loading={isUpdateLoading || isAddLoading}
              type="submit"
              size="small"
              variant="contained"
              sx={{
                minWidth: 120,
                transition: 'all 0.2s ease',
                '&:hover': { boxShadow: 4 },
              }}
            >
              {initialValues ? 'Update' : 'Add Chapter'}
            </Button>
          </DialogActions>

          <CustomDialog
            open={previewDialog.value}
            handleClose={() => {
              setPreviewFile(null);
              previewDialog.onFalse();
            }}
            title={previewFile ? fileData(previewFile).name : ''}
            maxWidth="sm"
          >
            <Scrollbar sx={{ height: 600, maxHeight: '100%' }}>
              {previewFile && <SingleFilePreview file={previewFile} />}
            </Scrollbar>
          </CustomDialog>

          <DocumentPreviewDialog
            open={!!previewDoc}
            onClose={() => setPreviewDoc(null)}
            url={previewDoc || ''}
            documentName={previewDoc ? getFileNameFromUrl(previewDoc) : ''}
          />
        </Box>
      </form>
    </BackPopUpChecked>
  );
};
