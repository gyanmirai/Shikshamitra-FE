import dayjs from 'dayjs';
import {
  TimetableSettingsSummaryCards,
  type ITimetableSummaryCard,
} from 'src/components/timetable-settings-summary-cards/TimetableSettingsSummaryCards';
import { Chip } from '@mui/material';

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
  const cards: ITimetableSummaryCard[] = [
    { label: 'Total Tasks', value: summary.total, icon: 'mdi:clipboard-text-outline', color: 'primary' },
    { label: 'Published', value: summary.published, icon: 'mdi:check-circle-outline', color: 'success' },
    { label: 'Draft', value: summary.draft, icon: 'mdi:file-document-edit-outline', color: 'info' },
    { label: 'Due Today', value: summary.dueToday, icon: 'mdi:calendar-today', color: 'info' },
    { label: 'Overdue', value: summary.overdue, icon: 'mdi:alert-circle-outline', color: 'error' },
    {
      label: 'Pending Evaluation',
      value: summary.pendingEvaluation,
      icon: 'mdi:clipboard-text-clock-outline',
      color: 'warning',
    },
  ];

  return <TimetableSettingsSummaryCards cards={cards} />;
};
