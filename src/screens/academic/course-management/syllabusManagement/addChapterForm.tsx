'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Editor } from 'src/components/editor';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import LoadingButton from '@mui/lab/LoadingButton';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { fileData } from 'src/components/file-thumbnail';
import { shikshaMitraToast } from 'src/components/toast';
import { SingleFilePreview } from 'src/components/upload';
import CustomTooltip from 'src/components/custom-tooltip';
import { FormSectionCard } from 'src/components/form-section-card';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import DocumentPreviewDialog from 'src/components/preview-document/DocumentPreviewDialog';
import {
  Box,
  Grid,
  Stack,
  Button,
  Drawer,
  MenuItem,
  TextField,
  IconButton,
  Typography,
  DialogActions,
} from '@mui/material';
import {
  useAddChapterWithAttachmentsMutation,
  useUpdateChapterWithAttachmentsMutation,
} from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api';

import { getChapterInitialValues } from './initialValues';
import { getChapterNumberApiError } from './chapterNumber';
import { getChapterValidationSchema } from './validationSchema';
import { buildChapterMultipartPayload } from './chapterMultipartPayload';
import { bloomOptions, difficultyOptions } from './syllabusPlanningData';
import { ChapterContextHeader } from './components/ChapterContextHeader';
import { ChapterDetailsSection } from './components/ChapterDetailsSection';
import { ChapterAttachmentsSection } from './components/ChapterAttachmentsSection';

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
  const [isDoneSaving, setIsDoneSaving] = useState(false);
  const previewDialog = useBoolean();
  const additionalFieldsDrawer = useBoolean(false);
  const [addChapter, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddChapterWithAttachmentsMutation,
    popupConfig: { error: false },
  });
  const [updateChapter, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateChapterWithAttachmentsMutation,
    popupConfig: { error: false },
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
    onSubmit: async (values, helpers) => {
      try {
        if (!classId || !subjectId) {
          shikshaMitraToast.error({
            message: 'Class and Subject must be selected before saving a chapter.',
          });
          return;
        }

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
            chapterNo: Number(values.chapterNo),
            chapterName: values.chapterName.trim(),
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            description: values.description,
            ...planningPayload,
          };

          await updateChapter({
            id: initialValues.id,
            body: buildChapterMultipartPayload(updatePayload, values.documents),
          }).unwrap();

          shikshaMitraToast.success({
            message: `Chapter ${values.chapterNo} updated successfully`,
          });
        } else {
          const postPayload = {
            chapterNo: Number(values.chapterNo),
            chapterName: values.chapterName.trim(),
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            description: values.description,
            ...planningPayload,
          };

          await addChapter({
            standardId: classId,
            subjectId,
            body: buildChapterMultipartPayload(postPayload, values.documents),
          }).unwrap();

          shikshaMitraToast.success({
            message: `Chapter ${values.chapterNo} added successfully`,
          });
        }
        onClose(null, true);
      } catch (error: unknown) {
        const chapterNumberError = getChapterNumberApiError(error);
        if (chapterNumberError) {
          helpers.setFieldTouched('chapterNo', true, false);
          helpers.setFieldError('chapterNo', chapterNumberError);
          return;
        }

        shikshaMitraToast.error({
          message: parseApiProblemDetail(error).detail,
        });
      }
    },
  });

  const handleDropzoneChange = (droppedFiles: any[]) => {
    const newFiles = droppedFiles.filter((f): f is File => f instanceof File);
    const existingFiles = droppedFiles
      .filter((f) => !(f instanceof File))
      .map((f) => (typeof f === 'string' ? f : f.url || f.filePath || ''))
      .filter(Boolean);

    formik.setFieldValue('documents', [...existingFiles, ...newFiles]);
    formik.setFieldTouched('documents', true, false);
  };

  const additionalFieldsCount = (() => {
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
  })();

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={1} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <ChapterContextHeader
              className={className}
              subject={subject}
              isEditing={Boolean(initialValues)}
            />

            <ChapterDetailsSection
              formik={formik}
              isEditing={Boolean(initialValues)}
              academicYearStart={currentYear?.startDate}
              academicYearEnd={currentYear?.endDate}
              additionalFieldsCount={additionalFieldsCount}
              onOpenAdditionalFields={additionalFieldsDrawer.onTrue}
            />

            {/* ── Section-Wise Right Drawer ─────────────────────────── */}
            <Drawer
              anchor="right"
              open={additionalFieldsDrawer.value}
              onClose={additionalFieldsDrawer.onFalse}
              PaperProps={{
                role: 'dialog',
                'aria-modal': true,
                'aria-label': 'Additional Chapter Details',
                sx: {
                  width: { xs: '100%', sm: 680, md: 760 },
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: (t) =>
                    `-8px 0 32px -4px ${varAlpha(t.vars.palette.common.blackChannel, 0.16)}`,
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
                  px: { xs: 2, sm: 3 },
                  py: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  flexShrink: 0,
                }}
              >
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography component="h2" variant="h6">
                      Additional Chapter Details
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
                            • <strong>Syllabus Planning:</strong> Unit name, term, topic name,
                            teaching days, and periods.
                          </Typography>
                          <Typography variant="caption" display="block" sx={{ mb: 0.75 }}>
                            • <strong>Pedagogy &amp; Taxonomies:</strong> Bloom levels, difficulty,
                            outcomes, skills, and activities.
                          </Typography>
                          <Typography variant="caption" display="block" sx={{ mb: 0.75 }}>
                            • <strong>Materials &amp; Assessment:</strong> Worksheets, board
                            documents, media links, and weightage.
                          </Typography>
                          <Typography variant="caption" display="block">
                            • <strong>Stakeholder Summaries:</strong> Notes for teachers, students,
                            and parents.
                          </Typography>
                        </Box>
                      }
                    >
                      <IconButton
                        aria-label="Additional chapter details information"
                        size="small"
                        color="info"
                        sx={{ p: 0.5, ml: 0.25 }}
                      >
                        <Iconify icon={GlobalIcons.info} width={18} />
                      </IconButton>
                    </CustomTooltip>
                  </Stack>
                </Box>

                <IconButton
                  aria-label="Close additional chapter details"
                  onClick={additionalFieldsDrawer.onFalse}
                  size="small"
                >
                  <Iconify icon={GlobalIcons.cancel} width={20} />
                </IconButton>
              </Stack>

              {/* Drawer Body - Section-Wise Content */}
              <Scrollbar sx={{ p: { xs: 2, sm: 3 }, flex: 1, minHeight: 0 }}>
                <Stack spacing={2}>
                  {/* Section 1: Planning & Scheduling */}
                  <FormSectionCard
                    title="Planning & Scheduling"
                    icon={GlobalIcons.calendar}
                    descriptionTooltip="Define unit, term, topic name and time allocations."
                  >
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
                          label="Teaching days"
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
                          label="Estimated periods"
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
                          label="Revision days"
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
                          label="Buffer days"
                          value={formik.values.bufferDays ?? ''}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                    </Grid>
                  </FormSectionCard>

                  {/* Section 2: Pedagogy & Learning Objectives */}
                  <FormSectionCard
                    title="Pedagogy & Learning Objectives"
                    icon={GlobalIcons.notebook}
                    descriptionTooltip="Set difficulty, taxonomy, outcomes and teaching methodology."
                  >
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
                          label="Bloom level"
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
                          label="Learning outcomes"
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
                          label="Skills covered"
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
                          label="Teaching methods"
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
                          label="Class activities"
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
                          label="Completion criteria"
                          placeholder="Criteria to mark topic complete"
                          value={formik.values.completionCriteria}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                    </Grid>
                  </FormSectionCard>

                  {/* Section 3: Chapter Overview & Detailed Description */}
                  <FormSectionCard
                    title="Chapter Overview & Detailed Description"
                    icon={GlobalIcons.documentIcon}
                    descriptionTooltip="Describe key topics and coverage with formatted text."
                  >
                    <Editor
                      editorProps={{
                        attributes: { 'aria-label': 'Chapter overview and detailed description' },
                      }}
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
                  </FormSectionCard>

                  {/* Section 4: Summaries & Stakeholder Notes */}
                  <FormSectionCard
                    title="Summaries & Stakeholder Notes"
                    icon={GlobalIcons.assigned}
                    descriptionTooltip="Provide dedicated guidance for teachers, students, and parents."
                  >
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          multiline
                          minRows={3}
                          size="small"
                          name="teacherNotes"
                          label="Teacher notes"
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
                          label="Student summary"
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
                          label="Parent summary"
                          placeholder="Summary for parents"
                          value={formik.values.parentSummary}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                    </Grid>
                  </FormSectionCard>

                  {/* Section 5: Resources & Study Materials */}
                  <FormSectionCard
                    title="Resources & Study Materials"
                    icon={GlobalIcons.issueBook}
                    descriptionTooltip="Record links, worksheets, audio/video media, and board reference documents."
                  >
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          multiline
                          minRows={2}
                          size="small"
                          name="referenceLinks"
                          label="Reference links"
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
                          label="Audio/video materials"
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
                          label="Board documents"
                          placeholder="Official board guidelines or docs"
                          value={formik.values.boardDocuments}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                    </Grid>
                  </FormSectionCard>

                  {/* Section 6: Assessment & Metrics */}
                  <FormSectionCard
                    title="Assessment & Weightage Metrics"
                    icon={GlobalIcons.usage}
                    descriptionTooltip="Set exam weightage, question counts and Bloom coverage."
                  >
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          name="assessmentMethod"
                          label="Assessment method"
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
                          label="Question types"
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
                          label="Bloom coverage"
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
                          label="Difficulty distribution"
                          placeholder="e.g. 30% Easy, 50% Med, 20% Hard"
                          value={formik.values.difficultyDistribution}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          name="marksWeightage"
                          label="Marks weightage"
                          value={formik.values.marksWeightage ?? ''}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          name="questionCount"
                          label="Question count"
                          value={formik.values.questionCount ?? ''}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          name="healthScore"
                          label="Health score"
                          value={formik.values.healthScore ?? ''}
                          onChange={formik.handleChange}
                        />
                      </Grid>
                    </Grid>
                  </FormSectionCard>
                </Stack>
              </Scrollbar>

              {/* Drawer Sticky Footer */}
              <Box
                sx={{
                  py: 1.75,
                  px: { xs: 2, sm: 3 },
                  borderTop: (t) => `1px solid ${t.vars.palette.divider}`,
                  bgcolor: 'background.paper',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexShrink: 0,
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {additionalFieldsCount > 0
                    ? `${additionalFieldsCount} additional fields configured`
                    : 'No additional fields set'}
                </Typography>
                <LoadingButton
                  type="button"
                  variant="contained"
                  color="inherit"
                  size="small"
                  loading={isDoneSaving}
                  onClick={() => {
                    setIsDoneSaving(true);
                    setTimeout(() => {
                      setIsDoneSaving(false);
                      additionalFieldsDrawer.onFalse();
                    }, 700);
                  }}
                  startIcon={<Iconify icon={GlobalIcons.submit} width={16} />}
                >
                  Submit
                </LoadingButton>
              </Box>
            </Drawer>

            {/* ── Section 3 : Attachments ──────────────────────────── */}
            <ChapterAttachmentsSection
              documents={(formik.values.documents ?? []).map((doc: any) => {
                if (typeof doc === 'string') {
                  return {
                    url: doc,
                    filePath: doc,
                    name: getFileNameFromUrl(doc),
                    size: undefined,
                  };
                }
                return doc;
              })}
              onChange={handleDropzoneChange}
              onPreview={(file) => {
                const url =
                  file instanceof File
                    ? URL.createObjectURL(file)
                    : file.url || file.filePath || '';
                setPreviewDoc(url);
              }}
            />
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
              Submit
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
