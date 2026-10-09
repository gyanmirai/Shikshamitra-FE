import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import StudentOnboardingFees from './student-onboarding-fees';

const mocks = vi.hoisted(() => ({ confirm: vi.fn(), refetch: vi.fn(), error: false, enrolled: false, candidates: [{ structureId: 'fee-1', structureName: 'CBSE English Class 1', revisionNumber: 1, heads: [{ feeHeadId: 'tuition', feeHeadName: 'Tuition', isOptional: false }] }] }));
vi.mock('src/components/custom-select', () => ({ default: ({ label, value, options, onChange, disabled }: { label: string; value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void; disabled: boolean }) => <select aria-label={label} disabled={disabled} value={value} onChange={event => onChange(event.target.value)}><option value="">Select</option>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select> }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useGetStudentOnboardingCaseQuery: () => ({ data: { concurrencyStamp: 'case-stamp', status: 1, studentEnrollmentId: mocks.enrolled ? 'enrollment' : null }, isError: mocks.error, refetch: mocks.refetch }),
  useGetStudentOnboardingFeeStructureQuery: () => ({ data: { selection: null, onboardingConfirmed: false }, isError: mocks.error, refetch: mocks.refetch }),
  useGetStudentOnboardingFeeCandidatesQuery: () => ({ data: mocks.candidates, isError: mocks.error, refetch: mocks.refetch }),
  useConfirmStudentOnboardingFeeStructureMutation: () => [mocks.confirm, { isLoading: false }],
}));
beforeEach(() => { mocks.confirm.mockReset(); mocks.confirm.mockReturnValue({ unwrap: () => Promise.resolve() }); mocks.error = false; mocks.enrolled = false; });
it('confirms an existing fee structure through Onboarding without payment controls', async () => {
  render(<StudentOnboardingFees caseId="case-1" canManage />);
  await waitFor(() => expect(screen.getByLabelText('Fee structure')).toHaveValue('fee-1'));
  expect(screen.queryByText(/collect|installment|payment/i)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm fee structure' }));
  await waitFor(() => expect(mocks.confirm).toHaveBeenCalledWith({ id: 'case-1', concurrencyStamp: 'case-stamp', structureId: 'fee-1', optionalHeadIds: [] }));
});
it('keeps fee confirmation unavailable to viewers', () => {
  render(<StudentOnboardingFees caseId="case-1" canManage={false} />);
  expect(screen.getByRole('button', { name: 'Confirm fee structure' })).toBeDisabled();
});
it('keeps activated fee snapshots read-only', () => {
  mocks.enrolled = true;
  render(<StudentOnboardingFees caseId="case-1" canManage />);
  expect(screen.getByRole('button', { name: 'Confirm fee structure' })).toBeDisabled();
});
it('offers retry when fee structure reads fail', () => {
  mocks.error = true;
  render(<StudentOnboardingFees caseId="case-1" canManage />);
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(mocks.refetch).toHaveBeenCalledTimes(3);
});
