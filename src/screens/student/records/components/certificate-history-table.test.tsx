import { vi, it, expect, beforeEach } from 'vitest';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import CertificateHistoryTable from './certificate-history-table';

const mocks = vi.hoisted(() => ({
  canIssue: true,
  cancelled: false,
  get: vi.fn(),
  reprint: vi.fn(),
  duplicate: vi.fn(),
  download: vi.fn(),
  error: vi.fn(),
  refetch: vi.fn(),
  historyFailed: false,
}));
vi.mock('react-redux', () => ({
  useSelector: (select: any) =>
    select({
      auth: {
        permissions: [
          { name: 'Students.Records.Certificates.View', isGranted: true },
          { name: 'Students.Records.Certificates.Add', isGranted: mocks.canIssue },
        ],
      },
    }),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => '/student/certificates',
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/components/label', () => ({ Label: ({ children }: any) => <span>{children}</span> }));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ columns, data, tableTitle, errorContent }: any) => (
    <div>
      {errorContent}
      <table aria-label={tableTitle}>
        <tbody>
          {data.map((row: any) => (
            <tr key={row.certificateId}>
              {columns.map((col: any) => (
                <td key={col.id}>{col.render ? col.render(row[col.id], row) : row[col.id]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
}));
vi.mock('src/components/adaptive-three-dots-actions', () => ({
  default: ({ actions }: any) => (
    <div>
      {actions.map((action: any) => (
        <button
          type="button"
          key={action.id}
          aria-label={action.ariaLabel}
          disabled={action.disabled}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ))}
    </div>
  ),
}));
vi.mock('src/components/form-section-card', () => ({
  FormSectionCard: ({ children }: any) => <section>{children}</section>,
}));
vi.mock('src/components/customDialog', () => ({
  default: ({ open, title, children, onSubmit }: any) =>
    open ? (
      <form aria-label={title} onSubmit={onSubmit}>
        {children}
      </form>
    ) : null,
  DialogScrollContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('src/components/shaking-text-field', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('src/hooks/use-unsaved-navigation', () => ({
  useUnsavedNavigation: () => ({ requestNavigation: (next: any) => next(), confirmation: null }),
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: (...args: any[]) => mocks.error(...args) },
}));
vi.mock('src/components/student-feedback', () => ({
  StudentFeedback: ({ children, toastAction }: any) => (
    <div>
      {children}
      {toastAction}
    </div>
  ),
}));
vi.mock('src/redux/student/records/student-record-documents-api', () => ({
  useGetRecordCertificateHistoryQuery: () => ({
    currentData: [
      {
        certificateId: 'c1',
        certificateNumber: 'BON-001',
        certificateType: 'Bonafide',
        issueDate: '2026-11-16T00:00:00Z',
        status: mocks.cancelled ? 'Cancelled' : 'Generated',
        supportedActions: mocks.cancelled
          ? ['View']
          : ['View', 'Download', 'Reprint', 'Duplicate', 'Void'],
      },
    ],
    isFetching: false,
    isError: mocks.historyFailed,
    refetch: mocks.refetch,
  }),
  useLazyGetRecordCertificateQuery: () => [
    (id: string) => ({ unwrap: () => mocks.get(id) }),
    { isFetching: false },
  ],
  useDownloadRecordDocumentMutation: () => [
    (input: any) => ({ unwrap: () => mocks.download(input) }),
    { isLoading: false },
  ],
  useReprintRecordDocumentMutation: () => [
    (input: any) => ({ unwrap: () => mocks.reprint(input) }),
    { isLoading: false },
  ],
  useDuplicateRecordCertificateMutation: () => [
    (input: any) => ({ unwrap: () => mocks.duplicate(input) }),
    { isLoading: false },
  ],
  useVoidRecordDocumentMutation: () => [vi.fn(), { isLoading: false }],
  downloadRecordPdf: vi.fn(),
}));
beforeEach(() => {
  vi.resetAllMocks();
  mocks.canIssue = true;
  mocks.cancelled = false;
  mocks.historyFailed = false;
  mocks.get.mockResolvedValue({
    certificateId: 'c1',
    certificateNo: 'BON-001',
    student: { studentName: 'Ravi Shah' },
    issueDate: '2026-11-16T00:00:00Z',
    template: { renderedHeaderContent: 'Saved school snapshot', renderedFooterContent: '' },
    certificateData: {},
  });
});
it('shows action names without certificate numbers while retaining accessible row context', () => {
  render(<CertificateHistoryTable studentId="ravi" />);
  expect(screen.getByRole('button', { name: 'Reprint BON-001' })).toHaveTextContent(/^Reprint$/);
  expect(screen.getByRole('button', { name: 'Issue duplicate BON-001' })).toHaveTextContent(
    /^Issue duplicate$/
  );
  expect(screen.getByRole('button', { name: 'Void BON-001' })).toHaveTextContent(/^Void$/);
});
it('offers a retry notification when certificate history fails to load', () => {
  mocks.historyFailed = true;
  render(<CertificateHistoryTable studentId="ravi" />);
  expect(screen.getByText('Certificate history could not be loaded.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Retry history' }));
  expect(mocks.refetch).toHaveBeenCalledTimes(1);
});
it('reports a failed saved certificate read', async () => {
  mocks.get.mockRejectedValueOnce(new Error('temporary'));
  render(<CertificateHistoryTable studentId="ravi" />);
  fireEvent.click(screen.getByRole('button', { name: 'View BON-001' }));
  await waitFor(() =>
    expect(mocks.error).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('could not be opened') })
    )
  );
});
it('restores the exact duplicate request after an ambiguous failure and closing the reason dialog', async () => {
  mocks.duplicate.mockRejectedValueOnce(new Error('response lost'));
  mocks.duplicate.mockImplementationOnce(async () => ({
    ...(await mocks.get()),
    certificateNo: 'BON-002',
  }));
  render(<CertificateHistoryTable studentId="ravi" />);
  fireEvent.click(screen.getByRole('button', { name: 'Issue duplicate BON-001' }));
  fireEvent.change(screen.getByRole('textbox', { name: /Reason/ }), {
    target: { value: 'Lost original certificate' },
  });
  fireEvent.submit(screen.getByRole('form', { name: 'Issue duplicate Certificate: BON-001' }));
  await waitFor(() => expect(mocks.error).toHaveBeenCalled());
  const firstRequest = mocks.duplicate.mock.calls[0][0];
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  fireEvent.click(screen.getByRole('button', { name: 'Issue duplicate BON-001' }));
  expect(screen.getByRole('textbox', { name: /Reason/ })).toHaveValue('Lost original certificate');
  expect(screen.getByRole('textbox', { name: /Reason/ })).toBeDisabled();
  expect(screen.getByText(/may already have been issued/)).toBeInTheDocument();
  fireEvent.submit(screen.getByRole('form', { name: 'Issue duplicate Certificate: BON-001' }));
  await waitFor(() => expect(mocks.duplicate).toHaveBeenCalledTimes(2));
  expect(mocks.duplicate.mock.calls[1][0]).toEqual(firstRequest);
});

it('opens the saved certificate snapshot for the chosen history row', async () => {
  render(<CertificateHistoryTable studentId="ravi" />);
  fireEvent.click(screen.getByRole('button', { name: 'View BON-001' }));
  await waitFor(() => expect(screen.getByText('Saved school snapshot')).toBeInTheDocument());
  expect(screen.getByText('Ravi Shah')).toBeInTheDocument();
});
it('offers history downloads but no issuing actions to view-only staff', () => {
  mocks.canIssue = false;
  render(<CertificateHistoryTable studentId="ravi" />);
  expect(screen.getByRole('button', { name: 'Download BON-001' })).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: /Reprint|Issue duplicate|Void/ })
  ).not.toBeInTheDocument();
});
it('offers only View for a voided certificate', () => {
  mocks.cancelled = true;
  render(<CertificateHistoryTable studentId="ravi" />);
  expect(screen.getByRole('button', { name: 'View BON-001' })).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: /Download|Reprint|Issue duplicate/ })
  ).not.toBeInTheDocument();
});

it('disables a pending certificate action if its issuance permission is revoked', () => {
  const view = render(<CertificateHistoryTable studentId="ravi" />);
  fireEvent.click(screen.getByRole('button', { name: 'Reprint BON-001' }));
  mocks.canIssue = false;
  view.rerender(<CertificateHistoryTable studentId="ravi" />);
  expect(screen.getByRole('button', { name: 'Reprint' })).toBeDisabled();
});

it('records one reprint when the reason form is submitted twice before the request completes', async () => {
  let complete: (value: Blob) => void = () => {};
  mocks.reprint.mockImplementation(
    () =>
      new Promise((resolve) => {
        complete = resolve;
      })
  );
  render(<CertificateHistoryTable studentId="ravi" />);
  fireEvent.click(screen.getByRole('button', { name: 'Reprint BON-001' }));
  fireEvent.change(screen.getByRole('textbox', { name: /Reason/ }), {
    target: { value: 'Original copy damaged' },
  });
  const form = screen.getByRole('form', { name: 'Reprint Certificate: BON-001' });
  fireEvent.submit(form);
  fireEvent.submit(form);
  await waitFor(() => expect(mocks.reprint).toHaveBeenCalledTimes(1));
  await act(async () => complete(new Blob(['pdf'])));
  expect(mocks.reprint).toHaveBeenCalledTimes(1);
});
