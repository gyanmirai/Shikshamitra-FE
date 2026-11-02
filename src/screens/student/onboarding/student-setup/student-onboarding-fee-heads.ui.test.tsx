import { createRef } from 'react';
import { vi, it, expect, beforeEach } from 'vitest';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import StudentOnboardingFees from './student-onboarding-fees';

import type { StudentOnboardingFeesHandle } from './student-onboarding-fees';

const mocks = vi.hoisted(() => ({
  confirm: vi.fn(),
  refresh: vi.fn(),
  locked: false,
  selected: false,
  missingSavedHead: false,
}));
const structure = {
  structureId: 'class-5',
  structureName: 'Class-5 Fee structure',
  revisionNumber: 1,
  heads: [
    { feeHeadId: 'tuition', feeHeadName: 'Tuition Fees', isOptional: false },
    { feeHeadId: 'admission', feeHeadName: 'Admission Fees', isOptional: false },
    { feeHeadId: 'transport', feeHeadName: 'General Transport Fees', isOptional: true },
    { feeHeadId: 'hostel', feeHeadName: 'Hostel Fees', isOptional: true },
  ],
};
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { error: vi.fn(), warning: vi.fn(), info: vi.fn(), success: vi.fn() },
}));
vi.mock('../../admissions/fee-selection/admission-fee-collection-panel', () => ({
  default: () => <div>Existing collection panel</div>,
}));
vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useGetStudentOnboardingCaseQuery: () => ({
    currentData: { status: 0, concurrencyStamp: 'cached' },
    refetch: mocks.refresh,
  }),
  useGetStudentOnboardingFeeStructureQuery: () => ({
    currentData: {
      onboardingConfirmed: false,
      isLocked: mocks.locked,
      selection: mocks.selected
        ? {
            ...structure,
            heads: mocks.missingSavedHead
              ? [
                  ...structure.heads,
                  {
                    feeHeadId: 'saved-optional',
                    feeHeadName: 'Saved optional fee',
                    isOptional: true,
                  },
                ]
              : structure.heads,
          }
        : undefined,
    },
  }),
  useGetStudentOnboardingFeeCandidatesQuery: () => ({
    currentData: [
      structure,
      { ...structure, structureId: 'alternative', structureName: 'Alternative' },
    ],
  }),
  useConfirmStudentOnboardingFeeStructureMutation: () => [mocks.confirm, { isLoading: false }],
}));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.locked = false;
  mocks.selected = false;
  mocks.missingSavedHead = false;
  mocks.refresh.mockReturnValue({
    unwrap: () => Promise.resolve({ status: 0, concurrencyStamp: 'fresh' }),
  });
  mocks.confirm.mockReturnValue({ unwrap: () => Promise.resolve({}) });
});

function setup(canManage = true) {
  const ref = createRef<StudentOnboardingFeesHandle>();
  render(<StudentOnboardingFees caseId="case-1" canManage={canManage} compact editorRef={ref} />);
  return ref;
}
function chooseStructure() {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Fee structure' }));
  fireEvent.click(screen.getByRole('option', { name: 'Class-5 Fee structure · Revision 1' }));
}

it('uses one grouped checkbox dropdown and saves only optional IDs with the fresh case stamp', async () => {
  const ref = setup();
  await act(() => ref.current!.save({ allowIncomplete: true }));
  expect(mocks.confirm).not.toHaveBeenCalled();
  chooseStructure();
  expect(screen.getAllByRole('combobox')).toHaveLength(1);
  expect(screen.getByText('Class-5 Fee structure · Revision 1')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Fee Details' })).not.toBeInTheDocument();
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Fee heads' }));
  expect(screen.getByText('Required fees')).toBeVisible();
  expect(screen.getByText('Optional fees')).toBeVisible();
  const tuition = screen.getByRole('option', { name: /Tuition Fees/ });
  expect(tuition).toHaveAttribute('aria-disabled', 'true');
  expect(tuition).toHaveAttribute('aria-selected', 'true');
  fireEvent.click(tuition);
  fireEvent.click(screen.getByRole('option', { name: 'General Transport Fees' }));
  expect(screen.getByRole('option', { name: 'General Transport Fees' })).toHaveAttribute(
    'aria-selected',
    'true'
  );
  fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
  await act(() => ref.current!.save());
  expect(mocks.confirm).toHaveBeenCalledWith({
    id: 'case-1',
    concurrencyStamp: 'fresh',
    structureId: 'class-5',
    optionalHeadIds: ['transport'],
  });
  expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
});

it('retains the draft when cancelling a structure change and resets optional heads only after selecting a new structure', async () => {
  const ref = setup();
  chooseStructure();
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Fee heads' }));
  fireEvent.click(screen.getByRole('option', { name: 'General Transport Fees' }));
  fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
  fireEvent.click(screen.getByRole('button', { name: 'Change fee structure' }));
  expect(screen.getAllByRole('combobox')).toHaveLength(1);
  expect(screen.queryByRole('combobox', { name: 'Fee heads' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Cancel fee structure change' }));
  expect(screen.getByRole('combobox', { name: 'Fee heads' })).toHaveTextContent(
    'General Transport Fees'
  );
  fireEvent.click(screen.getByRole('button', { name: 'Change fee structure' }));
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Fee structure' }));
  fireEvent.click(screen.getByRole('option', { name: 'Alternative · Revision 1' }));
  await act(() => ref.current!.save());
  expect(mocks.confirm).toHaveBeenCalledWith(
    expect.objectContaining({ structureId: 'alternative', optionalHeadIds: [] })
  );
});

it('keeps paid snapshots locked and confirmable without exposing a change action', async () => {
  mocks.selected = true;
  mocks.locked = true;
  const ref = setup();
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Fee heads' }));
  screen.getAllByRole('option').forEach((option) => {
    expect(option).toHaveAttribute('aria-disabled', 'true');
  });
  expect(screen.getByRole('option', { name: /General Transport Fees/ })).toHaveAttribute(
    'aria-selected',
    'true'
  );
  fireEvent.click(screen.getByRole('option', { name: /General Transport Fees/ }));
  fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
  expect(screen.queryByRole('button', { name: 'Change fee structure' })).not.toBeInTheDocument();
  await act(() => ref.current!.save());
  await waitFor(() => expect(mocks.confirm).toHaveBeenCalledOnce());
  expect(mocks.confirm).toHaveBeenCalledWith(
    expect.objectContaining({ structureId: 'class-5', optionalHeadIds: ['transport', 'hostel'] })
  );
});

it('allows a viewer to inspect all fee heads without enabling any selection changes', () => {
  mocks.selected = true;
  setup(false);
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Fee heads' }));
  screen.getAllByRole('option').forEach((option) => {
    expect(option).toHaveAttribute('aria-disabled', 'true');
  });
  expect(screen.getByRole('option', { name: /General Transport Fees/ })).toBeVisible();
  fireEvent.click(screen.getByRole('option', { name: /General Transport Fees/ }));
  expect(mocks.confirm).not.toHaveBeenCalled();
  expect(screen.queryByRole('button', { name: 'Change fee structure' })).not.toBeInTheDocument();
});

it('keeps optional checkbox edits after a failed confirmation and supports deselecting them', async () => {
  const ref = setup();
  chooseStructure();
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Fee heads' }));
  fireEvent.click(screen.getByRole('option', { name: 'General Transport Fees' }));
  fireEvent.click(screen.getByRole('option', { name: 'Hostel Fees' }));
  fireEvent.click(screen.getByRole('option', { name: 'General Transport Fees' }));
  fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
  mocks.confirm.mockReturnValue({
    unwrap: () => Promise.reject(new Error('Please refresh the case.')),
  });
  await act(async () => {
    await expect(ref.current!.save()).rejects.toThrow('Please refresh the case.');
  });
  expect(screen.getByRole('combobox', { name: 'Fee heads' })).toHaveTextContent('Hostel Fees');
  expect(screen.getByRole('combobox', { name: 'Fee heads' })).not.toHaveTextContent(
    'General Transport Fees'
  );
  expect(mocks.confirm).toHaveBeenCalledWith(
    expect.objectContaining({ optionalHeadIds: ['hostel'] })
  );
  expect(screen.getByText('Please refresh the case.')).toBeVisible();
});

it('does not silently discard a saved optional ID that is missing from the refreshed catalog', async () => {
  mocks.selected = true;
  mocks.missingSavedHead = true;
  const ref = setup();
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Fee heads' }));
  fireEvent.click(screen.getByRole('option', { name: 'General Transport Fees' }));
  fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
  await act(() => ref.current!.save());
  expect(mocks.confirm).toHaveBeenCalledWith(
    expect.objectContaining({ optionalHeadIds: ['hostel', 'saved-optional'] })
  );
});
