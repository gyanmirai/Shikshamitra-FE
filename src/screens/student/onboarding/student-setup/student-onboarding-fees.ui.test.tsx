import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import StudentOnboardingFees from './student-onboarding-fees';

vi.mock('../../admissions/fee-selection/admission-fee-collection-panel', async () => {
  const { useState } = await import('react');
  return {
    default: function MockAdmissionFeeCollectionPanel({
      applicationId,
      disabled,
    }: {
      applicationId: string;
      disabled: boolean;
    }) {
      const [receiptOpen, setReceiptOpen] = useState(false);
      return (
        <section
          aria-label="Embedded fee collection"
          data-application={applicationId}
          data-disabled={String(disabled)}
        >
          <button type="button" onClick={() => setReceiptOpen(true)}>
            Show saved receipt
          </button>
          {receiptOpen && <span>Saved receipt preview</span>}
        </section>
      );
    },
  };
});

const mocks = vi.hoisted(() => ({
  confirm: vi.fn(),
  refetch: vi.fn(),
  candidatesRefetch: vi.fn(),
  candidatesQuery: vi.fn(),
  error: false,
  currentDataAvailable: true,
  enrolled: false,
  selected: false,
  locked: false,
  deferral: null as null | {
    stageId: string;
    reason: string;
    deferredAt: string;
    deferredBy: string;
  },
  currentCandidatesAvailable: true,
  candidates: [
    {
      structureId: 'fee-1',
      structureName: 'CBSE English Class 1',
      revisionNumber: 1,
      heads: [{ feeHeadId: 'tuition', feeHeadName: 'Tuition', isOptional: false }],
    },
  ],
}));
vi.mock('src/components/custom-select', () => ({
  default: ({
    label,
    value,
    options,
    onChange,
    disabled,
  }: {
    label: string;
    value: string;
    options: Array<{ value: string; label: string }>;
    onChange: (value: string) => void;
    disabled: boolean;
  }) => (
    <select
      aria-label={label}
      disabled={disabled}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">Select</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useGetStudentOnboardingCaseQuery: () => ({
    currentData: mocks.currentDataAvailable
      ? {
          applicationId: 'application-1',
          concurrencyStamp: 'case-stamp',
          status: 1,
          studentEnrollmentId: mocks.enrolled ? 'enrollment' : null,
        }
      : undefined,
    isError: mocks.error,
    refetch: mocks.refetch,
  }),
  useGetStudentOnboardingFeeStructureQuery: () => ({
    currentData: mocks.currentDataAvailable
      ? {
          selection: mocks.selected ? mocks.candidates[0] : null,
          onboardingConfirmed: false,
          isLocked: mocks.locked,
          feeCollectionDeferral: mocks.deferral,
        }
      : undefined,
    isError: mocks.error,
    refetch: mocks.refetch,
  }),
  useGetStudentOnboardingFeeCandidatesQuery: (caseId: string, options: { skip: boolean }) => {
    mocks.candidatesQuery(caseId, options);
    return {
      currentData: mocks.currentCandidatesAvailable ? mocks.candidates : [],
      isError: mocks.error,
      refetch: mocks.candidatesRefetch,
    };
  },
  useConfirmStudentOnboardingFeeStructureMutation: () => [mocks.confirm, { isLoading: false }],
}));
beforeEach(() => {
  mocks.confirm.mockReset();
  mocks.refetch.mockReset();
  mocks.candidatesRefetch.mockReset();
  mocks.candidatesQuery.mockReset();
  mocks.confirm.mockReturnValue({ unwrap: () => Promise.resolve() });
  mocks.error = false;
  mocks.currentDataAvailable = true;
  mocks.enrolled = false;
  mocks.selected = false;
  mocks.locked = false;
  mocks.deferral = null;
  mocks.currentCandidatesAvailable = true;
});
it('confirms an existing fee structure through Onboarding without payment controls', async () => {
  render(<StudentOnboardingFees caseId="case-1" canManage />);
  await waitFor(() => expect(screen.getByLabelText('Fee structure')).toHaveValue('fee-1'));
  expect(screen.queryByText(/collect|installment|payment/i)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm fee structure' }));
  await waitFor(() =>
    expect(mocks.confirm).toHaveBeenCalledWith({
      id: 'case-1',
      concurrencyStamp: 'case-stamp',
      structureId: 'fee-1',
      optionalHeadIds: [],
    })
  );
});
it('keeps fee confirmation unavailable to viewers', () => {
  render(<StudentOnboardingFees caseId="case-1" canManage={false} />);
  expect(screen.getByRole('button', { name: 'Confirm fee structure' })).toBeDisabled();
});

it('shows the audited collect-later reason without assigning or collecting a fee on view', () => {
  mocks.deferral = {
    stageId: 'payment-stage',
    reason: 'Parent will pay during Onboarding.',
    deferredAt: '2026-10-14T06:00:00Z',
    deferredBy: 'counsellor-1',
  };
  render(<StudentOnboardingFees caseId="case-1" canManage />);
  expect(screen.getByText('Collection deferred from Admissions')).toBeInTheDocument();
  expect(screen.getByText(mocks.deferral.reason)).toBeInTheDocument();
  expect(screen.queryByLabelText('Embedded fee collection')).not.toBeInTheDocument();
  expect(mocks.confirm).not.toHaveBeenCalled();
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
  expect(mocks.refetch).toHaveBeenCalledTimes(2);
  expect(mocks.candidatesRefetch).toHaveBeenCalledTimes(1);
});

it('keeps the mounted receipt preview and saved snapshot when a post-payment context refresh fails', () => {
  mocks.selected = true;
  mocks.locked = true;
  const view = render(<StudentOnboardingFees caseId="case-1" canManage />);
  fireEvent.click(screen.getByRole('button', { name: 'Show saved receipt' }));
  const collection = screen.getByLabelText('Embedded fee collection');
  mocks.error = true;
  view.rerender(<StudentOnboardingFees caseId="case-1" canManage />);
  expect(screen.getByText('Saved receipt preview')).toBeInTheDocument();
  expect(screen.getByLabelText('Embedded fee collection')).toBe(collection);
  expect(collection).toHaveAttribute('data-disabled', 'true');
  expect(screen.getByText(/Fee structures could not be refreshed/)).toBeInTheDocument();
  expect(screen.getByLabelText('Fee structure')).toHaveValue('fee-1');
  expect(screen.getByRole('button', { name: 'Confirm fee structure' })).toBeDisabled();
  fireEvent.submit(screen.getByRole('button', { name: 'Confirm fee structure' }).closest('form')!);
  expect(mocks.confirm).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(mocks.refetch).toHaveBeenCalledTimes(2);
  expect(mocks.candidatesRefetch).not.toHaveBeenCalled();
  expect(mocks.candidatesQuery).toHaveBeenLastCalledWith('case-1', { skip: true });
  mocks.error = false;
  view.rerender(<StudentOnboardingFees caseId="case-1" canManage />);
  expect(screen.getByText('Saved receipt preview')).toBeInTheDocument();
  expect(collection).toHaveAttribute('data-disabled', 'false');
});

it('shows the blocking initial error without mounting collection when there is no current-case data', () => {
  mocks.selected = true;
  mocks.error = true;
  mocks.currentDataAvailable = false;
  render(<StudentOnboardingFees caseId="case-1" canManage />);
  expect(screen.getByText('Fee structures could not be loaded.')).toBeInTheDocument();
  expect(screen.queryByLabelText('Embedded fee collection')).not.toBeInTheDocument();
});

it('shares the same application collection context after confirmation, including activated students', () => {
  mocks.selected = true;
  mocks.enrolled = true;
  render(<StudentOnboardingFees caseId="case-1" canManage />);
  expect(screen.getByRole('button', { name: 'Confirm fee structure' })).toBeDisabled();
  expect(screen.getByLabelText('Embedded fee collection')).toHaveAttribute(
    'data-application',
    'application-1'
  );
  expect(screen.getByLabelText('Embedded fee collection')).toHaveAttribute(
    'data-disabled',
    'false'
  );
});

it('locks paid fee selection fields while allowing the identical snapshot to be confirmed for Onboarding', async () => {
  mocks.selected = true;
  mocks.locked = true;
  render(<StudentOnboardingFees caseId="case-1" canManage />);
  expect(screen.getByLabelText('Fee structure')).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Confirm fee structure' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm fee structure' }));
  await waitFor(() =>
    expect(mocks.confirm).toHaveBeenCalledWith({
      id: 'case-1',
      concurrencyStamp: 'case-stamp',
      structureId: 'fee-1',
      optionalHeadIds: [],
    })
  );
});

it('confirms the historical paid snapshot when the current Finance catalog no longer lists it', async () => {
  mocks.selected = true;
  mocks.locked = true;
  mocks.currentCandidatesAvailable = false;
  render(<StudentOnboardingFees caseId="case-1" canManage />);
  expect(screen.getByLabelText('Fee structure')).toHaveValue('fee-1');
  expect(screen.getByLabelText('Fee structure')).toBeDisabled();
  expect(screen.getByText('Tuition')).toBeInTheDocument();
  expect(screen.queryByText(/No published fee structure/)).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Confirm fee structure' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm fee structure' }));
  await waitFor(() =>
    expect(mocks.confirm).toHaveBeenCalledWith({
      id: 'case-1',
      concurrencyStamp: 'case-stamp',
      structureId: 'fee-1',
      optionalHeadIds: [],
    })
  );
});
