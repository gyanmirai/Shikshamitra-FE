import type { ApplicationAssessment } from 'src/redux/student/admissions/admission-assessment-types';
import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { vi, it, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';
import { DEFAULT_ASSESSMENT_POLICY } from 'src/redux/student/admissions/admission-assessment-policy';

import { ApplicationAssessmentPanel } from './application-assessment-panel';

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  refetch: vi.fn(),
  run: vi.fn(),
  permissions: { view: true, book: true, attendance: true, results: true, waive: true },
}));
vi.mock('src/redux/student/admissions/admission-assessments-api', () => ({
  useGetApplicationAssessmentQuery: mocks.query,
}));
vi.mock('./use-assessment-permissions', () => ({
  useAssessmentPermissions: () => mocks.permissions,
}));
vi.mock('./use-assessment-actions', () => ({ useAssessmentActions: () => mocks.run }));
vi.mock('./assessment-action-dialog', () => ({
  AssessmentActionDialog: ({ action }: { action: string }) => (
    <div role="dialog">Action {action}</div>
  ),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));
vi.mock('react-redux', () => ({
  useSelector: (select: (state: unknown) => unknown) =>
    select({ confirmPopup: { isChanges: false } }),
  useDispatch: () => vi.fn(),
}));
vi.mock('./assessment-scheduling-guidance', () => ({
  AssessmentSchedulingGuidance: () => <div>Book a slot before the entrance exam</div>,
}));

const base: ApplicationAssessment = {
  applicationId: 'application-1',
  stageInstanceId: 'stage-1',
  assessmentEnabled: true,
  policy: DEFAULT_ASSESSMENT_POLICY,
  attempts: [],
  concurrencyStamp: 'stamp',
  blockers: [],
  canComplete: false,
  canBook: true,
  canRecordAttendance: false,
  canRecordResult: false,
  canReview: false,
  canRetake: false,
  canWaive: true,
  canCancel: false,
};
const stage = {
  id: 'stage-1',
  name: 'Entrance assessment',
  definitionStageId: 'definition-1',
  status: 1,
} as AdmissionApplicationStage;
const query = (data = base, extra = {}) => ({
  currentData: data,
  isLoading: false,
  isFetching: false,
  isError: false,
  refetch: mocks.refetch,
  ...extra,
});
const panel = (onComplete = vi.fn()) =>
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <ApplicationAssessmentPanel
        compact
        applicationId="application-1"
        admissionOfferingId="offering-1"
        stage={stage}
        canAdvance
        advancing={false}
        onComplete={onComplete}
      />
    </ThemeProvider>
  );

beforeEach(() => {
  vi.clearAllMocks();
  mocks.permissions.view = true;
  mocks.permissions.attendance = true;
  mocks.permissions.results = true;
  mocks.permissions.waive = true;
  mocks.run.mockResolvedValue(undefined);
  mocks.query.mockReturnValue(query());
});

it('keeps empty requirements and start/waive actions visible in compact mode', () => {
  panel();
  expect(screen.getByText('No assessment attempt yet')).toBeVisible();
  expect(screen.getByText('Attempts')).toBeVisible();
  expect(screen.getByText(`0 of ${DEFAULT_ASSESSMENT_POLICY.maxAttempts}`)).toBeVisible();
  expect(screen.getByRole('button', { name: 'Waive assessment' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Start assessment' }));
  expect(screen.getByRole('dialog')).toHaveTextContent('Action book');
});

it('removes the redundant start banner while retaining actionable stage blockers', () => {
  mocks.query.mockReturnValue(
    query({
      ...base,
      canBook: false,
      canWaive: false,
      blockers: [
        'Create an assessment attempt or record an authorized waiver.',
        'This assessment stage is not active.',
      ],
    })
  );
  panel();
  expect(
    screen.queryByText('Create an assessment attempt or record an authorized waiver.')
  ).not.toBeInTheDocument();
  expect(screen.getByText('This assessment stage is not active.')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Start assessment' })).not.toBeInTheDocument();
});

it('keeps current and historical results together in the embedded attempts table', async () => {
  const attempt = {
    id: 'old',
    attemptNumber: 1,
    attendance: 'present' as const,
    status: 'completed' as const,
    outcome: 'failed' as const,
    createdAt: '2026-10-08T10:00:00Z',
    concurrencyStamp: 'attempt-stamp',
  };
  mocks.query.mockReturnValue(
    query({
      ...base,
      attempts: [attempt, { ...attempt, id: 'latest', attemptNumber: 2, outcome: 'passed' }],
    })
  );
  panel();
  expect(screen.getByText('Attempt 2')).toBeVisible();
  expect(screen.getByText('Attempt 1')).toBeVisible();
  expect(screen.getByRole('table', { name: 'Assessment attempts table' })).toBeVisible();
  expect(screen.queryByRole('button', { name: /Previous attempts/ })).not.toBeInTheDocument();
});

it('retains completion capability checks and does not forward click events', () => {
  const onComplete = vi.fn();
  mocks.query.mockReturnValue(query({ ...base, canComplete: true }));
  panel(onComplete);
  fireEvent.click(screen.getByRole('button', { name: 'Complete assessment step' }));
  expect(onComplete).toHaveBeenCalledWith();
});

it('does not expose assessment controls without view access and skips the query', () => {
  mocks.permissions.view = false;
  panel();
  expect(mocks.query).toHaveBeenCalledWith(
    { applicationId: 'application-1', stageInstanceId: 'stage-1' },
    { skip: true }
  );
  expect(screen.queryByRole('button', { name: 'Start assessment' })).not.toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent('Assessment access is required');
});

it('locks compact stage controls during refresh and supports query retry', () => {
  mocks.query.mockReturnValue(query(base, { isFetching: true }));
  const { unmount } = panel();
  expect(screen.getByRole('button', { name: 'Start assessment' })).toBeDisabled();
  unmount();
  mocks.query.mockReturnValue(query(base, { isError: true }));
  panel();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(mocks.refetch).toHaveBeenCalledOnce();
});

it('shows slot guidance by default only for an unbooked scheduled assessment', () => {
  mocks.query.mockReturnValue(
    query({ ...base, policy: { ...DEFAULT_ASSESSMENT_POLICY, schedulingEnabled: true } })
  );
  const { rerender } = panel();
  expect(screen.getByText('Book a slot before the entrance exam')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Book assessment slot' })).toBeEnabled();
  mocks.query.mockReturnValue(
    query({
      ...base,
      policy: { ...DEFAULT_ASSESSMENT_POLICY, schedulingEnabled: true },
      attempts: [
        {
          id: 'booked',
          attemptNumber: 1,
          sessionId: 'session-1',
          status: 'pending',
          attendance: 'pending',
          outcome: 'pending',
          createdAt: '',
          concurrencyStamp: '',
        },
      ],
    })
  );
  rerender(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <ApplicationAssessmentPanel
        compact
        applicationId="application-1"
        admissionOfferingId="offering-1"
        stage={stage}
        canAdvance
        advancing={false}
        onComplete={vi.fn()}
      />
    </ThemeProvider>
  );
  expect(screen.queryByText('Book a slot before the entrance exam')).not.toBeInTheDocument();
});

it('reports completion readiness to the page without rendering a duplicate Continue action', () => {
  const onReadinessChange = vi.fn();
  mocks.query.mockReturnValue(query({ ...base, canComplete: true }));
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <ApplicationAssessmentPanel
        compact
        applicationId="application-1"
        admissionOfferingId="offering-1"
        stage={stage}
        canAdvance
        advancing={false}
        onComplete={vi.fn()}
        showCompletionAction={false}
        onReadinessChange={onReadinessChange}
      />
    </ThemeProvider>
  );
  expect(
    screen.queryByRole('button', { name: 'Complete assessment step' })
  ).not.toBeInTheDocument();
  expect(onReadinessChange).toHaveBeenLastCalledWith({
    stageId: 'stage-1',
    canComplete: true,
    busy: false,
    concurrencyStamp: 'stamp',
  });
});

it.each([2, 3, 4])('does not suggest scheduling for historical stage status %i', (status) => {
  mocks.query.mockReturnValue(
    query({ ...base, policy: { ...DEFAULT_ASSESSMENT_POLICY, schedulingEnabled: true } })
  );
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <ApplicationAssessmentPanel
        compact
        applicationId="application-1"
        admissionOfferingId="offering-1"
        stage={{ ...stage, status } as AdmissionApplicationStage}
        canAdvance={false}
        advancing={false}
        onComplete={vi.fn()}
      />
    </ThemeProvider>
  );
  expect(screen.queryByText('Book a slot before the entrance exam')).not.toBeInTheDocument();
});

it('does not suggest scheduling when server booking capability is unavailable', () => {
  mocks.query.mockReturnValue(
    query({
      ...base,
      canBook: false,
      policy: { ...DEFAULT_ASSESSMENT_POLICY, schedulingEnabled: true },
    })
  );
  panel();
  expect(screen.queryByText('Book a slot before the entrance exam')).not.toBeInTheDocument();
});

const pendingAttempt = {
  id: 'attempt-1',
  attemptNumber: 1,
  attendance: 'pending' as const,
  status: 'pending' as const,
  outcome: 'pending' as const,
  concurrencyStamp: 'reviewed-attempt-stamp',
  createdAt: '2026-10-10T05:00:00Z',
};
const editable = (extra: Partial<ApplicationAssessment> = {}) => ({
  ...base,
  canBook: false,
  canRecordAttendance: true,
  canRecordResult: false,
  canCancel: true,
  attempts: [pendingAttempt],
  ...extra,
});

it('keeps result saving in the pinned Actions cell and submits its associated marks form', async () => {
  mocks.query.mockReturnValue(query(editable({ canRecordResult: true })));
  panel();
  const marks = screen.getByRole('textbox', { name: 'Marks / 100' });
  const save = screen.getByRole('button', {
    name: 'Save result for attempt 1',
  }) as HTMLButtonElement;
  const form = marks.closest('form');
  expect(save.closest('td')).not.toBe(marks.closest('td'));
  expect(save.closest('td')).toBe(
    screen.getByRole('button', { name: 'More actions for attempt 1' }).closest('td')
  );
  expect(save.form).toBe(form);
  expect(save.closest('td')).toHaveStyle({ position: 'sticky' });
  fireEvent.change(marks, { target: { value: '80' } });
  fireEvent.click(save);
  await waitFor(() =>
    expect(mocks.run).toHaveBeenCalledWith(
      'result',
      expect.objectContaining({ marks: 80 }),
      expect.anything()
    )
  );
});

it.each(['present', 'absent'])('records %s directly without a form popup', async (attendance) => {
  mocks.query.mockReturnValue(query(editable()));
  panel();
  fireEvent.click(screen.getByRole('button', { name: `Mark attempt 1 ${attendance}` }));
  await waitFor(() =>
    expect(mocks.run).toHaveBeenCalledWith(
      'attendance',
      expect.objectContaining({ attendance }),
      expect.objectContaining({ attempts: [pendingAttempt] })
    )
  );
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Save result for attempt 1' })).toBeDisabled();
});

it('preserves decimal marks and the reviewed stamp when a later refresh changes the record', async () => {
  const reviewed = editable({
    canRecordResult: true,
    attempts: [{ ...pendingAttempt, attendance: 'present' }],
  });
  mocks.query.mockReturnValue(query(reviewed));
  const { rerender } = panel();
  fireEvent.change(screen.getByRole('textbox', { name: 'Marks / 100' }), {
    target: { value: '69.25' },
  });
  mocks.query.mockReturnValue(
    query({ ...reviewed, attempts: [{ ...reviewed.attempts[0], concurrencyStamp: 'new-stamp' }] })
  );
  rerender(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <ApplicationAssessmentPanel
        compact
        applicationId="application-1"
        admissionOfferingId="offering-1"
        stage={stage}
        canAdvance
        advancing={false}
        onComplete={vi.fn()}
      />
    </ThemeProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'Save result for attempt 1' }));
  await waitFor(() =>
    expect(mocks.run).toHaveBeenCalledWith(
      'result',
      expect.objectContaining({ marks: 69.25 }),
      reviewed
    )
  );
});

it('validates the configured mark limit and retains the draft after a failed save', async () => {
  mocks.query.mockReturnValue(
    query(
      editable({
        canRecordResult: true,
        policy: { ...DEFAULT_ASSESSMENT_POLICY, totalMarks: 80, passingMarks: 32 },
      })
    )
  );
  mocks.run.mockRejectedValue({ data: { detail: 'The attempt changed. Reload and try again.' } });
  panel();
  fireEvent.change(screen.getByRole('textbox', { name: 'Marks / 80' }), {
    target: { value: '81' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save result for attempt 1' }));
  expect(await screen.findByText('Enter marks between 0 and 80')).toBeVisible();
  expect(mocks.run).not.toHaveBeenCalled();
  fireEvent.change(screen.getByRole('textbox', { name: 'Marks / 80' }), {
    target: { value: '69' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save result for attempt 1' }));
  expect(await screen.findByText('The attempt changed. Reload and try again.')).toBeVisible();
  expect(screen.getByRole('textbox', { name: 'Marks / 80' })).toHaveValue('69');
  fireEvent.click(screen.getByRole('button', { name: 'Discard result' }));
  await waitFor(() => expect(screen.getByRole('textbox', { name: 'Marks / 80' })).toHaveValue(''));
});

it('locks conflicting controls and prevents duplicate writes during inline saving', async () => {
  let resolve!: () => void;
  mocks.run.mockReturnValue(
    new Promise<void>((done) => {
      resolve = done;
    })
  );
  mocks.query.mockReturnValue(query(editable()));
  panel();
  fireEvent.click(screen.getByRole('button', { name: 'Mark attempt 1 present' }));
  fireEvent.click(screen.getByRole('button', { name: 'Mark attempt 1 absent' }));
  expect(mocks.run).toHaveBeenCalledOnce();
  expect(screen.getByRole('button', { name: 'Mark attempt 1 absent' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Refresh' })).toBeDisabled();
  await act(async () => resolve());
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Mark attempt 1 absent' })).toBeEnabled()
  );
});

it('keeps saved results in the same table without editable completed controls', () => {
  mocks.query.mockReturnValue(
    query(
      editable({
        attempts: [
          {
            ...pendingAttempt,
            attendance: 'present',
            status: 'completed',
            outcome: 'passed',
            marks: 69,
          },
        ],
        canRecordAttendance: false,
        canRecordResult: false,
        canComplete: true,
      })
    )
  );
  panel();
  expect(screen.getByText('69 / 100')).toBeVisible();
  expect(screen.getByText('Passed')).toHaveClass('mnl__label__root');
  expect(screen.queryByRole('textbox', { name: 'Marks / 100' })).not.toBeInTheDocument();
});

it('retains audited Waive/Cancel dialogs in the shared row menu', () => {
  mocks.query.mockReturnValue(query(editable()));
  panel();
  fireEvent.click(screen.getByRole('button', { name: 'More actions for attempt 1' }));
  fireEvent.click(screen.getByRole('menuitem', { name: 'Cancel attempt' }));
  expect(screen.getByRole('dialog')).toHaveTextContent('Action cancel');
});

it('does not expose inline write controls when action permissions are denied', () => {
  mocks.permissions.attendance = false;
  mocks.permissions.results = false;
  mocks.permissions.waive = false;
  mocks.query.mockReturnValue(query(editable({ canRecordResult: true, canCancel: false })));
  panel();
  expect(screen.queryByRole('button', { name: 'Mark attempt 1 present' })).not.toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: 'Marks / 100' })).toBeDisabled();
  expect(
    screen.queryByRole('button', { name: 'More actions for attempt 1' })
  ).not.toBeInTheDocument();
});

it('retains entered marks through a failed background read and locks stale writes', async () => {
  const data = editable({ canRecordResult: true });
  mocks.query.mockReturnValue(query(data));
  const { rerender } = panel();
  fireEvent.change(screen.getByRole('textbox', { name: 'Marks / 100' }), {
    target: { value: '57' },
  });
  mocks.query.mockReturnValue(query(data, { isError: true }));
  rerender(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <ApplicationAssessmentPanel
        compact
        applicationId="application-1"
        admissionOfferingId="offering-1"
        stage={stage}
        canAdvance
        advancing={false}
        onComplete={vi.fn()}
      />
    </ThemeProvider>
  );
  expect(screen.getByRole('textbox', { name: 'Marks / 100' })).toHaveValue('57');
  expect(screen.getByRole('button', { name: 'Save result for attempt 1' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Discard result' }));
  await waitFor(() => expect(screen.getByRole('textbox', { name: 'Marks / 100' })).toHaveValue(''));
});

it('offers discard when the edited attempt disappears after refresh', async () => {
  mocks.query.mockReturnValue(query(editable({ canRecordResult: true })));
  const { rerender } = panel();
  fireEvent.change(screen.getByRole('textbox', { name: 'Marks / 100' }), {
    target: { value: '57' },
  });
  mocks.query.mockReturnValue(query(editable({ attempts: [], canRecordResult: false })));
  rerender(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <ApplicationAssessmentPanel
        compact
        applicationId="application-1"
        admissionOfferingId="offering-1"
        stage={stage}
        canAdvance
        advancing={false}
        onComplete={vi.fn()}
      />
    </ThemeProvider>
  );
  expect(
    await screen.findByText(
      'The assessment attempt changed. Discard the unsaved result and try again.'
    )
  ).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Discard result' }));
  await waitFor(() =>
    expect(screen.queryByRole('button', { name: 'Discard result' })).not.toBeInTheDocument()
  );
  expect(mocks.run).not.toHaveBeenCalled();
});

it('records a pass/fail result when scoring and required attendance are disabled', async () => {
  mocks.query.mockReturnValue(
    query(
      editable({
        canRecordResult: true,
        canRecordAttendance: false,
        policy: { ...DEFAULT_ASSESSMENT_POLICY, scoringEnabled: false, attendanceRequired: false },
      })
    )
  );
  panel();
  expect(screen.queryByRole('textbox', { name: /Marks/ })).not.toBeInTheDocument();
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Result' }));
  fireEvent.click(screen.getByRole('option', { name: 'Passed' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save result for attempt 1' }));
  await waitFor(() =>
    expect(mocks.run).toHaveBeenCalledWith(
      'result',
      expect.objectContaining({ outcome: 'passed' }),
      expect.anything()
    )
  );
});

it('reports unsaved results to the page and blocks continuation until discard', async () => {
  const onReadinessChange = vi.fn();
  mocks.query.mockReturnValue(query(editable({ canRecordResult: true, canComplete: true })));
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <ApplicationAssessmentPanel
        compact
        applicationId="application-1"
        admissionOfferingId="offering-1"
        stage={stage}
        canAdvance
        advancing={false}
        onComplete={vi.fn()}
        onReadinessChange={onReadinessChange}
      />
    </ThemeProvider>
  );
  fireEvent.change(screen.getByRole('textbox', { name: 'Marks / 100' }), {
    target: { value: '57' },
  });
  await waitFor(() =>
    expect(onReadinessChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ dirty: true, canComplete: false })
    )
  );
  expect(screen.getByRole('button', { name: 'Complete assessment step' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Discard result' }));
  await waitFor(() =>
    expect(onReadinessChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ canComplete: true })
    )
  );
});
