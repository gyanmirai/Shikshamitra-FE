'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomUpload from 'src/components/custom-upload/custom-upload';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useCreateQuestionMutation } from 'src/redux/academicAPI/ExaminationApi/QuestionBankApi/question-bank-api';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import { useGetChaptersByStandardQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api';
import {
  Box,
  Grid,
  Alert,
  Stack,
  Button,
  Switch,
  Tooltip,
  TextField,
  Typography,
  IconButton,
  ToggleButton,
  DialogActions,
  ToggleButtonGroup,
} from '@mui/material';

// ─── Constants ────────────────────────────────────────────────────────────────

const QUESTION_TYPE_OPTIONS = [
  { value: 1, label: 'MCQ – Single Correct' },
  { value: 2, label: 'MCQ – Multiple Correct' },
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

// ─── Validation ───────────────────────────────────────────────────────────────

const questionValidationSchema = Yup.object({
  standardId: Yup.string().required('Class is required'),
  subjectId: Yup.string().required('Subject is required'),
  questionText: Yup.string().required('Question text is required').min(5, 'Too short'),
  questionType: Yup.number().required(),
  marks: Yup.number()
    .typeError('Enter a valid number')
    .required('Marks are required')
    .min(0.5, 'Minimum 0.5')
    .max(100, 'Maximum 100'),
  difficultyLevel: Yup.number().required(),
  options: Yup.array().when('questionType', {
    is: (type: number) => [1, 2, 3].includes(Number(type)),
    then: (schema) =>
      schema
        .of(
          Yup.object({
            optionText: Yup.string().trim().required('Option text is required'),
            isCorrect: Yup.boolean(),
            sortOrder: Yup.number(),
          })
        )
        .test(
          'has-two-options',
          'Enter at least two answer options',
          (opts: any) =>
            Array.isArray(opts) &&
            opts.filter((option: any) => String(option?.optionText || '').trim()).length >= 2
        )
        .test(
          'has-correct-option',
          'Mark at least one option as the correct answer',
          (opts: any) => Array.isArray(opts) && opts.some((o: any) => o.isCorrect)
        ),
  }),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildSubjectOptions(data: any) {
  const options: { value: string; label: string }[] = [];
  data?.data?.items?.forEach((item: any) => {
    if (item.subjects?.length > 1 && item.electiveGroupName) {
      item.subjects.forEach((sub: any, i: number) => {
        options.push({
          value: sub.subjectId,
          label: sub.subjectName || `${item.electiveGroupName} ${i + 1}`,
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

const OBJECTIVE_QUESTION_TYPES = [1, 2, 3];

const getObjectiveAnswerKey = (questionType: number, options: any[] = []) => {
  if (!OBJECTIVE_QUESTION_TYPES.includes(questionType)) {
    return '';
  }

  return options
    .filter((option) => option.isCorrect)
    .map((option) => String(option.optionText || '').trim())
    .filter(Boolean)
    .join(', ');
};

const normalizeSingleCorrectOptions = (options: any[]) => {
  let correctSeen = false;
  return options.map((option) => {
    if (!option.isCorrect) {
      return option;
    }

    if (correctSeen) {
      return { ...option, isCorrect: false };
    }

    correctSeen = true;
    return option;
  });
};

const toQuestionBody = (values: any) => {
  const options = (values.options || [])
    .map((o: any, index: number) => ({
      ...o,
      optionText: String(o.optionText || '').trim(),
      sortOrder: index + 1,
    }))
    .filter((o: any) => o.optionText);
  const answerKey =
    String(values.answerKey || '').trim() ||
    getObjectiveAnswerKey(Number(values.questionType), options);

  return {
    ...values,
    answerKey,
    chapterId: values.chapterId || null,
    topicId: values.topicId || null,
    bloomLevel: values.bloomLevel || null,
    marks: Number(values.marks),
    negativeMarks:
      values.negativeMarks === '' || values.negativeMarks == null
        ? null
        : Number(values.negativeMarks),
    tags: String(values.tagsText || '')
      .split(',')
      .map((t: string) => t.trim())
      .filter(Boolean),
    options,
  };
};

const makeInitialValues = (
  academicYearId: string,
  standardId = '',
  subjectId = '',
  chapterId = ''
) => ({
  academicYearId,
  standardId,
  subjectId,
  chapterId,
  topicId: '',
  questionText: '',
  questionType: 1,
  difficultyLevel: 1,
  bloomLevel: 1,
  marks: 1,
  negativeMarks: '',
  answerKey: '',
  learningOutcome: '',
  explanation: '',
  markingScheme: '',
  visibility: 2,
  tagsText: '',
  options: [
    { optionText: '', isCorrect: true, sortOrder: 1 },
    { optionText: '', isCorrect: false, sortOrder: 2 },
  ],
  file: null,
});

// ─── Question Form Fields ─────────────────────────────────────────────────────

function QuestionFormFields({
  formik,
  classOptions,
  subjectOptions,
  chapterOptions,
  creationMode,
  setCreationMode,
}: any) {
  const theme = useTheme();
  const showOptions = [1, 2, 3].includes(formik.values.questionType);

  const handleOptionChange = (index: number, field: string, value: any) => {
    const newOptions = formik.values.options.map((opt: any, i: number) => {
      if (i !== index) {
        if (
          field === 'isCorrect' &&
          value &&
          (formik.values.questionType === 1 || formik.values.questionType === 3)
        ) {
          return { ...opt, isCorrect: false };
        }
        return opt;
      }
      return { ...opt, [field]: value };
    });
    formik.setFieldValue('options', newOptions);
  };

  const handleTypeChange = (type: number) => {
    let newOptions = formik.values.options;
    if (type === 3) {
      newOptions = [
        { optionText: 'True', isCorrect: true, sortOrder: 1 },
        { optionText: 'False', isCorrect: false, sortOrder: 2 },
      ];
    } else if ((type === 1 || type === 2) && formik.values.questionType === 3) {
      newOptions = [
        { optionText: '', isCorrect: true, sortOrder: 1 },
        { optionText: '', isCorrect: false, sortOrder: 2 },
      ];
    } else if (type === 1) {
      newOptions = normalizeSingleCorrectOptions(newOptions);
    } else if (![1, 2, 3].includes(type)) {
      newOptions = [];
    }
    formik.setFieldValue('questionType', type);
    formik.setFieldValue('options', newOptions);
  };

  return (
    <Grid container spacing={1}>
      <Grid size={12} display="flex" justifyContent="center">
        <ToggleButtonGroup
          exclusive
          size="small"
          color="primary"
          value={creationMode}
          onChange={(_, val) => val && setCreationMode(val)}
          aria-label="Creation Mode"
          sx={{ mb: 1 }}
        >
          <ToggleButton value="manual" aria-label="Manual Entry">
            <Iconify icon="solar:pen-bold" sx={{ mr: 1, width: 16, height: 16 }} />
            Manual Entry
          </ToggleButton>
          <ToggleButton value="upload" aria-label="Bulk Upload">
            <Iconify icon="solar:upload-bold" sx={{ mr: 1, width: 16, height: 16 }} />
            Bulk Upload
          </ToggleButton>
        </ToggleButtonGroup>
      </Grid>

      <Grid size={12}>
        <Typography variant="overline" color="text.disabled" letterSpacing={1}>
          Classification
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <ShakingTextField error={formik.touched.standardId && !!formik.errors.standardId}>
          <CustomSelect
            label="Class *"
            options={classOptions}
            value={formik.values.standardId}
            onChange={(val: any) => {
              formik.setFieldValue('standardId', val);
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
            onChange={(val: any) => {
              formik.setFieldValue('subjectId', val);
              formik.setFieldValue('chapterId', '');
            }}
            error={formik.touched.subjectId && !!formik.errors.subjectId}
            helperText={(formik.touched.subjectId && formik.errors.subjectId) || ''}
          />
        </ShakingTextField>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomSelect
          label="Chapter (optional)"
          options={[{ value: '', label: 'None' }, ...chapterOptions]}
          value={formik.values.chapterId || ''}
          disabled={!formik.values.subjectId}
          onChange={(val: any) => formik.setFieldValue('chapterId', val)}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          size="small"
          label="Topic (optional)"
          name="topicId"
          value={formik.values.topicId || ''}
          onChange={formik.handleChange}
          placeholder="Enter topic name"
        />
      </Grid>

      {creationMode === 'manual' && (
        <>
          <Grid size={12}>
            <Typography variant="overline" color="text.disabled" letterSpacing={1}>
              Question
            </Typography>
          </Grid>

          <Grid size={12}>
            <ShakingTextField error={formik.touched.questionText && !!formik.errors.questionText}>
              <TextField
                fullWidth
                multiline
                minRows={4}
                label="Question Text *"
                name="questionText"
                value={formik.values.questionText}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.questionText && !!formik.errors.questionText}
                helperText={(formik.touched.questionText && formik.errors.questionText) || ''}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={12}>
            <Typography variant="overline" color="text.disabled" letterSpacing={1}>
              Question Properties
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <CustomSelect
              label="Question Type"
              options={QUESTION_TYPE_OPTIONS}
              value={formik.values.questionType}
              onChange={(val: any) => handleTypeChange(Number(val))}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 2 }}>
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

          <Grid size={{ xs: 6, sm: 2 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Neg. Marks"
              name="negativeMarks"
              value={formik.values.negativeMarks}
              onChange={formik.handleChange}
              inputProps={{ min: 0, step: 0.25 }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 2 }}>
            <CustomSelect
              label="Difficulty"
              options={DIFFICULTY_OPTIONS}
              value={formik.values.difficultyLevel}
              onChange={(val: any) => formik.setFieldValue('difficultyLevel', Number(val))}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 2 }}>
            <CustomSelect
              label="Bloom Level"
              options={BLOOM_OPTIONS}
              value={formik.values.bloomLevel || 1}
              onChange={(val: any) => formik.setFieldValue('bloomLevel', Number(val))}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <CustomSelect
              label="Visibility"
              options={VISIBILITY_OPTIONS}
              value={formik.values.visibility || 2}
              onChange={(val: any) => formik.setFieldValue('visibility', Number(val))}
            />
          </Grid>

          {showOptions && (
            <Grid size={12}>
              <Stack direction="row" spacing={0.5} alignItems="center" mb={1.5}>
                <Typography variant="overline" color="text.disabled" letterSpacing={1}>
                  Answer Options
                </Typography>
                <CustomTooltip
                  arrow
                  placement="right"
                  title={
                    formik.values.questionType === 2
                      ? 'Turn on the switch for every option that is correct. At least one option must be marked correct.'
                      : 'Turn on the switch next to the one correct option. A question cannot be saved without a correct answer.'
                  }
                >
                  <Iconify
                    icon="lucide:info"
                    width={14}
                    sx={{ cursor: 'pointer' }}
                    color="info.main"
                  />
                </CustomTooltip>
              </Stack>
              <ShakingTextField
                error={
                  formik.submitCount > 0 &&
                  (typeof formik.errors.options === 'string' ||
                    (Array.isArray(formik.errors.options) &&
                      formik.errors.options.some((err: any) => err && err.optionText)))
                }
              >
                <Stack spacing={1}>
                  {formik.values.options.map((option: any, index: number) => {
                    const optError =
                      (formik.touched.options?.[index]?.optionText || formik.submitCount > 0) &&
                      (formik.errors.options as any)?.[index]?.optionText;

                    return (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          p: 1.5,
                          borderRadius: 1.5,
                          border: '1px solid',
                          borderColor: option.isCorrect ? 'success.light' : 'divider',
                          bgcolor: option.isCorrect
                            ? alpha(theme.palette.success.main, 0.04)
                            : 'transparent',
                          transition: 'all 0.2s',
                        }}
                      >
                        <ShakingTextField error={Boolean(optError)} sx={{ flex: 1 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label={`Option ${index + 1}`}
                            name={`options[${index}].optionText`}
                            value={option.optionText}
                            disabled={formik.values.questionType === 3}
                            onChange={(e) =>
                              handleOptionChange(index, 'optionText', e.target.value)
                            }
                            onBlur={formik.handleBlur}
                            error={Boolean(optError)}
                            helperText={optError || ''}
                          />
                        </ShakingTextField>
                        <Tooltip title={option.isCorrect ? 'Correct answer' : 'Mark as correct'}>
                          <Switch
                            size="small"
                            checked={option.isCorrect}
                            color="success"
                            onChange={(_, checked) =>
                              handleOptionChange(index, 'isCorrect', checked)
                            }
                          />
                        </Tooltip>
                        {formik.values.options.length > 2 && formik.values.questionType !== 3 && (
                          <Tooltip title="Remove option">
                            <IconButton
                              type="button"
                              size="small"
                              color="error"
                              onClick={() =>
                                formik.setFieldValue(
                                  'options',
                                  formik.values.options.filter((_: any, i: number) => i !== index)
                                )
                              }
                            >
                              <Iconify icon="mingcute:delete-2-line" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    );
                  })}
                  {formik.values.questionType !== 3 && (
                    <Button
                      type="button"
                      size="small"
                      variant="outlined"
                      startIcon={<Iconify icon="mingcute:add-line" />}
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
                      sx={{ alignSelf: 'flex-start', mt: 0.5 }}
                    >
                      Add Option
                    </Button>
                  )}
                </Stack>
              </ShakingTextField>
              {formik.submitCount > 0 && typeof formik.errors.options === 'string' && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {formik.errors.options}
                </Alert>
              )}
            </Grid>
          )}

          <Grid size={12}>
            <Typography variant="overline" color="text.disabled" letterSpacing={1}>
              Additional Information
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Answer Key"
              name="answerKey"
              value={formik.values.answerKey}
              onChange={formik.handleChange}
              helperText="For short / long answer question types"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Learning Outcome"
              name="learningOutcome"
              value={formik.values.learningOutcome}
              onChange={formik.handleChange}
              placeholder="What will students learn?"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Tags (comma separated)"
              name="tagsText"
              value={formik.values.tagsText}
              onChange={formik.handleChange}
              placeholder="algebra, quadratic, class10"
            />
          </Grid>

          <Grid size={12}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Explanation / Marking Scheme"
              name="explanation"
              value={formik.values.explanation}
              onChange={(e) => {
                formik.setFieldValue('explanation', e.target.value);
                formik.setFieldValue('markingScheme', e.target.value);
              }}
            />
          </Grid>
        </>
      )}

      {creationMode === 'upload' && (
        <>
          <Grid size={12}>
            <Box
              sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Typography variant="overline" color="text.disabled" letterSpacing={1}>
                Upload File
              </Typography>
              <Button
                size="small"
                variant="text"
                color="primary"
                startIcon={<Iconify icon="solar:download-bold" />}
                onClick={() =>
                  shikshaMitraToast.info({ message: 'Excel Template download triggered.' })
                }
              >
                Download Excel Template
              </Button>
            </Box>
          </Grid>

          <Grid size={12}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.info.main, 0.04),
                border: '1px dashed',
                borderColor: 'info.light',
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: 'info.lighter',
                    color: 'info.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="solar:document-text-bold" width={24} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="info.darker">
                    Bulk Upload Guidelines
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Please use our Excel template. Ensure columns like Question Text, Option 1,
                    Option 2, etc., and Marks are filled before uploading.
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Grid>

          <Grid size={12}>
            <CustomUpload
              multiple={false}
              label="Drag & drop Excel/CSV question sheet, or click to browse"
              secondaryText="Supports .xlsx, .xls, .csv up to 5MB"
              value={formik.values.file ? [formik.values.file] : []}
              onChange={(files) => {
                formik.setFieldValue('file', files[0] || null);
              }}
              onDelete={() => {
                formik.setFieldValue('file', null);
              }}
            />
          </Grid>
        </>
      )}
    </Grid>
  );
}

// ─── Main Dialog Component ────────────────────────────────────────────────────

interface CreateQuestionDialogProps {
  open: boolean;
  onClose: () => void;
  initialStandardId?: string;
  initialSubjectId?: string;
  initialChapterId?: string;
  chapterName?: string;
}

export default function CreateQuestionDialog({
  open,
  onClose,
  initialStandardId = '',
  initialSubjectId = '',
  initialChapterId = '',
  chapterName,
}: CreateQuestionDialogProps) {
  const { currentYear, currentMedium: medium } = useSelector(
    (state: RootState) => state.globalState
  );
  const academicYearId = currentYear?.id || '';

  const allClass = useMemo(
    () => medium?.educationMediumStages?.flatMap((stage: any) => stage.standards || []) || [],
    [medium]
  );
  const classOptions = useMemo(
    () => allClass.map((cls: any) => ({ value: cls.id, label: cls.name })),
    [allClass]
  );

  const [createQuestion, createState] = useCreateQuestionMutation();
  const [creationMode, setCreationMode] = useState<'manual' | 'upload'>('manual');

  const validationSchema = useMemo(() => {
    if (creationMode === 'upload') {
      return Yup.object({
        standardId: Yup.string().required('Class is required'),
        subjectId: Yup.string().required('Subject is required'),
      });
    }
    return questionValidationSchema;
  }, [creationMode]);

  const formik = useFormik({
    initialValues: makeInitialValues(
      academicYearId,
      initialStandardId,
      initialSubjectId,
      initialChapterId
    ),
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, helpers) => {
      try {
        if (creationMode === 'upload') {
          if (!values.file) {
            shikshaMitraToast.error({ message: 'Please upload a template file.' });
            return;
          }
          shikshaMitraToast.success({ message: 'Question file uploaded successfully!' });
          helpers.resetForm({
            values: makeInitialValues(
              academicYearId,
              initialStandardId,
              initialSubjectId,
              initialChapterId
            ),
          });
          onClose();
          return;
        }
        await createQuestion(toQuestionBody(values)).unwrap();
        shikshaMitraToast.success({ message: 'Question created successfully.' });
        helpers.resetForm({
          values: makeInitialValues(
            academicYearId,
            initialStandardId,
            initialSubjectId,
            initialChapterId
          ),
        });
        onClose();
      } catch (err: any) {
        console.error('Failed to create question:', err);
        shikshaMitraToast.error({
          message: err?.data?.detail || err?.data?.error?.message || 'Failed to create question.',
        });
      }
    },
  });

  const { data: subjectData } = useGetSubjectAssignmentsQuery(
    { standardId: formik.values.standardId },
    { skip: !formik.values.standardId }
  );
  const subjectOptions = useMemo(() => buildSubjectOptions(subjectData), [subjectData]);

  const { data: chapters } = useGetChaptersByStandardQuery(
    { standardId: formik.values.standardId, subjectId: formik.values.subjectId },
    { skip: !formik.values.standardId || !formik.values.subjectId }
  );
  const chapterOptions = useMemo(
    () =>
      (chapters || []).map((c: any) => ({
        value: c.id,
        label: `${c.chapterNumber}. ${c.chapterName}`,
      })),
    [chapters]
  );

  const handleClose = () => {
    setCreationMode('manual');
    formik.resetForm({
      values: makeInitialValues(
        academicYearId,
        initialStandardId,
        initialSubjectId,
        initialChapterId
      ),
    });
    onClose();
  };

  const title = chapterName ? `Create Question — ${chapterName}` : 'Create New Question';

  return (
    <CustomDialog
      open={open}
      handleClose={handleClose}
      title={
        <Box display="flex" flexDirection="row" gap={1} alignItems="center">
          <Typography variant="h5">{title}</Typography>
          <CustomTooltip
            arrow
            placement="right"
            sx={{ textAlign: 'justify' }}
            title="Add new question manually or upload an Excel/CSV file to create questions in bulk."
          >
            <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
          </CustomTooltip>
        </Box>
      }
      maxWidth="md"
      hasForm={false}
    >
      <form
        onSubmit={formik.handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
      >
        <DialogScrollContent>
          <QuestionFormFields
            formik={formik}
            classOptions={classOptions}
            subjectOptions={subjectOptions}
            chapterOptions={chapterOptions}
            creationMode={creationMode}
            setCreationMode={setCreationMode}
          />
        </DialogScrollContent>

        <DialogActions
          sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider', gap: 1 }}
        >
          <CancelButton onClick={handleClose} />
          <SubmitButton
            loading={createState.isLoading}
            buttonText={creationMode === 'upload' ? 'Upload Questions' : 'Save Draft'}
            startIcon={
              <Iconify
                icon={creationMode === 'upload' ? 'solar:upload-bold' : 'mingcute:save-line'}
              />
            }
          />
        </DialogActions>
      </form>
    </CustomDialog>
  );
}
