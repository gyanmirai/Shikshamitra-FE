'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { GlobalIcons } from 'src/utils/icons';
import LoadingButton from '@mui/lab/LoadingButton';
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

import CustomTooltip from 'src/components/custom-tooltip';

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
  const [isDoneSaving, setIsDoneSaving] = useState(false);
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
                transition: 'all 0.25s ease',
                borderColor: additionalFieldsCount > 0 ? 'success.main' : 'divider',
                borderWidth: additionalFieldsCount > 0 ? 1.5 : 1,
                boxShadow: additionalFieldsCount > 0
                  ? (t) => `0 0 0 3px ${varAlpha(t.vars.palette.success.mainChannel, 0.12)}`
                  : 'none',
                '&:hover': {
                  borderColor: additionalFieldsCount > 0 ? 'success.dark' : 'text.primary',
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
                    <Iconify icon="solar:info-square-bold-duotone" width={24} />
                  </Box>
                  <Box>
                    <Stack direction="row" alignItems="center" gap={0.5} flexWrap="wrap">
                      <Typography variant="subtitle1" fontWeight={700}>
                        Content (Additional Fields)
                      </Typography>
                      <CustomTooltip
                        arrow
                        placement="bottom-start"
                        title={
                          <Box sx={{ p: 1, maxWidth: 320 }}>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                              About Additional Content Fields
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ mb: 0.75 }}>
                              • <strong>Planning &amp; Scheduling:</strong> Define unit, term, topic name, teaching days, and period allocations.
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ mb: 0.75 }}>
                              • <strong>Pedagogy &amp; Objectives:</strong> Set difficulty, Bloom&apos;s taxonomy level, learning outcomes, and prerequisites.
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ mb: 0.75 }}>
                              • <strong>Materials &amp; Assessment:</strong> Attach study links, worksheets, audio/video media, and exam weightage metrics.
                            </Typography>
                            <Typography variant="caption" display="block">
                              • <strong>Summaries &amp; Workflow:</strong> Provide teacher/student/parent notes and track review statuses.
                            </Typography>
                          </Box>
                        }
                      >
                        <IconButton size="small" color="info" sx={{ p: 0.5, ml: 0.25 }}>
                          <Iconify icon="lucide:info" width={18} />
                        </IconButton>
                      </CustomTooltip>
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
                  variant="contained"
                  size="small"
                  onClick={additionalFieldsDrawer.onTrue}
                  startIcon={<Iconify icon="solar:info-circle-linear" width={16} />}
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
                  width: { xs: '100%', sm: 680, md: 760 },
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: (t) => `-8px 0 32px -4px ${varAlpha(t.vars.palette.common.blackChannel, 0.16)}`,
                  bgcolor: 'background.default',
                },
              }}
            >
              {/* Drawer Header */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  px: 2.5,
                  py: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              >
                <Box>
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Content (Additional Fields)
                    </Typography>
                    <CustomTooltip
                      arrow
                      placement="bottom-start"
                      title={
                        <Box sx={{ p: 1, maxWidth: 320 }}>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                            Content Metadata Guidance
                          </Typography>
                          <Typography variant="caption" display="block" sx={{ mb: 0.75 }}>
                            • <strong>Syllabus Planning:</strong> Unit name, term, topic name, teaching days, and periods.
                          </Typography>
                          <Typography variant="caption" display="block" sx={{ mb: 0.75 }}>
                            • <strong>Pedagogy &amp; Taxonomies:</strong> Bloom levels, difficulty, outcomes, skills, and activities.
                          </Typography>
                          <Typography variant="caption" display="block" sx={{ mb: 0.75 }}>
                            • <strong>Materials &amp; Assessment:</strong> Worksheets, board documents, media links, and weightage.
                          </Typography>
                          <Typography variant="caption" display="block">
                            • <strong>Stakeholder Summaries:</strong> Notes for teachers, students, and parents.
                          </Typography>
                        </Box>
                      }
                    >
                      <IconButton size="small" color="info" sx={{ p: 0.5, ml: 0.25 }}>
                        <Iconify icon="lucide:info" width={18} />
                      </IconButton>
                    </CustomTooltip>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Syllabus planning, pedagogy, materials & assessment metadata
                  </Typography>
                </Box>

                <IconButton
                  aria-label="Close drawer"
                  onClick={additionalFieldsDrawer.onFalse}
                  size="small"
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    bgcolor: (t) => varAlpha(t.vars.palette.grey['500Channel'], 0.12),
                    color: 'text.secondary',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      bgcolor: (t) => varAlpha(t.vars.palette.grey['500Channel'], 0.24),
                      color: 'text.primary',
                      transform: 'scale(1.06)',
                    },
                  }}
                >
                  <Iconify icon="mingcute:close-line" width={20} />
                </IconButton>
              </Stack>

              {/* Drawer Body - Section-Wise Content */}
              <Scrollbar sx={{ p: { xs: 1.5, sm: 2 }, flex: 1 }}>
                <Stack spacing={2}>
                  {/* Section 1: Planning & Scheduling */}
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.75, bgcolor: 'background.paper' }}>
                    <Stack direction="row" alignItems="center" gap={1.25} mb={0.75}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '12px 12px 12px 3px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.1),
                          color: 'primary.main',
                          flexShrink: 0,
                        }}
                      >
                        <Iconify icon="solar:calendar-mark-bold-duotone" width={18} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                          1. Planning & Scheduling
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Define unit, term, topic name and time allocations
                        </Typography>
                      </Box>
                    </Stack>
                    <Divider sx={{ my: 1.5 }} />
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          name="unitName"
                          label="Unit"
                          placeholder="e.g. Unit 1"
                          value={formik.values.unitName}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          name="termName"
                          label="Term"
                          placeholder="e.g. Term 1"
                          value={formik.values.termName}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          name="topic"
                          label="Topic"
                          placeholder="Core topic or theme"
                          value={formik.values.topic}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          name="tags"
                          label="Tags"
                          placeholder="e.g. algebra, equations"
                          value={formik.values.tags}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          name="estimatedTeachingDays"
                          label="Teaching Days"
                          value={formik.values.estimatedTeachingDays ?? ''}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          name="estimatedPeriods"
                          label="Estimated Periods"
                          value={formik.values.estimatedPeriods ?? ''}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          name="revisionDays"
                          label="Revision Days"
                          value={formik.values.revisionDays ?? ''}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          name="bufferDays"
                          label="Buffer Days"
                          value={formik.values.bufferDays ?? ''}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Section 2: Pedagogy & Learning Objectives */}
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.75, bgcolor: 'background.paper' }}>
                    <Stack direction="row" alignItems="center" gap={1.25} mb={0.75}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '12px 12px 12px 3px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.1),
                          color: 'primary.main',
                          flexShrink: 0,
                        }}
                      >
                        <Iconify icon="solar:target-bold-duotone" width={18} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                          2. Pedagogy & Learning Objectives
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Difficulty level, taxonomy, outcomes and teaching methodology
                        </Typography>
                      </Box>
                    </Stack>
                    <Divider sx={{ my: 1.5 }} />
                    <Grid container spacing={2}>
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
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          multiline
                          minRows={2}
                          size="small"
                          name="learningOutcomes"
                          label="Learning Outcomes"
                          placeholder="Expected outcomes after completing this chapter"
                          value={formik.values.learningOutcomes}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          multiline
                          minRows={2}
                          size="small"
                          name="skillsCovered"
                          label="Skills Covered"
                          placeholder="Key skills developed"
                          value={formik.values.skillsCovered}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          multiline
                          minRows={2}
                          size="small"
                          name="prerequisites"
                          label="Prerequisites"
                          placeholder="Prior knowledge required"
                          value={formik.values.prerequisites}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          multiline
                          minRows={2}
                          size="small"
                          name="teachingMethods"
                          label="Teaching Methods"
                          placeholder="Pedagogical approaches"
                          value={formik.values.teachingMethods}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          multiline
                          minRows={2}
                          size="small"
                          name="classActivities"
                          label="Class Activities"
                          placeholder="Hands-on tasks or group work"
                          value={formik.values.classActivities}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          multiline
                          minRows={2}
                          size="small"
                          name="completionCriteria"
                          label="Completion Criteria"
                          placeholder="Criteria to mark topic complete"
                          value={formik.values.completionCriteria}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Section 3: Chapter Overview & Detailed Description */}
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.75, bgcolor: 'background.paper' }}>
                    <Stack direction="row" alignItems="center" gap={1.25} mb={0.75}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '12px 12px 12px 3px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.1),
                          color: 'primary.main',
                          flexShrink: 0,
                        }}
                      >
                        <Iconify icon="solar:document-text-bold-duotone" width={18} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                          3. Chapter Overview & Detailed Description
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Rich-text description of key topics and coverage
                        </Typography>
                      </Box>
                    </Stack>
                    <Divider sx={{ my: 1.5 }} />
                    <Editor
                      value={formik.values.description}
                      onChange={(value) => formik.setFieldValue('description', value)}
                      placeholder="Describe what this chapter covers, key topics and learning outcomes…"
                      sx={{
                        border: (t) => `1px solid ${t.vars.palette.divider}`,
                        borderRadius: 1,
                        '&:hover': { borderColor: (t) => t.vars.palette.text.primary },
                        ...(!!formik.errors.description && {
                          borderColor: 'error.main',
                        }),
                        '&:focus-within': {
                          borderColor: (t) => t.vars.palette.primary.main,
                          borderWidth: 2,
                        },
                      }}
                    />
                  </Paper>

                  {/* Section 4: Summaries & Stakeholder Notes */}
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.75, bgcolor: 'background.paper' }}>
                    <Stack direction="row" alignItems="center" gap={1.25} mb={0.75}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '12px 12px 12px 3px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.1),
                          color: 'primary.main',
                          flexShrink: 0,
                        }}
                      >
                        <Iconify icon="solar:users-group-two-rounded-bold-duotone" width={18} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                          4. Summaries & Stakeholder Notes
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Dedicated guidance for teachers, students, and parents
                        </Typography>
                      </Box>
                    </Stack>
                    <Divider sx={{ my: 1.5 }} />
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          multiline
                          minRows={3}
                          size="small"
                          name="teacherNotes"
                          label="Teacher Notes"
                          placeholder="Internal notes for educators"
                          value={formik.values.teacherNotes}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          multiline
                          minRows={3}
                          size="small"
                          name="studentSummary"
                          label="Student Summary"
                          placeholder="Summary for students"
                          value={formik.values.studentSummary}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          multiline
                          minRows={3}
                          size="small"
                          name="parentSummary"
                          label="Parent Summary"
                          placeholder="Summary for parents"
                          value={formik.values.parentSummary}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Section 5: Resources & Study Materials */}
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.75, bgcolor: 'background.paper' }}>
                    <Stack direction="row" alignItems="center" gap={1.25} mb={0.75}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '12px 12px 12px 3px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.1),
                          color: 'primary.main',
                          flexShrink: 0,
                        }}
                      >
                        <Iconify icon="solar:library-bold-duotone" width={18} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                          5. Resources & Study Materials
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Links, worksheets, audio/video media, and board reference documents
                        </Typography>
                      </Box>
                    </Stack>
                    <Divider sx={{ my: 1.5 }} />
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          multiline
                          minRows={2}
                          size="small"
                          name="referenceLinks"
                          label="Reference Links"
                          placeholder="External reference URLs"
                          value={formik.values.referenceLinks}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          multiline
                          minRows={2}
                          size="small"
                          name="worksheets"
                          label="Worksheets"
                          placeholder="Worksheet titles or paths"
                          value={formik.values.worksheets}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          multiline
                          minRows={2}
                          size="small"
                          name="audioVideoMaterials"
                          label="Audio/Video Materials"
                          placeholder="Media references"
                          value={formik.values.audioVideoMaterials}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          multiline
                          minRows={2}
                          size="small"
                          name="boardDocuments"
                          label="Board Documents"
                          placeholder="Official board guidelines or docs"
                          value={formik.values.boardDocuments}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Section 6: Assessment & Metrics */}
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.75, bgcolor: 'background.paper' }}>
                    <Stack direction="row" alignItems="center" gap={1.25} mb={0.75}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '12px 12px 12px 3px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.1),
                          color: 'primary.main',
                          flexShrink: 0,
                        }}
                      >
                        <Iconify icon="solar:chart-square-bold-duotone" width={18} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                          6. Assessment & Weightage Metrics
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Exam weightage, question counts, bloom coverage and progress metrics
                        </Typography>
                      </Box>
                    </Stack>
                    <Divider sx={{ my: 1.5 }} />
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          name="assessmentMethod"
                          label="Assessment Method"
                          placeholder="e.g. Quiz, Exam, Project"
                          value={formik.values.assessmentMethod}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          name="questionTypes"
                          label="Question Types"
                          placeholder="e.g. MCQ, Short Answer"
                          value={formik.values.questionTypes}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          name="bloomCoverage"
                          label="Bloom Coverage"
                          placeholder="e.g. Remember, Understand"
                          value={formik.values.bloomCoverage}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          name="difficultyDistribution"
                          label="Difficulty Distribution"
                          placeholder="e.g. 30% Easy, 50% Med, 20% Hard"
                          value={formik.values.difficultyDistribution}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          name="marksWeightage"
                          label="Marks Weightage"
                          value={formik.values.marksWeightage ?? ''}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          name="questionCount"
                          label="Question Count"
                          value={formik.values.questionCount ?? ''}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          name="progressPercentage"
                          label="Progress %"
                          value={formik.values.progressPercentage ?? ''}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          name="healthScore"
                          label="Health Score"
                          value={formik.values.healthScore ?? ''}
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
                  borderTop: (t) => `1px solid ${t.vars.palette.divider}`,
                  bgcolor: 'background.paper',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: (t) => `-4px 0 16px ${varAlpha(t.vars.palette.grey['500Channel'], 0.06)}`,
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {additionalFieldsCount > 0
                    ? `${additionalFieldsCount} additional fields configured`
                    : 'No additional fields set'}
                </Typography>
                <LoadingButton
                  variant="contained"
                  size="small"
                  loading={isDoneSaving}
                  onClick={() => {
                    setIsDoneSaving(true);
                    setTimeout(() => {
                      setIsDoneSaving(false);
                      additionalFieldsDrawer.onFalse();
                    }, 700);
                  }}
                  startIcon={<Iconify icon="mdi:check-bold" width={16} />}
                >
                  Done & Save
                </LoadingButton>
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
