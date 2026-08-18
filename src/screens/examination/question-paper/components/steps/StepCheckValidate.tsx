'use client';

import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Stack, Paper, Button, Typography } from '@mui/material';

import { BLOOM_LABELS, DIFFICULTY_LABELS } from '../../constants';

import type { QuestionItem, SectionPattern } from '../../types';

export type ValidationSeverity = 'success' | 'warning' | 'error';

export interface CheckResult {
  id: string;
  severity: ValidationSeverity;
  label: string;
  detail?: string;
  /** Action label shown when the issue can be fixed from a specific step. */
  actionLabel?: string;
  /** Wizard step to jump to when the action is clicked. */
  actionStep?: number;
}

interface StepCheckValidateProps {
  results: { category: string; items: CheckResult[] }[];
  onGoToStep: (step: number) => void;
}

export default function StepCheckValidate({ results, onGoToStep }: StepCheckValidateProps) {
  const allItems = results.flatMap((category) => category.items);
  const blockingCount = results.reduce(
    (n, cat) => n + cat.items.filter((i) => i.severity === 'error').length,
    0
  );
  const warningCount = results.reduce(
    (n, cat) => n + cat.items.filter((i) => i.severity === 'warning').length,
    0
  );
  const passedCount = allItems.filter((item) => item.severity === 'success').length;
  const groupedResults = [
    {
      title: 'Must Fix',
      subtitle: 'These issues must be resolved before you can submit this paper.',
      severity: 'error' as const,
      items: allItems.filter((item) => item.severity === 'error'),
    },
    {
      title: 'Recommendations',
      subtitle: 'These improvements are optional, but worth reviewing.',
      severity: 'warning' as const,
      items: allItems.filter((item) => item.severity === 'warning'),
    },
    {
      title: 'Passed',
      subtitle: 'These checks are complete.',
      severity: 'success' as const,
      items: allItems.filter((item) => item.severity === 'success'),
    },
  ];
  const readiness =
    blockingCount > 0
      ? {
          icon: 'mdi:close-circle',
          color: 'error.main' as const,
          title: 'Your paper is not ready yet',
          detail: `${blockingCount} issue${blockingCount > 1 ? 's' : ''} must be fixed before you can submit this paper.`,
        }
      : warningCount > 0
        ? {
            icon: 'mdi:alert',
            color: 'warning.main' as const,
            title: 'Your paper is ready, but we found recommendations',
            detail: `${warningCount} recommendation${warningCount > 1 ? 's' : ''} can still be reviewed before submission.`,
          }
        : {
            icon: 'mdi:check-circle',
            color: 'success.main' as const,
            title: 'Your paper is ready',
            detail: 'All required checks have passed. You can preview the final paper or submit it for review.',
          };

  return (
    <Stack spacing={2.5} sx={{ width: '100%' }}>
      <Box>
        <Typography variant="h6" fontWeight={700}>
          Review &amp; Validate
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Let’s check your paper before you preview or submit it.
        </Typography>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 2,
          borderColor:
            blockingCount > 0
              ? 'error.light'
              : warningCount > 0
                ? 'warning.light'
                : 'success.light',
          bgcolor: (t) =>
            blockingCount > 0
              ? varAlpha(t.vars.palette.error.mainChannel, 0.04)
              : warningCount > 0
                ? varAlpha(t.vars.palette.warning.mainChannel, 0.04)
                : varAlpha(t.vars.palette.success.mainChannel, 0.04),
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Iconify icon={readiness.icon} width={24} color={readiness.color} sx={{ mt: 0.25 }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={800} color={readiness.color}>
              {readiness.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {readiness.detail}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
          <SummaryBadge label="Must fix" value={blockingCount} color="error" />
          <SummaryBadge label="Recommendations" value={warningCount} color="warning" />
          <SummaryBadge label="Checks passed" value={passedCount} color="success" />
        </Stack>
      </Paper>

      {groupedResults.map(
        (group) =>
          group.items.length > 0 && (
            <Box key={group.title}>
              <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mb: 1 }}>
                <Typography variant="subtitle1" fontWeight={800}>
                  {group.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {group.subtitle}
                </Typography>
              </Stack>
              <Stack spacing={1}>
                {group.items.map((item) => (
                  <CheckLine
                    key={item.id}
                    item={item}
                    onAction={
                      item.actionStep != null
                        ? () => onGoToStep(item.actionStep as number)
                        : undefined
                    }
                  />
                ))}
              </Stack>
            </Box>
          )
      )}
    </Stack>
  );
}

function SummaryBadge({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'error' | 'warning' | 'success';
}) {
  return (
    <Paper variant="outlined" sx={{ px: 1.25, py: 0.75, borderRadius: 1.25 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="subtitle2" fontWeight={800} color={`${color}.main`}>
        {value}
      </Typography>
    </Paper>
  );
}

function CheckLine({ item, onAction }: { item: CheckResult; onAction?: () => void }) {
  const config = {
    success: {
      icon: 'mdi:check-circle-outline',
      color: 'success.main' as const,
      label: 'Looks good',
    },
    warning: {
      icon: 'mdi:alert-outline',
      color: 'warning.main' as const,
      label: 'Recommended improvement',
    },
    error: {
      icon: 'mdi:close-circle-outline',
      color: 'error.main' as const,
      label: 'Cannot continue',
    },
  }[item.severity];

  return (
    <Stack
      direction="row"
      spacing={1.25}
      alignItems="flex-start"
      sx={{
        p: 1.25,
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: (t) => varAlpha(t.vars.palette.grey['500Channel'], 0.03),
      }}
    >
      <CustomTooltip title={config.label} placement="left">
        <Iconify icon={config.icon} width={16} color={config.color} sx={{ mt: '2px' }} />
      </CustomTooltip>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          fontWeight={item.severity === 'success' ? 500 : 600}
          noWrap={false}
        >
          {item.label}
        </Typography>
        {item.detail && (
          <Typography variant="caption" color="text.secondary" display="block">
            {item.detail}
          </Typography>
        )}
      </Box>
      {item.severity !== 'success' && item.actionLabel && onAction && (
        <Button size="small" variant="outlined" onClick={onAction} sx={{ flexShrink: 0 }}>
          {item.actionLabel}
        </Button>
      )}
    </Stack>
  );
}

/**
 * Computes the Step 4 validation categories from the current paper state.
 * Purely derived from local state — no API calls.
 */
export function buildCheckResults({
  sections,
  totalMarks,
  durationMinutes,
  blueprintRules,
  difficultyDist,
  bloomDist,
}: {
  sections: SectionPattern[];
  totalMarks: number;
  durationMinutes: number;
  blueprintRules: Record<string, { marks: number; count: number }>;
  difficultyDist: Record<number, number>;
  bloomDist: Record<number, number>;
}): { category: string; items: CheckResult[] }[] {
  const allQuestions: QuestionItem[] = sections.flatMap((sec) => sec.questions || []);
  const currentMarks = allQuestions.reduce((s, q) => s + (q.marks || 0), 0);
  const targetQuestionCount = sections.reduce(
    (s, sec) => s + (sec.questionCount ?? sec.questions?.length ?? 0),
    0
  );
  const chapterMarksSum = Object.values(blueprintRules).reduce((s, r) => s + (r.marks || 0), 0);
  const difficultySum = Object.values(difficultyDist).reduce((s, v) => s + v, 0);
  const bloomSum = Object.values(bloomDist).reduce((s, v) => s + v, 0);

  const hasAdvancedRules = Object.keys(blueprintRules).length > 0;
  const duplicateGroups = getDuplicateGroups(allQuestions);
  const questionsWithoutMarks = allQuestions.filter((question) => !(question.marks > 0));
  const ineligibleQuestions = allQuestions.filter(
    (question) =>
      question.isActive === false ||
      (question.approvalStatus != null &&
        !['3', 'approved'].includes(String(question.approvalStatus).toLowerCase()))
  );
  const questionsMissingAnswers = allQuestions.filter(
    (question) => [1, 2, 3, 7, 8].includes(question.questionType) && question.hasAnswer === false
  );
  const previouslyUsedQuestions = allQuestions.filter((question) => (question.usageCount || 0) > 0);

  return [
    {
      category: 'Paper Configuration',
      items: [
        {
          id: 'cfg-marks',
          severity: Math.abs(currentMarks - totalMarks) < 0.01 ? 'success' : 'error',
          label: `Total Marks — ${currentMarks} / ${totalMarks}`,
          detail:
            Math.abs(currentMarks - totalMarks) < 0.01
              ? undefined
              : currentMarks < totalMarks
                ? `${totalMarks - currentMarks} marks are still unallocated.`
                : `${currentMarks - totalMarks} marks exceed the paper total.`,
          actionLabel: 'Fix Pattern',
          actionStep: 1,
        },
        {
          id: 'cfg-duration',
          severity: durationMinutes >= 10 ? 'success' : 'error',
          label: `Duration — ${durationMinutes} minutes`,
          actionLabel: durationMinutes >= 10 ? undefined : 'Fix Details',
          actionStep: 0,
        },
        {
          id: 'cfg-sections',
          severity: sections.length > 0 ? 'success' : 'error',
          label: `Sections — ${sections.length}`,
          detail:
            sections.length === 0 ? 'Add at least one section in the Paper Pattern.' : undefined,
          actionLabel: sections.length === 0 ? 'Fix Pattern' : undefined,
          actionStep: 1,
        },
      ],
    },
    {
      category: 'Question Structure',
      items: [
        {
          id: 'qs-count',
          severity: allQuestions.length >= targetQuestionCount ? 'success' : 'error',
          label: `Required questions — ${allQuestions.length} / ${targetQuestionCount}`,
          detail:
            allQuestions.length < targetQuestionCount
              ? `${targetQuestionCount - allQuestions.length} more questions needed.`
              : undefined,
          actionLabel: allQuestions.length < targetQuestionCount ? 'Add Questions' : undefined,
          actionStep: 2,
        },
        {
          id: 'qs-types',
          severity: sections.every(
            (sec) =>
              !sec.questionType ||
              (sec.questions || []).every((q) => q.questionType === sec.questionType)
          )
            ? 'success'
            : 'warning',
          label: 'Question types',
          detail: sections.every(
            (sec) =>
              !sec.questionType ||
              (sec.questions || []).every((q) => q.questionType === sec.questionType)
          )
            ? 'Correct'
            : 'Some sections contain questions of a different type than planned.',
          actionLabel: 'Review Questions',
          actionStep: 2,
        },
        {
          id: 'qs-section-marks',
          severity: sections.every(
            (sec) => (sec.questions || []).reduce((s, q) => s + (q.marks || 0), 0) === sec.marks
          )
            ? 'success'
            : 'warning',
          label: 'Section marks',
          detail:
            sections
              .filter(
                (sec) => (sec.questions || []).reduce((s, q) => s + (q.marks || 0), 0) !== sec.marks
              )
              .map(
                (sec) =>
                  `${sec.sectionName}: ${(sec.questions || []).reduce((s, q) => s + (q.marks || 0), 0)} / ${sec.marks}`
              )
              .join(', ') || 'Correct',
          actionLabel: 'Review Questions',
          actionStep: 2,
        },
      ],
    },
    {
      category: 'Academic Coverage',
      items: hasAdvancedRules
        ? [
            {
              id: 'ac-chapters',
              severity: Math.abs(chapterMarksSum - totalMarks) < 0.01 ? 'success' : 'warning',
              label: 'Chapter coverage',
              detail:
                Math.abs(chapterMarksSum - totalMarks) < 0.01
                  ? 'Chapter weightage matches total marks'
                  : `Chapter weightage totals ${chapterMarksSum} of ${totalMarks} marks.`,
              actionLabel: 'Adjust Rules',
              actionStep: 1,
            },
            {
              id: 'ac-difficulty',
              severity: difficultySum === 100 ? 'success' : 'warning',
              label: 'Difficulty distribution',
              detail:
                difficultySum === 100
                  ? Object.entries(difficultyDist)
                      .map(([lvl, pct]) => `${DIFFICULTY_LABELS[Number(lvl)]} ${pct}%`)
                      .join(' · ')
                  : `Percentages total ${difficultySum}% (should be 100%).`,
              actionLabel: 'Adjust Rules',
              actionStep: 1,
            },
            {
              id: 'ac-bloom',
              severity: bloomSum === 100 ? 'success' : 'warning',
              label: "Bloom's distribution",
              detail:
                bloomSum === 100
                  ? Object.entries(bloomDist)
                      .filter(([, pct]) => pct > 0)
                      .map(([lvl, pct]) => `${BLOOM_LABELS[Number(lvl)]} ${pct}%`)
                      .join(' · ')
                  : `Needs adjustment — totals ${bloomSum}%.`,
              actionLabel: 'Adjust Rules',
              actionStep: 1,
            },
          ]
        : [
            {
              id: 'ac-skipped',
              severity: 'success',
              label: 'Advanced assessment rules not configured',
              detail: 'Optional — skipped for this paper.',
            },
          ],
    },
    {
      category: 'Question Quality',
      items: [
        {
          id: 'qq-duplicates',
          severity: duplicateGroups.length > 0 ? 'warning' : 'success',
          label:
            duplicateGroups.length > 0
              ? `Duplicate questions — ${duplicateGroups.length} group${duplicateGroups.length > 1 ? 's' : ''}`
              : 'Duplicate questions',
          detail:
            duplicateGroups.length > 0
              ? `Affected: ${duplicateGroups.map((group) => group.join(' and ')).join('; ')}`
              : 'No duplicate questions',
          actionLabel: duplicateGroups.length > 0 ? 'Review Duplicates' : undefined,
          actionStep: 2,
        },
        {
          id: 'qq-empty-sections',
          severity: sections.some((sec) => (sec.questions || []).length === 0)
            ? sections.every((sec) => (sec.questions || []).length === 0)
              ? 'error'
              : 'warning'
            : 'success',
          label: 'Empty sections',
          detail:
            sections
              .filter((sec) => (sec.questions || []).length === 0)
              .map((sec) => sec.sectionName)
              .join(', ') || 'All sections have questions',
          actionLabel: sections.some((sec) => (sec.questions || []).length === 0)
            ? 'Add Questions'
            : undefined,
          actionStep: 2,
        },
        {
          id: 'qq-marks',
          severity: questionsWithoutMarks.length > 0 ? 'error' : 'success',
          label: 'Question marks',
          detail:
            questionsWithoutMarks.length > 0
              ? `${questionsWithoutMarks.length} question${questionsWithoutMarks.length > 1 ? 's have' : ' has'} no marks configured.`
              : 'All questions have valid marks.',
          actionLabel: questionsWithoutMarks.length > 0 ? 'Review Questions' : undefined,
          actionStep: 2,
        },
        {
          id: 'qq-eligibility',
          severity: ineligibleQuestions.length > 0 ? 'error' : 'success',
          label: 'Question eligibility',
          detail:
            ineligibleQuestions.length > 0
              ? `${ineligibleQuestions.length} question${ineligibleQuestions.length > 1 ? 's are' : ' is'} not approved or active.`
              : 'All questions are approved and active.',
          actionLabel: ineligibleQuestions.length > 0 ? 'Review Questions' : undefined,
          actionStep: 2,
        },
        {
          id: 'qq-answers',
          severity: questionsMissingAnswers.length > 0 ? 'error' : 'success',
          label: 'Required answers',
          detail:
            questionsMissingAnswers.length > 0
              ? `${questionsMissingAnswers.length} objective question${questionsMissingAnswers.length > 1 ? 's are' : ' is'} missing an answer.`
              : 'Required objective answers are configured.',
          actionLabel: questionsMissingAnswers.length > 0 ? 'Edit Questions' : undefined,
          actionStep: 2,
        },
        {
          id: 'qq-usage',
          severity: previouslyUsedQuestions.length > 0 ? 'warning' : 'success',
          label: 'Previously used questions',
          detail:
            previouslyUsedQuestions.length > 0
              ? `${previouslyUsedQuestions.length} question${previouslyUsedQuestions.length > 1 ? 's were' : ' was'} used in previous papers.`
              : 'No selected questions have previous usage history.',
          actionLabel: previouslyUsedQuestions.length > 0 ? 'Review Questions' : undefined,
          actionStep: 2,
        },
      ],
    },
  ];
}

function getDuplicateGroups(questions: QuestionItem[]): string[][] {
  const grouped = new Map<string, string[]>();
  questions.forEach((question, index) => {
    const key = question.questionBankItemId || question.id;
    if (!key) return;
    const labels = grouped.get(key) || [];
    labels.push(`Q${question.questionNumber || index + 1}`);
    grouped.set(key, labels);
  });
  return Array.from(grouped.values()).filter((group) => group.length > 1);
}
