import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import SchoolExitDrawer from './school-exit-drawer';
const state = vi.hoisted(() => ({ summary: null as any, transition: null as any, submit: vi.fn(), preview: vi.fn(), decide: vi.fn(), permissions: [{ name: 'Students.Records.Transitions.View', isGranted: true }, { name: 'Students.Records.Transitions.Add', isGranted: true }], error: false }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('react-redux', () => ({ useSelector: (fn: any) => fn({ auth: { permissions: state.permissions }, globalState: { currentYear: { id: 'year' } } }) }));
vi.mock('src/redux/student/records/student-record-transitions-api', () => ({
 useGetSchoolExitSummaryQuery: () => ({ currentData: state.summary, isFetching: false, isError: state.error, refetch: vi.fn() }),
 useGetStudentRecordTransitionQuery: () => ({ currentData: state.transition, isFetching: false, refetch: vi.fn() }),
 usePreviewStudentRecordTransitionsMutation: () => [state.preview, { isLoading: false }],
 useSubmitStudentRecordTransitionsMutation: () => [state.submit, { isLoading: false }],
 useDecideStudentRecordTransitionMutation: () => [state.decide, { isLoading: false }],
}));
vi.mock('../onboarding/student-setup/student-assignment-drawer', () => ({ default: ({ children, actions }: any) => <div>{children}{actions}</div> }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/custom-tooltip/info-tooltip-icon', () => ({ InfoTooltipIcon: () => null }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
const props = { studentId: 'student', academicYearId: 'year', onClose: vi.fn() };
describe('School Exit drawer', () => {
 beforeEach(() => {
  vi.clearAllMocks(); state.transition = null; state.error = false; state.permissions = [{ name: 'Students.Records.Transitions.View', isGranted: true }, { name: 'Students.Records.Transitions.Add', isGranted: true }];
  state.summary = { studentName: 'Aarav Shah', canSubmit: true, studentConcurrencyStamp: 's', enrollmentConcurrencyStamp: 'e', fees: { status: 'Pending', detail: 'Outstanding dues', outstandingAmount: 5000 }, library: { status: 'Pending', detail: 'Two borrowed books', pendingCount: 2 }, documents: { status: 'NotApplicable', detail: 'No uploaded documents', items: [] }, pendingTransitions: [] };
 });
 it('shows owner balances and document evidence without invented completion or return claims', () => {
  render(<SchoolExitDrawer {...props} />);
  expect(screen.getByText(/5,000/)).toBeTruthy();
  expect(screen.getByText('2 books pending')).toBeTruthy();
  expect(screen.queryByText(/originals returned|complete/i)).toBeNull();
  expect(screen.queryByRole('button', { name: 'Approve Exit' })).toBeNull();
 });
 it('does not submit without a reason', async () => {
  render(<SchoolExitDrawer {...props} />);
  fireEvent.click(screen.getByRole('button', { name: 'Submit for Approval' }));
  await waitFor(() => expect(screen.getByText('Enter a reason.')).toBeTruthy());
  expect(state.preview).not.toHaveBeenCalled();
 });
 it('requires an independent reviewer reason for outstanding items', async () => {
  state.transition = { id: 't', academicYearId: 'year', studentId: 'student', outcome: 'Withdraw', status: 'PendingApproval', effectiveDate: '2026-10-28T00:00:00Z', reason: 'Family relocating', canApprove: true, concurrencyStamp: 't1', outstandingOverrideRequired: true, outstandingItems: [{ code: 'fees', message: 'Fees pending' }] };
  render(<SchoolExitDrawer {...props} transition={state.transition} />);
  fireEvent.click(screen.getByRole('button', { name: 'Approve Exit' }));
  await waitFor(() => expect(screen.getByText('Enter an approval reason for pending fees or books.')).toBeTruthy());
  expect(state.decide).not.toHaveBeenCalled();
 });
 it('keeps date editable when cleared and validates without crashing', async () => {
  render(<SchoolExitDrawer {...props} />);
  fireEvent.change(screen.getByLabelText(/Leaving date/), { target: { value: '' } });
  expect(screen.getByLabelText(/Leaving date/)).not.toBeDisabled();
  fireEvent.blur(screen.getByLabelText(/Leaving date/));
  await waitFor(() => expect(screen.getByText('Choose a leaving date.')).toBeTruthy());
 });
 it('blocks a cached summary after refresh fails', () => {
  state.error = true; render(<SchoolExitDrawer {...props} studentName="Private name" grNumber="GR-secret" className="Class secret" />);
  expect(screen.queryByText(/Private name|GR-secret|Class secret/)).toBeNull();
  expect(screen.getByRole('button', { name: 'Submit for Approval' })).toBeDisabled();
 });
 it('removes mutation authority when grants are revoked', () => {
  state.permissions = []; render(<SchoolExitDrawer {...props} studentName="Private name" grNumber="GR-secret" className="Class secret" />);
  expect(screen.queryByText(/Private name|GR-secret|Class secret/)).toBeNull();
  expect(screen.getByRole('button', { name: 'Submit for Approval' })).toBeDisabled();
  expect(screen.queryByText('Aarav Shah')).toBeNull();
 });
 it('retries an uncertain submission with exactly the same payload and key', async () => {
  state.preview.mockReturnValue({ unwrap: async () => ({ canSubmit: true, items: [{ ready: true, issues: [], studentConcurrencyStamp: 's2', enrollmentConcurrencyStamp: 'e2' }] }) });
  state.submit.mockReturnValueOnce({ unwrap: async () => { throw new Error('network'); } }).mockReturnValueOnce({ unwrap: async () => ({ items: [{ id: 'created' }], exceptions: [] }) });
  render(<SchoolExitDrawer {...props} />);
  fireEvent.change(screen.getByLabelText(/^Reason/), { target: { value: 'Family relocating' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit for Approval' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Retry Submission' })).not.toBeDisabled());
  expect(screen.getByLabelText(/^Reason/)).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Retry Submission' }));
  await waitFor(() => expect(state.submit).toHaveBeenCalledTimes(2));
  expect(state.submit.mock.calls[1][0]).toEqual(state.submit.mock.calls[0][0]);
  expect(state.preview).toHaveBeenCalledTimes(1);
 });
 it('shows a required reason when rejecting a clear exit', async () => {
  state.summary.fees = { status: 'Clear', detail: 'No fees pending', outstandingAmount: 0 };
  state.summary.library = { status: 'Clear', detail: 'No books pending', pendingCount: 0 };
  state.transition = { id: 't', outcome: 'Withdraw', status: 'Submitted', effectiveDate: '2026-10-28T00:00:00Z', reason: 'Moving', canApprove: true };
  render(<SchoolExitDrawer {...props} transition={state.transition} />);
  fireEvent.click(screen.getByRole('button', { name: 'Reject' }));
  await waitFor(() => expect(screen.getByRole('textbox', { name: /Approval reason/ })).toHaveAttribute('aria-invalid', 'true'));
  expect(state.decide).not.toHaveBeenCalled();
 });
 it('does not present unavailable fees as zero or cleared', () => {
  state.summary.fees = { status: 'Unavailable', detail: 'Finance unavailable', outstandingAmount: null };
  render(<SchoolExitDrawer {...props} />);
  expect(screen.getByText('Unavailable')).toBeTruthy();
  expect(screen.queryByText(/₹0|cleared/i)).toBeNull();
 });
});
