import type { ReactElement } from 'react';

import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render as renderComponent, screen, waitFor, fireEvent } from '@testing-library/react';

import ReadOnlyConcessionApprovalView from './ReadOnlyConcessionApprovalView';
import { approvalContext } from '../../../../e2e/fixtures/concession-request-ui/data';

const mocks = vi.hoisted(() => ({
  context: {} as any,
  preview: vi.fn(),
  approve: vi.fn(),
  refetch: vi.fn(),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('src/redux/finance/ConcessionManagement/concessionManagementApi', () => ({
  useGetConcessionApprovalContextQuery: () => ({ ...mocks.context, refetch: mocks.refetch }),
  usePreviewConcessionApprovalMutation: () => [mocks.preview, { isLoading: false }],
  useApproveConcessionRequestMutation: () => [mocks.approve, { isLoading: false }],
}));
const item = {
  studentConcessionTypeRequestId: 'request',
  concessionTypeName: 'Sibling tuition concession',
} as any;
const theme = createTheme(defaultSettings);
const render = (element: ReactElement) =>
  renderComponent(<ThemeProvider theme={theme}>{element}</ThemeProvider>);
beforeEach(() => {
  vi.clearAllMocks();
  mocks.context = { data: approvalContext, isLoading: false, isError: false };
  mocks.preview.mockImplementation(() => ({
    unwrap: async () => ({
      totalApprovedAmount: 400,
      refundRequestAmount: 100,
      autoCreateRefund: false,
    }),
  }));
  mocks.approve.mockImplementation(() => ({ unwrap: async () => ({ refundRequests: [] }) }));
});
describe('concession approval review', () => {
  it('requires server review before confirming and preserves approval metadata and note', async () => {
    const onBack = vi.fn();
    render(<ReadOnlyConcessionApprovalView selectedItem={item} mode="Approve" onBack={onBack} />);
    fireEvent.change(screen.getByLabelText('Approval note (optional)'), {
      target: { value: '  Verified documents  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Review impact' }));
    await screen.findByRole('button', { name: 'Confirm approval' });
    expect(mocks.approve).not.toHaveBeenCalled();
    expect(screen.getByText(/create its linked refund requests manually/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm approval' }));
    await waitFor(() => expect(mocks.approve).toHaveBeenCalled());
    expect(mocks.approve.mock.calls[0][0]).toMatchObject({
      studentConcessionTypeRequestId: 'request',
      body: {
        message: 'Verified documents',
        requestConcurrencyStamp: 'stamp',
        previewFingerprint: 'fingerprint',
        idempotencyKey: expect.any(String),
      },
    });
    await waitFor(() => expect(onBack).toHaveBeenCalled());
  });
  it('blocks approval for changed balances', () => {
    mocks.context = {
      data: {
        ...approvalContext,
        feeHeadGroups: [{ ...approvalContext.feeHeadGroups[0], hasChangedSinceSubmission: true }],
      },
    };
    render(<ReadOnlyConcessionApprovalView selectedItem={item} mode="Approve" onBack={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Review impact' })).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent('changed since submission');
  });
  it('retains a retry action when loading fails', () => {
    mocks.context = { isError: true };
    render(<ReadOnlyConcessionApprovalView selectedItem={item} mode="Approve" onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(mocks.refetch).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Review impact' })).not.toBeInTheDocument();
  });
});
