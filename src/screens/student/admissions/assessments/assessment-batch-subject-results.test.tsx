import type { Window } from 'happy-dom';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AssessmentRosterItem } from 'src/redux/student/admissions/admission-assessment-roster-api';
import type {
  ApplicationAssessment,
  AssessmentResultInput,
  AssessmentEffectiveProfile,
} from 'src/redux/student/admissions/admission-assessment-types';

import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { assessmentResponse } from 'src/redux/student/admissions/assessment-test-fixture';
import { render, screen, within, cleanup, waitFor, fireEvent } from '@testing-library/react';

import { AssessmentBatchDialog } from './assessment-batch-dialog';

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  draft: vi.fn(),
  result: vi.fn(),
  other: vi.fn(),
  closed: vi.fn(),
  nativeSubmit: vi.fn(),
  state: new Map<string, ApplicationAssessment>(),
}));
const browser = window as unknown as Window;
const requests = vi.fn();
let previousInterceptor: typeof browser.happyDOM.settings.fetch.interceptor;

// MSW's strict strategy still ignores asset .json requests. This unit fixture
// expects zero browser network calls: capture unexpected requests and fail in
// afterEach instead of allowing them to open live TLS sockets.
beforeEach(() => {
  previousInterceptor = browser.happyDOM.settings.fetch.interceptor;
  browser.happyDOM.settings.fetch.interceptor = {
    beforeAsyncRequest: async ({ request, window: requestWindow }) => {
      requests(request.url);
      return new requestWindow.Response(null, { status: 404 });
    },
  };
});

afterEach(() => {
  cleanup();
  browser.happyDOM.settings.fetch.interceptor = previousInterceptor;
  expect(requests).not.toHaveBeenCalled();
});
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));
// SubmitButton imports the implementation directly rather than the barrel.
vi.mock('src/components/iconify/iconify', () => ({ Iconify: () => <span aria-hidden /> }));
vi.mock('src/redux/student/admissions/admission-assessments-api', () => ({
  admissionAssessmentsApi: { useLazyGetApplicationAssessmentQuery: () => [mocks.get] },
  useRecordAssessmentResultMutation: () => [mocks.result],
  useSaveAssessmentResultDraftMutation: () => [mocks.draft],
  useRecordAssessmentAttendanceMutation: () => [mocks.other],
}));
vi.mock('src/redux/student/admissions/admission-applications-api', () => ({
  admissionApplicationsApi: { useLazyGetAdmissionApplicationWorkflowQuery: () => [mocks.other] },
  useLazyGetAdmissionApplicationQuery: () => [mocks.other],
  useAdvanceAdmissionApplicationWorkflowMutation: () => [mocks.other],
}));
vi.mock('src/components/customDialog', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div role="dialog">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          mocks.nativeSubmit();
        }}
      >
        {children}
      </form>
    </div>
  ),
  DialogScrollContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({
    columns,
    data,
  }: {
    columns: IColumn[];
    data: (AssessmentRosterItem & { id: string })[];
  }) => (
    <div data-testid="batch-profile-table">
      {data.map((row) => (
        <div key={row.id} role="group" aria-label={row.applicantName}>
          {columns.map((column) => (
            <div key={column.id}>
              {column.render
                ? column.render(undefined, row)
                : String(row[column.id as keyof AssessmentRosterItem] ?? '')}
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
}));
vi.mock('src/components/confirm-dialog', () => ({ ConfirmDialog: () => null }));

function makeRow(
  id: string,
  className: string,
  subjects: AssessmentEffectiveProfile['subjects']
): AssessmentRosterItem {
  const profile: AssessmentEffectiveProfile = {
    id: `profile-${id}`,
    name: `${className} entrance`,
    boardId: 'board',
    mediumId: 'medium',
    standardIds: [id],
    passRule: 'both',
    passingMarks: 20,
    subjects,
  };
  const assessment: ApplicationAssessment = {
    ...assessmentResponse,
    applicationId: `application-${id}`,
    stageInstanceId: id,
    effectiveProfile: profile,
    policy: { ...assessmentResponse.policy!, version: 2, scoringMode: 'subjects' },
    canRecordResult: true,
    canSaveResultDraft: true,
    attempts: [
      {
        id: `attempt-${id}`,
        attemptNumber: 1,
        attendance: 'present',
        status: 'pending',
        outcome: 'pending',
        concurrencyStamp: 'reviewed',
        createdAt: '',
        effectiveProfile: profile,
        subjectScores: [],
      },
    ],
  };
  mocks.state.set(id, assessment);
  return {
    applicationId: assessment.applicationId,
    applicationNumber: `APP-${id}`,
    applicantId: `applicant-${id}`,
    applicantName: `Applicant ${id}`,
    stageInstanceId: id,
    className,
    stageName: 'Entrance',
    applicationStatus: 1,
    stageStatus: 1,
    isActive: true,
    queue: 'result',
    assessment,
  };
}
function persist(input: AssessmentResultInput, draft: boolean) {
  const key = input.attemptId.replace('attempt-', '');
  const current = mocks.state.get(key)!;
  const updated: ApplicationAssessment = {
    ...current,
    canComplete: !draft,
    canRecordResult: draft,
    attempts: [
      {
        ...current.attempts[0],
        concurrencyStamp: `${draft ? 'draft' : 'submitted'}-${key}`,
        subjectScores: input.subjectScores,
        status: draft ? 'pending' : 'completed',
        outcome: draft ? 'pending' : 'passed',
        notes: input.notes,
      },
    ],
  };
  mocks.state.set(key, updated);
  return updated;
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.state.clear();
  mocks.get.mockImplementation(({ stageInstanceId }) => ({
    unwrap: async () => mocks.state.get(stageInstanceId),
  }));
  mocks.draft.mockImplementation((input: AssessmentResultInput) => ({
    unwrap: async () => persist(input, true),
  }));
  mocks.result.mockImplementation((input: AssessmentResultInput) => ({
    unwrap: async () => persist(input, false),
  }));
});
const setup = (rows: AssessmentRosterItem[]) =>
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AssessmentBatchDialog action="result" rows={rows} onClose={mocks.closed} />
    </ThemeProvider>
  );

it('keeps mixed class profiles separate, saves partial drafts, then submits complete marks with fresh stamps', async () => {
  const rows = [
    makeRow('one', 'Class 1', [
      { code: 'english', name: 'English', totalMarks: 50, passingMarks: 10 },
      { code: 'maths', name: 'Maths', totalMarks: 50, passingMarks: 10 },
    ]),
    makeRow('two', 'Class 2', [
      { code: 'science', name: 'Science', totalMarks: 50, passingMarks: 10 },
    ]),
  ];
  setup(rows);
  expect(screen.getAllByTestId('batch-profile-table')).toHaveLength(2);
  const first = within(screen.getByRole('group', { name: 'Applicant one' }));
  const second = within(screen.getByRole('group', { name: 'Applicant two' }));
  expect(first.queryByRole('textbox', { name: /Science/ })).not.toBeInTheDocument();
  expect(second.queryByRole('textbox', { name: /Maths/ })).not.toBeInTheDocument();
  fireEvent.change(first.getByRole('textbox', { name: /English/ }), { target: { value: '12.25' } });
  fireEvent.change(second.getByRole('textbox', { name: /Science/ }), { target: { value: '40' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save drafts' }));
  await waitFor(() => expect(mocks.draft).toHaveBeenCalledTimes(2));
  expect(mocks.draft.mock.calls[0][0]).toMatchObject({
    concurrencyStamp: 'reviewed',
    subjectScores: [
      { code: 'english', marks: 12.25 },
      { code: 'maths', marks: null },
    ],
  });
  await waitFor(() => expect(screen.getAllByText('Draft saved')).toHaveLength(2));
  fireEvent.change(first.getByRole('textbox', { name: /Maths/ }), { target: { value: '40' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(mocks.result).toHaveBeenCalledTimes(2));
  expect(mocks.result.mock.calls[0][0]).toMatchObject({
    concurrencyStamp: 'draft-one',
    subjectScores: [
      { code: 'english', marks: 12.25 },
      { code: 'maths', marks: 40 },
    ],
  });
  expect(mocks.result.mock.calls[1][0]).toMatchObject({
    concurrencyStamp: 'draft-two',
    subjectScores: [{ code: 'science', marks: 40 }],
  });
});

it('reconciles a lost final response by exact subject scores without sending a second result', async () => {
  const row = makeRow('one', 'Class 1', [
    { code: 'english', name: 'English', totalMarks: 50, passingMarks: 10 },
  ]);
  mocks.result.mockImplementation((input: AssessmentResultInput) => ({
    unwrap: async () => {
      persist(input, false);
      throw new Error('Response lost');
    },
  }));
  setup([row]);
  fireEvent.change(screen.getByRole('textbox', { name: /English/ }), { target: { value: '25' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(screen.getByText('Needs retry')).toBeVisible());
  fireEvent.click(screen.getByRole('button', { name: 'Submit Remaining Rows' }));
  await waitFor(() => expect(screen.getByText('Saved', { exact: true })).toBeVisible());
  expect(mocks.result).toHaveBeenCalledOnce();
});

it('validates only entered rows without submitting the native form or requiring untouched applicants', async () => {
  const rows = [
    makeRow('one', 'Class 1', [
      { code: 'language', name: 'Language readiness', totalMarks: 30, passingMarks: 10 },
    ]),
    makeRow('five', 'Class 5', [
      { code: 'maths', name: 'Mathematics', totalMarks: 30, passingMarks: 10 },
      { code: 'science', name: 'Science', totalMarks: 30, passingMarks: 10 },
    ]),
  ];
  setup(rows);
  const untouched = screen.getByRole('textbox', { name: /Language readiness/ });
  const maths = screen.getByRole('textbox', { name: /Mathematics/ });
  const science = screen.getByRole('textbox', { name: /Science/ });
  const invalid = vi.fn();
  untouched.addEventListener('invalid', invalid);
  expect(untouched).toBeRequired();
  expect(untouched).toHaveValue('');
  fireEvent.change(maths, { target: { value: '0' } });
  const submit = screen.getByRole('button', { name: 'Submit' });
  expect(submit).toHaveAttribute('type', 'button');
  expect(submit.closest('form')).not.toBeNull();
  fireEvent.click(submit);
  await waitFor(() =>
    expect(
      screen.getByText('Applicant five: Enter Science marks between 0 and 30', { exact: false })
    ).toBeVisible()
  );
  expect(screen.queryByText(/Enter Language readiness marks/)).not.toBeInTheDocument();
  expect(mocks.get).not.toHaveBeenCalled();
  expect(mocks.result).not.toHaveBeenCalled();
  expect(mocks.nativeSubmit).not.toHaveBeenCalled();
  expect(invalid).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Save drafts' }));
  await waitFor(() => expect(mocks.draft).toHaveBeenCalledOnce());
  expect(mocks.draft).toHaveBeenCalledWith(
    expect.objectContaining({
      attemptId: 'attempt-five',
      subjectScores: [
        { code: 'maths', marks: 0 },
        { code: 'science', marks: null },
      ],
    })
  );
  await waitFor(() => expect(screen.getByText('Draft saved')).toBeVisible());
  fireEvent.change(science, { target: { value: '25' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(mocks.result).toHaveBeenCalledOnce());
  expect(mocks.result).toHaveBeenCalledWith(
    expect.objectContaining({
      attemptId: 'attempt-five',
      subjectScores: [
        { code: 'maths', marks: 0 },
        { code: 'science', marks: 25 },
      ],
    })
  );
  expect(untouched).toBeRequired();
  expect(untouched).toHaveValue('');
  expect(mocks.nativeSubmit).not.toHaveBeenCalled();
  expect(invalid).not.toHaveBeenCalled();
});
