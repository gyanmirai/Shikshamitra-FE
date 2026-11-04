import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { financePermissions } from 'src/constants/finance-menu';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';
import { ConcessionRequestStatusEnum } from 'src/redux/finance/ConcessionManagement/types';

import ConcessionRequestDetails from './ConcessionRequestDetails';

const api = vi.hoisted(() => ({ detail: {} as any, context: {} as any, retry: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/redux/finance/ConcessionManagement/concessionManagementApi', () => ({
  useGetConcessionRequestByIdQuery: () => api.detail,
  useGetConcessionApprovalContextQuery: () => api.context,
}));
vi.mock('src/components/preview-document/DocumentPreviewDialog', () => ({
  default: ({ open, documentName, url }: any) =>
    open ? (
      <div role="dialog" aria-label={documentName}>
        {url}
      </div>
    ) : null,
}));

const request = {
  concessionRequestId: 'request',
  studentId: 'student',
  studentName: 'Aanya Example',
  academicYearId: 'year',
  concessionTypeId: 'type',
  concessionTypeName: 'Sibling concession',
  studentFeeStructureId: 'assignment',
  concessionPolicyId: 'policy',
  concessionPolicyVersionId: 'version',
  concessionPolicyName: 'Tuition support',
  concessionPolicyCode: 'SUPPORT',
  concessionPolicyVersion: 2,
  status: ConcessionRequestStatusEnum.APPROVED,
  statusName: 'Approved',
  concurrencyStamp: 'stamp',
  totalRequestedConcessionAmount: 14500,
  totalApprovedConcessionAmount: 14500,
  totalReversedConcessionAmount: 0,
  netApprovedConcessionAmount: 14500,
  autoCreateRefund: false,
  paidConcessionAmount: 0,
  canCreateRefundRequests: false,
  boardId: 'board',
  educationMediumId: 'medium',
  standardId: 'class',
  divisionId: 'division',
  feeHeadConcessions: [
    {
      feeHeadId: 'tuition',
      feeHeadName: 'Tuition',
      annualBaseAmount: 40000,
      basedOn: 1,
      amount: 25,
      discountAmount: 10000,
      netAmount: 30000,
    },
    {
      feeHeadId: 'transport',
      feeHeadName: 'Transport',
      annualBaseAmount: 9000,
      basedOn: 0,
      amount: 4500,
      discountAmount: 4500,
      netAmount: 4500,
    },
  ],
  requiredDocuments: [
    {
      documentId: 'doc',
      documentName: 'Sibling proof',
      isRequired: true,
      maxFileSizeBytes: 10000,
      acceptedFormats: [],
      isUploaded: true,
      url: '/proof.pdf',
    },
  ],
  submittedDocuments: [
    { documentId: 'doc', documentName: 'Sibling proof', url: '/proof.pdf', status: 1 },
  ],
  documentSubmissionState: 'Complete',
  missingDocumentIds: [],
  createdAt: '2026-11-03T08:00:00Z',
  availableActions: ['view'],
  remarks: 'Sibling discount requested',
  timeline: [
    {
      action: 'approved',
      status: 1,
      occurredAt: '2026-11-03T08:01:00Z',
      reason: 'Automatically approved on administrator submission.',
      amount: 14500,
    },
  ],
};
const line = (dueFeeId: string, applied: number, month: number, original: number) => ({
  dueFeeId,
  feeHeadId: 'tuition',
  feeHeadName: 'Tuition',
  month,
  year: 2026,
  installmentLabel: month === 11 ? 'November 2026' : 'December 2026',
  monthLabel: month === 11 ? 'November' : 'December',
  originalAmount: original,
  paidAmount: 0,
  concessionAmount: applied,
  adjustmentCreditAmount: 0,
  outstandingAmount: original - applied,
  eligibleConcessionAmount: 0,
  status: 'Pending',
  concurrencyStamp: 'due-stamp',
  isSelectable: true,
  maxConcessionAmount: original,
  suggestedConcessionAmount: 999,
  appliedConcessionAmount: applied,
  reversedConcessionAmount: 0,
  reversibleConcessionAmount: applied,
});
const context = {
  concessionRequestId: 'request',
  studentId: 'student',
  concessionPolicyName: 'Tuition support',
  concessionPolicyCode: 'SUPPORT',
  concessionPolicyVersion: 2,
  requestConcurrencyStamp: 'stamp',
  totalRequestedConcessionAmount: 14500,
  totalLiveMaximumConcessionAmount: 14500,
  hasChangedSinceSubmission: false,
  previewFingerprint: 'fingerprint',
  feeHeadGroups: [
    {
      feeHeadId: 'tuition',
      feeHeadName: 'Tuition',
      requestedConcessionAmount: 10000,
      liveMaximumConcessionAmount: 40000,
      suggestedConcessionAmount: 999,
      hasChangedSinceSubmission: false,
      dueFeeLines: [line('nov', 5000, 11, 20000), line('dec', 5000, 12, 20000)],
    },
    {
      feeHeadId: 'transport',
      feeHeadName: 'Transport',
      requestedConcessionAmount: 4500,
      liveMaximumConcessionAmount: 9000,
      suggestedConcessionAmount: 999,
      hasChangedSinceSubmission: false,
      dueFeeLines: [{ ...line('bus', 4500, 11, 9000), feeHeadId: 'transport' }],
    },
  ],
};
const selected = {
  studentConcessionTypeRequestId: 'request',
  concessionTypeName: 'Sibling concession',
} as any;
const student = {
  studentId: 'student',
  name: 'Aanya Example',
  grNumber: '10260',
  rollNo: '2',
  standardName: 'Class 1',
  divisionName: 'A',
};
function show(canViewDocuments = true) {
  const store = configureStore({
    reducer: {
      confirmPopup: () => ({ isChanges: false }),
      auth: () => ({
        permissions: [
          { name: financePermissions.fees.concessionActions.view, isGranted: true },
          ...(canViewDocuments
            ? [{ name: financePermissions.fees.concessionActions.viewDocument, isGranted: true }]
            : []),
        ],
      }),
    },
  });
  return render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <ConcessionRequestDetails
          open
          onClose={vi.fn()}
          item={selected}
          student={student}
          academicYear="2026-2027"
        />
      </ThemeProvider>
    </Provider>
  );
}
beforeEach(() => {
  api.detail = {
    currentData: { success: true, data: structuredClone(request) },
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: api.retry,
  };
  api.context = {
    currentData: structuredClone(context),
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: api.retry,
  };
  api.retry.mockClear();
});
describe('concession request detail drawer', () => {
  it('combines student name and GR number, includes roll number and omits activity', () => {
    show();
    expect(screen.getByText('Aanya Example (10260)')).toBeInTheDocument();
    expect(screen.getByText('Roll number')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.queryByText('GR number')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Remarks & Activity' })).not.toBeInTheDocument();
  });
  it('collapses each fee head independently while keeping its subtotal visible', async () => {
    show();
    const toggle = screen.getByRole('button', { name: 'Tuition fee breakdown' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() =>
      expect(
        screen.queryByRole('table', { name: 'Tuition instalments table' })
      ).not.toBeInTheDocument()
    );
    expect(
      within(screen.getByRole('region', { name: 'Tuition breakdown' })).getByText(/10,000/)
    ).toBeVisible();
    expect(screen.getByRole('table', { name: 'Transport instalments table' })).toBeVisible();
    fireEvent.click(toggle);
    expect(await screen.findByRole('table', { name: 'Tuition instalments table' })).toBeVisible();
  });
  it('keeps saved instalment percentage inputs distinct from rupee concessions', () => {
    api.detail.currentData.data.status = ConcessionRequestStatusEnum.PENDING;
    api.detail.currentData.data.feeHeadConcessions[0].amount = 0;
    api.detail.currentData.data.dueFeeConcessions = [
      { dueFeeId: 'nov', feeHeadId: 'tuition', amount: 25 },
      { dueFeeId: 'dec', feeHeadId: 'tuition', amount: 25 },
    ];
    api.context.currentData.feeHeadGroups[0].dueFeeLines.forEach((row: any) => {
      row.suggestedConcessionAmount = 5000;
    });
    show();
    const tuition = screen.getByRole('region', { name: 'Tuition breakdown' });
    expect(within(tuition).getAllByText(/5,000/)).toHaveLength(2);
    expect(within(tuition).getAllByText('25%')).toHaveLength(2);
    expect(within(tuition).queryByText('0%')).not.toBeInTheDocument();
    expect(within(tuition).queryByText(/^₹\s*25$/)).not.toBeInTheDocument();
  });
  it('shows saved allocations grouped by fee head, never live suggestions as applied amounts', () => {
    show();
    const tuition = screen.getByRole('region', { name: 'Tuition breakdown' });
    expect(within(tuition).getByText('November 2026')).toBeInTheDocument();
    expect(within(tuition).getByText('December 2026')).toBeInTheDocument();
    expect(within(tuition).getAllByText(/5,000/)).toHaveLength(2);
    expect(within(tuition).getByText(/10,000/)).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.queryByText(/999/)).not.toBeInTheDocument();
    expect(screen.getByText('Tuition support')).toBeInTheDocument();
    expect(screen.getByText('2026-2027')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close Sibling concession' })).toBeEnabled();
  });
  it('keeps fully reversed zero allocations visible', () => {
    api.detail.currentData.data = {
      ...request,
      status: 5,
      statusName: 'Reversed',
      totalReversedConcessionAmount: 14500,
      netApprovedConcessionAmount: 0,
    };
    api.context.currentData.feeHeadGroups.forEach((group: any) =>
      group.dueFeeLines.forEach((row: any) => {
        row.reversedConcessionAmount = row.appliedConcessionAmount;
        row.reversibleConcessionAmount = 0;
      })
    );
    show();
    const tuition = screen.getByRole('region', { name: 'Tuition breakdown' });
    expect(within(tuition).getByText('Net concession')).toBeInTheDocument();
    expect(within(tuition).getAllByText(/^₹\s*0$/).length).toBeGreaterThan(0);
    expect(within(tuition).getByText('November 2026')).toBeInTheDocument();
  });
  it('labels pending suggestions as proposed and explains changed balances', () => {
    api.detail.currentData.data = {
      ...request,
      status: 0,
      statusName: 'Pending',
      totalApprovedConcessionAmount: 0,
    };
    api.context.currentData.hasChangedSinceSubmission = true;
    show();
    expect(screen.getAllByText('Proposed concession').length).toBeGreaterThan(0);
    expect(
      within(screen.getByRole('region', { name: 'Tuition breakdown' })).getByText(/1,998/)
    ).toBeInTheDocument();
    expect(screen.queryByText('Concession applied')).not.toBeInTheDocument();
    expect(screen.getByText(/changed since submission/i)).toBeInTheDocument();
  });
  it('does not imply a rejected request was applied or allocate a missing installment', () => {
    api.detail.currentData.data = {
      ...request,
      status: 2,
      statusName: 'Rejected',
      totalApprovedConcessionAmount: 0,
    };
    api.context.currentData.feeHeadGroups.forEach((group: any) => {
      group.dueFeeLines = [];
    });
    show();
    expect(screen.getByText(/No concession was applied/i)).toBeInTheDocument();
    expect(screen.queryByText('Concession applied')).not.toBeInTheDocument();
    expect(screen.getByText('Tuition')).toBeInTheDocument();
  });
  it('shows retry instead of a fabricated fee breakdown after a context error', () => {
    api.context = { isError: true, isLoading: false, isFetching: false, refetch: api.retry };
    show();
    expect(screen.getByText(/Unable to load the fee breakdown/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry fee breakdown' }));
    expect(api.retry).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('region', { name: 'Tuition breakdown' })).not.toBeInTheDocument();
  });
  it('keeps the drawer closable during loading and hides stale data on a failed detail fetch', () => {
    api.detail = { isFetching: true, isLoading: true, refetch: api.retry };
    const loading = show();
    expect(screen.getByRole('button', { name: 'Close' })).toBeEnabled();
    expect(screen.queryByText('Tuition support')).not.toBeInTheDocument();
    loading.unmount();
    api.detail = { currentData: { data: request }, isError: true, refetch: api.retry };
    show();
    expect(screen.getByText(/Unable to load this concession request/)).toBeInTheDocument();
    expect(screen.queryByText('Tuition support')).not.toBeInTheDocument();
  });
  it('restricts document previews to the document permission', () => {
    api.detail.currentData.data.requiredDocuments[0].url = null;
    api.detail.currentData.data.submittedDocuments = [];
    const denied = show(false);
    expect(screen.getByText('Uploaded')).toBeInTheDocument();
    expect(screen.getByText('Sibling proof')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'View Sibling proof' })).not.toBeInTheDocument();
    denied.unmount();
    api.detail.currentData.data = structuredClone(request);
    show();
    fireEvent.click(screen.getByRole('button', { name: 'View Sibling proof' }));
    expect(screen.getByRole('dialog', { name: 'Sibling proof' })).toHaveTextContent('/proof.pdf');
  });
});
