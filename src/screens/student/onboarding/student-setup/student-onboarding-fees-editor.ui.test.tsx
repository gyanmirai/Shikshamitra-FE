import { createRef } from 'react';
import { vi, it, expect, beforeEach } from 'vitest';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import StudentOnboardingFees from './student-onboarding-fees';

import type { StudentOnboardingFeesHandle } from './student-onboarding-fees';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));

const mocks = vi.hoisted(() => ({
  confirm: vi.fn(),
  refreshCase: vi.fn(),
  state: vi.fn(),
  confirmed: false,
  automatic: false,
  candidates: true,
  failing: false,
  readingError: false,
  optional: false,
}));
const structure = {
  structureId: 'structure-1',
  structureName: 'Class 1',
  revisionNumber: 2,
  heads: [{ feeHeadId: 'tuition', feeHeadName: 'Tuition', isOptional: false }],
};
const unconfirmed = {
  onboardingConfirmed: false,
  automaticallyConfirmedFromAdmissions: false,
  isLocked: false,
  selection: undefined,
};
const confirmed = {
  onboardingConfirmed: true,
  automaticallyConfirmedFromAdmissions: true,
  isLocked: true,
  selection: structure,
};
const manuallyConfirmed = { ...confirmed, automaticallyConfirmedFromAdmissions: false };
const optionalStructure = {
  ...structure,
  heads: [...structure.heads, { feeHeadId: 'trip', feeHeadName: 'Trip', isOptional: true }],
};
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
    success: vi.fn(),
  },
}));
vi.mock('src/components/shaking-text-field', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('src/components/custom-select', () => ({
  default: ({
    label,
    value,
    options,
    disabled,
    onChange,
    multiple,
  }: {
    label: string;
    value: string | string[];
    options: { value: string; label: string }[];
    disabled: boolean;
    onChange: (value: string | string[]) => void;
    multiple?: boolean;
  }) => (
    <select
      aria-label={label}
      value={value}
      disabled={disabled}
      multiple={multiple}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="" />
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));
vi.mock('../../admissions/fee-selection/admission-fee-collection-panel', () => ({
  default: ({
    onOpenChange,
    disabled,
  }: {
    onOpenChange: (open: boolean) => void;
    disabled: boolean;
  }) => (
    <button type="button" disabled={disabled} onClick={() => onOpenChange(true)}>
      Collect fees
    </button>
  ),
}));
vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useGetStudentOnboardingCaseQuery: () => ({
    currentData: {
      id: 'case-1',
      concurrencyStamp: 'cached-stamp',
      status: 0,
      applicationId: 'app-1',
    },
    refetch: mocks.refreshCase,
    isError: mocks.readingError,
    isFetching: false,
  }),
  useGetStudentOnboardingFeeStructureQuery: () => ({
    currentData: mocks.confirmed ? (mocks.automatic ? confirmed : manuallyConfirmed) : unconfirmed,
    isError: false,
    isFetching: false,
  }),
  useGetStudentOnboardingFeeCandidatesQuery: () => ({
    currentData: mocks.candidates ? [mocks.optional ? optionalStructure : structure] : [],
    isError: false,
    isFetching: false,
    isLoading: false,
  }),
  useConfirmStudentOnboardingFeeStructureMutation: () => [mocks.confirm, { isLoading: false }],
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.confirmed = false;
  mocks.automatic = false;
  mocks.candidates = true;
  mocks.failing = false;
  mocks.readingError = false;
  mocks.optional = false;
  mocks.refreshCase.mockReturnValue({
    unwrap: () => Promise.resolve({ concurrencyStamp: 'fresh-stamp', status: 0 }),
  });
  mocks.confirm.mockReturnValue({ unwrap: () => Promise.resolve({}) });
});

function setup(props: { disabled?: boolean; canManage?: boolean } = {}) {
  const editorRef = createRef<StudentOnboardingFeesHandle>();
  render(
    <StudentOnboardingFees
      caseId="case-1"
      canManage
      compact
      editorRef={editorRef}
      onStateChange={mocks.state}
      {...props}
    />
  );
  return editorRef;
}

it('saves the selected fee using a fresh case stamp from the parent footer', async () => {
  const ref = setup({ disabled: true });
  await waitFor(() => expect(screen.getByLabelText('Fee structure')).toHaveValue('structure-1'));
  expect(screen.queryByRole('button', { name: 'Confirm fee structure' })).not.toBeInTheDocument();
  await act(() => ref.current!.save());
  expect(mocks.refreshCase).toHaveBeenCalledOnce();
  expect(mocks.confirm).toHaveBeenCalledWith({
    id: 'case-1',
    concurrencyStamp: 'fresh-stamp',
    structureId: 'structure-1',
    optionalHeadIds: [],
  });
  expect(mocks.state).toHaveBeenLastCalledWith(
    expect.objectContaining({ dirty: false, busy: false })
  );
});

it('does not reconfirm a completed Admissions selection even without manage permission', async () => {
  mocks.confirmed = true;
  mocks.automatic = true;
  const ref = setup({ canManage: false });
  await act(() => ref.current!.save());
  expect(mocks.refreshCase).not.toHaveBeenCalled();
  expect(mocks.confirm).not.toHaveBeenCalled();
});

it('allows Save for Later with no selection but prevents activation submission', async () => {
  mocks.candidates = false;
  const ref = setup();
  await act(() => ref.current!.save({ allowIncomplete: true }));
  await act(async () => {
    await expect(ref.current!.save()).rejects.toThrow('Choose a published fee structure.');
  });
  expect(mocks.confirm).not.toHaveBeenCalled();
  expect(screen.getByText('Choose a published fee structure.')).toBeInTheDocument();
});

it('retains the draft and exposes server failure to the parent', async () => {
  mocks.confirm.mockReturnValue({
    unwrap: () =>
      Promise.reject(
        Object.assign(new Error('Structure changed.'), { data: { detail: 'Structure changed.' } })
      ),
  });
  const ref = setup();
  await waitFor(() => expect(screen.getByLabelText('Fee structure')).toHaveValue('structure-1'));
  await act(async () => {
    await expect(ref.current!.save()).rejects.toMatchObject({
      data: { detail: 'Structure changed.' },
    });
  });
  expect(screen.getByLabelText('Fee structure')).toHaveValue('structure-1');
  expect(screen.getByText('Structure changed.', { exact: false })).toBeVisible();
  expect(mocks.state).toHaveBeenLastCalledWith(
    expect.objectContaining({ dirty: true, busy: false })
  );
});

it('reports collection dialog busy and prevents a simultaneous confirmation', async () => {
  mocks.confirmed = true;
  const ref = setup();
  fireEvent.click(screen.getByRole('button', { name: 'Payments & Receipts' }));
  fireEvent.click(screen.getByRole('button', { name: 'Collect fees' }));
  expect(screen.getByRole('button', { name: 'Collect fees' })).toBeEnabled();
  expect(mocks.state).toHaveBeenLastCalledWith(expect.objectContaining({ busy: true }));
  await act(async () => {
    await expect(ref.current!.save()).rejects.toThrow('Wait for the current fee action');
  });
  expect(mocks.confirm).not.toHaveBeenCalled();
});

it('rejects fee confirmation when query refresh failed', async () => {
  mocks.readingError = true;
  const ref = setup();
  await act(async () => {
    await expect(ref.current!.save()).rejects.toThrow('Refresh fee structures before saving.');
  });
  expect(mocks.confirm).not.toHaveBeenCalled();
});

it('does not submit an unconfirmed structure without manage permission', async () => {
  const ref = setup({ canManage: false });
  await act(async () => {
    await expect(ref.current!.save()).rejects.toThrow('You do not have permission');
  });
  expect(mocks.confirm).not.toHaveBeenCalled();
});

it('guards repeated parent saves while the first confirmation is running', async () => {
  let finish!: () => void;
  mocks.confirm.mockReturnValue({
    unwrap: () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  });
  const ref = setup();
  await waitFor(() => expect(screen.getByLabelText('Fee structure')).toHaveValue('structure-1'));
  let first!: Promise<void>;
  await act(async () => {
    first = ref.current!.save();
  });
  await act(async () => {
    await expect(ref.current!.save()).rejects.toThrow('Wait for the current fee action');
  });
  await act(async () => {
    finish();
    await first;
  });
  expect(mocks.confirm).toHaveBeenCalledOnce();
});

it('collapses readonly fee details and payments while keeping the optional selection visible', async () => {
  mocks.optional = true;
  setup();
  await waitFor(() => expect(screen.getByLabelText('Fee structure')).toHaveValue('structure-1'));
  expect(screen.getByRole('button', { name: 'Fee Details' })).toHaveAttribute(
    'aria-expanded',
    'false'
  );
  expect(screen.getByText('Tuition')).not.toBeVisible();
  expect(screen.getByLabelText('Optional fee heads')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Fee Details' }));
  expect(screen.getByText('Tuition')).toBeVisible();
});

it('keeps the existing payment panel mounted but collapsed in compact mode', () => {
  mocks.confirmed = true;
  setup();
  expect(screen.getByRole('button', { name: 'Payments & Receipts' })).toHaveAttribute(
    'aria-expanded',
    'false'
  );
  expect(screen.getByText('Collect fees')).not.toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Payments & Receipts' }));
  expect(screen.getByRole('button', { name: 'Collect fees' })).toBeVisible();
});
