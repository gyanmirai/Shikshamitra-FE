import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { financePermissions } from 'src/constants/finance-menu';
import { ConcessionStatusType } from 'src/enums/concession-status-type';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, fireEvent } from '@testing-library/react';

import ConcessionItemCard from './ConcessionItemCard';

import type { IConcessionRequestItem } from './type';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/preview-document/DocumentPreviewDialog', () => ({
  default: ({ open, documentName, url, directUrl, onClose }: any) =>
    open ? (
      <div role="dialog" aria-label={documentName}>
        <span>{url}</span>
        <span>{String(directUrl)}</span>
        <button type="button" onClick={onClose}>
          Close preview
        </button>
      </div>
    ) : null,
}));
vi.mock('src/redux/finance/ConcessionManagement/concessionManagementApi', () => ({
  useCreateConcessionRefundRequestsMutation: () => [vi.fn(), { isLoading: false }],
}));

const actions = financePermissions.fees.concessionActions;
const item: IConcessionRequestItem = {
  studentConcessionTypeRequestId: 'request',
  concessionTypeId: 'sibling-tuition',
  concessionTypeName: 'Sibling tuition concession',
  status: ConcessionStatusType.Draft,
  requesterId: 'maker',
  submittedById: 'maker',
  totalRequestedAmount: 275,
  totalAmount: 275,
  totalApprovedAmount: 0,
  totalReversedAmount: 0,
  netApprovedAmount: 0,
  feeHeads: [],
  createdAt: '2026-10-15T11:13:33Z',
  updatedAt: '2026-10-15T11:13:33Z',
  message: '',
  approvedAt: '',
  concurrencyStamp: 'request-stamp',
  requiredDocuments: [1, 2].map((n) => ({
    documentId: `doc-${n}`,
    documentName: `Certificate ${n}`,
    isRequired: true,
    isUploaded: true,
    maxFileSizeBytes: 5 * 1024 * 1024,
    acceptedFormats: [],
    url: `/files/certificate-${n}.pdf`,
  })),
  submittedDocuments: [],
  availableActions: ['view', 'edit', 'delete', 'upload-document'],
  timeline: [
    { action: 'created', status: ConcessionStatusType.Draft, occurredAt: '2026-10-15T11:13:33Z' },
  ],
};

const handlers = {
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onApprove: vi.fn(),
  onReject: vi.fn(),
  onCancel: vi.fn(),
  onOpenDocs: vi.fn(),
};
function show(
  record = item,
  grants: string[] = [actions.view, actions.edit, actions.delete, actions.viewDocument],
  user = 'checker',
  role = 'staff'
) {
  const store = configureStore({
    reducer: {
      auth: () => ({
        permissions: grants.map((name) => ({ name, isGranted: true })),
        user: { sub: user, role },
      }),
      confirmPopup: () => ({ isChanges: false }),
    },
  });
  return render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <ConcessionItemCard item={record} {...handlers} />
      </ThemeProvider>
    </Provider>
  );
}
beforeEach(() => vi.clearAllMocks());

describe('individual concession request card', () => {
  it('shows an unchanged approved amount once', () => {
    show({
      ...item,
      status: ConcessionStatusType.Approved,
      totalRequestedAmount: 108,
      totalApprovedAmount: 108,
      netApprovedAmount: 108,
    });
    const amounts = screen.getByRole('region', { name: 'Concession amounts' });
    expect(within(amounts).getByText('Approved amount')).toBeInTheDocument();
    expect(within(amounts).queryByText('Requested amount')).not.toBeInTheDocument();
    expect(within(amounts).getAllByText(/108/)).toHaveLength(1);
  });

  it('distinguishes requested and approved amounts when they differ', () => {
    show({
      ...item,
      status: ConcessionStatusType.Approved,
      totalApprovedAmount: 108,
      netApprovedAmount: 108,
    });
    const amounts = screen.getByRole('region', { name: 'Concession amounts' });
    expect(within(amounts).getByText('Requested amount')).toBeInTheDocument();
    expect(within(amounts).getByText('Approved amount')).toBeInTheDocument();
    expect(within(amounts).getAllByText(/108/)).toHaveLength(1);
    expect(within(amounts).getAllByText(/275/)).toHaveLength(1);
  });

  it.each([
    ConcessionStatusType.Draft,
    ConcessionStatusType.Pending,
    ConcessionStatusType.Rejected,
    ConcessionStatusType.Cancelled,
  ])('shows only the requested amount for status %s', (status) => {
    show({ ...item, status });
    const amounts = screen.getByRole('region', { name: 'Concession amounts' });
    expect(within(amounts).getByText('Requested amount')).toBeInTheDocument();
    expect(within(amounts).queryByText('Approved amount')).not.toBeInTheDocument();
  });

  it.each([
    [ConcessionStatusType.PartiallyReversed, 75, 200],
    [ConcessionStatusType.Reversed, 275, 0],
  ])('keeps reversal and net amounts explicit for status %s', (status, reversed, net) => {
    show({
      ...item,
      status,
      totalApprovedAmount: 275,
      totalReversedAmount: reversed,
      netApprovedAmount: net,
    });
    const amounts = screen.getByRole('region', { name: 'Concession amounts' });
    expect(within(amounts).queryByText('Requested amount')).not.toBeInTheDocument();
    expect(within(amounts).getByText('Approved amount')).toBeInTheDocument();
    expect(within(amounts).getByText('Reversed amount')).toBeInTheDocument();
    expect(within(amounts).getByText('Net approved amount')).toBeInTheDocument();
  });

  it.each(['admin', 'super-admin'])(
    'allows %s to decide their own request with action grants and server eligibility',
    (role) => {
      const own = { ...item, availableActions: ['edit', 'approve', 'reject', 'delete'] };
      const card = show(own, [actions.approve, actions.reject], 'maker', role);
      expect(screen.getByRole('button', { name: 'Approve' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Reject' })).toBeEnabled();
      expect(
        screen.queryByText('You cannot approve or reject your own request')
      ).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
      fireEvent.click(screen.getByRole('button', { name: 'Reject' }));
      expect(handlers.onApprove).toHaveBeenCalledWith(own);
      expect(handlers.onReject).toHaveBeenCalledWith(own);
      card.unmount();
      show(own, [], 'maker', role);
      expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument();
    }
  );

  it('keeps administrator decisions disabled when the server withholds them', () => {
    show(
      { ...item, availableActions: ['edit'] },
      [actions.approve, actions.reject],
      'maker',
      'admin'
    );
    expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeDisabled();
  });
  it('uses named icon-only controls for every card action', () => {
    show(
      item,
      [
        actions.view,
        actions.edit,
        actions.submit,
        actions.delete,
        actions.approve,
        actions.reject,
        actions.viewDocument,
      ],
      'maker'
    );
    ['Edit concession request', 'Approve', 'Reject', 'Delete concession request'].forEach(
      (name) => {
        expect(screen.getByRole('button', { name })).toBeEmptyDOMElement();
      }
    );
    expect(screen.getByRole('button', { name: 'See all supporting documents' })).toHaveTextContent(
      'See all'
    );
    expect(screen.queryByRole('button', { name: 'View request details' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Review and submit' })).not.toBeInTheDocument();
  });
  it('shows the header, full requested amount and every uploaded document', () => {
    show();
    expect(
      screen.getByRole('article', { name: 'Sibling tuition concession request' })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Sibling tuition concession' })).toBeInTheDocument();
    expect(screen.getByText(/Requested on/)).toBeInTheDocument();
    expect(screen.getByText(/275/)).toBeInTheDocument();
    expect(screen.getByText('2/2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View Certificate 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View Certificate 2' })).toBeInTheDocument();
    const header = screen.getByRole('article').querySelector('header')!;
    expect(
      within(header).getByRole('heading', { name: 'Sibling tuition concession' })
    ).toBeInTheDocument();
    expect(within(header).getByText(/Requested on/)).toBeInTheDocument();
    expect(screen.queryByText('Concession Request')).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Activity' })).not.toBeInTheDocument();
  });
  it('passes the selected document to the existing direct preview and can close it', () => {
    show();
    fireEvent.click(screen.getByRole('button', { name: 'View Certificate 2' }));
    expect(screen.getByRole('dialog', { name: 'Certificate 2' })).toHaveTextContent(
      '/files/certificate-2.pdf'
    );
    expect(screen.getByRole('dialog')).toHaveTextContent('true');
    fireEvent.click(screen.getByRole('button', { name: 'Close preview' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('delegates Edit, See All and Delete to the existing owning workflow', () => {
    show();
    const edit = screen.getByRole('button', { name: 'Edit concession request' });
    expect(edit).toBeEmptyDOMElement();
    fireEvent.click(edit);
    fireEvent.click(screen.getByRole('button', { name: 'See all supporting documents' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete concession request' }));
    expect(handlers.onEdit).toHaveBeenCalledWith(item);
    expect(handlers.onOpenDocs).toHaveBeenCalledWith(item);
    expect(handlers.onDelete).toHaveBeenCalledTimes(1);
    expect(handlers.onDelete).toHaveBeenCalledWith(item);
  });
  it('retains grant and server-action checks and disables deletion outside Draft', () => {
    const { unmount } = show(item, []);
    expect(
      screen.queryByRole('button', { name: 'Edit concession request' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Delete concession request' })
    ).not.toBeInTheDocument();
    unmount();
    const pending = show({ ...item, status: ConcessionStatusType.Pending });
    expect(
      screen.queryByRole('button', { name: 'Edit concession request' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete concession request' })).toBeDisabled();
    pending.unmount();
    show({ ...item, availableActions: ['upload-document'] });
    expect(
      screen.queryByRole('button', { name: 'Edit concession request' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Delete concession request' })
    ).not.toBeInTheDocument();
  });
  it.each([ConcessionStatusType.Draft, ConcessionStatusType.Pending])(
    'retains independent review and mandatory-document checks for status %s',
    (status) => {
      const pending = {
        ...item,
        status,
        availableActions: ['approve', 'reject'],
      };
      const maker = show(pending, [actions.approve, actions.reject], 'maker');
      expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Reject' })).toBeDisabled();
      maker.unmount();
      show(
        {
          ...pending,
          requiredDocuments: [{ ...item.requiredDocuments![0], isUploaded: false, url: null }],
        },
        [actions.approve, actions.reject]
      );
      expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Reject' })).toBeEnabled();
    }
  );
  it('keeps creator decisions disabled while offering Edit without an extra submission message', () => {
    show(item, [actions.edit, actions.submit, actions.approve, actions.reject], 'maker');
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.queryByText('Draft')).not.toBeInTheDocument();
    expect(
      screen.queryByText(/This pending request has not been submitted/)
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Edit concession request' }));
    expect(handlers.onEdit).toHaveBeenCalledWith(item);
    expect(handlers.onApprove).not.toHaveBeenCalled();
    expect(handlers.onReject).not.toHaveBeenCalled();
  });
  it.each([
    { grants: [actions.edit, actions.submit], user: 'checker', availableActions: ['edit'] },
    { grants: [actions.edit], user: 'maker', availableActions: ['edit'] },
    { grants: [actions.submit], user: 'maker', availableActions: ['edit'] },
    { grants: [actions.edit, actions.submit], user: 'maker', availableActions: [] },
  ])(
    'does not offer submission without ownership, grants and server eligibility: %j',
    ({ grants, user, availableActions }) => {
      show({ ...item, availableActions }, grants, user);
      expect(screen.queryByRole('button', { name: 'Review and submit' })).not.toBeInTheDocument();
    }
  );
  it('offers enabled decisions for an independently submitted request', () => {
    const pending = {
      ...item,
      status: ConcessionStatusType.Pending,
      availableActions: ['approve', 'reject'],
    };
    show(pending, [actions.approve, actions.reject]);
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reject' }));
    expect(handlers.onApprove).toHaveBeenCalledWith(pending);
    expect(handlers.onReject).toHaveBeenCalledWith(pending);
    expect(screen.queryByRole('button', { name: 'Review and submit' })).not.toBeInTheDocument();
  });
  it('allows an independent checker to decide a saved pending card without submission', () => {
    const saved = { ...item, availableActions: ['approve', 'reject'] };
    show(saved, [actions.approve, actions.reject]);
    expect(screen.getByRole('button', { name: 'Approve' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reject' }));
    expect(handlers.onApprove).toHaveBeenCalledWith(saved);
    expect(handlers.onReject).toHaveBeenCalledWith(saved);
  });
  it('allows rejection of an incomplete saved request while approval requires an amount', () => {
    const incomplete = {
      ...item,
      totalRequestedAmount: 0,
      totalAmount: 0,
      requiredDocuments: [],
      availableActions: ['approve', 'reject'],
    };
    show(incomplete, [actions.approve, actions.reject]);
    expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Reject' }));
    expect(handlers.onReject).toHaveBeenCalledWith(incomplete);
  });
  it('shows unavailable decisions without bypassing server actions or absent grants', () => {
    const denied = show({ ...item, status: ConcessionStatusType.Pending, availableActions: [] }, [
      actions.approve,
      actions.reject,
    ]);
    expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeDisabled();
    denied.unmount();
    show(
      { ...item, status: ConcessionStatusType.Pending, availableActions: ['approve', 'reject'] },
      []
    );
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument();
  });
  it.each([ConcessionStatusType.Approved, ConcessionStatusType.Rejected])(
    'does not offer decisions on a final request (%s)',
    (status) => {
      show({ ...item, status, availableActions: undefined }, [actions.approve, actions.reject]);
      expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument();
    }
  );
  it('renders all legacy submitted documents and the empty state', () => {
    const legacy = show({
      ...item,
      requiredDocuments: [],
      submittedDocuments: [1, 2].map((n) => ({
        documentId: `doc-${n}`,
        documentName: `Certificate ${n}`,
        url: `/files/certificate-${n}.pdf`,
        uploadedAt: '2026-10-15T11:13:33Z',
      })),
    });
    expect(screen.getByRole('button', { name: 'View Certificate 2' })).toBeInTheDocument();
    legacy.unmount();
    show({ ...item, requiredDocuments: [], submittedDocuments: [] });
    expect(screen.getByText('No documents required')).toBeInTheDocument();
  });
});
