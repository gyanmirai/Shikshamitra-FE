import type { ApplicationAssessment } from 'src/redux/student/admissions/admission-assessment-types';
import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import { vi, it, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings';
import { act, render, screen, within, waitFor, fireEvent } from '@testing-library/react';
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
vi.mock('./assessment-pipeline-booking-drawer', () => ({
  AssessmentPipelineBookingDrawer: () => <div role="dialog" aria-label="Book Assessment Slot" />,
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
        'Record the required assessment attendance and result.',
        'Attendance and results become available when the session starts.',
        'This assessment stage is not active.',
      ],
    })
  );
  panel();
  expect(
    screen.queryByText('Create an assessment attempt or record an authorized waiver.')
  ).not.toBeInTheDocument();
  expect(screen.getByText('This assessment stage is not active.')).toBeVisible();
  expect(
    screen.queryByText('Record the required assessment attendance and result.')
  ).not.toBeInTheDocument();
  expect(
    screen.queryByText('Attendance and results become available when the session starts.')
  ).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Start assessment' })).not.toBeInTheDocument();
});

it('keeps current and previous attempts as cards without a table or history section', () => {
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
  expect(screen.getByRole('article', { name: 'Assessment attempt 2' })).toBeVisible();
  expect(screen.getByRole('article', { name: 'Assessment attempt 1' })).toBeVisible();
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
  expect(screen.queryByText('Activity')).not.toBeInTheDocument();
  expect(screen.queryByText('Attempt history')).not.toBeInTheDocument();
  expect(screen.queryByText('Save result to continue')).not.toBeInTheDocument();
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
  expect(screen.getByText('Assessment access is required', { exact: false })).toBeVisible();
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

it('opens scheduled booking in the Pipeline drawer without the external scheduling warning', () => {
  mocks.query.mockReturnValue(
    query({ ...base, policy: { ...DEFAULT_ASSESSMENT_POLICY, schedulingEnabled: true } })
  );
  const { rerender } = panel();
  expect(screen.queryByText('Book a slot before the entrance exam')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Go to Assessments' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Book Assessment Slot' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Book Assessment Slot' }));
  expect(screen.getByRole('dialog', { name: 'Book Assessment Slot' })).toBeVisible();
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

it('shows the booked session, school-local date/time and room in the attempt card', () => {
  mocks.query.mockReturnValue(
    query(
      editable({
        attempts: [
          {
            ...pendingAttempt,
            sessionId: 'session-1',
            sessionName: 'School exam · Entrance assessment · 15 Oct 2026',
            sessionStartsAt: '2026-10-15T09:40:00Z',
            sessionEndsAt: '2026-10-15T09:45:00Z',
            sessionLocation: 'A001',
          },
        ],
      })
    )
  );
  panel();
  const card = screen.getByRole('article', { name: 'Assessment attempt 1' });
  expect(within(card).getByText('School exam · Entrance assessment · 15 Oct 2026')).toBeVisible();
  expect(within(card).getByText('15 Oct 2026')).toBeVisible();
  expect(within(card).getByText('3:10 PM–3:15 PM IST')).toBeVisible();
  expect(within(card).getByText('A001')).toBeVisible();
  expect(within(card).getByText('Result pending')).toHaveClass('mnl__label__root');
});

it('keeps a small Save Result action beside marks and submits the same result form', async () => {
  mocks.query.mockReturnValue(query(editable({ canRecordResult: true })));
  panel();
  const marks = screen.getByRole('textbox', { name: 'Marks / 100' });
  const save = screen.getByRole('button', {
    name: 'Save result for attempt 1',
  }) as HTMLButtonElement;
  const form = marks.closest('form');
  expect(save).toHaveClass('MuiButton-sizeSmall');
  expect(save).toHaveTextContent('Save Result');
  expect(save.form).toBe(form);
  expect(save.closest('article')).toBe(marks.closest('article'));
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

it('keeps saved results in the same card without editable completed controls', () => {
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

it('changes recorded attendance through the existing notes dialog', () => {
  mocks.query.mockReturnValue(
    query(editable({ attempts: [{ ...pendingAttempt, attendance: 'present' }] }))
  );
  panel();
  expect(screen.getByText('Present')).toHaveClass('mnl__label__root');
  const change = screen.getByRole('button', { name: 'Change attendance for attempt 1' });
  expect(change).toHaveClass('MuiButton-sizeSmall');
  fireEvent.click(change);
  expect(screen.getByRole('dialog')).toHaveTextContent('Action attendance');
  expect(mocks.run).not.toHaveBeenCalled();
});

it('keeps a failed result visible and routes retakes through the existing reason dialog', () => {
  mocks.query.mockReturnValue(
    query(
      editable({
        attempts: [
          {
            ...pendingAttempt,
            status: 'completed',
            attendance: 'present',
            outcome: 'failed',
            marks: 22,
          },
        ],
        canRetake: true,
        canRecordAttendance: false,
      })
    )
  );
  const onComplete = vi.fn();
  panel(onComplete);
  expect(screen.getByText('22 / 100')).toBeVisible();
  expect(screen.getByText('Failed')).toHaveClass('mnl__label__root');
  expect(screen.queryByRole('textbox', { name: 'Marks / 100' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'More actions for attempt 1' }));
  fireEvent.click(screen.getByRole('menuitem', { name: 'Allow retake' }));
  expect(screen.getByRole('dialog')).toHaveTextContent('Action retake');
  expect(onComplete).not.toHaveBeenCalled();
});

it('shows the assigned interview slot instead of the whole session window', () => {
  mocks.query.mockReturnValue(
    query(
      editable({
        attempts: [
          {
            ...pendingAttempt,
            sessionStartsAt: '2026-10-15T03:30:00Z',
            sessionEndsAt: '2026-10-15T05:30:00Z',
            slotStartsAt: '2026-10-15T04:00:00Z',
            slotEndsAt: '2026-10-15T04:15:00Z',
          },
        ],
      })
    )
  );
  panel();
  expect(screen.getByText('9:30 AM–9:45 AM IST')).toBeVisible();
  expect(screen.queryByText('9:00 AM–11:00 AM IST')).not.toBeInTheDocument();
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

it('restores subject draft marks, requires every mark for submit, and saves partial drafts without continuing', async () => {
  const profile = {
    id: 'profile',
    name: 'Class 1 entrance',
    boardId: 'board',
    mediumId: 'medium',
    standardIds: ['class-1'],
    passRule: 'both' as const,
    passingMarks: 40,
    subjects: [
      { code: 'english', name: 'English', totalMarks: 50, passingMarks: 20 },
      { code: 'maths', name: 'Maths', totalMarks: 50, passingMarks: 20 },
    ],
  };
  const attempt = {
    id: 'subject-attempt',
    attemptNumber: 1,
    attendance: 'present' as const,
    status: 'pending' as const,
    outcome: 'pending' as const,
    createdAt: '',
    concurrencyStamp: 'reviewed',
    effectiveProfile: profile,
    subjectScores: [
      { code: 'english', marks: 0 },
      { code: 'maths', marks: null },
    ],
  };
  const assessment = {
    ...base,
    policy: { ...DEFAULT_ASSESSMENT_POLICY, version: 2 as const, scoringMode: 'subjects' as const },
    effectiveProfile: profile,
    attempts: [attempt],
    canRecordResult: true,
    canSaveResultDraft: true,
    canBook: false,
  };
  mocks.query.mockReturnValue(query(assessment));
  const updated = {
    ...assessment,
    attempts: [
      {
        ...attempt,
        concurrencyStamp: 'saved',
        subjectScores: [
          { code: 'english', marks: 15.25 },
          { code: 'maths', marks: null },
        ],
      },
    ],
  };
  mocks.run.mockResolvedValue(updated);
  const complete = vi.fn();
  panel(complete);
  expect(screen.getByRole('textbox', { name: /English \/ 50/ })).toHaveValue('0');
  expect(screen.getByRole('textbox', { name: /Maths \/ 50/ })).toHaveValue('');
  fireEvent.change(screen.getByRole('textbox', { name: /English \/ 50/ }), {
    target: { value: '15.25' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Submit result' }));
  await waitFor(() => expect(screen.getByText('Enter Maths marks between 0 and 50')).toBeVisible());
  expect(mocks.run).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
  await waitFor(() =>
    expect(mocks.run).toHaveBeenCalledWith(
      'resultDraft',
      expect.objectContaining({ subjectScores: { english: '15.25', maths: '' } }),
      expect.objectContaining({ canComplete: false })
    )
  );
  expect(screen.getByRole('button', { name: 'Complete assessment step' })).toBeDisabled();
  expect(complete).not.toHaveBeenCalled();
});
