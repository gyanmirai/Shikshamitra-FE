'use client';

import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import CancelButton from 'src/components/cancel-button';
import { varAlpha, stylesMode } from 'src/theme/styles';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useId, useRef, useMemo, useState, useEffect } from 'react';
import CustomUpload from 'src/components/custom-upload/custom-upload';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { LanguageInputField } from 'src/screens/academic/components/language-typing';
import { useGetChaptersByStandardQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import {
  useCreateQuestionMutation,
  useGetQuestionBankSettingsQuery,
  useLazyDownloadQuestionBulkTemplateQuery,
} from 'src/redux/academicAPI/ExaminationApi/QuestionBankApi/question-bank-api';
import {
  Box,
  Grid,
  Alert,
  Paper,
  Radio,
  Stack,
  Button,
  Switch,
  Tooltip,
  Checkbox,
  Collapse,
  TextField,
  IconButton,
  RadioGroup,
  Typography,
  FormControl,
  ToggleButton,
  DialogActions,
  FormHelperText,
  FormControlLabel,
  ToggleButtonGroup,
} from '@mui/material';

import { QuestionFormSection as Section } from './QuestionFormSection';
import {
  toQuestionBody,
  createAnswerOptions,
  createNextQuestionValues,
  createInitialQuestionValues,
  buildQuestionValidationSchema,
} from './questionFormModel';

import type { QuestionFormValues } from './questionFormModel';

const QUESTION_TYPE_OPTIONS = [
  { value: 1, label: 'MCQ - Single Correct' },
  { value: 2, label: 'MCQ - Multiple Correct' },
  { value: 3, label: 'True / False' },
  { value: 4, label: 'Fill in the Blank' },
  { value: 5, label: 'Short Answer' },
  { value: 6, label: 'Long Answer' },
  { value: 7, label: 'Match the Following' },
  { value: 8, label: 'Assertion & Reason' },
  { value: 9, label: 'Case Study' },
  { value: 10, label: 'Diagram Based' },
  { value: 11, label: 'Practical' },
];

const DIFFICULTY_OPTIONS = [
  { value: 1, label: 'Easy' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Hard' },
];

const BLOOM_OPTIONS = [
  { value: 1, label: 'Remembering' },
  { value: 2, label: 'Understanding' },
  { value: 3, label: 'Applying' },
  { value: 4, label: 'Analyzing' },
  { value: 5, label: 'Evaluating' },
  { value: 6, label: 'Creating' },
];

const VISIBILITY_OPTIONS = [
  { value: 1, label: 'Public' },
  { value: 2, label: 'Internal / School' },
  { value: 3, label: 'Private' },
];

const ANSWER_KEY_TYPES = [4, 5, 6];

function buildSubjectOptions(data: any) {
  const options: { value: string; label: string }[] = [];

  data?.data?.items?.forEach((item: any) => {
    if (item.subjects?.length > 1 && item.electiveGroupName) {
      item.subjects.forEach((subject: any, index: number) => {
        options.push({
          value: subject.subjectId,
          label: subject.subjectName || `${item.electiveGroupName} ${index + 1}`,
        });
      });
    } else {
      options.push({
        value: item.subjects?.[0]?.subjectId || item.id,
        label: item.subjects?.[0]?.subject?.name || item.subjects?.[0]?.subjectName || '',
      });
    }
  });

  return options;
}

function buildQuestionTemplateFileName(chapterName?: string) {
  const safeChapter = String(chapterName || 'questions')
    .trim()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  return `question-bank-${safeChapter || 'questions'}-template.xlsx`;
}

function triggerTemplateDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function collectErrorMessages(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectErrorMessages);
  if (value && typeof value === 'object') return Object.values(value).flatMap(collectErrorMessages);
  return [];
}

function CreationModeSelector({
  value,
  onChange,
}: {
  value: 'manual' | 'upload';
  onChange: (value: 'manual' | 'upload') => void;
}) {
  return (
    <Stack alignItems="center" spacing={0.75}>
      <ToggleButtonGroup
        exclusive
        size="small"
        color="primary"
        value={value}
        onChange={(_, nextValue) => nextValue && onChange(nextValue)}
        aria-label="Question creation mode"
      >
        <ToggleButton value="manual" aria-label="Manual entry">
          <Iconify icon={GlobalIcons.edit} sx={{ mr: 1, width: 16, height: 16 }} />
          Manual entry
        </ToggleButton>
        <ToggleButton value="upload" aria-label="Bulk upload">
          <Iconify icon={GlobalIcons.upload} sx={{ mr: 1, width: 16, height: 16 }} />
          Bulk upload
        </ToggleButton>
      </ToggleButtonGroup>
      <Typography variant="caption" color="text.secondary">
        {value === 'manual'
          ? 'Create one question at a time.'
          : 'Add multiple questions using an Excel template.'}
      </Typography>
    </Stack>
  );
}

function ContextSection({
  formik,
  classOptions,
  subjectOptions,
  chapterOptions,
  isSubjectLoading,
  isChapterLoading,
  settings,
}: {
  formik: FormikProps<QuestionFormValues>;
  classOptions: { value: string; label: string }[];
  subjectOptions: { value: string; label: string }[];
  chapterOptions: { value: string; label: string }[];
  isSubjectLoading: boolean;
  isChapterLoading: boolean;
  settings: any;
}) {
  return (
    <Section title="Question Context" description="Select where this question belongs.">
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <ShakingTextField error={formik.touched.standardId && !!formik.errors.standardId}>
            <CustomSelect
              label="Class *"
              options={classOptions}
              value={formik.values.standardId}
              onChange={(value) => {
                formik.setFieldValue('standardId', String(value));
                formik.setFieldValue('subjectId', '');
                formik.setFieldValue('chapterId', '');
              }}
              error={formik.touched.standardId && !!formik.errors.standardId}
              helperText={(formik.touched.standardId && formik.errors.standardId) || ''}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <ShakingTextField error={formik.touched.subjectId && !!formik.errors.subjectId}>
            <CustomSelect
              label="Subject *"
              options={subjectOptions}
              value={formik.values.subjectId}
              disabled={!formik.values.standardId}
              isLoading={isSubjectLoading}
              onChange={(value) => {
                formik.setFieldValue('subjectId', String(value));
                formik.setFieldValue('chapterId', '');
              }}
              error={formik.touched.subjectId && !!formik.errors.subjectId}
              helperText={(formik.touched.subjectId && formik.errors.subjectId) || ''}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <ShakingTextField error={formik.touched.chapterId && !!formik.errors.chapterId}>
            <CustomSelect
              label={`Chapter${settings?.requireChapter ? ' *' : ''}`}
              options={[{ value: '', label: 'No Chapter' }, ...chapterOptions]}
              value={formik.values.chapterId}
              disabled={!formik.values.subjectId}
              isLoading={isChapterLoading}
              onChange={(value) => formik.setFieldValue('chapterId', String(value))}
              error={formik.touched.chapterId && !!formik.errors.chapterId}
              helperText={(formik.touched.chapterId && formik.errors.chapterId) || ''}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <ShakingTextField error={formik.touched.topicName && !!formik.errors.topicName}>
            <LanguageInputField
              fullWidth
              size="small"
              label={`Topic${settings?.requireTopic ? ' *' : ''}`}
              name="topicName"
              value={formik.values.topicName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.topicName && !!formik.errors.topicName}
              helperText={(formik.touched.topicName && formik.errors.topicName) || ''}
              placeholder="Enter topic name"
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </Section>
  );
}

function ObjectiveAnswerEditor({ formik }: { formik: FormikProps<QuestionFormValues> }) {
  const questionType = Number(formik.values.questionType);
  const isSingleCorrect = questionType === 1;
  const isTrueFalse = questionType === 3;
  const optionsError = typeof formik.errors.options === 'string' ? formik.errors.options : '';

  const updateCorrectAnswer = (index: number, checked: boolean) => {
    const options = formik.values.options.map((option, optionIndex) => ({
      ...option,
      isCorrect:
        isSingleCorrect || isTrueFalse
          ? checked && optionIndex === index
          : optionIndex === index
            ? checked
            : option.isCorrect,
    }));
    formik.setFieldValue('options', options);
  };

  if (isTrueFalse) {
    const selectedIndex = Math.max(
      0,
      formik.values.options.findIndex((option) => option.isCorrect)
    );

    return (
      <FormControl error={Boolean(optionsError)}>
        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
          Correct answer
        </Typography>
        <RadioGroup
          row
          value={selectedIndex}
          onChange={(event) => updateCorrectAnswer(Number(event.target.value), true)}
          aria-label="Correct answer"
        >
          {formik.values.options.map((option, index) => (
            <FormControlLabel
              key={option.optionText}
              value={index}
              control={<Radio size="small" />}
              label={option.optionText}
            />
          ))}
        </RadioGroup>
        {optionsError && <FormHelperText>{optionsError}</FormHelperText>}
      </FormControl>
    );
  }

  return (
    <Stack spacing={1}>
      <Box>
        <Typography variant="body2" fontWeight={600}>
          Options
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {isSingleCorrect ? 'Select the correct answer.' : 'Select all correct answers.'}
        </Typography>
      </Box>
      {formik.values.options.map((option, index) => {
        const optionError = (formik.errors.options as any)?.[index]?.optionText;
        const showOptionError = Boolean(formik.submitCount && optionError);

        return (
          <Paper
            key={index}
            variant="outlined"
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
              p: 1,
              borderRadius: 1.25,
              borderColor: option.isCorrect ? 'success.main' : 'divider',
              bgcolor: option.isCorrect
                ? (theme) => varAlpha(theme.vars.palette.success.mainChannel, 0.06)
                : 'background.paper',
            }}
          >
            {isSingleCorrect ? (
              <Radio
                size="small"
                checked={option.isCorrect}
                onChange={() => updateCorrectAnswer(index, true)}
                inputProps={{ 'aria-label': `Mark option ${index + 1} as correct` }}
              />
            ) : (
              <Checkbox
                size="small"
                checked={option.isCorrect}
                onChange={(_, checked) => updateCorrectAnswer(index, checked)}
                inputProps={{ 'aria-label': `Mark option ${index + 1} as correct` }}
              />
            )}
            <LanguageInputField
              fullWidth
              size="small"
              label={`Option ${String.fromCharCode(65 + index)}`}
              name={`options[${index}].optionText`}
              value={option.optionText}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={showOptionError}
              helperText={showOptionError ? optionError : ''}
            />
            {formik.values.options.length > 2 && (
              <Tooltip title="Remove option">
                <IconButton
                  type="button"
                  size="small"
                  color="error"
                  aria-label={`Remove option ${index + 1}`}
                  onClick={() =>
                    formik.setFieldValue(
                      'options',
                      formik.values.options.filter((_, optionIndex) => optionIndex !== index)
                    )
                  }
                >
                  <Iconify icon={GlobalIcons.delete} />
                </IconButton>
              </Tooltip>
            )}
          </Paper>
        );
      })}
      <Button
        type="button"
        size="small"
        variant="outlined"
        startIcon={<Iconify icon={GlobalIcons.addIcon} />}
        onClick={() =>
          formik.setFieldValue('options', [
            ...formik.values.options,
            {
              optionText: '',
              isCorrect: false,
              sortOrder: formik.values.options.length + 1,
            },
          ])
        }
        sx={{ alignSelf: 'flex-start' }}
      >
        Add option
      </Button>
      {formik.submitCount > 0 && optionsError && <Alert severity="error">{optionsError}</Alert>}
    </Stack>
  );
}

function AnswerSection({
  formik,
  settings,
}: {
  formik: FormikProps<QuestionFormValues>;
  settings: any;
}) {
  const questionType = Number(formik.values.questionType);

  if ([1, 2, 3].includes(questionType)) return <ObjectiveAnswerEditor formik={formik} />;

  if (ANSWER_KEY_TYPES.includes(questionType)) {
    const labels: Record<number, string> = {
      4: 'Correct answer',
      5: 'Expected answer / answer key',
      6: 'Model answer / answer key',
    };

    return (
      <ShakingTextField error={formik.touched.answerKey && !!formik.errors.answerKey}>
        <LanguageInputField
          fullWidth
          multiline={questionType !== 4}
          minRows={questionType === 6 ? 4 : 2}
          size="small"
          label={`${labels[questionType]}${settings?.requireAnswerKey ? ' *' : ''}`}
          name="answerKey"
          value={formik.values.answerKey}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.answerKey && !!formik.errors.answerKey}
          helperText={(formik.touched.answerKey && formik.errors.answerKey) || ''}
        />
      </ShakingTextField>
    );
  }

  return (
    <Alert severity="info">
      Write the question in Question text and add evaluation guidance in Advanced Details.
    </Alert>
  );
}

function UploadSection({
  formik,
  onDownloadTemplate,
  isTemplateDownloading,
}: {
  formik: FormikProps<QuestionFormValues>;
  onDownloadTemplate: () => void;
  isTemplateDownloading: boolean;
}) {
  return (
    <Section
      title="Bulk Upload"
      description="Add multiple questions using the project Excel template."
    >
      <Alert
        severity="info"
        action={
          <Button
            size="small"
            color="inherit"
            startIcon={<Iconify icon={GlobalIcons.download} />}
            disabled={isTemplateDownloading}
            onClick={onDownloadTemplate}
          >
            {isTemplateDownloading ? 'Downloading...' : 'Download template'}
          </Button>
        }
      >
        Complete the required template columns before selecting the Excel or CSV file.
      </Alert>
      <CustomUpload
        multiple={false}
        label="Drag & drop Excel/CSV question sheet, or click to browse"
        secondaryText="Supports .xlsx, .xls, .csv up to 5MB"
        value={formik.values.file ? [formik.values.file] : []}
        onChange={(files) => formik.setFieldValue('file', files[0] || null)}
        onDelete={() => formik.setFieldValue('file', null)}
      />
    </Section>
  );
}

interface CreateQuestionDialogProps {
  open: boolean;
  onClose: () => void;
  initialStandardId?: string;
  initialSubjectId?: string;
  initialChapterId?: string;
  initialTopicName?: string;
  chapterName?: string;
}

export default function CreateQuestionDialog({
  open,
  onClose,
  initialStandardId = '',
  initialSubjectId = '',
  initialChapterId = '',
  initialTopicName = '',
  chapterName,
}: CreateQuestionDialogProps) {
  const advancedContentId = useId();
  const { currentYear, currentMedium: medium } = useSelector(
    (state: RootState) => state.globalState
  );
  const academicYearId = currentYear?.id || '';
  const questionTextRef = useRef<HTMLInputElement>(null);
  const submitIntentRef = useRef<'close' | 'another'>('close');
  const [creationMode, setCreationMode] = useState<'manual' | 'upload'>('manual');
  const [activeSubmit, setActiveSubmit] = useState<'close' | 'another' | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [savedAnother, setSavedAnother] = useState(false);

  const initialValues = useMemo(
    () =>
      createInitialQuestionValues(academicYearId, {
        standardId: initialStandardId,
        subjectId: initialSubjectId,
        chapterId: initialChapterId,
        topicName: initialTopicName,
      }),
    [academicYearId, initialChapterId, initialStandardId, initialSubjectId, initialTopicName]
  );
  const allClasses = useMemo(
    () => medium?.educationMediumStages?.flatMap((stage: any) => stage.standards || []) || [],
    [medium]
  );
  const classOptions = useMemo(
    () => allClasses.map((item: any) => ({ value: item.id, label: item.name })),
    [allClasses]
  );

  const {
    data: settings,
    isLoading: isSettingsLoading,
    isFetching: isSettingsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetQuestionBankSettingsQuery,
    params: { academicYearId },
    options: { skip: !academicYearId || !open },
  });
  const [createQuestion, createState] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateQuestionMutation,
  });
  const [downloadTemplate, downloadTemplateState] = useLazyDownloadQuestionBulkTemplateQuery();

  const validationSchema = useMemo(() => {
    if (creationMode === 'upload') {
      return Yup.object({
        standardId: Yup.string().required('Select a Class.'),
        subjectId: Yup.string().required('Select a Subject.'),
      });
    }
    return buildQuestionValidationSchema(settings);
  }, [creationMode, settings]);

  const formik = useFormik<QuestionFormValues>({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, helpers) => {
      try {
        if (creationMode === 'upload') {
          if (!values.file) {
            shikshaMitraToast.error({ message: 'Select a template file to upload.' });
            return;
          }
          shikshaMitraToast.success({ message: 'Question file uploaded successfully!' });
          helpers.resetForm({ values: initialValues });
          onClose();
          return;
        }

        await createQuestion(toQuestionBody(values)).unwrap();
        if (submitIntentRef.current === 'another') {
          helpers.resetForm({ values: createNextQuestionValues(values) });
          setSavedAnother(true);
          shikshaMitraToast.success({ message: 'Question saved. Add your next question.' });
          setTimeout(() => questionTextRef.current?.focus(), 0);
          return;
        }

        shikshaMitraToast.success({ message: 'Question created successfully.' });
        helpers.resetForm({ values: initialValues });
        onClose();
      } catch (error: any) {
        shikshaMitraToast.error({
          message:
            error?.data?.detail ||
            error?.data?.error?.message ||
            'Unable to save this question. Your entered data has been kept.',
        });
      } finally {
        setActiveSubmit(null);
      }
    },
  });

  const {
    data: subjectData,
    isLoading: isSubjectLoading,
    isFetching: isSubjectFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentsQuery,
    params: { standardId: formik.values.standardId },
    options: { skip: !formik.values.standardId || !open },
  });
  const subjectOptions = useMemo(() => buildSubjectOptions(subjectData), [subjectData]);
  const {
    data: chapters,
    isLoading: isChapterLoading,
    isFetching: isChapterFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChaptersByStandardQuery,
    params: { standardId: formik.values.standardId, subjectId: formik.values.subjectId },
    options: { skip: !formik.values.standardId || !formik.values.subjectId || !open },
  });
  const chapterOptions = useMemo(
    () =>
      (chapters || []).map((chapter: any) => ({
        value: chapter.id,
        label: `${chapter.chapterNumber}. ${chapter.chapterName}`,
      })),
    [chapters]
  );

  const errorMessages = useMemo(
    () => Array.from(new Set(collectErrorMessages(formik.errors))),
    [formik.errors]
  );
  const retainedContext = useMemo(() => {
    const classLabel = classOptions.find(
      (item: { value: string; label: string }) => item.value === formik.values.standardId
    )?.label;
    const subjectLabel = subjectOptions.find(
      (item: { value: string; label: string }) => item.value === formik.values.subjectId
    )?.label;
    const chapterLabel = chapterOptions.find(
      (item: any) => item.value === formik.values.chapterId
    )?.label;
    return [classLabel, subjectLabel, chapterLabel, formik.values.topicName]
      .filter(Boolean)
      .join(' · ');
  }, [chapterOptions, classOptions, formik.values, subjectOptions]);

  useEffect(() => {
    if (open && settings?.requireLearningOutcome) setAdvancedOpen(true);
  }, [open, settings?.requireLearningOutcome]);

  useEffect(() => {
    if (formik.submitCount > 0 && formik.errors.learningOutcome) setAdvancedOpen(true);
  }, [formik.errors.learningOutcome, formik.submitCount]);

  const handleTypeChange = (questionType: number) => {
    formik.setFieldValue('questionType', questionType);
    formik.setFieldValue('options', createAnswerOptions(questionType));
    formik.setFieldValue('answerKey', '');
    setSavedAnother(false);
  };

  const handleClose = () => {
    setCreationMode('manual');
    setAdvancedOpen(false);
    setSavedAnother(false);
    setActiveSubmit(null);
    formik.resetForm({ values: initialValues });
    onClose();
  };

  const handleDownloadTemplate = async () => {
    try {
      const template = await downloadTemplate(undefined, false).unwrap();
      triggerTemplateDownload(template, buildQuestionTemplateFileName(chapterName));
      shikshaMitraToast.success({ message: 'Excel template downloaded successfully.' });
    } catch {
      shikshaMitraToast.error({ message: 'Failed to download Excel template. Please try again.' });
    }
  };

  const submit = (intent: 'close' | 'another') => {
    if (createState.isLoading || isSettingsLoading || isSettingsFetching) return;
    submitIntentRef.current = intent;
    setActiveSubmit(intent);
    formik.submitForm();
  };

  return (
    <CustomDialog
      open={open}
      handleClose={handleClose}
      title={chapterName ? `Create Question - ${chapterName}` : 'Create New Question'}
      titleInfo="Add a question to the Question Bank. You can create another with the same context after saving."
      disableClose={createState.isLoading}
      maxWidth="md"
      hasForm={false}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit('close');
        }}
        style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
      >
        <DialogScrollContent>
          <Stack spacing={2}>
            <CreationModeSelector
              value={creationMode}
              onChange={(value) => {
                setCreationMode(value);
                setSavedAnother(false);
              }}
            />

            {formik.submitCount > 0 && errorMessages.length > 0 && (
              <Alert severity="error">
                <Typography variant="subtitle2">
                  Please fix {errorMessages.length} {errorMessages.length === 1 ? 'item' : 'items'}
                  before saving.
                </Typography>
                <Box component="ul" sx={{ pl: 2.5, my: 0.5 }}>
                  {errorMessages.slice(0, 4).map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </Box>
              </Alert>
            )}

            {savedAnother && creationMode === 'manual' && (
              <Alert severity="success" icon={<Iconify icon="mingcute:check-circle-fill" />}>
                <Typography variant="subtitle2">
                  Question saved. Ready for the next question.
                </Typography>
                {retainedContext && (
                  <Typography variant="caption">Creating in: {retainedContext}</Typography>
                )}
              </Alert>
            )}

            <ContextSection
              formik={formik}
              classOptions={classOptions}
              subjectOptions={subjectOptions}
              chapterOptions={chapterOptions}
              isSubjectLoading={isSubjectLoading || isSubjectFetching}
              isChapterLoading={isChapterLoading || isChapterFetching}
              settings={settings}
            />

            {creationMode === 'upload' ? (
              <UploadSection
                formik={formik}
                onDownloadTemplate={handleDownloadTemplate}
                isTemplateDownloading={downloadTemplateState.isFetching}
              />
            ) : (
              <>
                <Section
                  title="Question"
                  description="Choose the question type, scoring, and prompt."
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <CustomSelect
                        label="Question type *"
                        options={QUESTION_TYPE_OPTIONS}
                        value={formik.values.questionType}
                        onChange={(value) => handleTypeChange(Number(value))}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <ShakingTextField error={formik.touched.marks && !!formik.errors.marks}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Marks *"
                          name="marks"
                          value={formik.values.marks}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.marks && !!formik.errors.marks}
                          helperText={(formik.touched.marks && formik.errors.marks) || ''}
                          inputProps={{ min: 0.5, step: 0.5 }}
                        />
                      </ShakingTextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <ShakingTextField
                        error={formik.touched.difficultyLevel && !!formik.errors.difficultyLevel}
                      >
                        <CustomSelect
                          label={`Difficulty${settings?.requireDifficulty ? ' *' : ''}`}
                          options={DIFFICULTY_OPTIONS}
                          value={formik.values.difficultyLevel || ''}
                          onChange={(value) =>
                            formik.setFieldValue('difficultyLevel', Number(value))
                          }
                          error={formik.touched.difficultyLevel && !!formik.errors.difficultyLevel}
                          helperText={
                            (formik.touched.difficultyLevel && formik.errors.difficultyLevel) ||
                            'Choose how difficult this is for the selected class.'
                          }
                        />
                      </ShakingTextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <ShakingTextField
                        error={formik.touched.bloomLevel && !!formik.errors.bloomLevel}
                      >
                        <CustomSelect
                          label={`Bloom's level${settings?.requireBloomLevel ? ' *' : ''}`}
                          options={BLOOM_OPTIONS}
                          value={formik.values.bloomLevel || ''}
                          onChange={(value) => formik.setFieldValue('bloomLevel', Number(value))}
                          error={formik.touched.bloomLevel && !!formik.errors.bloomLevel}
                          helperText={
                            (formik.touched.bloomLevel && formik.errors.bloomLevel) ||
                            'Choose the level of thinking required.'
                          }
                        />
                      </ShakingTextField>
                    </Grid>
                    <Grid size={12}>
                      <ShakingTextField
                        error={formik.touched.questionText && !!formik.errors.questionText}
                      >
                        <LanguageInputField
                          inputRef={questionTextRef}
                          fullWidth
                          multiline
                          minRows={4}
                          label="Question text *"
                          name="questionText"
                          value={formik.values.questionText}
                          onChange={(event) => {
                            formik.handleChange(event);
                            setSavedAnother(false);
                          }}
                          onBlur={formik.handleBlur}
                          error={formik.touched.questionText && !!formik.errors.questionText}
                          helperText={
                            (formik.touched.questionText && formik.errors.questionText) ||
                            'Enter the question students will see.'
                          }
                        />
                      </ShakingTextField>
                    </Grid>
                  </Grid>
                </Section>

                <Section
                  title="Answer"
                  description="Provide the answer format for this question type."
                >
                  <AnswerSection formik={formik} settings={settings} />
                </Section>

                <Section
                  title="Advanced Details"
                  description="Optional information for search, evaluation, and analysis."
                  action={
                    <IconButton
                      type="button"
                      size="small"
                      aria-label={`${advancedOpen ? 'Collapse' : 'Expand'} advanced details`}
                      aria-expanded={advancedOpen}
                      aria-controls={advancedContentId}
                      onClick={() => setAdvancedOpen((value) => !value)}
                    >
                      <Iconify icon={advancedOpen ? 'mingcute:up-line' : 'mingcute:down-line'} />
                    </IconButton>
                  }
                >
                  <Collapse in={advancedOpen} id={advancedContentId}>
                    <Grid container spacing={2}>
                      {settings?.enableNegativeMarking && (
                        <Grid size={12}>
                          <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={1}
                            alignItems={{ sm: 'center' }}
                          >
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={formik.values.negativeMarks !== ''}
                                  onChange={(_, checked) =>
                                    formik.setFieldValue('negativeMarks', checked ? 0.25 : '')
                                  }
                                />
                              }
                              label="Enable negative marking"
                            />
                            {formik.values.negativeMarks !== '' && (
                              <TextField
                                size="small"
                                type="number"
                                label="Negative marks"
                                name="negativeMarks"
                                value={formik.values.negativeMarks}
                                onChange={formik.handleChange}
                                inputProps={{ min: 0, step: 0.25 }}
                                sx={{ width: { xs: '100%', sm: 180 } }}
                              />
                            )}
                          </Stack>
                        </Grid>
                      )}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <ShakingTextField
                          error={formik.touched.learningOutcome && !!formik.errors.learningOutcome}
                        >
                          <LanguageInputField
                            fullWidth
                            size="small"
                            label={`Learning outcome${settings?.requireLearningOutcome ? ' *' : ''}`}
                            name="learningOutcome"
                            value={formik.values.learningOutcome}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={
                              formik.touched.learningOutcome && !!formik.errors.learningOutcome
                            }
                            helperText={
                              (formik.touched.learningOutcome && formik.errors.learningOutcome) ||
                              ''
                            }
                          />
                        </ShakingTextField>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Tags"
                          name="tagsText"
                          value={formik.values.tagsText}
                          onChange={formik.handleChange}
                          placeholder="algebra, quadratic, class10"
                          helperText="Separate tags with commas."
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CustomSelect
                          label="Visibility"
                          options={VISIBILITY_OPTIONS}
                          value={formik.values.visibility}
                          onChange={(value) => formik.setFieldValue('visibility', Number(value))}
                        />
                      </Grid>
                      <Grid size={12}>
                        <LanguageInputField
                          fullWidth
                          multiline
                          minRows={3}
                          label="Explanation / marking scheme"
                          name="explanation"
                          value={formik.values.explanation}
                          onChange={(event) => {
                            formik.setFieldValue('explanation', event.target.value);
                            formik.setFieldValue('markingScheme', event.target.value);
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Collapse>
                </Section>
              </>
            )}
          </Stack>
        </DialogScrollContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            justifyContent: 'space-between',
            bgcolor: (theme) => varAlpha(theme.vars.palette.background.paperChannel, 0.96),
            [stylesMode.dark]: { bgcolor: 'background.paper' },
          }}
        >
          <CancelButton onClick={handleClose} />
          <Stack direction="row" spacing={1}>
            <LoadingButton
              type="submit"
              size="small"
              variant={creationMode === 'manual' ? 'outlined' : 'contained'}
              loading={createState.isLoading && activeSubmit === 'close'}
              disabled={createState.isLoading || isSettingsLoading || isSettingsFetching}
              startIcon={
                <Iconify
                  icon={creationMode === 'upload' ? GlobalIcons.upload : GlobalIcons.submit}
                />
              }
            >
              {creationMode === 'upload' ? 'Upload questions' : 'Save draft'}
            </LoadingButton>
            {creationMode === 'manual' && (
              <LoadingButton
                type="button"
                size="small"
                variant="contained"
                loading={createState.isLoading && activeSubmit === 'another'}
                disabled={createState.isLoading || isSettingsLoading || isSettingsFetching}
                startIcon={<Iconify icon={GlobalIcons.addIcon} />}
                onClick={() => submit('another')}
              >
                Save & add another
              </LoadingButton>
            )}
          </Stack>
        </DialogActions>
      </form>
    </CustomDialog>
  );
}
