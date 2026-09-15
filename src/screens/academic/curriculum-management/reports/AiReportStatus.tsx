import type { AcademicDynamicReportSpec } from 'src/redux/academicAPI/AcademicReportApi';

import { Iconify } from 'src/components/iconify';
import { Box, Chip, Alert, Stack, Paper, Typography } from '@mui/material';

const DATASET_LABELS: Record<AcademicDynamicReportSpec['dataset'], string> = {
  'curriculum.subjects': 'Subjects',
  'curriculum.chapters': 'Chapters',
  'curriculum.teachers': 'Subject teachers',
  'timetable.slots': 'Timetable slots',
  'student-records.students': 'Student records',
  'student-attendance.entries': 'Attendance entries',
  'student-attendance.daily-summary': 'Daily attendance summary',
  'homework-assignment.homework': 'Homework tasks',
  'homework-assignment.assignments': 'Assignments',
  'examination.schedule': 'Examination schedule',
  'examination.marks': 'Student examination marks',
  'examination.results': 'Student examination results',
};

const OPERATOR_LABELS = {
  eq: 'is',
  ne: 'is not',
  contains: 'contains',
  startsWith: 'starts with',
  in: 'is one of',
  gt: 'is greater than',
  gte: 'is at least',
  lt: 'is less than',
  lte: 'is at most',
  between: 'is between',
  isEmpty: 'is empty',
  isNotEmpty: 'is not empty',
} as const;

function formatCondition(
  condition: AcademicDynamicReportSpec['where']['conditions'][number]
): string {
  const field = condition.field
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (character) => character.toUpperCase());
  const values = condition.values.join(' and ');
  return `${field} ${OPERATOR_LABELS[condition.operator]}${values ? ` ${values}` : ''}`;
}

export function AiReportPlanPreview({ plan }: { plan: AcademicDynamicReportSpec }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }} aria-live="polite">
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify icon="solar:clipboard-check-bold" color="success.main" />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2">Report plan ready</Typography>
            <Typography variant="caption" color="text.secondary">
              Review the agent&apos;s interpretation, live preview, and format before approval.
            </Typography>
          </Box>
        </Stack>
        <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
          <Typography variant="caption" color="text.secondary">
            Report title
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {plan.title}
          </Typography>
        </Box>
        {plan.interpretedRequest && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Understood request
            </Typography>
            <Typography variant="body2">{plan.interpretedRequest}</Typography>
          </Box>
        )}
        <Typography variant="body2">{plan.summary}</Typography>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip size="small" label={`Data: ${DATASET_LABELS[plan.dataset]}`} variant="soft" />
          <Chip size="small" label={`${plan.columns.length} columns`} variant="soft" />
          {(plan.appliedFilters ?? []).map((filter) => (
            <Chip
              key={filter.type}
              size="small"
              color="primary"
              label={`${filter.label}: ${filter.values.join(', ')}`}
              variant="soft"
            />
          ))}
          {(plan.appliedFilters?.length ?? 0) === 0 && (
            <Chip size="small" label="Scope: All accessible records" variant="soft" />
          )}
          {(plan.where?.conditions ?? []).map((condition, index) => (
            <Chip
              key={`${condition.field}-${condition.operator}-${index}`}
              size="small"
              color="secondary"
              label={formatCondition(condition)}
              variant="soft"
            />
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}

export function AiReportReady({ reportType, summary }: { reportType: string; summary: string }) {
  return (
    <Alert severity="success" icon={<Iconify icon="solar:file-check-bold" />}>
      <Typography variant="subtitle2">{reportType}</Typography>
      <Typography variant="body2">{summary}</Typography>
      <Typography variant="caption">Your report is ready to download.</Typography>
    </Alert>
  );
}
