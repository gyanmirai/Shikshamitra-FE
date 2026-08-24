'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { academicPermissions } from 'src/constants/academic-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { fDate } from 'src/utils/format-time';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import { varAlpha, stylesMode } from 'src/theme/styles';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import { LanguageInputField } from 'src/screens/academic/components/language-typing';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomUpload from 'src/components/custom-upload/custom-upload';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import { useGetChaptersByStandardQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api';
import {
  Box,
  Card,
  Chip,
  Grid,
  Paper,
  Stack,
  Alert,
  Button,
  Switch,
  Drawer,
  Popover,
  Divider,
  Tooltip,
  Checkbox,
  Skeleton,
  MenuList,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  ToggleButton,
  DialogActions,
  ToggleButtonGroup,
} from '@mui/material';
import {
  useGetQuestionsQuery,
  useUpdateQuestionMutation,
  useSubmitQuestionMutation,
  useApproveQuestionMutation,
  useRejectQuestionMutation,
  useDeleteQuestionMutation,
  useArchiveQuestionMutation,
  useDuplicateQuestionMutation,
  useGetQuestionBankSettingsQuery,
  useGetQuestionBankDashboardQuery,
  useSaveQuestionBankSettingsMutation,
} from 'src/redux/academicAPI/ExaminationApi/QuestionBankApi/question-bank-api';

import CreateQuestionDialog from './components/CreateQuestionDialog';
import {
  toQuestionBody,
  createInitialQuestionValues,
  buildQuestionValidationSchema,
  normalizeSingleCorrectOptions,
} from './components/questionFormModel';

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
const ALL_SCOPE_VALUE = '__all__';
const ADVANCED_FILTER_LABELS: Record<string, string> = {
  questionType: 'Type',
  topicName: 'Topic',
  difficultyLevel: 'Difficulty',
  bloomLevel: "Bloom's Level",
  marks: 'Marks',
  status: 'Status',
  createdBy: 'Created By',
  createdDate: 'Created Date',
  updatedDate: 'Updated Date',
  timesUsed: 'Times Used',
};

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

// ─── Stat Card Component ──────────────────────────────────────────────────────

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
            bgcolor: (t) => varAlpha(t.vars.palette[color].mainChannel, 0.12),
            color: `${color}.main`,
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
      bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
      borderColor: 'divider',
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
              bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
            }}
          >
            <Iconify icon={icon} width={18} height={18} />
          </Box>
          <Stack spacing={0.2}>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary">
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

function QuestionPreviewDrawer({
  question,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  onSubmit,
}: {
  question: any;
  onClose: () => void;
  onEdit: (question: any) => void;
  onDuplicate: (question: any) => void;
  onDelete: (question: any) => void;
  onSubmit?: (id: string) => void;
}) {
  const [cachedQuestion, setCachedQuestion] = useState(question);

  useEffect(() => {
    if (question) {
      setCachedQuestion(question);
    }
  }, [question]);

  const targetQuestion = question || cachedQuestion;
  if (!targetQuestion) return null;

  const typeObj = QUESTION_TYPE_OPTIONS.find(
    (item) => item.value === Number(targetQuestion.questionType)
  );
  const difficultyObj = DIFFICULTY_OPTIONS.find(
    (item) => item.value === Number(targetQuestion.difficultyLevel)
  );
  const bloomObj = BLOOM_OPTIONS.find((item) => item.value === Number(targetQuestion.bloomLevel));
  const statusObj = STATUS_OPTIONS.find((item) => item.value === Number(targetQuestion.status));

  return (
    <Drawer
      anchor="right"
      open={Boolean(question)}
      onClose={onClose}
      transitionDuration={{ enter: 350, exit: 250 }}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: (theme) => varAlpha(theme.vars.palette.grey['900Channel'], 0.28),
            backdropFilter: 'blur(3px)',
            transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1) !important',
          },
        },
      }}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 480 },
          boxShadow: (theme) =>
            `-12px 0 40px -4px ${varAlpha(theme.vars.palette.grey['900Channel'], 0.24)}`,
        },
      }}
    >
      <Stack height="100%" minHeight={0} bgcolor="background.paper">
        {/* Top Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            px: 2.5,
            py: 2,
            flexShrink: 0,
            borderBottom: '1px solid',
            borderColor: 'divider',
            background: (theme) =>
              `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.08)} 0%, ${varAlpha(theme.vars.palette.info.mainChannel, 0.04)} 100%)`,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.14),
                color: 'primary.main',
              }}
            >
              <Iconify icon="solar:document-text-bold-duotone" width={22} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                Question Preview
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Assessment detail and properties
              </Typography>
            </Box>
          </Stack>
          <IconButton
            onClick={onClose}
            aria-label="Close question preview"
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
            }}
          >
            <Iconify icon="mingcute:close-line" width={20} />
          </IconButton>
        </Stack>

        <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
          <Stack spacing={2} sx={{ p: 2.5 }}>
            {/* Quick Status / Properties Badges */}
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
              <Label
                variant="filled"
                color={(STATUS_COLOR[Number(targetQuestion.status)] as any) || 'default'}
                sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem' }}
              >
                {statusObj?.label || 'Draft'}
              </Label>
              <Label
                variant="soft"
                color={
                  (DIFFICULTY_COLOR[Number(targetQuestion.difficultyLevel)] as any) || 'default'
                }
                sx={{ fontWeight: 600 }}
              >
                {difficultyObj?.label || 'Easy'}
              </Label>
              {bloomObj && (
                <Label variant="soft" color="info" sx={{ fontWeight: 600 }}>
                  Bloom: {bloomObj.label}
                </Label>
              )}
              <Label variant="soft" color="primary" sx={{ fontWeight: 700, ml: 'auto' }}>
                {targetQuestion.marks ?? 1} {targetQuestion.marks === 1 ? 'Mark' : 'Marks'}
                {targetQuestion.negativeMarks ? ` (-${targetQuestion.negativeMarks})` : ''}
              </Label>
            </Stack>

            {/* Question Statement Card */}
            <Paper
              variant="outlined"
              sx={{
                p: 2.25,
                borderRadius: 2,
                bgcolor: (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.02),
                borderColor: (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.2),
                boxShadow: (t) =>
                  `0 4px 16px 0 ${varAlpha(t.vars.palette.primary.mainChannel, 0.05)}`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: 4,
                  height: '100%',
                  bgcolor: 'primary.main',
                }}
              />
              <Stack spacing={1.25}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Chip
                    size="small"
                    icon={<Iconify icon="solar:notes-bold-duotone" width={14} />}
                    label={typeObj?.label || 'Question'}
                    color="primary"
                    variant="soft"
                    sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                  />
                  {targetQuestion.createdAt && (
                    <Typography variant="caption" color="text.disabled">
                      {fDate(targetQuestion.createdAt, 'dd MMM yyyy')}
                    </Typography>
                  )}
                </Stack>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  sx={{
                    lineHeight: 1.6,
                    color: 'text.primary',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {targetQuestion.questionText || '—'}
                </Typography>
                {!!targetQuestion.tags?.length && (
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ pt: 0.5 }}>
                    {targetQuestion.tags.map((tag: string) => (
                      <Chip
                        key={tag}
                        size="small"
                        label={`#${tag}`}
                        variant="outlined"
                        sx={{ fontSize: '0.72rem', height: 22 }}
                      />
                    ))}
                  </Stack>
                )}
              </Stack>
            </Paper>

            {/* Academic Classification Grid */}
            <Stack spacing={1}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ letterSpacing: 0.8, fontSize: '0.7rem' }}
              >
                Curriculum Hierarchy
              </Typography>
              <Grid container spacing={1.25}>
                <Grid size={6}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: (t) => varAlpha(t.vars.palette.info.mainChannel, 0.06),
                      border: '1px solid',
                      borderColor: (t) => varAlpha(t.vars.palette.info.mainChannel, 0.16),
                    }}
                  >
                    <Stack direction="row" spacing={0.75} alignItems="center" mb={0.5}>
                      <Iconify icon="solar:buildings-2-bold-duotone" width={16} color="info.main" />
                      <Typography variant="caption" color="text.secondary">
                        Class
                      </Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight={700} color="text.primary" noWrap>
                      {targetQuestion.standardName || targetQuestion.standard?.name || '—'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={6}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.06),
                      border: '1px solid',
                      borderColor: (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.16),
                    }}
                  >
                    <Stack direction="row" spacing={0.75} alignItems="center" mb={0.5}>
                      <Iconify icon="solar:notebook-bold-duotone" width={16} color="primary.main" />
                      <Typography variant="caption" color="text.secondary">
                        Subject
                      </Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight={700} color="text.primary" noWrap>
                      {targetQuestion.subjectName || targetQuestion.subject?.name || '—'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={6}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: (t) => varAlpha(t.vars.palette.warning.mainChannel, 0.06),
                      border: '1px solid',
                      borderColor: (t) => varAlpha(t.vars.palette.warning.mainChannel, 0.16),
                    }}
                  >
                    <Stack direction="row" spacing={0.75} alignItems="center" mb={0.5}>
                      <Iconify
                        icon="solar:bookmark-opened-bold-duotone"
                        width={16}
                        color="warning.main"
                      />
                      <Typography variant="caption" color="text.secondary">
                        Chapter
                      </Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight={700} color="text.primary" noWrap>
                      {targetQuestion.chapterName ||
                        targetQuestion.chapter?.chapterName ||
                        targetQuestion.chapter?.name ||
                        '—'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={6}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: (t) => varAlpha(t.vars.palette.secondary.mainChannel, 0.06),
                      border: '1px solid',
                      borderColor: (t) => varAlpha(t.vars.palette.secondary.mainChannel, 0.16),
                    }}
                  >
                    <Stack direction="row" spacing={0.75} alignItems="center" mb={0.5}>
                      <Iconify
                        icon="solar:hashtag-bold-duotone"
                        width={16}
                        color="secondary.main"
                      />
                      <Typography variant="caption" color="text.secondary">
                        Topic
                      </Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight={700} color="text.primary" noWrap>
                      {targetQuestion.topicName || targetQuestion.topic?.name || '—'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Stack>

            {/* Options List */}
            {!!targetQuestion.options?.length && (
              <Stack spacing={1}>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ letterSpacing: 0.8, fontSize: '0.7rem' }}
                >
                  Choice Options ({targetQuestion.options.length})
                </Typography>
                <Stack spacing={1}>
                  {targetQuestion.options.map((option: any, index: number) => {
                    const isCorrect = Boolean(option.isCorrect);
                    const letter = String.fromCharCode(65 + index);
                    return (
                      <Box
                        key={`${option.optionText}-${index}`}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          p: 1.25,
                          borderRadius: 1.5,
                          border: '1px solid',
                          borderColor: isCorrect ? 'success.main' : 'divider',
                          bgcolor: (t) =>
                            isCorrect
                              ? varAlpha(t.vars.palette.success.mainChannel, 0.08)
                              : varAlpha(
                                  t.vars.palette.background.neutralChannel ||
                                    t.vars.palette.grey['500Channel'],
                                  0.04
                                ),
                          transition: 'all 0.2s',
                        }}
                      >
                        <Box
                          sx={{
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            bgcolor: isCorrect ? 'success.main' : 'action.selected',
                            color: isCorrect ? 'success.contrastText' : 'text.secondary',
                            flexShrink: 0,
                          }}
                        >
                          {letter}
                        </Box>
                        <Typography
                          variant="body2"
                          fontWeight={isCorrect ? 700 : 500}
                          color={isCorrect ? 'success.darker' : 'text.primary'}
                          sx={{ flex: 1 }}
                        >
                          {option.optionText || '—'}
                        </Typography>
                        {isCorrect && (
                          <Chip
                            size="small"
                            color="success"
                            icon={<Iconify icon="solar:check-circle-bold" width={14} />}
                            label="Correct"
                            sx={{ height: 22, fontWeight: 700, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              </Stack>
            )}

            {/* Answer Key */}
            {targetQuestion.answerKey && (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: (t) => varAlpha(t.vars.palette.success.mainChannel, 0.08),
                  border: '1px solid',
                  borderColor: (t) => varAlpha(t.vars.palette.success.mainChannel, 0.24),
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                  <Iconify icon="solar:key-bold-duotone" width={18} color="success.main" />
                  <Typography variant="subtitle2" fontWeight={700} color="success.darker">
                    Answer Key
                  </Typography>
                </Stack>
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  {targetQuestion.answerKey}
                </Typography>
              </Box>
            )}

            {/* Explanation / Marking Scheme */}
            {(targetQuestion.explanation || targetQuestion.markingScheme) && (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: (t) => varAlpha(t.vars.palette.info.mainChannel, 0.06),
                  border: '1px solid',
                  borderColor: (t) => varAlpha(t.vars.palette.info.mainChannel, 0.2),
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                  <Iconify icon="solar:lightbulb-bolt-bold-duotone" width={18} color="info.main" />
                  <Typography variant="subtitle2" fontWeight={700} color="info.darker">
                    Explanation & Marking Scheme
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {targetQuestion.explanation || targetQuestion.markingScheme}
                </Typography>
              </Box>
            )}

            {/* Learning outcome */}
            {targetQuestion.learningOutcome && (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: (t) => varAlpha(t.vars.palette.secondary.mainChannel, 0.06),
                  border: '1px solid',
                  borderColor: (t) => varAlpha(t.vars.palette.secondary.mainChannel, 0.2),
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                  <Iconify
                    icon="solar:star-fall-minimalistic-2-bold-duotone"
                    width={18}
                    color="secondary.main"
                  />
                  <Typography variant="subtitle2" fontWeight={700} color="secondary.darker">
                    Learning Outcome
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {targetQuestion.learningOutcome}
                </Typography>
              </Box>
            )}

            {/* Usage stats & Teacher Metadata */}
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ pt: 0.5 }}>
              <Chip
                size="small"
                variant="outlined"
                icon={<Iconify icon="solar:history-bold-duotone" width={14} />}
                label={`Times Used: ${targetQuestion.usedCount ?? 0}`}
                sx={{ fontSize: '0.75rem' }}
              />
              {(targetQuestion.createdByName || targetQuestion.createdByTeacher?.name) && (
                <Chip
                  size="small"
                  variant="outlined"
                  icon={<Iconify icon="solar:user-rounded-bold-duotone" width={14} />}
                  label={`Created by: ${targetQuestion.createdByName || targetQuestion.createdByTeacher?.name}`}
                  sx={{ fontSize: '0.75rem' }}
                />
              )}
            </Stack>
          </Stack>
        </Scrollbar>

        {/* Footer Actions */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            p: 2,
            flexShrink: 0,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Button
            fullWidth
            variant="contained"
            size="small"
            onClick={() => onEdit(targetQuestion)}
            startIcon={<Iconify icon="solar:pen-bold" />}
            sx={{ height: 36 }}
          >
            Edit
          </Button>
          {(targetQuestion.status === 1 || targetQuestion.status === 4) && onSubmit && (
            <Button
              fullWidth
              variant="soft"
              color="info"
              size="small"
              onClick={() => onSubmit(targetQuestion.id)}
              startIcon={<Iconify icon="solar:plain-bold" />}
              sx={{ height: 36 }}
            >
              Submit
            </Button>
          )}
          <Button
            fullWidth
            variant="outlined"
            size="small"
            onClick={() => onDuplicate(targetQuestion)}
            startIcon={<Iconify icon="solar:copy-bold" />}
            sx={{ height: 36 }}
          >
            Duplicate
          </Button>
          <Tooltip title="Delete question">
            <IconButton
              color="error"
              size="small"
              onClick={() => onDelete(targetQuestion)}
              aria-label="Delete question"
              sx={{
                width: 36,
                height: 36,
                flexShrink: 0,
                border: '1px solid',
                borderColor: (t) => varAlpha(t.vars.palette.error.mainChannel, 0.24),
                bgcolor: (t) => varAlpha(t.vars.palette.error.mainChannel, 0.08),
                borderRadius: 1,
                '&:hover': {
                  bgcolor: (t) => varAlpha(t.vars.palette.error.mainChannel, 0.16),
                },
              }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" width={18} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Drawer>
  );
}

function QuestionCardsGrid({
  rows,
  selectedIds,
  density,
  onToggle,
  onPreview,
}: {
  rows: any[];
  selectedIds: Set<string>;
  density: 'compact' | 'comfortable';
  onToggle: (id: string) => void;
  onPreview: (row: any) => void;
}) {
  if (!rows.length) {
    return (
      <Card
        variant="outlined"
        sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: 2,
          bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.02),
        }}
      >
        <Stack alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.08),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main',
            }}
          >
            <Iconify icon="solar:document-text-bold-duotone" width={32} />
          </Box>
          <Typography variant="subtitle1" fontWeight={700}>
            No questions found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
            Adjust your scope filters above or create a new question to populate the question bank.
          </Typography>
        </Stack>
      </Card>
    );
  }

  return (
    <Stack spacing={1}>
      {rows.map((row, index) => {
        const isEligible = row.status === 1 || row.status === 4;
        const isSelected = selectedIds.has(row.id);
        const difficulty = DIFFICULTY_OPTIONS.find(
          (item) => item.value === Number(row.difficultyLevel)
        )?.label;
        const status = STATUS_OPTIONS.find((item) => item.value === Number(row.status));
        const questionType = QUESTION_TYPE_OPTIONS.find(
          (item) => item.value === Number(row.questionType)
        )?.label;
        const hierarchyText = [row.subjectName, row.chapterName, row.topicName]
          .filter(Boolean)
          .join(' › ');

        return (
          <Card
            key={row.id}
            variant="outlined"
            onClick={() => onPreview(row)}
            sx={{
              p: { xs: 1.5, sm: 1.75 },
              borderRadius: 1.5,
              cursor: 'pointer',
              borderColor: isSelected ? 'primary.main' : 'divider',
              bgcolor: isSelected
                ? (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.04)
                : 'background.paper',
              boxShadow: isSelected ? (theme) => `0 0 0 1px ${theme.palette.primary.main}` : 'none',
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                borderColor: isSelected ? 'primary.main' : 'text.disabled',
                bgcolor: (theme) =>
                  isSelected
                    ? varAlpha(theme.vars.palette.primary.mainChannel, 0.06)
                    : 'action.hover',
              },
            }}
          >
            {/* Left Status Indicator Stripe */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: 3,
                bgcolor: (theme) => {
                  if (isSelected) return theme.palette.primary.main;
                  const statusColor = STATUS_COLOR[Number(row.status)];
                  if (!statusColor || statusColor === 'default') return theme.palette.divider;
                  return theme.palette[statusColor].main;
                },
              }}
            />

            <Stack
              direction={{ xs: 'column', md: 'row' }}
              alignItems={{ xs: 'flex-start', md: 'center' }}
              justifyContent="space-between"
              spacing={1.5}
            >
              {/* Left Info */}
              <Stack
                direction="row"
                spacing={1.25}
                alignItems="flex-start"
                sx={{ minWidth: 0, flex: 1 }}
              >
                {/* Checkbox */}
                <Box sx={{ pt: 0.25, flexShrink: 0 }}>
                  <Checkbox
                    size="small"
                    checked={isSelected}
                    disabled={!isEligible}
                    onClick={(event) => event.stopPropagation()}
                    onChange={() => onToggle(row.id)}
                    inputProps={{ 'aria-label': `Select question ${row.questionText}` }}
                    sx={{ p: 0.25 }}
                  />
                </Box>

                {/* Index Pill */}
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    display: { xs: 'none', sm: 'flex' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    bgcolor: (t) =>
                      isSelected
                        ? varAlpha(t.vars.palette.primary.mainChannel, 0.12)
                        : varAlpha(t.vars.palette.grey['500Channel'], 0.08),
                    color: isSelected ? 'primary.main' : 'text.secondary',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                >
                  #{index + 1}
                </Box>

                {/* Question Details */}
                <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
                  {/* Question Text */}
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    sx={{
                      lineHeight: 1.45,
                      color: 'text.primary',
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2,
                      overflow: 'hidden',
                    }}
                  >
                    {row.questionText || '—'}
                  </Typography>

                  {/* Taxonomy / Hierarchy */}
                  <Stack
                    direction="row"
                    spacing={0.75}
                    alignItems="center"
                    flexWrap="wrap"
                    useFlexGap
                  >
                    {questionType && (
                      <Chip
                        size="small"
                        label={questionType}
                        variant="soft"
                        sx={{ height: 20, fontSize: '0.7rem', fontWeight: 500 }}
                      />
                    )}
                    {row.standardName && (
                      <Chip
                        size="small"
                        variant="outlined"
                        icon={<Iconify icon="solar:buildings-2-bold-duotone" width={12} />}
                        label={row.standardName}
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                    {hierarchyText && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          maxWidth: { xs: '100%', md: 380 },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Iconify
                          icon="solar:notebook-bold-duotone"
                          width={13}
                          sx={{ flexShrink: 0 }}
                        />
                        {hierarchyText}
                      </Typography>
                    )}
                    {!!row.tags?.length && (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {row.tags.slice(0, 3).map((tag: string) => (
                          <Chip
                            key={tag}
                            size="small"
                            label={`#${tag}`}
                            variant="soft"
                            sx={{ height: 18, fontSize: '0.65rem', px: 0.25 }}
                          />
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </Stack>
              </Stack>

              {/* Right Badges & Metrics */}
              <Stack
                direction="row"
                spacing={1.25}
                alignItems="center"
                justifyContent={{ xs: 'space-between', md: 'flex-end' }}
                sx={{
                  flexShrink: 0,
                  width: { xs: '100%', md: 'auto' },
                  pt: { xs: 0.75, md: 0 },
                  borderTop: { xs: '1px dashed', md: 'none' },
                  borderColor: 'divider',
                  pl: { xs: 4, md: 0 },
                }}
              >
                {/* Difficulty & Status */}
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Label
                    variant="soft"
                    color={(DIFFICULTY_COLOR[Number(row.difficultyLevel)] as any) || 'default'}
                    sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                  >
                    {difficulty || '—'}
                  </Label>
                  <Label
                    variant="soft"
                    color={(STATUS_COLOR[Number(row.status)] as any) || 'default'}
                    sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                  >
                    {status?.label || '—'}
                  </Label>
                </Stack>

                {/* Marks */}
                <Typography
                  variant="caption"
                  sx={{
                    px: 1,
                    py: 0.35,
                    borderRadius: 0.75,
                    fontWeight: 700,
                    bgcolor: 'action.hover',
                    color: 'text.secondary',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {row.marks ?? '—'} mk
                </Typography>

                {/* Created Date */}
                {row.createdAt && (
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{
                      minWidth: 70,
                      textAlign: 'right',
                      display: { xs: 'none', lg: 'block' },
                    }}
                  >
                    {fDate(row.createdAt, 'dd MMM yyyy')}
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );
}

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
  creationMode,
  setCreationMode,
  onDownloadTemplate,
  isTemplateDownloading,
}: any) {
  const showOptions = [1, 2, 3].includes(formik.values.questionType);
  const requireChapter = !!settings?.requireChapter;
  const requireTopic = !!settings?.requireTopic;

  return (
    <Stack spacing={2}>
      {creationMode && setCreationMode && (
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
        </Grid>
      )}

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
              <LanguageInputField
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

      {creationMode !== 'upload' && (
        <>
          {/* ── 2. Question Content ──────────────────────────────────── */}
          <SectionPaper
            title="Question Content"
            caption="Enter the main statement or prompt for this question"
            icon="solar:pen-bold-duotone"
          >
            <ShakingTextField error={formik.touched.questionText && !!formik.errors.questionText}>
              <LanguageInputField
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
                      borderColor: option.isCorrect ? 'success.main' : 'divider',
                      bgcolor: option.isCorrect
                        ? (t) => varAlpha(t.vars.palette.success.mainChannel, 0.08)
                        : (t) => varAlpha(t.vars.palette.background.paperChannel, 0.4),
                      transition: 'all 0.2s',
                    }}
                  >
                    <LanguageInputField
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
                <LanguageInputField
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
                <LanguageInputField
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
                <LanguageInputField
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
        </>
      )}

      {creationMode === 'upload' && (
        <SectionPaper
          title="Upload File"
          caption="Drag and drop your Excel template here"
          icon="solar:upload-bold-duotone"
          action={
            <Button
              size="small"
              variant="outlined"
              color="primary"
              startIcon={<Iconify icon="solar:download-bold" />}
              disabled={isTemplateDownloading}
              onClick={onDownloadTemplate}
            >
              {isTemplateDownloading ? 'Downloading...' : 'Download Template'}
            </Button>
          }
        >
          <Box
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              bgcolor: (t) => varAlpha(t.vars.palette.info.mainChannel, 0.08),
              border: '1px dashed',
              borderColor: (t) => varAlpha(t.vars.palette.info.mainChannel, 0.24),
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: (t) => varAlpha(t.vars.palette.info.mainChannel, 0.16),
                  color: 'info.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  [stylesMode.dark]: { color: 'info.light' },
                }}
              >
                <Iconify icon="solar:document-text-bold" width={24} />
              </Box>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: 'info.darker',
                    [stylesMode.dark]: { color: 'info.light' },
                  }}
                >
                  Bulk Upload Guidelines
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Please use our Excel template. Ensure columns like Question Text, Option 1, Option
                  2, etc., and Marks are filled before uploading.
                </Typography>
              </Box>
            </Stack>
          </Box>

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
        </SectionPaper>
      )}
    </Stack>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function QuestionBankScreen() {
  const theme = useTheme();
  const { currentYear, currentMedium: medium } = useSelector(
    (state: RootState) => state.globalState
  );
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const questionBankPermission = academicPermissions.examination.questionBank;
  const canView = hasGrantedPermission(permissions, `${questionBankPermission}.View`);
  const canAdd = hasGrantedPermission(permissions, `${questionBankPermission}.Add`);
  const canDelete = hasGrantedPermission(permissions, `${questionBankPermission}.Delete`);
  const academicYearId = currentYear?.id;

  const [filters, setFilters] = useState<any>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [localSettings, setLocalSettings] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [previewQuestion, setPreviewQuestion] = useState<any>(null);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [advancedAnchorEl, setAdvancedAnchorEl] = useState<HTMLElement | null>(null);
  const [advancedDraft, setAdvancedDraft] = useState<any>({});
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [density, setDensity] = useState<'compact' | 'comfortable'>('compact');

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
  const [updateQuestion, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateQuestionMutation,
  });
  const [submitQuestion] = useQueryAndMutation({
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

  // Formik for edit question dialog
  const editFormik = useFormik({
    initialValues: createInitialQuestionValues(academicYearId),
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
    setDialogOpen(true);
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
        visibility: question.visibility || 2,
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
        file: null,
      },
    });
    setEditDialogOpen(true);
  };

  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);
  const [archiveQuestionId, setArchiveQuestionId] = useState<string | null>(null);
  const [rejectQuestionId, setRejectQuestionId] = useState<string | null>(null);

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

  const handleApproveQuestion = async (id: string) => {
    try {
      await approveQuestion({ id, body: {} }).unwrap();
      shikshaMitraToast.success({ message: 'Question approved successfully.' });
    } catch (err: any) {
      shikshaMitraToast.error({
        message: err?.data?.detail || err?.data?.message || 'Failed to approve question.',
      });
    }
  };

  const handleConfirmRejectQuestion = async () => {
    if (!rejectQuestionId) return;
    try {
      await rejectQuestion({ id: rejectQuestionId, body: {} }).unwrap();
      shikshaMitraToast.success({ message: 'Question rejected.' });
    } catch (err: any) {
      shikshaMitraToast.error({
        message: err?.data?.detail || err?.data?.message || 'Failed to reject question.',
      });
    } finally {
      setRejectQuestionId(null);
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
    setSettingsAnchorEl(e.currentTarget);
  };

  const handleOpenAdvancedFilters = (event: React.MouseEvent<HTMLElement>) => {
    setAdvancedDraft({ ...filters });
    setAdvancedAnchorEl(event.currentTarget);
  };

  const handleApplyAdvancedFilters = () => {
    setFilters((current: any) => ({ ...current, ...advancedDraft }));
    setAdvancedAnchorEl(null);
  };

  const handleClearFilter = (key: string) => {
    setFilters((current: any) => {
      const next = { ...current };
      delete next[key];
      if (key === 'standardId') {
        delete next.subjectId;
        delete next.chapterId;
      }
      if (key === 'subjectId') delete next.chapterId;
      return next;
    });
  };
  const handleCloseSettings = () => setSettingsAnchorEl(null);
  const handleSaveSettings = async () => {
    if (!localSettings) return;
    try {
      await saveSettings(localSettings).unwrap();
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
      status: 3,
      icon: 'mingcute:check-circle-line',
      color: 'success' as StatColor,
    },
    {
      label: 'Draft',
      value: dashboard?.draftQuestions || 0,
      status: 1,
      icon: 'mingcute:file-line',
      color: 'info' as StatColor,
    },
    {
      label: 'Pending Review',
      value: dashboard?.pendingReview || 0,
      status: 2,
      icon: 'mingcute:time-line',
      color: 'warning' as StatColor,
    },
    {
      label: 'Rejected',
      value: dashboard?.rejectedQuestions || 0,
      status: 4,
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
            filterSubjectOptions.find((subjectOption: any) => subjectOption.value === row.subjectId)
              ?.label
        ),
        chapterName: displayNameOrPlaceholder(
          row.chapterName ||
            row.chapter?.chapterName ||
            row.chapter?.name ||
            (row.chapterNumber
              ? `${row.chapterNumber}. ${row.chapterName || ''}`
              : filterChapterOptions.find(
                  (chapterOption: any) => chapterOption.value === row.chapterId
                )?.label)
        ),
      })),
    [classOptions, data?.items, filterChapterOptions, filterSubjectOptions]
  );

  const eligibleQuestionIds = useMemo(
    () =>
      questionRows
        .filter((row: any) => row.status === 1 || row.status === 4)
        .map((row: any) => row.id),
    [questionRows]
  );

  useEffect(() => {
    const eligibleIds = new Set(eligibleQuestionIds);
    setSelectedQuestionIds((current) => {
      const next = new Set([...current].filter((id) => eligibleIds.has(id)));
      const isUnchanged = next.size === current.size && [...next].every((id) => current.has(id));
      return isUnchanged ? current : next;
    });
  }, [eligibleQuestionIds]);

  const handleToggleQuestion = (id: string) => {
    setSelectedQuestionIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleAllEligibleQuestions = () => {
    setSelectedQuestionIds((current) =>
      current.size === eligibleQuestionIds.length ? new Set() : new Set(eligibleQuestionIds)
    );
  };

  const handleBulkSubmitQuestions = async () => {
    const ids = [...selectedQuestionIds];
    if (!ids.length) return;

    setIsBulkSubmitting(true);
    const failedIds: string[] = [];
    const batchSize = 5;

    for (let index = 0; index < ids.length; index += batchSize) {
      const batchIds = ids.slice(index, index + batchSize);
      // The current backend contract exposes only single-question submit, so keep concurrency bounded.
      // eslint-disable-next-line no-await-in-loop
      const results = await Promise.allSettled(
        batchIds.map((id) => submitQuestion({ id }).unwrap())
      );
      results.forEach((result, resultIndex) => {
        if (result.status === 'rejected') failedIds.push(batchIds[resultIndex]);
      });
    }

    const submittedCount = ids.length - failedIds.length;

    setSelectedQuestionIds(new Set(failedIds));
    setIsBulkSubmitting(false);

    if (submittedCount) {
      shikshaMitraToast.success({
        message: `${submittedCount} question${submittedCount === 1 ? '' : 's'} submitted for review.`,
      });
    }
    if (failedIds.length) {
      shikshaMitraToast.error({
        message: `${failedIds.length} question${failedIds.length === 1 ? '' : 's'} could not be submitted. Please try again.`,
      });
    }
  };

  const questionColumns = useMemo(
    () => [
      {
        id: 'selection',
        label: '',
        renderColumn: () => (
          <Tooltip title="Select all draft or rejected questions">
            <span>
              <Checkbox
                size="small"
                checked={
                  eligibleQuestionIds.length > 0 &&
                  selectedQuestionIds.size === eligibleQuestionIds.length
                }
                indeterminate={
                  selectedQuestionIds.size > 0 &&
                  selectedQuestionIds.size < eligibleQuestionIds.length
                }
                disabled={!eligibleQuestionIds.length}
                onChange={handleToggleAllEligibleQuestions}
                inputProps={{ 'aria-label': 'Select all questions eligible for review' }}
              />
            </span>
          </Tooltip>
        ),
        isFilter: false,
        isSort: false,
        width: 56,
        align: 'center' as const,
        sticky: true,
        stickyPosition: 'left' as const,
        excludeFromExport: true,
        render: (_: any, row: any) => {
          const isEligible = row.status === 1 || row.status === 4;
          return (
            <Tooltip
              title={
                isEligible ? 'Select question' : 'Only draft or rejected questions can be submitted'
              }
            >
              <span>
                <Checkbox
                  size="small"
                  checked={selectedQuestionIds.has(row.id)}
                  disabled={!isEligible}
                  onClick={(event) => event.stopPropagation()}
                  onChange={() => handleToggleQuestion(row.id)}
                  inputProps={{ 'aria-label': `Select question ${row.questionText}` }}
                />
              </span>
            </Tooltip>
          );
        },
      },
      {
        id: 'questionText',
        label: 'Question',
        filterType: 'string' as const,
        minWidth: 280,
        sticky: true,
        stickyPosition: 'left' as const,
        render: (_: any, row: any) => (
          <Box>
            <Typography
              variant="body2"
              sx={{
                mb: row.tags?.length ? 0.5 : 0,
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
                overflow: 'hidden',
              }}
            >
              {row.questionText}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {QUESTION_TYPE_OPTIONS.find((item) => item.value === Number(row.questionType))
                ?.label || '—'}
              {' · '}
              {row.standardName || '—'}
            </Typography>
            {!!row.tags?.length && (
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {row.tags.map((tag: string) => (
                  <Label
                    key={tag}
                    variant="soft"
                    color="default"
                    sx={{ fontSize: '0.75rem', px: 0.75 }}
                  >
                    {tag}
                  </Label>
                ))}
              </Stack>
            )}
          </Box>
        ),
      },
      {
        id: 'classification',
        label: 'Classification',
        filterType: 'string' as const,
        width: 240,
        render: (_: any, row: any) => (
          <Typography variant="body2" color="text.secondary" noWrap>
            {[row.subjectName, row.chapterName, row.topicName].filter(Boolean).join(' › ') || '—'}
          </Typography>
        ),
      },
      {
        id: 'questionType',
        label: 'Type',
        filterType: 'enum' as const,
        width: 170,
        enumOptions: QUESTION_TYPE_OPTIONS.map((q) => ({ value: q.label, label: q.label })),
        defaultHidden: true,
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
            {row.standardName ||
              row.standard?.name ||
              classOptions.find((c: any) => c.value === row.standardId)?.label ||
              row.standardId ||
              '—'}
          </Typography>
        ),
      },
      {
        id: 'subjectName',
        label: 'Subject',
        filterType: 'string' as const,
        width: 140,
        defaultHidden: true,
        render: (_: any, row: any) => (
          <Typography variant="body2" color="text.primary" noWrap>
            {row.subjectName ||
              row.subject?.name ||
              filterSubjectOptions.find((s: any) => s.value === row.subjectId)?.label ||
              row.subjectId ||
              '—'}
          </Typography>
        ),
      },
      {
        id: 'chapterName',
        label: 'Chapter',
        filterType: 'string' as const,
        width: 150,
        defaultHidden: true,
        render: (_: any, row: any) => (
          <Typography variant="body2" color="text.primary" noWrap>
            {row.chapterName ||
              row.chapter?.chapterName ||
              row.chapter?.name ||
              (row.chapterNumber
                ? `${row.chapterNumber}. ${row.chapterName || ''}`
                : filterChapterOptions.find((c: any) => c.value === row.chapterId)?.label) ||
              row.chapterId ||
              '—'}
          </Typography>
        ),
      },
      {
        id: 'topicName',
        label: 'Topic',
        filterType: 'string' as const,
        width: 130,
        defaultHidden: true,
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
        render: (v: any) => (
          <Typography variant="body2" fontWeight={700}>
            {v ?? '—'}
          </Typography>
        ),
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
        defaultHidden: true,
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
        defaultHidden: true,
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
        defaultHidden: true,
        render: (_: any, row: any) => (
          <Typography variant="body2" color="text.secondary" noWrap>
            {row.createdByName ||
              row.createdByTeacher?.name ||
              row.createdByUserId ||
              row.createdByTeacherId ||
              '—'}
          </Typography>
        ),
      },
      {
        id: 'createdAt',
        label: 'Created On',
        filterType: 'date' as const,
        width: 120,
        defaultHidden: true,
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
            placement="right-top"
            showEditIcon={false}
            disableEditIcon={row.isLocked}
            handleEditClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(row);
            }}
            actions={({ popover }) => (
              <MenuList>
                {canView && (
                  <MenuItem
                    onClick={() => {
                      popover.onClose();
                      setPreviewQuestion(row);
                    }}
                  >
                    <Iconify icon="carbon:view-filled" sx={{ mr: 1, height: 16, width: 16 }} />
                    Preview
                  </MenuItem>
                )}
                {canAdd && (row.status === 1 || row.status === 4) && (
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
                {canAdd && row.status === 2 && (
                  <>
                    <MenuItem
                      onClick={() => {
                        popover.onClose();
                        handleApproveQuestion(row.id);
                      }}
                      disabled={isApproveLoading}
                    >
                      <Iconify
                        icon="mingcute:check-2-line"
                        sx={{ mr: 1, height: 16, width: 16, color: 'success.main' }}
                      />
                      Approve
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        popover.onClose();
                        setRejectQuestionId(row.id);
                      }}
                      disabled={isRejectLoading}
                    >
                      <Iconify
                        icon="mingcute:close-line"
                        sx={{ mr: 1, height: 16, width: 16, color: 'error.main' }}
                      />
                      Reject
                    </MenuItem>
                  </>
                )}
                {canAdd && (
                  <MenuItem
                    onClick={() => {
                      popover.onClose();
                      handleDuplicateQuestion(row.id);
                    }}
                  >
                    <Iconify icon="mingcute:copy-2-line" sx={{ mr: 1, height: 16, width: 16 }} />
                    Duplicate
                  </MenuItem>
                )}
                {canAdd && row.status !== 5 && (
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
                {canDelete && row.status === 1 && (
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
    [
      classOptions,
      eligibleQuestionIds,
      filterChapterOptions,
      filterSubjectOptions,
      selectedQuestionIds,
      canAdd,
      canDelete,
      canView,
    ]
  );

  const activeFilterEntries = useMemo(
    () => Object.entries(filters).filter(([, value]) => value !== undefined && value !== ''),
    [filters]
  );

  return (
    <Box height="100%" display="flex" flexDirection="column" gap={1}>
      <CustomBreadcrumbs
        sx={{ mb: 1 }}
        heading="Question Bank"
        description="Create, organize, submit, tag and reuse questions for assessment workflows."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Examination' },
          { name: 'Question Bank' },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            {canAdd && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Iconify icon="mingcute:settings-3-line" />}
                disabled={!academicYearId}
                onClick={handleOpenSettings}
              >
                Settings
              </Button>
            )}
            {canAdd && (
              <Button
                variant="contained"
                size="small"
                startIcon={<Iconify icon="mingcute:add-line" />}
                disabled={!academicYearId}
                onClick={handleOpenCreate}
              >
                Create Question
              </Button>
            )}
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
              isSelected={card.status ? filters.status === card.status : !filters.status}
              onClick={() => {
                if (!card.status) {
                  setFilters((current: any) => {
                    const next = { ...current };
                    delete next.status;
                    return next;
                  });
                  return;
                }
                setFilters((current: any) => ({
                  ...current,
                  status: current.status === card.status ? undefined : card.status,
                }));
              }}
              isLoading={isDashboardLoading || isDashboardFetching}
            />
          </Box>
        ))}
      </Stack>

      {/* ── Cascade Scope Filters (API-driven) ──────────────────────────── */}
      <Card
        sx={{
          p: 1,
          borderRadius: 2,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          bgcolor: 'background.paper',
          boxShadow: (t) => `0 4px 16px 0 ${varAlpha(t.vars.palette.grey['500Channel'], 0.08)}`,
          flexShrink: 0,
        }}
      >
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={1}
          alignItems={{ xs: 'stretch', lg: 'center' }}
          justifyContent="space-between"
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
            sx={{ flex: 1 }}
          >
            <Box sx={{ minWidth: 100, flex: 1 }}>
              <CustomSelect
                label="Class"
                options={[{ value: ALL_SCOPE_VALUE, label: 'All Classes' }, ...classOptions]}
                value={filters.standardId || ALL_SCOPE_VALUE}
                onChange={(val) =>
                  setFilters((prev: any) => ({
                    ...prev,
                    standardId: val === ALL_SCOPE_VALUE ? undefined : val,
                    subjectId: undefined,
                    chapterId: undefined,
                  }))
                }
              />
            </Box>
            <Box sx={{ minWidth: 100, flex: 1 }}>
              <CustomSelect
                label="Subject"
                options={[
                  { value: ALL_SCOPE_VALUE, label: 'All Subjects' },
                  ...filterSubjectOptions,
                ]}
                value={filters.subjectId || ALL_SCOPE_VALUE}
                isLoading={isFilterSubjectLoading || isFilterSubjectFetching}
                onChange={(val) =>
                  setFilters((prev: any) => ({
                    ...prev,
                    subjectId: val === ALL_SCOPE_VALUE ? undefined : val,
                    chapterId: undefined,
                  }))
                }
              />
            </Box>
            <Box sx={{ minWidth: 100, flex: 1 }}>
              <CustomSelect
                label="Chapter"
                options={[
                  { value: ALL_SCOPE_VALUE, label: 'All Chapters' },
                  ...filterChapterOptions,
                ]}
                value={filters.chapterId || ALL_SCOPE_VALUE}
                isLoading={isFilterChapterLoading || isFilterChapterFetching}
                onChange={(val) =>
                  setFilters((prev: any) => ({
                    ...prev,
                    chapterId: val === ALL_SCOPE_VALUE ? undefined : val,
                  }))
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

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ alignSelf: { xs: 'flex-start', lg: 'center' } }}
          >
            <Tooltip
              title={
                viewMode === 'table'
                  ? 'Selection is controlled via table header in Table view'
                  : 'Select all draft or rejected questions'
              }
            >
              <span>
                <Checkbox
                  size="small"
                  checked={
                    eligibleQuestionIds.length > 0 &&
                    selectedQuestionIds.size === eligibleQuestionIds.length
                  }
                  indeterminate={
                    selectedQuestionIds.size > 0 &&
                    selectedQuestionIds.size < eligibleQuestionIds.length
                  }
                  disabled={viewMode === 'table' || !eligibleQuestionIds.length}
                  onChange={handleToggleAllEligibleQuestions}
                  inputProps={{ 'aria-label': 'Select all questions eligible for review' }}
                />
              </span>
            </Tooltip>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={viewMode}
              onChange={(_, value) => value && setViewMode(value)}
              aria-label="Question view"
            >
              <ToggleButton value="table">Table</ToggleButton>
              <ToggleButton value="cards">Cards</ToggleButton>
            </ToggleButtonGroup>
            <Button
              size="small"
              variant="soft"
              onClick={handleOpenAdvancedFilters}
              startIcon={<Iconify icon="mingcute:filter-line" />}
            >
              Filters
            </Button>
            <LoadingButton
              size="small"
              variant={selectedQuestionIds.size ? 'contained' : 'soft'}
              color={selectedQuestionIds.size ? 'primary' : 'inherit'}
              loading={isBulkSubmitting}
              disabled={!selectedQuestionIds.size || isBulkSubmitting}
              onClick={handleBulkSubmitQuestions}
              startIcon={<Iconify icon="mingcute:send-line" />}
              sx={{
                minWidth: 155,
                whiteSpace: 'nowrap',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              {selectedQuestionIds.size
                ? `Submit (${selectedQuestionIds.size})`
                : 'Submit selected'}
            </LoadingButton>
          </Stack>
        </Stack>
        {!!activeFilterEntries.length && (
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ pt: 1 }}>
            {activeFilterEntries.map(([key, value]) => {
              const label =
                key === 'standardId'
                  ? classOptions.find((item: any) => item.value === value)?.label || value
                  : key === 'subjectId'
                    ? filterSubjectOptions.find((item: any) => item.value === value)?.label || value
                    : key === 'chapterId'
                      ? filterChapterOptions.find((item: any) => item.value === value)?.label ||
                        value
                      : ADVANCED_FILTER_LABELS[key]
                        ? `${ADVANCED_FILTER_LABELS[key]}: ${value}`
                        : `${key}: ${value}`;
              return (
                <Chip
                  key={key}
                  size="small"
                  variant="outlined"
                  label={label}
                  onDelete={() => handleClearFilter(key)}
                />
              );
            })}
            <Button size="small" color="error" onClick={() => setFilters({})}>
              Clear all
            </Button>
          </Stack>
        )}
      </Card>

      {/* ── Questions Table (CustomizableTable handles search / sort / filter / export / pagination) */}
      {viewMode === 'table' ? (
        <CustomizableTable
          tableId="question-bank-questions"
          tableTitle="Questions"
          columns={questionColumns}
          data={questionRows}
          isLoading={isQuestionLoading || isQuestionFetching}
          handleRowClick={(row) => setPreviewQuestion(row)}
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
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <Scrollbar sx={{ flex: 1, minHeight: 0, pr: 0.5 }}>
            <Box sx={{ pb: 3, pt: 0.5 }}>
              <QuestionCardsGrid
                rows={questionRows}
                selectedIds={selectedQuestionIds}
                density={density}
                onToggle={handleToggleQuestion}
                onPreview={setPreviewQuestion}
              />
            </Box>
          </Scrollbar>
        </Box>
      )}

      {/* ── Question Bank Settings Popover ────────────────────────────────── */}
      <QuestionPreviewDrawer
        question={previewQuestion}
        onClose={() => setPreviewQuestion(null)}
        onEdit={(q) => {
          handleOpenEdit(q || previewQuestion);
          setPreviewQuestion(null);
        }}
        onDuplicate={async (q) => {
          const id = (q || previewQuestion)?.id;
          if (id) await handleDuplicateQuestion(id);
          setPreviewQuestion(null);
        }}
        onDelete={(q) => {
          const id = (q || previewQuestion)?.id;
          if (id) setDeleteQuestionId(id);
          setPreviewQuestion(null);
        }}
        onSubmit={async (id) => {
          await handleSubmitQuestion(id);
          setPreviewQuestion(null);
        }}
      />

      <Popover
        open={Boolean(advancedAnchorEl)}
        anchorEl={advancedAnchorEl}
        onClose={() => setAdvancedAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { p: 2, width: { xs: 320, sm: 460 }, borderRadius: 2 } } }}
      >
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2" fontWeight={700}>
              Advanced filters
            </Typography>
            <IconButton
              size="small"
              onClick={() => setAdvancedAnchorEl(null)}
              aria-label="Close filters"
            >
              <Iconify icon="mingcute:close-line" width={16} />
            </IconButton>
          </Stack>
          <Grid container spacing={1.5}>
            <Grid size={6}>
              <CustomSelect
                label="Question Type"
                options={QUESTION_TYPE_OPTIONS}
                value={advancedDraft.questionType || ''}
                onChange={(value) =>
                  setAdvancedDraft((current: any) => ({
                    ...current,
                    questionType: value || undefined,
                  }))
                }
              />
            </Grid>
            <Grid size={6}>
              <CustomSelect
                label="Difficulty"
                options={DIFFICULTY_OPTIONS}
                value={advancedDraft.difficultyLevel || ''}
                onChange={(value) =>
                  setAdvancedDraft((current: any) => ({
                    ...current,
                    difficultyLevel: value || undefined,
                  }))
                }
              />
            </Grid>
            <Grid size={6}>
              <CustomSelect
                label="Bloom's Level"
                options={BLOOM_OPTIONS}
                value={advancedDraft.bloomLevel || ''}
                onChange={(value) =>
                  setAdvancedDraft((current: any) => ({
                    ...current,
                    bloomLevel: value || undefined,
                  }))
                }
              />
            </Grid>
            <Grid size={6}>
              <CustomSelect
                label="Status"
                options={STATUS_OPTIONS}
                value={advancedDraft.status || ''}
                onChange={(value) =>
                  setAdvancedDraft((current: any) => ({ ...current, status: value || undefined }))
                }
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                label="Topic"
                value={advancedDraft.topicName || ''}
                onChange={(event) =>
                  setAdvancedDraft((current: any) => ({
                    ...current,
                    topicName: event.target.value || undefined,
                  }))
                }
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Marks"
                value={advancedDraft.marks || ''}
                onChange={(event) =>
                  setAdvancedDraft((current: any) => ({
                    ...current,
                    marks: event.target.value || undefined,
                  }))
                }
              />
            </Grid>
          </Grid>
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button size="small" color="inherit" onClick={() => setAdvancedDraft({})}>
              Reset
            </Button>
            <Button size="small" variant="contained" onClick={handleApplyAdvancedFilters}>
              Apply Filters
            </Button>
          </Stack>
        </Stack>
      </Popover>

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
      <CreateQuestionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        initialStandardId={filters.standardId || ''}
        initialSubjectId={filters.subjectId || ''}
        initialChapterId={filters.chapterId || ''}
      />

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

      <ConfirmDialog
        open={!!rejectQuestionId}
        title="Reject Question"
        content="This question will be marked as rejected and can be edited before resubmission."
        icon="warning"
        onClose={() => setRejectQuestionId(null)}
        action={
          <LoadingButton
            variant="contained"
            color="error"
            size="small"
            loading={isRejectLoading}
            onClick={handleConfirmRejectQuestion}
          >
            Reject
          </LoadingButton>
        }
      />
    </Box>
  );
}
