import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { financePermissions } from 'src/constants/finance-menu';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConcessionStatusType } from 'src/enums/concession-status-type';
import { defaultSettings } from 'src/components/settings/config-settings';

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
  availableActions: ['edit', 'delete', 'upload-document'],
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
  grants: string[] = [actions.edit, actions.delete, actions.viewDocument],
  user = 'checker'
) {
  const store = configureStore({
    reducer: {
      auth: () => ({
        permissions: grants.map((name) => ({ name, isGranted: true })),
        user: { sub: user },
      }),
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
    expect(screen.getByText('Activity')).toBeInTheDocument();
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
    fireEvent.click(screen.getByRole('button', { name: 'See All' }));
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
  it('retains the maker-checker restriction and mandatory-document approval block', () => {
    const pending = {
      ...item,
      status: ConcessionStatusType.Pending,
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
  });
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
