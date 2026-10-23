import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import TransitionBatchForm from './transition-batch-form';

const mocks = vi.hoisted(() => ({
  preview: vi.fn(),
  submit: vi.fn(),
  done: vi.fn(),
  previewData: {} as any,
  schoolMode: 'manual' as 'manual' | 'automatic' | 'both',
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('react-redux', () => ({
  useSelector: (select: any) => select({ globalState: { currentYear: { id: 'year-1' } } }),
}));
vi.mock('src/hooks/use-unsaved-navigation', () => ({
  useUnsavedNavigation: () => ({ confirmation: null }),
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
    success: vi.fn(),
  },
}));
vi.mock('src/components/form-section-card', () => ({
  FormSectionCard: ({ title, children, action }: any) => (
    <section aria-label={title}>
      {action}
      {children}
    </section>
  ),
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ data }: any) => (
    <div>
      {data.map((row: any) => (
        <div key={row.studentId}>
          {row.studentName} · {row.ready ? 'Ready' : 'Needs attention'}
        </div>
      ))}
    </div>
  ),
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, value, options, onChange, disabled }: any) => (
    <select
      aria-label={label}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="" />
      {options.map((option: any) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));
vi.mock('./records-student-picker', () => ({
  default: ({ onSelect }: any) => (
    <button
      type="button"
      onClick={() => onSelect({ studentId: 'student-1', firstName: 'Riya', lastName: 'Shah' })}
    >
      Select Riya
    </button>
  ),
}));
vi.mock('src/redux/student/records/student-record-transitions-api', () => ({
  useGetStudentRecordTransitionOptionsQuery: () => ({
    currentData: {
      academicYears: [{ id: 'year-1', name: '2026–27' }],
      standards: [{ id: 'class-1', name: 'Class 6' }],
      divisions: [{ id: 'division-1', name: 'A', parentId: 'class-1' }],
      rollAssignmentMode: mocks.schoolMode,
    },
  }),
  usePreviewStudentRecordTransitionsMutation: () => [mocks.preview, { isLoading: false }],
  useSubmitStudentRecordTransitionsMutation: () => [mocks.submit, { isLoading: false }],
}));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.schoolMode = 'manual';
  mocks.previewData = {
    items: [
      {
        studentId: 'student-1',
        outcome: 'Withdraw',
        ready: true,
        issues: [],
        studentConcurrencyStamp: 'student-stamp',
        enrollmentConcurrencyStamp: 'enrollment-stamp',
      },
    ],
    readyCount: 1,
    exceptionCount: 0,
    canSubmit: true,
    batchExceptionMode: 'ReadyOnly',
  };
  mocks.preview.mockImplementation(() => ({ unwrap: () => Promise.resolve(mocks.previewData) }));
  mocks.submit.mockImplementation(() => ({
    unwrap: () =>
      Promise.resolve({ batchId: 'batch-1', items: [{ id: 'operation-1' }], exceptions: [] }),
  }));
});

async function preparePromotion(mode: 'manual' | 'automatic' | 'both') {
  mocks.schoolMode = mode;
  mocks.previewData.items[0] = {
    ...mocks.previewData.items[0],
    outcome: 'Promote',
    rollAssignmentMode: mode === 'both' ? 'automatic' : mode,
    proposedRollNumber: 35,
  };
  const view = render(<TransitionBatchForm onSubmitted={mocks.done} />);
  fireEvent.click(screen.getByRole('button', { name: 'Select Riya' }));
  fireEvent.change(screen.getByLabelText('Target academic year'), { target: { value: 'year-1' } });
  await waitFor(() => expect(screen.getByLabelText('Target class')).toBeEnabled());
  fireEvent.change(screen.getByLabelText('Target class'), { target: { value: 'class-1' } });
  fireEvent.change(screen.getByLabelText('Target division'), { target: { value: 'division-1' } });
  fireEvent.change(screen.getByLabelText('Reason'), {
    target: { value: 'Annual promotion after academic review' },
  });
  return view;
}

it('does not send a contradictory manual payload after the school switches to automatic-only', async () => {
  const view = await preparePromotion('manual');
  fireEvent.change(screen.getByLabelText(/Target roll number/), { target: { value: '14' } });
  mocks.schoolMode = 'automatic';
  view.rerender(<TransitionBatchForm onSubmitted={mocks.done} />);
  expect(await screen.findByText(/School numbering rules changed/)).toBeVisible();
  expect(screen.queryByLabelText(/Target roll number/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Preview batch' }));
  expect(
    await screen.findByText('Review the highlighted student rows before previewing.')
  ).toBeVisible();
  expect(mocks.preview).not.toHaveBeenCalled();
});

it('submits the accepted automatic number and source stamps without UI metadata', async () => {
  await preparePromotion('automatic');
  expect(screen.queryByLabelText(/Target roll number/)).not.toBeInTheDocument();
  expect(screen.getByLabelText('Proposed roll number')).toHaveAttribute('readonly');
  fireEvent.click(screen.getByRole('button', { name: 'Preview batch' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Submit ready transitions' })).toBeEnabled()
  );
  expect(screen.getByLabelText('Proposed roll number')).toHaveValue('35');
  fireEvent.click(screen.getByRole('button', { name: 'Submit ready transitions' }));
  await waitFor(() => expect(mocks.submit).toHaveBeenCalledOnce());
  expect(mocks.submit.mock.calls[0][0].items[0]).toMatchObject({
    rollAssignmentMode: 'automatic',
    rollNumber: 35,
    studentConcurrencyStamp: 'student-stamp',
    enrollmentConcurrencyStamp: 'enrollment-stamp',
  });
  expect(mocks.submit.mock.calls[0][0].items[0]).not.toHaveProperty('schoolRollMode');
});

it('does not choose manual automatically in a school that allows both methods', async () => {
  await preparePromotion('both');
  expect(screen.getByLabelText('Roll number assignment')).toHaveValue('');
  fireEvent.click(screen.getByRole('button', { name: 'Preview batch' }));
  expect(
    await screen.findByText('Review the highlighted student rows before previewing.')
  ).toBeVisible();
  expect(mocks.preview).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Roll number assignment'), {
    target: { value: 'automatic' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Preview batch' }));
  await waitFor(() => expect(mocks.preview).toHaveBeenCalledOnce());
  expect(mocks.preview.mock.calls[0][0].items[0].rollAssignmentMode).toBe('automatic');
});

it('clears the manual number and invalidates review when staff switch to automatic', async () => {
  await preparePromotion('both');
  fireEvent.change(screen.getByLabelText('Roll number assignment'), {
    target: { value: 'manual' },
  });
  fireEvent.change(screen.getByLabelText(/Target roll number/), { target: { value: '14' } });
  mocks.previewData.items[0].rollAssignmentMode = 'manual';
  fireEvent.click(screen.getByRole('button', { name: 'Preview batch' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Submit ready transitions' })).toBeEnabled()
  );
  fireEvent.change(screen.getByLabelText('Roll number assignment'), {
    target: { value: 'automatic' },
  });
  expect(screen.getByRole('button', { name: 'Submit ready transitions' })).toBeDisabled();
  expect(screen.getByLabelText('Proposed roll number')).toHaveValue('');
  fireEvent.click(screen.getByRole('button', { name: 'Preview batch' }));
  await waitFor(() => expect(mocks.preview).toHaveBeenCalledTimes(2));
  expect(mocks.preview.mock.calls[1][0].items[0]).toMatchObject({
    rollAssignmentMode: 'automatic',
    rollNumber: null,
  });
});

it('blocks a ready automatic row when the server has not returned a valid proposal', async () => {
  await preparePromotion('automatic');
  mocks.previewData.items[0].proposedRollNumber = null;
  fireEvent.click(screen.getByRole('button', { name: 'Preview batch' }));
  expect(await screen.findByText('1 ready · 0 exceptions')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Submit ready transitions' })).toBeDisabled();
});

it('discards a stale automatic preview after a changed-proposal response', async () => {
  await preparePromotion('automatic');
  mocks.submit.mockReturnValue({
    unwrap: () =>
      Promise.reject(
        Object.assign(new Error('Proposal changed'), {
          data: { error: { code: 'Students:Records:RollProposalChanged' } },
        })
      ),
  });
  fireEvent.click(screen.getByRole('button', { name: 'Preview batch' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Submit ready transitions' })).toBeEnabled()
  );
  fireEvent.click(screen.getByRole('button', { name: 'Submit ready transitions' }));
  expect(await screen.findByText(/The batch could not be submitted/)).toBeVisible();
  expect(screen.getByRole('button', { name: 'Submit ready transitions' })).toBeDisabled();
  expect(screen.getByLabelText('Target division')).toHaveValue('division-1');
});
function prepare() {
  render(<TransitionBatchForm onSubmitted={mocks.done} />);
  fireEvent.click(screen.getByRole('button', { name: 'Select Riya' }));
  fireEvent.change(screen.getByLabelText('Outcome'), { target: { value: 'Withdraw' } });
  fireEvent.change(screen.getByLabelText('Reason'), {
    target: { value: 'Parent approved school withdrawal' },
  });
}
describe('Year-end batch safeguards', () => {
  it('requires a fresh server preview and submits exact student and enrollment stamps', async () => {
    prepare();
    expect(screen.getByRole('button', { name: 'Submit ready transitions' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Preview batch' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Submit ready transitions' })).toBeEnabled()
    );
    fireEvent.click(screen.getByRole('button', { name: 'Submit ready transitions' }));
    await waitFor(() => expect(mocks.submit).toHaveBeenCalledOnce());
    const body = mocks.submit.mock.calls[0][0];
    expect(body).toMatchObject({
      academicYearId: 'year-1',
      items: [
        {
          studentId: 'student-1',
          outcome: 'Withdraw',
          studentConcurrencyStamp: 'student-stamp',
          enrollmentConcurrencyStamp: 'enrollment-stamp',
        },
      ],
    });
    expect(body.items[0]).not.toHaveProperty('studentName');
    expect(body.idempotencyKey).toBeTruthy();
    expect(mocks.done).toHaveBeenCalledOnce();
  });
  it('invalidates the preview when the row changes', async () => {
    prepare();
    fireEvent.click(screen.getByRole('button', { name: 'Preview batch' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Submit ready transitions' })).toBeEnabled()
    );
    fireEvent.change(screen.getByLabelText('Reason'), {
      target: { value: 'Changed withdrawal reason' },
    });
    expect(screen.getByRole('button', { name: 'Submit ready transitions' })).toBeDisabled();
    expect(
      screen.getByText('The batch changed. Preview it again before submitting.')
    ).toBeVisible();
  });
  it('keeps a held batch blocked when the server reports an exception', async () => {
    mocks.previewData = {
      ...mocks.previewData,
      canSubmit: false,
      batchExceptionMode: 'HoldAll',
      readyCount: 0,
      exceptionCount: 1,
      items: [
        {
          ...mocks.previewData.items[0],
          ready: false,
          issues: [{ code: 'FinanceNotClear', message: 'Finance clearance required' }],
        },
      ],
    };
    prepare();
    fireEvent.click(screen.getByRole('button', { name: 'Preview batch' }));
    expect(await screen.findByText('0 ready · 1 exceptions')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Submit ready transitions' })).toBeDisabled();
    expect(mocks.submit).not.toHaveBeenCalled();
  });
});
