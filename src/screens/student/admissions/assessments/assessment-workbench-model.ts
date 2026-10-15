import type {
  AssessmentQueue,
  AssessmentProgress,
  AssessmentRosterItem,
} from 'src/redux/student/admissions/admission-assessment-roster-api';

import type { AssessmentAction } from './assessment-action-model';
import type { getAssessmentPermissions } from './use-assessment-permissions';

export const assessmentQueues: { value: AssessmentQueue | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'toBook', label: 'To book' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'result', label: 'Results' },
  { value: 'ready', label: 'Ready' },
  { value: 'attention', label: 'Needs attention' },
  { value: 'completed', label: 'Completed' },
];
const sortColumns = ['applicantName', 'applicationNumber', 'sessionStartsAt', 'enteredAt'];
export function readAssessmentWorkbench(params: URLSearchParams) {
  const queue = params.get('assessmentQueue');
  const status = params.get('assessmentStatus');
  const size = Number(params.get('assessmentSize'));
  const page = Number(params.get('assessmentPage'));
  const sort = params.get('assessmentSort') ?? 'enteredAt';
  return {
    status: ['pending', 'ongoing', 'complete'].includes(status ?? '')
      ? (status as AssessmentProgress)
      : ('all' as const),
    manageSessions:
      params.get('assessmentManage') === '1' || params.get('assessmentTab') === 'sessions',
    tab: params.get('assessmentTab') === 'applicants' ? 'applicants' : 'sessions',
    queue: assessmentQueues.some((item) => item.value === queue)
      ? (queue as AssessmentQueue | 'all')
      : 'all',
    sessionId: params.get('assessmentSession') ?? '',
    search: (params.get('assessmentSearch') ?? '').slice(0, 128),
    page: Number.isSafeInteger(page) && page >= 0 ? page : 0,
    size: [10, 25, 100].includes(size) ? size : 25,
    sort: sortColumns.includes(sort) ? sort : 'enteredAt',
    direction: params.get('assessmentDirection') === 'asc' ? ('asc' as const) : ('desc' as const),
  };
}

export function getAssessmentRowActions(
  row: AssessmentRosterItem,
  permissions: ReturnType<typeof getAssessmentPermissions>
): AssessmentAction[] {
  if (!row.isActive || !row.assessment.policy) return [];
  const { assessment } = row;
  return (
    [
      ['book', assessment.canBook && permissions.book],
      ['attendance', assessment.canRecordAttendance && permissions.attendance],
      ['result', assessment.canRecordResult && permissions.results],
      ['retake', assessment.canRetake && permissions.book],
      ['cancel', assessment.canCancel && permissions.book],
      ['waive', assessment.canWaive && permissions.waive],
    ] as [AssessmentAction, boolean][]
  )
    .filter(([, allowed]) => allowed)
    .map(([action]) => action);
}

export function getPrimaryAssessmentAction(
  row: AssessmentRosterItem,
  permissions: ReturnType<typeof getAssessmentPermissions>,
  canAdvance: boolean
): AssessmentAction | 'continue' | undefined {
  if (row.isActive && row.assessment.canComplete && canAdvance) return 'continue';
  const allowed = getAssessmentRowActions(row, permissions);
  const preferred: AssessmentAction[] =
    row.queue === 'result'
      ? ['result', 'attendance', 'retake', 'book']
      : row.queue === 'attendance'
        ? ['attendance', 'result', 'book', 'retake']
        : row.queue === 'attention'
          ? ['retake', 'result', 'attendance', 'book']
          : ['book', 'attendance', 'result', 'retake'];
  return preferred.find((action) => allowed.includes(action));
}
