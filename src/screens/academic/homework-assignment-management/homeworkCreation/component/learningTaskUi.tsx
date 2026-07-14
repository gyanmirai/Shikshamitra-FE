import dayjs from 'dayjs';
import { alpha } from '@mui/material/styles';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';

type LearningTaskStatus = {
  label: string;
  color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
};

export const SUBMISSION_TYPE_LABELS: Record<number, string> = {
  0: 'Online Text',
  1: 'File Upload',
  2: 'In-Person',
  3: 'No Submission Required',
};

export const getLearningTaskStatus = (task: any): LearningTaskStatus => {
  const status = Number(task?.status ?? 0);
  const publishDate = task?.publishDate ? dayjs(task.publishDate) : null;
  const dueDate = task?.dueDate ? dayjs(task.dueDate) : null;
  const pendingEvaluation = Number(task?.evaluationPendingCount ?? 0);

  if (status === 0) {
    if (publishDate?.isAfter(dayjs())) return { label: 'Scheduled', color: 'info' };
    return { label: 'Draft', color: 'default' };
  }

  if (status === 2) return { label: 'Closed', color: 'secondary' };
  if (pendingEvaluation > 0) return { label: 'Evaluation Pending', color: 'warning' };
  if (dueDate?.isSame(dayjs(), 'day')) return { label: 'Due Today', color: 'info' };
  if (dueDate?.isBefore(dayjs(), 'day')) return { label: 'Overdue', color: 'error' };

  return { label: 'Published', color: 'success' };
};

export const getSubmissionProgress = (task: any) => {
  if (Number(task?.submissionType) === 3) return 'No submission required';
  if (Number(task?.status ?? 0) === 0) return 'Not started';

  const total = Number(task?.totalStudents ?? 0);
  const submitted = Number(task?.submittedCount ?? 0);
  const pending = Number(task?.pendingCount ?? 0);
  const late = Number(task?.lateCount ?? 0);
  const base = total > 0 ? `${submitted}/${total} submitted` : `${submitted} submitted`;
  const details = [pending > 0 ? `${pending} pending` : null, late > 0 ? `${late} late` : null]
    .filter(Boolean)
    .join(' · ');

  return details ? `${base} · ${details}` : base;
};

export const getEvaluationProgress = (task: any) => {
  if (Number(task?.submissionType) === 3) return 'No evaluation required';

  const submitted = Number(task?.submittedCount ?? 0);
  const checked = Number(task?.checkedCount ?? 0);
  const pending = Number(task?.evaluationPendingCount ?? 0);
  if (!submitted && !pending) return 'No submissions yet';

  const base = `${checked}/${submitted || pending} checked`;
  return pending > 0 ? `${base} · ${pending} pending` : base;
};

export const getLearningTaskSummary = (tasks: any[]) => {
  const statuses = tasks.map(getLearningTaskStatus);
  return {
    total: tasks.length,
    published: statuses.filter((item) => item.label === 'Published').length,
    draft: statuses.filter((item) => item.label === 'Draft').length,
    dueToday: statuses.filter((item) => item.label === 'Due Today').length,
    overdue: statuses.filter((item) => item.label === 'Overdue').length,
    pendingEvaluation: tasks.reduce(
      (total, task) => total + Number(task?.evaluationPendingCount ?? 0),
      0
    ),
  };
};

export const LearningTaskStatusChip = ({ task }: { task: any }) => {
  const status = getLearningTaskStatus(task);
  return <Chip size="small" variant="soft" color={status.color} label={status.label} />;
};

export const LearningTaskSummaryCards = ({ tasks }: { tasks: any[] }) => {
  const summary = getLearningTaskSummary(tasks);
  const cards = [
    { label: 'Total Tasks', value: summary.total, color: 'text.primary' },
    { label: 'Published', value: summary.published, color: 'success.main' },
    { label: 'Draft', value: summary.draft, color: 'text.secondary' },
    { label: 'Due Today', value: summary.dueToday, color: 'info.main' },
    { label: 'Overdue', value: summary.overdue, color: 'error.main' },
    { label: 'Pending Evaluation', value: summary.pendingEvaluation, color: 'warning.main' },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(3, minmax(0, 1fr))',
          lg: 'repeat(6, minmax(0, 1fr))',
        },
        gap: 1,
        mb: 1,
      }}
    >
      {cards.map((card) => (
        <Paper
          key={card.label}
          variant="outlined"
          sx={{
            p: 1.25,
            borderRadius: 1,
            bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9),
          }}
        >
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              {card.label}
            </Typography>
            <Typography variant="h6" sx={{ color: card.color, lineHeight: 1.1 }}>
              {card.value}
            </Typography>
          </Stack>
        </Paper>
      ))}
    </Box>
  );
};
