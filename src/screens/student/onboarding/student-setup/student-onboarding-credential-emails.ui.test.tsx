import { shikshaMitraToast } from 'src/components/toast';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';

import StudentOnboardingDocuments from './student-onboarding-documents';
import { studentOnboardingTestData } from './student-onboarding-test-fixtures';
import StudentOnboardingPortalAccounts from './student-onboarding-portal-accounts';
import StudentOnboardingCredentialEmails from './student-onboarding-credential-emails';

const mocks = vi.hoisted(() => ({
  emails: {} as any,
  documents: {} as any,
  accounts: {} as any,
  handoffs: {} as any,
  credentials: {} as any,
  sendCredentials: vi.fn(),
  provision: vi.fn(),
  send: vi.fn(),
  upload: vi.fn(),
  override: vi.fn(),
  sending: false,
}));
vi.mock('react-redux', () => ({
  useSelector: (select: (state: unknown) => unknown) =>
    select({
      auth: {
        permissions: [
          { name: 'AbpIdentity.Users.Create', isGranted: true },
          { name: 'AbpIdentity.Users.Update', isGranted: true },
        ],
      },
    }),
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
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
  useUploadStudentOnboardingDocumentMutation: () => [mocks.upload, { isLoading: false }],
  useOverrideStudentOnboardingDocumentsMutation: () => [mocks.override, { isLoading: false }],
  useGetStudentPortalAccountsQuery: () => mocks.accounts,
  useGetStudentOnboardingServiceHandoffsQuery: () => mocks.handoffs,
  useProvisionStudentPortalAccountMutation: () => [mocks.provision, { isLoading: false }],
  useGetStudentOnboardingCredentialsQuery: () => mocks.credentials,
  useSendStudentOnboardingCredentialsMutation: () => [
    mocks.sendCredentials,
    { isLoading: mocks.sending },
  ],
  useRetryStudentOnboardingParentSetupMutation: () => [vi.fn(), { isLoading: false }],
  useLinkStudentOnboardingParentMutation: () => [vi.fn(), { isLoading: false }],
}));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.send.mockReset();
  mocks.provision.mockReset();
  mocks.sendCredentials.mockReset();
  mocks.override.mockReset();
  mocks.upload.mockReset();
  mocks.upload.mockReturnValue({ unwrap: () => Promise.resolve({}) });
  mocks.sending = false;
  mocks.credentials = {
    data: {
      caseId: 'case-1',
      concurrencyStamp: 'credential-workspace-stamp',
      recipients: [
        {
          accountType: 'guardian',
          relationship: 'father',
          name: 'Parent',
          email: 'parent@example.com',
          canSend: true,
          delivery: {
            accountType: 'guardian',
            status: 'Failed',
            message: 'Sending failed',
            attemptCount: 1,
          },
        },
      ],
    },
    refetch: vi.fn(),
  };
  mocks.sendCredentials.mockImplementation(() => ({
    unwrap: () =>
      Promise.resolve({
        ...mocks.credentials.data,
        recipients: mocks.credentials.data.recipients.map((recipient: any) => ({
          ...recipient,
          delivery: { ...recipient.delivery, status: 'Pending' },
        })),
      }),
  }));
  mocks.accounts = {
    data: [
      {
        accountType: 'student',
        email: 'student@example.com',
        isActive: true,
        emailConfirmed: true,
      },
      {
        accountType: 'guardian',
        email: 'parent@example.com',
        isActive: true,
        emailConfirmed: true,
      },
    ],
    refetch: vi.fn(),
  };
  mocks.handoffs = {
    data: [
      { serviceKey: 'student-account', required: true },
      { serviceKey: 'guardian-account', required: true },
    ],
    refetch: vi.fn(),
  };
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
  it('offers a case-only parent correction only when the caller permits it', () => {
    mocks.emails.data = [
      { accountType: 'student', status: 'Blocked', emailEnabled: false, canSend: false },
      { accountType: 'guardian', status: 'Blocked', emailEnabled: false, canSend: false },
    ];
    const view = render(
      <StudentOnboardingCredentialEmails
        caseId="case-1"
        concurrencyStamp="current-stamp"
        canEnableGuardianEmail
      />
    );
    expect(
      screen.getAllByRole('button', { name: 'Enable parent email for this case' })
    ).toHaveLength(1);
    view.rerender(
      <StudentOnboardingCredentialEmails caseId="case-1" concurrencyStamp="current-stamp" />
    );
    expect(
      screen.queryByRole('button', { name: 'Enable parent email for this case' })
    ).not.toBeInTheDocument();
    expect(mocks.send).not.toHaveBeenCalled();
  });
  it('retries an existing account through the one-click workspace without separate provisioning fields', async () => {
    render(
      <StudentOnboardingPortalAccounts
        canManage
        student={{
          ...studentOnboardingTestData[0],
          id: 'case-1',
          studentEnrollmentId: 'enrollment-1',
          backendStatus: 3,
          concurrencyStamp: 'case-stamp',
        }}
      />
    );
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Parent / guardian email' })).toHaveValue(
        'parent@example.com'
      )
    );
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /Profile email/ })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Create and link account' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send selected login details' })).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Send to parent / guardian' }));
    fireEvent.click(screen.getByRole('checkbox', { name: /I confirm Parent may access/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Send selected login details' }));
    await waitFor(() =>
      expect(mocks.sendCredentials).toHaveBeenCalledWith({
        id: 'case-1',
        accountType: 'guardian',
        relationship: 'father',
        expectedEmail: 'parent@example.com',
        concurrencyStamp: 'credential-workspace-stamp',
        confirmRecipientAccess: true,
      })
    );
    expect(mocks.provision).not.toHaveBeenCalled();
  });
  it('uses the same Send Credentials action when the account has not yet been created', async () => {
    mocks.credentials.data.recipients[0].delivery = null;
    render(
      <StudentOnboardingPortalAccounts
        canManage
        student={{
          ...studentOnboardingTestData[0],
          id: 'case-1',
          studentEnrollmentId: 'enrollment-1',
          backendStatus: 3,
        }}
      />
    );
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Parent / guardian email' })).toHaveValue(
        'parent@example.com'
      )
    );
    expect(screen.getByRole('button', { name: 'Send selected login details' })).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Send to parent / guardian' }));
    fireEvent.click(screen.getByRole('checkbox', { name: /I confirm Parent may access/i }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Send selected login details' })).toBeEnabled()
    );
    expect(
      screen.queryByRole('button', { name: 'Create and link account' })
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Send selected login details' }));
    await waitFor(() => expect(mocks.sendCredentials).toHaveBeenCalledOnce());
    expect(mocks.provision).not.toHaveBeenCalled();
  });
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
    await waitFor(() =>
      expect(shikshaMitraToast.info).toHaveBeenCalledWith({ message: 'Login email is queued.' })
    );
    expect(shikshaMitraToast.success).not.toHaveBeenCalled();
  });
  it('honors denied readiness/permission and does not allow duplicate pending sends', () => {
    mocks.emails.data[0].canSend = false;
    const { rerender } = render(<StudentOnboardingCredentialEmails caseId="case-1" />);
    expect(screen.getByRole('button', { name: 'Retry email' })).toBeDisabled();
    mocks.emails.data[0] = { ...mocks.emails.data[0], canSend: true, status: 'Pending' };
    rerender(<StudentOnboardingCredentialEmails caseId="case-1" />);
    expect(screen.getByRole('button', { name: 'Send login details' })).toBeDisabled();
  });
  it('reports sender submission as success without claiming delivery', async () => {
    mocks.send.mockReturnValue({ unwrap: () => Promise.resolve({ status: 'Sent' }) });
    mocks.emails.data[0].status = 'Sent';
    render(<StudentOnboardingCredentialEmails caseId="case-1" concurrencyStamp="case-stamp" />);
    expect(screen.getByText('Login details sent')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Resend login details' }));
    expect(mocks.send).not.toHaveBeenCalled();
    fireEvent.click(
      within(screen.getByRole('dialog', { name: 'Resend Login Details?' })).getByRole('button', {
        name: 'Resend login details',
      })
    );
    await waitFor(() =>
      expect(shikshaMitraToast.success).toHaveBeenCalledWith({
        message: 'Login email submitted for sending.',
      })
    );
    expect(shikshaMitraToast.info).not.toHaveBeenCalled();
    expect(screen.queryByText('Email sent.')).not.toBeInTheDocument();
  });
  it('keeps loading visible and reports failed reads through the standard toast', () => {
    mocks.emails = { isFetching: true, data: undefined };
    const { rerender } = render(<StudentOnboardingCredentialEmails caseId="case-1" />);
    expect(
      screen.getByRole('status', { name: 'Loading credential email status' })
    ).toBeInTheDocument();
    expect(
      screen.queryByText('No credential email requests are available for this case.')
    ).not.toBeInTheDocument();
    mocks.emails = { isError: true, refetch: vi.fn() };
    rerender(<StudentOnboardingCredentialEmails caseId="case-1" />);
    expect(shikshaMitraToast.error).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Credential email status could not be loaded.' })
    );
    expect(screen.queryByRole('button', { name: 'Retry email status' })).not.toBeInTheDocument();
  });
  it('confirms a failed resend instead of replaying it as an initial retry', () => {
    mocks.emails.data[0].sentAt = '2026-10-29T10:00:00Z';
    render(<StudentOnboardingCredentialEmails caseId="case-1" concurrencyStamp="case-stamp" />);
    expect(screen.queryByRole('button', { name: 'Retry email' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Resend login details' }));
    expect(screen.getByRole('dialog', { name: 'Resend Login Details?' })).toBeVisible();
    expect(mocks.send).not.toHaveBeenCalled();
  });
});

describe('Required document evidence without bypass', () => {
  it('keeps the document section shaped while requirements load', () => {
    mocks.documents = { isFetching: true, data: undefined };
    render(<StudentOnboardingDocuments caseId="case-1" enabled canManage />);
    expect(
      screen.getByRole('status', { name: 'Loading document requirements' })
    ).toBeInTheDocument();
    expect(
      screen.queryByText('No onboarding document requirements are configured.')
    ).not.toBeInTheDocument();
  });

  it('keeps an uploaded required document awaiting verification without offering an override', async () => {
    const { container } = render(<StudentOnboardingDocuments caseId="case-1" enabled canManage />);
    expect(screen.getByText('Awaiting verification')).toBeInTheDocument();
    const file = new File(['evidence'], 'birth.pdf', { type: 'application/pdf' });
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();
    fireEvent.change(input!, { target: { files: [file] } });
    await waitFor(() =>
      expect(mocks.upload).toHaveBeenCalledWith({
        caseId: 'case-1',
        documentTypeId: 'doc-1',
        concurrencyStamp: 'latest-doc-stamp',
        file,
      })
    );
    expect(screen.getByText('Awaiting verification')).toBeInTheDocument();
    expect(screen.queryByText('Verified')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Override/ })).not.toBeInTheDocument();
    expect(mocks.override).not.toHaveBeenCalled();
  });
  it('distinguishes required and optional evidence without bypass actions under legacy flags', () => {
    mocks.documents.data.documents[0].hasStudentUpload = false;
    mocks.documents.data.documents.push({
      ...mocks.documents.data.documents[0],
      documentTypeId: 'doc-2',
      name: 'Address proof',
      isRequired: false,
    });
    const { rerender } = render(<StudentOnboardingDocuments caseId="case-1" enabled canManage />);
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByText('Optional')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Override/ })).not.toBeInTheDocument();
    mocks.documents.data.canOverride = false;
    rerender(<StudentOnboardingDocuments caseId="case-1" enabled={false} canManage={false} />);
    expect(screen.queryByText('Upload file')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Override/ })).not.toBeInTheDocument();
    expect(mocks.override).not.toHaveBeenCalled();
  });
  it('preserves historical override notes as read-only audit evidence', () => {
    mocks.documents.data.documents[0].isOverridden = true;
    mocks.documents.data.documents[0].overrideReason = 'Historical school decision';
    render(<StudentOnboardingDocuments caseId="case-1" enabled canManage />);
    expect(screen.getByText('Override note: Historical school decision')).toBeInTheDocument();
    expect(screen.getByText('Overridden')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Override/ })).not.toBeInTheDocument();
    expect(mocks.override).not.toHaveBeenCalled();
  });
  it('toasts a failed requirement read without claiming there are no requirements', () => {
    mocks.documents = { isError: true, refetch: vi.fn() };
    render(<StudentOnboardingDocuments caseId="case-1" enabled canManage />);
    expect(shikshaMitraToast.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Student documents could not be loaded. Refresh the page.',
      })
    );
    expect(
      screen.queryByText('No onboarding document requirements are configured.')
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    expect(mocks.override).not.toHaveBeenCalled();
  });
});
