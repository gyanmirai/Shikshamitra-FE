'use client';

import dayjs from 'dayjs';
import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import { LoadingButton } from '@mui/lab';
import { shikshaMitraToast } from 'src/components/toast';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import { useGetChaptersByStandardQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api';
import CustomTooltip from 'src/components/custom-tooltip';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { academicPaths } from 'src/constants/academic-menu';
import {
  Box,
  Tab,
  Card,
  Tabs,
  Chip,
  Grid,
  Paper,
  Stack,
  Alert,
  Button,
  Switch,
  Popover,
  Skeleton,
  Tooltip,
  MenuList,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  DialogActions,
} from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import {
  QB_STATUS_LABEL,
  QB_STATUS_COLOR,
} from 'src/utils/examination-constants';
import {
  useGetQuestionsQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useSubmitQuestionMutation,
  useRejectQuestionMutation,
  useDeleteQuestionMutation,
  useApproveQuestionMutation,
  useArchiveQuestionMutation,
  useDuplicateQuestionMutation,
  useGetQuestionBankSettingsQuery,
  useGetQuestionBankDashboardQuery,
  useSaveQuestionBankSettingsMutation,
  useBulkApproveQuestionsMutation,
  useBulkRejectQuestionsMutation,
} from 'src/redux/academicAPI/ExaminationApi/QuestionBankApi/question-bank-api';

// ─── Constants ────────────────────────────────────────────────────────────────

const QUESTION_TYPE_OPTIONS = [
  { value: 1, label: 'MCQ-Single Correct' },
  { value: 2, label: 'MCQ-Multiple Correct' },
  { value: 3, label: 'True/False' },
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

// Visibility is now a hidden field — defaults to 2 (Internal / School)

const STATUS_OPTIONS = [
  { value: 1, label: 'Draft' },
  { value: 2, label: 'Submitted' },
  { value: 3, label: 'Approved' },
  { value: 4, label: 'Rejected' },
  { value: 5, label: 'Archived' },
];

const STATUS_COLOR: Record<number, 'default' | 'info' | 'success' | 'error' | 'warning'> = {
  1: 'default',
  2: 'info',
  3: 'success',
  4: 'error',
  5: 'warning',
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function displayNameOrPlaceholder(value?: string | null) {
  if (!value || UUID_PATTERN.test(value)) return '—';
  return value;
}

const DIFFICULTY_COLOR: Record<number, 'success' | 'warning' | 'error'> = {
  1: 'success',
  2: 'warning',
  3: 'error',
};

// ─── Validation ───────────────────────────────────────────────────────────────

/** Builds a dynamic Yup schema that honours Question Bank Settings toggles.
 *  Call inside useMemo whenever `settings` changes.
 */
function buildQuestionValidationSchema(settings?: any) {
  return Yup.object({
    standardId: Yup.string().required('Class is required'),
    subjectId: Yup.string().required('Subject is required'),
    questionText: Yup.string().required('Question text is required').min(5, 'Too short'),
    questionType: Yup.number().required(),
    marks: Yup.number()
      .typeError('Enter a valid number')
      .required('Marks are required')
      .min(0.5, 'Minimum 0.5')
      .max(100, 'Maximum 100'),
    difficultyLevel: Yup.number().required('Difficulty level is required'),
    chapterId: settings?.requireChapter
      ? Yup.string().required('Chapter is required')
      : Yup.string().nullable(),
    topicName: settings?.requireTopic
      ? Yup.string().required('Topic is required')
      : Yup.string().nullable(),
    bloomLevel: settings?.requireBloomLevel
      ? Yup.number().required("Bloom's level is required")
      : Yup.number().nullable(),
    answerKey: settings?.requireAnswerKey
      ? Yup.string().when('questionType', {
        is: (type: number) => [4, 5, 6].includes(Number(type)),
        then: (schema) => schema.trim().required('Answer key is required'),
        otherwise: (schema) => schema.notRequired(),
      })
      : Yup.string().nullable(),
    options: Yup.array().when('questionType', {
      is: (type: number) => [1, 2, 3].includes(Number(type)),
      then: (schema) =>
        schema
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
            (opts: any) => Array.isArray(opts) && opts.some((option: any) => option.isCorrect)
          ),
    }),
  });
}

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

  const { tagsText, ...rest } = values;
  return {
    ...rest,
    answerKey,
    chapterId: values.chapterId || null,
    topicName: String(values.topicName || '').trim() || null,
    bloomLevel: values.bloomLevel || null,
    visibility: 2, // default Internal / School
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

const initialFormValues = (academicYearId?: string) => ({
  academicYearId: academicYearId || '',
  standardId: '',
  subjectId: '',
  chapterId: '',
  topicName: '',
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
  tagsText: '',
  options: [
    { optionText: '', isCorrect: true, sortOrder: 1 },
    { optionText: '', isCorrect: false, sortOrder: 2 },
  ],
});

// ─── Stat Card ────────────────────────────────────────────────────────────────

type StatColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error';

function StatCard({
  label,
  value,
  icon,
  color,
  isSelected,
  isLoading,
  onClick,
}: {
  label: string;
  value: number;
  icon: string;
  color: StatColor;
  isSelected?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
}) {
  const theme = useTheme();
  const palette = theme.palette[color];

  if (isLoading) {
    return <Skeleton variant="rounded" height={64} width="100%" sx={{ borderRadius: 1 }} />;
  }

  return (
    <Card
      onClick={onClick}
      sx={{
        p: 1.5,
        borderRadius: 1,
        border: '1px solid',
        borderColor: isSelected ? palette.main : 'divider',
        boxShadow: isSelected ? `0 0 0 1px ${palette.main}` : 'none',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: palette.main,
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 1,
            display: 'grid',
            placeItems: 'center',
            bgcolor: alpha(palette.main, 0.12),
            color: palette.main,
            flexShrink: 0,
          }}
        >
          <Iconify icon={icon} width={20} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" sx={{ lineHeight: 1 }}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap display="block">
            {label}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}

// ─── Section Card Wrapper Component (UI Skill Standard) ───────────────────────

const SectionPaper = ({
  title,
  caption,
  icon,
  children,
  action,
}: {
  title: string;
  caption?: string;
  icon: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <Paper
    variant="outlined"
    sx={{
      p: { xs: 1.5, md: 2 },
      borderRadius: 1.5,
      bgcolor: (theme) => alpha(theme.palette.background.paper, 0.92),
      borderColor: (theme) => alpha(theme.palette.divider, 0.9),
      boxShadow: (theme) => `0 10px 30px -24px ${alpha(theme.palette.grey[500], 0.4)}`,
    }}
  >
    <Stack spacing={1.5}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={1}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
            }}
          >
            <Iconify icon={icon} width={18} height={18} />
          </Box>
          <Stack spacing={0.2}>
            <Typography variant="subtitle2" fontWeight={700}>
              {title}
            </Typography>
            {caption && (
              <Typography variant="caption" color="text.secondary">
                {caption}
              </Typography>
            )}
          </Stack>
        </Stack>
        {action}
      </Stack>
      {children}
    </Stack>
  </Paper>
);

// ─── Question Form Fields (shared between create & edit dialogs) ──────────────

function QuestionFormFields({
  formik,
  classOptions,
  subjectOptions,
  chapterOptions,
  isSubjectLoading,
  isChapterLoading,
  onTypeChange,
  onOptionChange,
  theme,
  settings,
}: any) {
  const showOptions = [1, 2, 3].includes(formik.values.questionType);
  const requireChapter = !!settings?.requireChapter;
  const requireTopic = !!settings?.requireTopic;

  return (
    <Stack spacing={2}>
      {/* ── 1. Classification & Scope ─────────────────────────────── */}
      <SectionPaper
        title="Classification & Scope"
        caption="Select the target class, subject, chapter, and topic for categorization"
        icon="solar:box-minimalistic-bold-duotone"
      >
        <Grid container spacing={2}>
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
                isLoading={isSubjectLoading}
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
            <ShakingTextField error={formik.touched.chapterId && !!formik.errors.chapterId}>
              <CustomSelect
                label={requireChapter ? 'Chapter *' : 'Chapter (optional)'}
                options={[{ value: '', label: 'None' }, ...chapterOptions]}
                value={formik.values.chapterId || ''}
                disabled={!formik.values.subjectId}
                isLoading={isChapterLoading}
                onChange={(val: any) => formik.setFieldValue('chapterId', val)}
                error={formik.touched.chapterId && !!formik.errors.chapterId}
                helperText={(formik.touched.chapterId && formik.errors.chapterId) || ''}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <ShakingTextField error={formik.touched.topicName && !!formik.errors.topicName}>
              <TextField
                fullWidth
                size="small"
                label={requireTopic ? 'Topic *' : 'Topic (optional)'}
                name="topicName"
                value={formik.values.topicName || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter topic name"
                error={formik.touched.topicName && !!formik.errors.topicName}
                helperText={(formik.touched.topicName && formik.errors.topicName) || ''}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </SectionPaper>

      {/* ── 2. Question Content ──────────────────────────────────── */}
      <SectionPaper
        title="Question Content"
        caption="Enter the main statement or prompt for this question"
        icon="solar:pen-bold-duotone"
      >
        <ShakingTextField error={formik.touched.questionText && !!formik.errors.questionText}>
          <TextField
            fullWidth
            size="small"
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
      </SectionPaper>

      {/* ── 3. Question Properties ───────────────────────────────── */}
      <SectionPaper
        title="Question Properties"
        caption="Configure question type, scoring rules, difficulty level, and taxonomy"
        icon="solar:tuning-square-bold-duotone"
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <CustomSelect
              label="Question Type"
              options={QUESTION_TYPE_OPTIONS}
              value={formik.values.questionType}
              onChange={(val: any) => onTypeChange(Number(val))}
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

          <Grid size={{ xs: 6, sm: 2 }}>
            <CustomSelect
              label="Difficulty"
              options={DIFFICULTY_OPTIONS}
              value={formik.values.difficultyLevel}
              onChange={(val: any) => formik.setFieldValue('difficultyLevel', Number(val))}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <CustomSelect
              label="Bloom Level"
              options={BLOOM_OPTIONS}
              value={formik.values.bloomLevel || 1}
              onChange={(val: any) => formik.setFieldValue('bloomLevel', Number(val))}
            />
          </Grid>
        </Grid>
      </SectionPaper>

      {/* ── 4. Answer Options ────────────────────────────────────── */}
      {showOptions && (
        <SectionPaper
          title="Answer Options"
          caption="Define choice options and toggle the correct answer(s)"
          icon="solar:checklist-bold-duotone"
        >
          <Stack spacing={1}>
            {formik.values.options.map((option: any, index: number) => (
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
                <TextField
                  fullWidth
                  size="small"
                  label={`Option ${index + 1}`}
                  value={option.optionText}
                  disabled={formik.values.questionType === 3}
                  onChange={(e) => onOptionChange(index, 'optionText', e.target.value)}
                />
                <Tooltip title={option.isCorrect ? 'Correct answer' : 'Mark as correct'}>
                  <Switch
                    size="small"
                    checked={option.isCorrect}
                    color="success"
                    onChange={(_, checked) => onOptionChange(index, 'isCorrect', checked)}
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
            ))}
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
          {formik.submitCount > 0 && typeof formik.errors.options === 'string' && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {formik.errors.options}
            </Alert>
          )}
        </SectionPaper>
      )}

      {/* ── 5. Additional Details ─────────────────────────────────── */}
      <SectionPaper
        title="Additional Metadata & Marking Scheme"
        caption="Provide optional answer key, learning outcome, tags, and explanation"
        icon="solar:info-square-bold-duotone"
      >
        <Grid container spacing={2}>
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
              size="small"
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
        </Grid>
      </SectionPaper>
    </Stack>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function QuestionBankScreen() {
  const theme = useTheme();
  const { currentYear, currentMedium: medium } = useSelector(
    (state: RootState) => state.globalState
  );
  const academicYearId = currentYear?.id;

  const [filters, setFilters] = useState<any>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [localSettings, setLocalSettings] = useState<any>(null);
  const [localReviewComment, setLocalReviewComment] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectCommentText, setRejectCommentText] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  // Classes from medium
  const allClass = useMemo(
    () => medium?.educationMediumStages?.flatMap((stage: any) => stage.standards || []) || [],
    [medium]
  );
  const classOptions = useMemo(
    () => allClass.map((cls: any) => ({ value: cls.id, label: cls.name })),
    [allClass]
  );

  // Filter cascade queries via useQueryAndMutation (SKILL.md Section 4)
  const {
    data: filterSubjectData,
    isFetching: isFilterSubjectFetching,
    isLoading: isFilterSubjectLoading,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentsQuery,
    params: { standardId: filters.standardId },
    options: { skip: !filters.standardId },
  });
  const filterSubjectOptions = useMemo(
    () => buildSubjectOptions(filterSubjectData),
    [filterSubjectData]
  );

  const {
    data: filterChapters,
    isFetching: isFilterChapterFetching,
    isLoading: isFilterChapterLoading,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChaptersByStandardQuery,
    params: { standardId: filters.standardId, subjectId: filters.subjectId },
    options: { skip: !filters.standardId || !filters.subjectId },
  });
  const filterChapterOptions = useMemo(
    () =>
      (filterChapters || []).map((c: any) => ({
        value: c.id,
        label: `${c.chapterNumber}. ${c.chapterName}`,
      })),
    [filterChapters]
  );

  // Data queries via useQueryAndMutation
  const query = useMemo(
    () => ({
      ...filters,
      academicYearId: academicYearId || undefined,
      pageSize: 300,
    }),
    [academicYearId, filters]
  );

  const {
    data: dashboard,
    isFetching: isDashboardFetching,
    isLoading: isDashboardLoading,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetQuestionBankDashboardQuery,
    params: { academicYearId },
    options: { skip: !academicYearId },
  });

  const {
    data,
    isFetching: isQuestionFetching,
    isLoading: isQuestionLoading,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetQuestionsQuery,
    params: query,
    options: { skip: !academicYearId },
  });

  const {
    data: settings,
    isFetching: isSettingsFetching,
    isLoading: isSettingsLoading,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetQuestionBankSettingsQuery,
    params: { academicYearId },
    options: { skip: !academicYearId },
  });

  const [saveSettings, { isLoading: isSaveSettingsLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useSaveQuestionBankSettingsMutation,
  });
  const [createQuestion, { isLoading: isCreateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateQuestionMutation,
  });
  const [updateQuestion, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateQuestionMutation,
  });
  const [submitQuestion, { isLoading: isSubmitLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useSubmitQuestionMutation,
  });
  const [approveQuestion, { isLoading: isApproveLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useApproveQuestionMutation,
  });
  const [rejectQuestion, { isLoading: isRejectLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRejectQuestionMutation,
  });
  const [deleteQuestion, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteQuestionMutation,
  });
  const [archiveQuestion, { isLoading: isArchiveLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useArchiveQuestionMutation,
  });
  const [duplicateQuestion, { isLoading: isDuplicateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDuplicateQuestionMutation,
  });

  // Dynamic validation schema respects Settings toggles
  const questionValidationSchema = useMemo(
    () => buildQuestionValidationSchema(settings),
    [settings]
  );

  // Formik for create question dialog
  const formik = useFormik({
    initialValues: initialFormValues(academicYearId),
    validationSchema: questionValidationSchema,
    onSubmit: async (values, helpers) => {
      try {
        await createQuestion(toQuestionBody(values)).unwrap();
        shikshaMitraToast.success({ message: 'Question created successfully.' });
        helpers.resetForm({ values: initialFormValues(academicYearId) });
        setDialogOpen(false);
      } catch (err: any) {
        console.error('Failed to create question:', err);
        shikshaMitraToast.error({
          message: err?.data?.detail || err?.data?.error?.message || 'Failed to create question.',
        });
      }
    },
  });

  // Formik for edit question dialog
  const editFormik = useFormik({
    initialValues: initialFormValues(academicYearId),
    validationSchema: questionValidationSchema,
    onSubmit: async (values, helpers) => {
      if (!selectedQuestion) return;
      try {
        await updateQuestion({ id: selectedQuestion.id, body: toQuestionBody(values) }).unwrap();
        shikshaMitraToast.success({ message: 'Question updated successfully.' });
        helpers.resetForm();
        setEditDialogOpen(false);
        setSelectedQuestion(null);
      } catch (err: any) {
        console.error('Failed to update question:', err);
        shikshaMitraToast.error({
          message: err?.data?.detail || err?.data?.error?.message || 'Failed to update question.',
        });
      }
    },
  });

  // Form cascade queries (driven by formik values)
  const {
    data: formSubjectData,
    isFetching: isFormSubjectFetching,
    isLoading: isFormSubjectLoading,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentsQuery,
    params: { standardId: formik.values.standardId },
    options: { skip: !formik.values.standardId },
  });
  const formSubjectOptions = useMemo(() => buildSubjectOptions(formSubjectData), [formSubjectData]);

  const {
    data: formChapters,
    isFetching: isFormChapterFetching,
    isLoading: isFormChapterLoading,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChaptersByStandardQuery,
    params: { standardId: formik.values.standardId, subjectId: formik.values.subjectId },
    options: { skip: !formik.values.standardId || !formik.values.subjectId },
  });
  const formChapterOptions = useMemo(
    () =>
      (formChapters || []).map((c: any) => ({
        value: c.id,
        label: `${c.chapterNumber}. ${c.chapterName}`,
      })),
    [formChapters]
  );

  // Edit form cascade queries (driven by editFormik values)
  const {
    data: editSubjectData,
    isFetching: isEditSubjectFetching,
    isLoading: isEditSubjectLoading,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentsQuery,
    params: { standardId: editFormik.values.standardId },
    options: { skip: !editFormik.values.standardId },
  });
  const editSubjectOptions = useMemo(() => buildSubjectOptions(editSubjectData), [editSubjectData]);

  const {
    data: editChapters,
    isFetching: isEditChapterFetching,
    isLoading: isEditChapterLoading,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChaptersByStandardQuery,
    params: { standardId: editFormik.values.standardId, subjectId: editFormik.values.subjectId },
    options: { skip: !editFormik.values.standardId || !editFormik.values.subjectId },
  });
  const editChapterOptions = useMemo(
    () =>
      (editChapters || []).map((c: any) => ({
        value: c.id,
        label: `${c.chapterNumber}. ${c.chapterName}`,
      })),
    [editChapters]
  );



  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleOpenCreate = () => {
    formik.resetForm({ values: initialFormValues(academicYearId) });
    setDialogOpen(false);
    setTimeout(() => setDialogOpen(true), 0);
  };

  const handleOpenEdit = (question: any) => {
    setSelectedQuestion(question);
    editFormik.resetForm({
      values: {
        academicYearId: question.academicYearId || academicYearId || '',
        standardId: question.standardId || '',
        subjectId: question.subjectId || '',
        chapterId: question.chapterId || '',
        topicName: question.topicName || '',
        questionText: question.questionText || '',
        questionType: question.questionType || 1,
        difficultyLevel: question.difficultyLevel || 1,
        bloomLevel: question.bloomLevel || 1,
        marks: question.marks || 1,
        negativeMarks: question.negativeMarks ?? '',
        answerKey: question.answerKey || '',
        learningOutcome: question.learningOutcome || '',
        explanation: question.explanation || '',
        markingScheme: question.markingScheme || '',
        tagsText: (question.tags || []).join(', '),
        options: question.options?.length
          ? question.options.map((o: any) => ({
            optionText: o.optionText,
            isCorrect: o.isCorrect,
            sortOrder: o.sortOrder,
          }))
          : [
            { optionText: '', isCorrect: true, sortOrder: 1 },
            { optionText: '', isCorrect: false, sortOrder: 2 },
          ],
      },
    });
    setEditDialogOpen(true);
  };

  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);
  const [archiveQuestionId, setArchiveQuestionId] = useState<string | null>(null);

  const handleSubmitQuestion = async (id: string) => {
    try {
      await submitQuestion({ id }).unwrap();
      shikshaMitraToast.success({ message: 'Question submitted for review.' });
    } catch (err: any) {
      shikshaMitraToast.error({
        message: err?.data?.detail || err?.data?.message || 'Failed to submit question.',
      });
    }
  };

  const handleApproveQuestion = async (id: string) => {
    try {
      await approveQuestion({ id, body: { comment: reviewComment } }).unwrap();
      shikshaMitraToast.success({ message: 'Question approved.' });
    } catch (err: any) {
      shikshaMitraToast.error({
        message: err?.data?.detail || err?.data?.message || 'Failed to approve question.',
      });
    }
  };

  const handleDuplicateQuestion = async (id: string) => {
    try {
      await duplicateQuestion({ id }).unwrap();
      shikshaMitraToast.success({ message: 'Question duplicated.' });
    } catch (err: any) {
      shikshaMitraToast.error({
        message: err?.data?.detail || err?.data?.message || 'Failed to duplicate question.',
      });
    }
  };

  const handleConfirmDeleteQuestion = async () => {
    if (!deleteQuestionId) return;
    try {
      await deleteQuestion({ id: deleteQuestionId }).unwrap();
      shikshaMitraToast.success({ message: 'Question deleted permanently.' });
    } catch (err: any) {
      shikshaMitraToast.error({
        message: err?.data?.detail || err?.data?.message || 'Failed to delete question.',
      });
    } finally {
      setDeleteQuestionId(null);
    }
  };

  const handleConfirmArchiveQuestion = async () => {
    if (!archiveQuestionId) return;
    try {
      await archiveQuestion({ id: archiveQuestionId }).unwrap();
      shikshaMitraToast.success({ message: 'Question archived.' });
    } catch (err: any) {
      shikshaMitraToast.error({
        message: err?.data?.detail || err?.data?.message || 'Failed to archive question.',
      });
    } finally {
      setArchiveQuestionId(null);
    }
  };

  const handleRejectClick = (id: string) => {
    setRejectTargetId(id);
    setRejectCommentText('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectTargetId) return;
    try {
      await rejectQuestion({ id: rejectTargetId, body: { comment: rejectCommentText } }).unwrap();
      shikshaMitraToast.success({ message: 'Question rejected.' });
      setRejectDialogOpen(false);
      setRejectTargetId(null);
      setRejectCommentText('');
    } catch (err: any) {
      console.error('Failed to reject question:', err);
      shikshaMitraToast.error({
        message: err?.data?.detail || err?.data?.message || 'Failed to reject question.',
      });
    }
  };

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

  const handleQuestionTypeChange = (type: number) => {
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

  const handleEditOptionChange = (index: number, field: string, value: any) => {
    const newOptions = editFormik.values.options.map((opt: any, i: number) => {
      if (i !== index) {
        if (
          field === 'isCorrect' &&
          value &&
          (editFormik.values.questionType === 1 || editFormik.values.questionType === 3)
        ) {
          return { ...opt, isCorrect: false };
        }
        return opt;
      }
      return { ...opt, [field]: value };
    });
    editFormik.setFieldValue('options', newOptions);
  };

  const handleEditQuestionTypeChange = (type: number) => {
    let newOptions = editFormik.values.options;
    if (type === 3) {
      newOptions = [
        { optionText: 'True', isCorrect: true, sortOrder: 1 },
        { optionText: 'False', isCorrect: false, sortOrder: 2 },
      ];
    } else if ((type === 1 || type === 2) && editFormik.values.questionType === 3) {
      newOptions = [
        { optionText: '', isCorrect: true, sortOrder: 1 },
        { optionText: '', isCorrect: false, sortOrder: 2 },
      ];
    } else if (type === 1) {
      newOptions = normalizeSingleCorrectOptions(newOptions);
    } else if (![1, 2, 3].includes(type)) {
      newOptions = [];
    }
    editFormik.setFieldValue('questionType', type);
    editFormik.setFieldValue('options', newOptions);
  };

  const handleOpenSettings = (e: React.MouseEvent<HTMLButtonElement>) => {
    setLocalSettings(settings ? { ...settings } : {});
    setLocalReviewComment(reviewComment);
    setSettingsAnchorEl(e.currentTarget);
  };
  const handleCloseSettings = () => setSettingsAnchorEl(null);
  const handleSaveSettings = async () => {
    if (!localSettings) return;
    try {
      await saveSettings(localSettings).unwrap();
      setReviewComment(localReviewComment);
      setSettingsAnchorEl(null);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const statCards = [
    {
      label: 'Total Questions',
      value: dashboard?.totalQuestions || 0,
      icon: 'mingcute:book-2-line',
      color: 'primary' as StatColor,
    },
    {
      label: 'Approved',
      value: dashboard?.approvedQuestions || 0,
      icon: 'mingcute:check-circle-line',
      color: 'success' as StatColor,
    },
    {
      label: 'Draft',
      value: dashboard?.draftQuestions || 0,
      icon: 'mingcute:file-line',
      color: 'info' as StatColor,
    },
    {
      label: 'Pending Review',
      value: dashboard?.pendingReview || 0,
      icon: 'mingcute:time-line',
      color: 'warning' as StatColor,
    },
    {
      label: 'Rejected',
      value: dashboard?.rejectedQuestions || 0,
      icon: 'mingcute:close-circle-line',
      color: 'error' as StatColor,
    },
  ];

  /**
   * Memoization Justification:
   * - Normalizes API/lookup values once per data refresh so the table renders, filters, and exports display labels.
   * - Prevents repeated option scans from every Class/Subject/Chapter cell render in the grid.
   * - Required because Question Bank can render hundreds of rows from the paged API response.
   */
  const questionRows = useMemo(
    () =>
      (data?.items || []).map((row: any) => ({
        ...row,
        standardName: displayNameOrPlaceholder(
          row.standardName ||
            row.standard?.name ||
            classOptions.find((classOption: any) => classOption.value === row.standardId)?.label
        ),
        subjectName: displayNameOrPlaceholder(
          row.subjectName ||
            row.subject?.name ||
            filterSubjectOptions.find((subjectOption: any) => subjectOption.value === row.subjectId)?.label
        ),
        chapterName: displayNameOrPlaceholder(
          row.chapterName ||
            row.chapter?.chapterName ||
            row.chapter?.name ||
            (row.chapterNumber
              ? `${row.chapterNumber}. ${row.chapterName || ''}`
              : filterChapterOptions.find((chapterOption: any) => chapterOption.value === row.chapterId)?.label)
        ),
      })),
    [classOptions, data?.items, filterChapterOptions, filterSubjectOptions]
  );

  const questionColumns = useMemo(
    () => [
      {
        id: 'questionText',
        label: 'Question',
        filterType: 'string' as const,
        minWidth: 280,
        sticky: true,
        stickyPosition: 'left' as const,
        render: (_: any, row: any) => (
          <Box>
            <Typography variant="body2" sx={{ mb: row.tags?.length ? 0.5 : 0 }}>
              {row.questionText}
            </Typography>
            {!!row.tags?.length && (
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {row.tags.map((tag: string) => (
                  <Label key={tag} variant="soft" color="default" sx={{ fontSize: '0.75rem', px: 0.75 }}>
                    {tag}
                  </Label>
                ))}
              </Stack>
            )}
          </Box>
        ),
      },
      {
        id: 'questionType',
        label: 'Type',
        filterType: 'enum' as const,
        width: 170,
        enumOptions: QUESTION_TYPE_OPTIONS.map((q) => ({ value: q.label, label: q.label })),
        render: (v: any) => (
          <Typography variant="body2">
            {QUESTION_TYPE_OPTIONS.find((q) => q.value === Number(v))?.label || v || '—'}
          </Typography>
        ),
      },
      {
        id: 'standardName',
        label: 'Class',
        filterType: 'string' as const,
        width: 120,
        render: (_: any, row: any) => (
          <Typography variant="body2" color="text.primary" noWrap>
            {row.standardName || row.standard?.name || classOptions.find((c: any) => c.value === row.standardId)?.label || row.standardId || '—'}
          </Typography>
        ),
      },
      {
        id: 'subjectName',
        label: 'Subject',
        filterType: 'string' as const,
        width: 140,
        render: (_: any, row: any) => (
          <Typography variant="body2" color="text.primary" noWrap>
            {row.subjectName || row.subject?.name || filterSubjectOptions.find((s: any) => s.value === row.subjectId)?.label || row.subjectId || '—'}
          </Typography>
        ),
      },
      {
        id: 'chapterName',
        label: 'Chapter',
        filterType: 'string' as const,
        width: 150,
        render: (_: any, row: any) => (
          <Typography variant="body2" color="text.primary" noWrap>
            {row.chapterName || row.chapter?.chapterName || row.chapter?.name || (row.chapterNumber ? `${row.chapterNumber}. ${row.chapterName || ''}` : filterChapterOptions.find((c: any) => c.value === row.chapterId)?.label) || row.chapterId || '—'}
          </Typography>
        ),
      },
      {
        id: 'topicName',
        label: 'Topic',
        filterType: 'string' as const,
        width: 130,
        render: (_: any, row: any) => (
          <Typography variant="body2" color="text.secondary" noWrap>
            {row.topicName || row.topic?.name || '—'}
          </Typography>
        ),
      },
      {
        id: 'marks',
        label: 'Marks',
        filterType: 'number' as const,
        width: 80,
        align: 'center' as const,
        render: (v: any) => <Typography variant="body2" fontWeight={700}>{v ?? '—'}</Typography>,
      },
      {
        id: 'difficultyLevel',
        label: 'Difficulty',
        filterType: 'enum' as const,
        width: 110,
        enumOptions: DIFFICULTY_OPTIONS.map((d) => ({ value: d.label, label: d.label })),
        render: (v: any) => (
          <Label
            variant="soft"
            color={(DIFFICULTY_COLOR[Number(v)] as any) || 'default'}
            sx={{ fontWeight: 600 }}
          >
            {DIFFICULTY_OPTIONS.find((d) => d.value === Number(v))?.label || '—'}
          </Label>
        ),
      },
      {
        id: 'bloomLevel',
        label: "Bloom's Level",
        filterType: 'enum' as const,
        width: 130,
        enumOptions: BLOOM_OPTIONS.map((b) => ({ value: b.label, label: b.label })),
        render: (v: any) => (
          <Typography variant="body2" color="text.secondary" noWrap>
            {BLOOM_OPTIONS.find((b) => b.value === Number(v))?.label || '—'}
          </Typography>
        ),
      },
      {
        id: 'usedCount',
        label: 'Times Used',
        filterType: 'number' as const,
        width: 100,
        align: 'center' as const,
        render: (v: any) => (
          <Typography variant="body2" color="text.secondary">
            {v ?? 0}
          </Typography>
        ),
      },
      {
        id: 'createdByTeacherId',
        label: 'Created By',
        filterType: 'string' as const,
        width: 140,
        render: (_: any, row: any) => (
          <Typography variant="body2" color="text.secondary" noWrap>
            {row.createdByName || row.createdByTeacher?.name || row.createdByUserId || row.createdByTeacherId || '—'}
          </Typography>
        ),
      },
      {
        id: 'createdAt',
        label: 'Created On',
        filterType: 'date' as const,
        width: 120,
        render: (_: any, row: any) => (
          <Typography variant="body2" color="text.secondary" noWrap>
            {row.createdAt ? dayjs(row.createdAt).format('DD-MM-YYYY') : '—'}
          </Typography>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        filterType: 'enum' as const,
        sticky: true,
        stickyPosition: 'right' as const,
        width: 120,
        enumOptions: STATUS_OPTIONS.map((s) => ({ value: s.label, label: s.label })),
        render: (v: any) => (
          <Label
            variant="soft"
            color={(STATUS_COLOR[Number(v)] as any) || 'default'}
            sx={{ fontWeight: 700 }}
          >
            {STATUS_OPTIONS.find((s) => s.value === Number(v))?.label || '—'}
          </Label>
        ),
      },
      {
        id: 'actions',
        label: 'Actions',
        isFilter: false,
        isSort: false,
        width: 80,
        align: 'right' as const,
        sticky: true,
        stickyPosition: 'right' as const,
        render: (_: any, row: any) => (
          <ThreeDotsActions
            showEditIcon
            disableEditIcon={row.isLocked}
            handleEditClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(row);
            }}
            actions={({ popover }) => (
              <MenuList>
                {(row.status === 1 || row.status === 4) && (
                  <MenuItem
                    onClick={() => {
                      popover.onClose();
                      handleSubmitQuestion(row.id);
                    }}
                  >
                    <Iconify icon="mingcute:send-line" sx={{ mr: 1, height: 16, width: 16 }} />
                    Submit for Review
                  </MenuItem>
                )}
                {row.status === 2 && (
                  <MenuItem
                    onClick={() => {
                      popover.onClose();
                      handleApproveQuestion(row.id);
                    }}
                  >
                    <Iconify
                      icon="mingcute:check-circle-line"
                      sx={{ mr: 1, height: 16, width: 16, color: 'success.main' }}
                    />
                    Approve
                  </MenuItem>
                )}
                {row.status === 2 && (
                  <MenuItem
                    onClick={() => {
                      popover.onClose();
                      handleRejectClick(row.id);
                    }}
                  >
                    <Iconify
                      icon="mingcute:close-circle-line"
                      sx={{ mr: 1, height: 16, width: 16, color: 'error.main' }}
                    />
                    Reject
                  </MenuItem>
                )}
                <MenuItem
                  onClick={() => {
                    popover.onClose();
                    handleDuplicateQuestion(row.id);
                  }}
                >
                  <Iconify icon="mingcute:copy-2-line" sx={{ mr: 1, height: 16, width: 16 }} />
                  Duplicate
                </MenuItem>
                {row.status !== 5 && (
                  <MenuItem
                    onClick={() => {
                      popover.onClose();
                      setArchiveQuestionId(row.id);
                    }}
                  >
                    <Iconify
                      icon="mingcute:archive-line"
                      sx={{ mr: 1, height: 16, width: 16, color: 'warning.main' }}
                    />
                    Archive
                  </MenuItem>
                )}
                {row.status === 1 && (
                  <MenuItem
                    onClick={() => {
                      popover.onClose();
                      setDeleteQuestionId(row.id);
                    }}
                  >
                    <Iconify
                      icon="mingcute:delete-2-line"
                      sx={{ mr: 1, height: 16, width: 16, color: 'error.main' }}
                    />
                    Delete
                  </MenuItem>
                )}
              </MenuList>
            )}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [classOptions, reviewComment]
  );

  return (
    <Box height="100%" display="flex" flexDirection="column" gap={1}>
      <CustomBreadcrumbs
        sx={{ mb: 1 }}
        heading="Question Bank"
        description="Create, review, approve, tag and reuse questions for assessment workflows."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Examination' },
          { name: 'Question Bank' },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Iconify icon="mingcute:settings-3-line" />}
              disabled={!academicYearId}
              onClick={handleOpenSettings}
            >
              Settings
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon="mingcute:add-line" />}
              disabled={!academicYearId}
              onClick={handleOpenCreate}
            >
              Create Question
            </Button>
          </Stack>
        }
      />

      {!academicYearId && (
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          Please select an academic year to manage the question bank.
        </Alert>
      )}

      {/* Stat Cards */}
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {statCards.map((card) => (
          <Box key={card.label} sx={{ flex: '1 1 180px', minWidth: 180 }}>
            <StatCard
              {...card}
              isLoading={isDashboardLoading || isDashboardFetching}
            />
          </Box>
        ))}
      </Stack>

      {/* ── Cascade Scope Filters (API-driven) ──────────────────────────── */}
      <Card sx={{ p: 1, borderRadius: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
            <Iconify icon="mingcute:filter-line" width={18} sx={{ color: 'text.secondary' }} />
            <Typography variant="subtitle2" color="text.secondary" noWrap>
              Scope
            </Typography>
          </Box>
          <Box sx={{ minWidth: 150, flex: 1 }}>
            <CustomSelect
              label="Class"
              options={[{ value: '', label: 'All Classes' }, ...classOptions]}
              value={filters.standardId || ''}
              onChange={(val) =>
                setFilters((prev: any) => ({
                  ...prev,
                  standardId: val || undefined,
                  subjectId: undefined,
                  chapterId: undefined,
                }))
              }
            />
          </Box>
          <Box sx={{ minWidth: 160, flex: 1 }}>
            <CustomSelect
              label="Subject"
              options={[{ value: '', label: 'All Subjects' }, ...filterSubjectOptions]}
              value={filters.subjectId || ''}
              disabled={!filters.standardId}
              isLoading={isFilterSubjectLoading || isFilterSubjectFetching}
              onChange={(val) =>
                setFilters((prev: any) => ({
                  ...prev,
                  subjectId: val || undefined,
                  chapterId: undefined,
                }))
              }
            />
          </Box>
          <Box sx={{ minWidth: 180, flex: 1 }}>
            <CustomSelect
              label="Chapter"
              options={[{ value: '', label: 'All Chapters' }, ...filterChapterOptions]}
              value={filters.chapterId || ''}
              disabled={!filters.subjectId}
              isLoading={isFilterChapterLoading || isFilterChapterFetching}
              onChange={(val) =>
                setFilters((prev: any) => ({ ...prev, chapterId: val || undefined }))
              }
            />
          </Box>
          {(filters.standardId || filters.subjectId || filters.chapterId) && (
            <Button
              size="small"
              variant="text"
              color="error"
              onClick={() => setFilters({})}
              startIcon={<Iconify icon="mingcute:close-line" width={14} />}
            >
              Clear
            </Button>
          )}
        </Stack>
      </Card>

      {/* ── Questions Table (CustomizableTable handles search / sort / filter / export / pagination) */}
      <CustomizableTable
        tableId="question-bank-questions"
        tableTitle="Questions"
        columns={questionColumns}
        data={questionRows}
        isLoading={isQuestionLoading || isQuestionFetching}
        noDataText={
          <Stack alignItems="center" spacing={1}>
            <Typography variant="subtitle2" color="text.secondary">
              No questions found
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Adjust the scope filters above or create a new question.
            </Typography>
          </Stack>
        }
      />

      {/* ── Question Bank Settings Popover ────────────────────────────────── */}
      <Popover
        open={Boolean(settingsAnchorEl)}
        anchorEl={settingsAnchorEl}
        onClose={handleCloseSettings}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              width: 380,
              borderRadius: 2.5,
              boxShadow: (t) => t.shadows[16],
              overflow: 'hidden',
            },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                bgcolor: 'primary.lighter',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="mingcute:settings-3-line" color="primary.main" width={18} />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>
                Question Bank Settings
              </Typography>
              <Typography variant="caption" color="text.disabled">
                Changes save when you click Save
              </Typography>
            </Box>
          </Stack>
          <IconButton size="small" onClick={handleCloseSettings}>
            <Iconify icon="mingcute:close-line" width={18} />
          </IconButton>
        </Box>

        {/* Scrollable body */}
        <Box sx={{ maxHeight: 480, overflowY: 'auto', px: 2.5, py: 2 }}>
          <Stack spacing={0}>
            {/* Approve comment */}
            <TextField
              fullWidth
              size="small"
              label="Default approve comment"
              value={localReviewComment}
              onChange={(e) => setLocalReviewComment(e.target.value)}
              placeholder="Optional comment added when approving…"
              sx={{ mb: 2.5 }}
            />

            {/* Required Fields section */}
            <Typography
              variant="overline"
              color="text.disabled"
              sx={{ letterSpacing: 1, fontSize: '0.68rem', mb: 0.5 }}
            >
              Required Fields
            </Typography>
            {[
              {
                field: 'requireChapter',
                label: 'Require chapter',
                desc: 'Every question must be linked to a chapter',
              },
              {
                field: 'requireTopic',
                label: 'Require topic',
                desc: 'Force teachers to enter a topic name',
              },
              {
                field: 'requireDifficulty',
                label: 'Require difficulty level',
                desc: 'Easy / Medium / Hard must be set',
              },
              {
                field: 'requireBloomLevel',
                label: "Require Bloom's level",
                desc: 'Cognitive taxonomy tag is mandatory',
              },
              {
                field: 'requireAnswerKey',
                label: 'Require answer key',
                desc: 'Must be filled for subjective types',
              },
              {
                field: 'requireLearningOutcome',
                label: 'Require learning outcome',
                desc: 'Outcome tag improves report quality',
              },
            ].map(({ field, label, desc }, idx, arr) => (
              <Box
                key={field}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 1.25,
                  borderBottom: idx < arr.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    {label}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {desc}
                  </Typography>
                </Box>
                <Switch
                  size="small"
                  checked={localSettings?.[field] ?? false}
                  onChange={(_, checked) =>
                    setLocalSettings((prev: any) => ({ ...prev, [field]: checked }))
                  }
                />
              </Box>
            ))}

            {/* Marks & Validation section */}
            <Typography
              variant="overline"
              color="text.disabled"
              sx={{ letterSpacing: 1, fontSize: '0.68rem', mt: 2, mb: 0.5 }}
            >
              Marks & Validation
            </Typography>
            {[
              {
                field: 'allowDecimalMarks',
                label: 'Allow decimal marks',
                desc: 'Permit 0.5, 1.5 etc. as mark values',
              },
              {
                field: 'enableNegativeMarking',
                label: 'Negative marking',
                desc: 'Show negative marks field on MCQs',
              },
              {
                field: 'enableDuplicateCheck',
                label: 'Duplicate detection',
                desc: 'Warn when similar question exists',
              },
              {
                field: 'enableQuestionVersioning',
                label: 'Question versioning',
                desc: 'Lock used questions and create new versions on edit',
              },
            ].map(({ field, label, desc }, idx, arr) => (
              <Box
                key={field}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 1.25,
                  borderBottom: idx < arr.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    {label}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {desc}
                  </Typography>
                </Box>
                <Switch
                  size="small"
                  checked={localSettings?.[field] ?? false}
                  onChange={(_, checked) =>
                    setLocalSettings((prev: any) => ({ ...prev, [field]: checked }))
                  }
                />
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            px: 2.5,
            py: 1.75,
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1,
            bgcolor: 'background.neutral',
          }}
        >
          <CancelButton onClick={handleCloseSettings} />
          <SubmitButton
            buttonText="Save"
            loading={isSaveSettingsLoading}
            onClick={handleSaveSettings}
          />
        </Box>
      </Popover>

      {/* ── Create Question Dialog ─────────────────────────────────────────── */}
      <CustomDialog
        open={dialogOpen}
        handleClose={() => setDialogOpen(false)}
        title={
          <Box
            display="flex"
            flexDirection="row"
            gap={1}
            alignItems="center"
            component="span"
            sx={{ fontWeight: 'normal' }}
          >
            <Box component="span" sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
              Create New Question
            </Box>
            <CustomTooltip
              arrow
              placement="right"
              title="Add a new assessment question with classification, scoring rules, choices, and marking schemes."
            >
              <Iconify
                icon={GlobalIcons.info}
                sx={{ cursor: 'pointer' }}
                color="info.main"
                width={16}
                height={16}
              />
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
              subjectOptions={formSubjectOptions}
              chapterOptions={formChapterOptions}
              isSubjectLoading={isFormSubjectLoading || isFormSubjectFetching}
              isChapterLoading={isFormChapterLoading || isFormChapterFetching}
              onTypeChange={handleQuestionTypeChange}
              onOptionChange={handleOptionChange}
              theme={theme}
              settings={settings}
            />
          </DialogScrollContent>

          <DialogActions
            sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider', gap: 1 }}
          >
            <CancelButton onClick={() => setDialogOpen(false)} />
            <SubmitButton
              loading={isCreateLoading}
              buttonText="Save Draft"
              startIcon={<Iconify icon="mingcute:save-line" />}
            />
          </DialogActions>
        </form>
      </CustomDialog>

      {/* ── Edit Question Dialog ───────────────────────────────────────────── */}
      <CustomDialog
        open={editDialogOpen}
        handleClose={() => {
          setEditDialogOpen(false);
          setSelectedQuestion(null);
        }}
        title={
          <Box
            display="flex"
            flexDirection="row"
            gap={1}
            alignItems="center"
            component="span"
            sx={{ fontWeight: 'normal' }}
          >
            <Box component="span" sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
              {`Edit Question${selectedQuestion?.isLocked ? ' (Locked – Versioning)' : ''}`}
            </Box>
            <CustomTooltip
              arrow
              placement="right"
              title="Modify question content, scoring properties, options, or marking schemes."
            >
              <Iconify
                icon={GlobalIcons.info}
                sx={{ cursor: 'pointer' }}
                color="info.main"
                width={16}
                height={16}
              />
            </CustomTooltip>
          </Box>
        }
        maxWidth="md"
        hasForm={false}
      >
        <form
          onSubmit={editFormik.handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
        >
          <DialogScrollContent>
            {selectedQuestion?.isLocked && (
              <Alert severity="info" sx={{ mb: 2, borderRadius: 1.5 }}>
                This question has been used in a published paper. Saving will create a new version
                (v{(selectedQuestion.versionNumber || 1) + 1}) and submit it for re-approval.
              </Alert>
            )}
            <QuestionFormFields
              formik={editFormik}
              classOptions={classOptions}
              subjectOptions={editSubjectOptions}
              chapterOptions={editChapterOptions}
              isSubjectLoading={isEditSubjectLoading || isEditSubjectFetching}
              isChapterLoading={isEditChapterLoading || isEditChapterFetching}
              onTypeChange={handleEditQuestionTypeChange}
              onOptionChange={handleEditOptionChange}
              theme={theme}
              settings={settings}
            />
          </DialogScrollContent>

          <DialogActions
            sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider', gap: 1 }}
          >
            <CancelButton
              onClick={() => {
                setEditDialogOpen(false);
                setSelectedQuestion(null);
              }}
            />
            <SubmitButton
              loading={isUpdateLoading}
              buttonText="Save Changes"
              startIcon={<Iconify icon="mingcute:save-line" />}
            />
          </DialogActions>
        </form>
      </CustomDialog>

      {/* ── Reject Question Dialog ─────────────────────────────────────────── */}
      <CustomDialog
        open={rejectDialogOpen}
        handleClose={() => setRejectDialogOpen(false)}
        title={
          <Stack direction="row" alignItems="center" spacing={1} component="span">
            <Iconify icon="mingcute:close-circle-line" color="error.main" />
            <Box component="span" sx={{ fontWeight: 700 }}>
              Reject Question
            </Box>
          </Stack>
        }
        maxWidth="xs"
      >
        <DialogScrollContent onSubmit={handleRejectConfirm}>
          <TextField
            fullWidth
            size="small"
            multiline
            minRows={3}
            label="Rejection reason *"
            value={rejectCommentText}
            onChange={(e) => setRejectCommentText(e.target.value)}
            placeholder="Explain why this question is being rejected so the teacher can correct it…"
            autoFocus
            sx={{ mt: 1 }}
          />
          <DialogActions sx={{ px: 0, pb: 0, pt: 2, gap: 1 }}>
            <CancelButton onClick={() => setRejectDialogOpen(false)} />
            <LoadingButton
              variant="contained"
              color="error"
              size="small"
              loading={isRejectLoading}
              disabled={!rejectCommentText.trim() || isRejectLoading}
              onClick={handleRejectConfirm}
              startIcon={<Iconify icon="mingcute:close-circle-line" />}
            >
              Reject
            </LoadingButton>
          </DialogActions>
        </DialogScrollContent>
      </CustomDialog>

      {/* ── Confirm Delete Question Dialog ── */}
      <ConfirmDialog
        open={!!deleteQuestionId}
        title="Delete Question"
        content="This action cannot be undone. The question will be permanently deleted from the Question Bank."
        icon="warning"
        onClose={() => setDeleteQuestionId(null)}
        action={
          <LoadingButton
            variant="contained"
            color="error"
            size="small"
            loading={isDeleteLoading}
            onClick={handleConfirmDeleteQuestion}
          >
            Delete
          </LoadingButton>
        }
      />

      {/* ── Confirm Archive Question Dialog ── */}
      <ConfirmDialog
        open={!!archiveQuestionId}
        title="Archive Question"
        content="Archiving will hide this question from paper builder selection. Historical papers that already use this question will be unaffected."
        icon="warning"
        onClose={() => setArchiveQuestionId(null)}
        action={
          <LoadingButton
            variant="contained"
            color="warning"
            size="small"
            loading={isArchiveLoading}
            onClick={handleConfirmArchiveQuestion}
          >
            Archive
          </LoadingButton>
        }
      />
    </Box>
  );
}
