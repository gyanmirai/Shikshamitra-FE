import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import StudentOnboardingDocuments from './student-onboarding-documents';
import StudentOnboardingCredentialEmails from './student-onboarding-credential-emails';

const mocks = vi.hoisted(() => ({
  emails: {} as any,
  documents: {} as any,
  send: vi.fn(),
  override: vi.fn(),
  close: vi.fn(),
  sending: false,
  saving: false,
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/components/customDialog', () => ({
  default: ({ children, title }: any) => (
    <div role="dialog" aria-label={title}>
      {children}
    </div>
  ),
  DialogScrollContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useGetStudentCredentialEmailsQuery: () => mocks.emails,
  useSendStudentCredentialEmailMutation: () => [mocks.send, { isLoading: mocks.sending }],
  useGetStudentOnboardingDocumentsQuery: () => mocks.documents,
  useUploadStudentOnboardingDocumentMutation: () => [vi.fn(), { isLoading: false }],
  useOverrideStudentOnboardingDocumentsMutation: () => [
    mocks.override,
    { isLoading: mocks.saving },
  ],
}));
beforeEach(() => {
  mocks.send.mockReset();
  mocks.override.mockReset();
  mocks.sending = false;
  mocks.saving = false;
  mocks.emails = {
    data: [
      {
        id: 'email-1',
        accountType: 'guardian',
        email: 'parent@example.com',
        status: 'Failed',
        message: 'Sending failed',
        attemptCount: 1,
        emailEnabled: true,
        canSend: true,
      },
    ],
    refetch: vi.fn(),
  };
  mocks.documents = {
    data: {
      concurrencyStamp: 'latest-doc-stamp',
      canUpload: true,
      canOverride: true,
      documents: [
        {
          documentTypeId: 'doc-1',
          name: 'Birth certificate',
          isRequired: true,
          hasStudentUpload: true,
          isValidated: false,
          allowedExtensions: ['pdf'],
          maxSizeMb: 5,
        },
      ],
    },
    refetch: vi.fn(),
  };
});

describe('Onboarding credential email recovery', () => {
  it('retries through the case boundary with its stamp and never exposes a password', async () => {
    mocks.send.mockReturnValue({ unwrap: () => Promise.resolve({ status: 'Pending' }) });
    render(<StudentOnboardingCredentialEmails caseId="case-1" concurrencyStamp="case-stamp" />);
    fireEvent.click(screen.getByRole('button', { name: 'Retry email' }));
    await waitFor(() =>
      expect(mocks.send).toHaveBeenCalledWith({
        id: 'case-1',
        accountType: 'guardian',
        concurrencyStamp: 'case-stamp',
      })
    );
    expect(screen.queryByRole('textbox', { name: /password/i })).not.toBeInTheDocument();
  });
  it('honors denied readiness/permission and does not allow duplicate pending sends', () => {
    mocks.emails.data[0].canSend = false;
    const { rerender } = render(<StudentOnboardingCredentialEmails caseId="case-1" />);
    expect(screen.getByRole('button', { name: 'Retry email' })).toBeDisabled();
    mocks.emails.data[0] = { ...mocks.emails.data[0], canSend: true, status: 'Pending' };
    rerender(<StudentOnboardingCredentialEmails caseId="case-1" />);
    expect(screen.getByRole('button', { name: 'Send credential email' })).toBeDisabled();
  });
  it('keeps loading and failed reads visible with a retry', () => {
    mocks.emails = { isFetching: true, data: undefined };
    const { rerender } = render(<StudentOnboardingCredentialEmails caseId="case-1" />);
    expect(
      screen.getByRole('progressbar', { name: 'Loading credential email status' })
    ).toBeInTheDocument();
    mocks.emails = { isError: true, refetch: vi.fn() };
    rerender(<StudentOnboardingCredentialEmails caseId="case-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Retry email status' }));
    expect(mocks.emails.refetch).toHaveBeenCalledOnce();
  });
});

describe('Authorized document overrides', () => {
  it('does not count an upload as verified and requires an audit note for individual overrides', async () => {
    mocks.override.mockReturnValue({ unwrap: () => Promise.resolve({}) });
    render(<StudentOnboardingDocuments caseId="case-1" enabled canManage />);
    expect(screen.getByText('Awaiting verification')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Override Birth certificate' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save override' }));
    await screen.findByText('An override note is required.');
    expect(mocks.override).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole('textbox', { name: /Override note/ }), {
      target: { value: '  School verified original  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save override' }));
    await waitFor(() =>
      expect(mocks.override).toHaveBeenCalledWith({
        caseId: 'case-1',
        concurrencyStamp: 'latest-doc-stamp',
        documentTypeIds: ['doc-1'],
        overrideAll: false,
        reason: 'School verified original',
      })
    );
  });
  it('permits all-document overrides independently of upload policy, but obeys canOverride', async () => {
    mocks.override.mockReturnValue({ unwrap: () => Promise.resolve({}) });
    const { rerender } = render(
      <StudentOnboardingDocuments caseId="case-1" enabled={false} canManage={false} />
    );
    expect(screen.queryByText('Upload file')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Override all required documents' }));
    fireEvent.change(screen.getByRole('textbox', { name: /Override note/ }), {
      target: { value: 'Authorized exception' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save override' }));
    await waitFor(() =>
      expect(mocks.override).toHaveBeenCalledWith(
        expect.objectContaining({ documentTypeIds: [], overrideAll: true })
      )
    );
    mocks.documents.data.canOverride = false;
    rerender(<StudentOnboardingDocuments caseId="case-1" enabled canManage />);
    expect(screen.queryByRole('button', { name: /Override/ })).not.toBeInTheDocument();
  });
  it('preserves the override note on a server error', async () => {
    mocks.override.mockReturnValue({
      unwrap: () => Promise.reject(Object.assign(new Error('Override request unavailable.'), {
        data: { detail: 'Override request unavailable.' },
      })),
    });
    render(<StudentOnboardingDocuments caseId="case-1" enabled canManage />);
    fireEvent.click(screen.getByRole('button', { name: 'Override all required documents' }));
    fireEvent.change(screen.getByRole('textbox', { name: /Override note/ }), {
      target: { value: 'Exception reason' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save override' }));
    await screen.findByText('Override request unavailable.');
    expect(screen.getByRole('textbox', { name: /Override note/ })).toHaveValue('Exception reason');
  });
});
it('locks the override note and actions while saving', () => {
  mocks.saving = true;
  render(<StudentOnboardingDocuments caseId="case-1" enabled canManage />);
  fireEvent.click(screen.getByRole('button', { name: 'Override all required documents' }));
  expect(screen.getByRole('textbox', { name: /Override note/ })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  expect(screen.getByRole('progressbar', { name: 'Saving document override' })).toBeInTheDocument();
  expect(mocks.override).not.toHaveBeenCalled();
});
