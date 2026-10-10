import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { studentOnboardingTestData } from './student-onboarding-test-fixtures';
import StudentOnboardingOperationDialog from './student-onboarding-operation-dialog';

const mocks = vi.hoisted(() => ({ gr: vi.fn(), roll: vi.fn(), place: vi.fn(), preview: vi.fn(), permissions: [{ name: 'Students.Onboarding.Add', isGranted: true }], seriesQuery: vi.fn() }));
vi.mock('react-redux', () => ({ useSelector: (select: (state: unknown) => unknown) => select({ auth: { permissions: mocks.permissions } }) }));
vi.mock('src/components/customDialog', () => ({ default: ({ open, title, children }: { open: boolean; title: string; children: React.ReactNode }) => open ? <div role="dialog"><h2>{title}</h2>{children}</div> : null, DialogScrollContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock('src/components/custom-select', () => ({ default: ({ label, value, options, onChange, disabled }: { label: string; value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void; disabled: boolean }) => <select aria-label={label} disabled={disabled} value={value} onChange={event => onChange(event.target.value)}><option value="">Select</option>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select> }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useGetStudentOnboardingPlacementOptionsQuery: () => ({ data: [{ id: 'division-b', name: 'B', availableSeats: 3, isFull: false }] }),
  useGetAvailableStudentIdentifierSeriesQuery: (...args: unknown[]) => { mocks.seriesQuery(...args); return { data: [{ id: 'series-1', name: 'GR', nextPreview: '1001' }] }; },
  useSetStudentOnboardingPlacementMutation: () => [mocks.place, { isLoading: false }],
  useAssignStudentOnboardingGrMutation: () => [mocks.gr, { isLoading: false }],
  useAssignStudentOnboardingRollMutation: () => [mocks.roll, { isLoading: false }],
  usePreviewStudentOnboardingRollMutation: () => [mocks.preview, { isLoading: false }],
}));
const student = { ...studentOnboardingTestData[0], id: 'case-1', source: 'onboarding-case' as const, divisionId: 'division-a', concurrencyStamp: 'stamp', rollAssignmentMode: 'automatic' as const, grNo: null, rollNo: null };
beforeEach(() => {
  vi.clearAllMocks();
  mocks.permissions = [{ name: 'Students.Onboarding.Add', isGranted: true }];
  mocks.gr.mockReturnValue({ unwrap: () => Promise.resolve() }); mocks.roll.mockReturnValue({ unwrap: () => Promise.resolve() }); mocks.place.mockReturnValue({ unwrap: () => Promise.resolve() });
  mocks.preview.mockReturnValue({ unwrap: () => Promise.resolve({ schoolAssignmentMode: 'automatic', rollAssignmentMode: 'automatic', proposedRollNumber: 1, concurrencyStamp: 'stamp' }) });
});
it('opens GR-only assignment and does not require Division or Roll', async () => {
  render(<StudentOnboardingOperationDialog assignmentType="gr-number" student={{ ...student, divisionId: null }} onClose={vi.fn()} />);
  expect(screen.getByRole('heading', { name: 'Assign GR Number' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Preview Roll number' })).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('GR series'), { target: { value: 'series-1' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(mocks.gr).toHaveBeenCalledWith({ id: 'case-1', concurrencyStamp: 'stamp', numberSeriesId: 'series-1', manualValue: undefined, reason: undefined }));
  expect(mocks.roll).not.toHaveBeenCalled();
});
it('opens Roll-only assignment, skips GR series and requires preview', async () => {
  render(<StudentOnboardingOperationDialog assignmentType="roll-number" student={student} onClose={vi.fn()} />);
  expect(screen.queryByLabelText('GR series')).not.toBeInTheDocument();
  expect(mocks.seriesQuery).toHaveBeenCalledWith('case-1', { skip: true });
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Preview Roll number' }));
  await screen.findByText('Proposed Roll number: 1');
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(mocks.roll).toHaveBeenCalledWith({ id: 'case-1', concurrencyStamp: 'stamp', rollNumber: 1, rollAssignmentMode: 'automatic', reason: undefined }));
  expect(mocks.gr).not.toHaveBeenCalled();
});
it('requires a reason only for correcting an assigned GR', async () => {
  render(<StudentOnboardingOperationDialog assignmentType="gr-number" student={{ ...student, grNo: '1000' }} onClose={vi.fn()} />);
  fireEvent.change(screen.getByLabelText('GR series'), { target: { value: 'series-1' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await screen.findByText('Enter a reason for changing the number.');
  expect(mocks.gr).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText(/Change reason/), { target: { value: 'Correct registration entry' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(mocks.gr).toHaveBeenCalledWith(expect.objectContaining({ reason: 'Correct registration entry' })));
});
it('blocks changes to a locked GR but permits first assignment for a new student', () => {
  const view = render(<StudentOnboardingOperationDialog assignmentType="gr-number" student={{ ...student, grNumberLocked: true, grNo: '1001' }} onClose={vi.fn()} />);
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  view.rerender(<StudentOnboardingOperationDialog assignmentType="gr-number" student={{ ...student, grNumberLocked: true, grNo: null }} onClose={vi.fn()} />);
  expect(screen.getByRole('button', { name: 'Submit' })).not.toBeDisabled();
});
it('does not allow Roll preview without Division', () => {
  render(<StudentOnboardingOperationDialog assignmentType="roll-number" student={{ ...student, divisionId: null }} onClose={vi.fn()} />);
  expect(screen.getByRole('button', { name: 'Preview Roll number' })).toBeDisabled();
});
it('automatically prepares the next Roll for a new student in a locked Division despite a manual rule', async () => {
  render(<StudentOnboardingOperationDialog assignmentType="roll-number" student={{ ...student, rollAssignmentMode: 'manual', rollNumberLocked: true, rollNo: null }} onClose={vi.fn()} />);
  expect(screen.queryByLabelText(/Roll number/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Preview Roll number' }));
  await waitFor(() => expect(mocks.preview).toHaveBeenCalledWith({ id: 'case-1', rollAssignmentMode: 'automatic', rollNumber: undefined, reason: undefined }));
  await screen.findByText('Proposed Roll number: 1');
});
it('rejects a stale Roll preview', async () => {
  mocks.preview.mockReturnValue({ unwrap: () => Promise.resolve({ schoolAssignmentMode: 'automatic', proposedRollNumber: 1, concurrencyStamp: 'changed' }) });
  render(<StudentOnboardingOperationDialog assignmentType="roll-number" student={student} onClose={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Preview Roll number' }));
  await screen.findByText('The case or numbering rule changed. Refresh and preview again.');
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
});
it('explains a duplicate manual Roll and permits an unused number after retry', async () => {
  const onClose = vi.fn();
  mocks.preview.mockReturnValueOnce({ unwrap: () => Promise.reject(Object.assign(new Error('Duplicate Roll number'), { status: 400, data: {
    errorCode: 'Students.Onboarding.RollNumberDuplicate', detail: 'One or more business rules were violated.',
  } })) });
  mocks.preview.mockReturnValue({ unwrap: () => Promise.resolve({ schoolAssignmentMode: 'manual', rollAssignmentMode: 'manual', proposedRollNumber: 6, concurrencyStamp: 'stamp' }) });
  render(<StudentOnboardingOperationDialog assignmentType="roll-number" student={{ ...student, rollAssignmentMode: 'manual' }} onClose={onClose} />);
  const rollInput = screen.getByRole('spinbutton', { name: /Roll number/ });
  fireEvent.change(rollInput, { target: { value: '1' } });
  fireEvent.click(screen.getByRole('button', { name: 'Preview Roll number' }));
  await screen.findByText('This roll number is already assigned or reserved in the selected class/division for this academic year. Enter an unused number, or use Automatic if available.');
  expect(rollInput).toHaveValue(1);
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  expect(onClose).not.toHaveBeenCalled();
  expect(mocks.roll).not.toHaveBeenCalled();
  fireEvent.change(rollInput, { target: { value: '6' } });
  fireEvent.click(screen.getByRole('button', { name: 'Preview Roll number' }));
  await screen.findByText('Proposed Roll number: 6');
  expect(screen.queryByText(/This roll number is already assigned/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(mocks.roll).toHaveBeenCalledWith({ id: 'case-1', concurrencyStamp: 'stamp', rollNumber: 6, rollAssignmentMode: 'manual', reason: undefined }));
});
it('keeps assignment disabled for a viewer', () => {
  mocks.permissions = [];
  render(<StudentOnboardingOperationDialog assignmentType="gr-number" student={student} onClose={vi.fn()} />);
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
});
