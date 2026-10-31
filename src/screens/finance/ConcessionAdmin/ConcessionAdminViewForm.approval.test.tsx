import React from 'react';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConcessionStatusType } from 'src/enums/concession-status-type';
import { concessionRequestErrorMessage } from 'src/utils/concession-request-error';

import ViewConcessionRequest from './ConcessionAdminViewForm';

vi.mock('src/components/confirm-dialog', () => ({ ConfirmDialog: () => null }));
vi.mock('src/components/customDialog', () => ({
  default: () => null,
  DialogScrollContent: () => null,
}));

const state = vi.hoisted(() => ({ check: vi.fn(), toast: vi.fn(), userId: 'checker' }));
vi.mock('react-redux', () => ({
  useSelector: (select: any) =>
    select({
      globalState: { currentYear: { id: 'year' } },
      auth: { user: { sub: state.userId }, permissions: [] },
    }),
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { error: state.toast } }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/scrollbar', () => ({
  Scrollbar: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('src/components/preview-document/DocumentPreviewDialog', () => ({ default: () => null }));
vi.mock('./StucentConcessionCard', () => ({ default: () => <div>Student information</div> }));
vi.mock('./ConcessionFeeHeadApprovalView', () => ({ default: () => <div>Approval panel</div> }));
vi.mock('./ConcessionItemCard', () => ({
  default: ({ item, onApprove, approvalChecking }: any) => (
    <button type="button" disabled={approvalChecking} onClick={() => onApprove(item)}>
      Approve request
    </button>
  ),
}));
vi.mock('src/redux/finance/ConcessionManagement/concessionManagementApi', () => ({
  useGetStudentConcessionDetailsQuery: vi.fn(),
  useDeleteConcessionApplicationMutation: vi.fn(),
  useRejectConcessionRequestMutation: vi.fn(),
  useUploadConcessionDocumentsMutation: vi.fn(),
  useUploadConcessionDocumentFileMutation: vi.fn(),
  useLazyGetConcessionApprovalContextQuery: () => [
    (...args: unknown[]) => ({ unwrap: () => state.check(...args) }),
  ],
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ type }: any) =>
    type === 'mutation'
      ? [vi.fn(), {}]
      : {
          data: {
            items: [
              {
                id: 'request',
                studentConcessionTypeRequestId: 'request',
                requesterId: 'maker',
                status: ConcessionStatusType.Pending,
                requiredDocuments: [],
                totalAmount: 500,
              },
            ],
          },
        },
}));

const setup = () =>
  render(<ViewConcessionRequest student={{ studentId: 'student' } as any} onClose={vi.fn()} />);
const approve = () => fireEvent.click(screen.getByRole('button', { name: 'Approve request' }));
const duplicateMessage = concessionRequestErrorMessage('Finance:Concession:010034');

describe('Student concession approval entry', () => {
  beforeEach(() => {
    state.userId = 'checker';
    state.check.mockReset().mockResolvedValue({});
    state.toast.mockClear();
  });

  it.each([
    { benefitBlocker: { code: 'Finance:Concession:010034', message: 'Finance:Concession:010034' } },
    { benefitBlocker: { code: 'Finance:Concession:010034', message: duplicateMessage } },
  ])('keeps the request card visible and toasts the context blocker', async (context) => {
    state.check.mockResolvedValue(context);
    setup();
    approve();
    await waitFor(() => expect(state.toast).toHaveBeenCalledWith({ message: duplicateMessage }));
    expect(screen.queryByText('Approval panel')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Approve request' })).toBeEnabled();
  });

  it('maps a duplicate-benefit HTTP error to a toast without opening approval', async () => {
    state.check.mockRejectedValue({
      status: 403,
      data: {
        error: {
          code: 'Finance:Concession:010034',
          message: 'An internal error occurred during your request!',
        },
      },
    });
    setup();
    approve();
    await waitFor(() => expect(state.toast).toHaveBeenCalledWith({ message: duplicateMessage }));
    expect(screen.queryByText('Approval panel')).not.toBeInTheDocument();
  });

  it('waits for fresh eligibility and prevents duplicate clicks before opening approval', async () => {
    let resolve!: (value: object) => void;
    state.check.mockReturnValue(
      new Promise((done) => {
        resolve = done;
      })
    );
    setup();
    approve();
    expect(screen.queryByText('Approval panel')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Approve request' })).toBeDisabled();
    approve();
    expect(state.check).toHaveBeenCalledTimes(1);
    expect(state.check).toHaveBeenCalledWith('request', false);
    await act(async () => resolve({}));
    expect(screen.getByText('Approval panel')).toBeVisible();
    expect(state.toast).not.toHaveBeenCalled();
  });

  it('stays on the list after a failed check and permits a fresh retry', async () => {
    state.check.mockRejectedValueOnce({ status: 500, data: { title: 'Request failed' } });
    setup();
    approve();
    await waitFor(() => expect(state.toast).toHaveBeenCalledTimes(1));
    expect(screen.queryByText('Approval panel')).not.toBeInTheDocument();
    approve();
    expect(await screen.findByText('Approval panel')).toBeVisible();
    expect(state.check).toHaveBeenCalledTimes(2);
  });

  it('preserves the maker-checker restriction before making a preflight request', () => {
    state.userId = 'maker';
    setup();
    approve();
    expect(state.check).not.toHaveBeenCalled();
    expect(screen.queryByText('Approval panel')).not.toBeInTheDocument();
  });

  it('does not toast or open approval after leaving the view', async () => {
    let reject!: (error: object) => void;
    state.check.mockReturnValue(
      new Promise((_, fail) => {
        reject = fail;
      })
    );
    const view = setup();
    approve();
    view.unmount();
    await act(async () => reject({ status: 500 }));
    expect(state.toast).not.toHaveBeenCalled();
  });
});
