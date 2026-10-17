import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import GuardianProfileEmailDialog from './guardian-profile-email-dialog';
import GuardianCredentialEmailDialog from './guardian-credential-email-dialog';

const mocks = vi.hoisted(() => ({
  snapshot: {} as any,
  save: vi.fn(),
  enable: vi.fn(),
  success: vi.fn(),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: mocks.success } }));
vi.mock('src/components/customDialog', () => ({
  default: ({ children, title }: any) => (
    <div role="dialog" aria-label={title}>
      {children}
    </div>
  ),
  DialogScrollContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('src/redux/student/records/student-record-changes-api', () => ({
  useGetStudentRecordSnapshotQuery: () => mocks.snapshot,
  useCreateStudentRecordChangeMutation: () => [mocks.save, { isLoading: false }],
}));
vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useEnableGuardianCredentialEmailMutation: () => [mocks.enable, { isLoading: false }],
}));

const family = {
  fatherDetails: {
    fullName: 'Test Father',
    email: null,
    contactNo: '9000000001',
    localAddress: null,
  },
  motherDetails: { fullName: 'Test Mother', email: 'mother@example.test' },
  guardianDetails: null,
  siblingStudentIds: ['sibling-1'],
};
beforeEach(() => {
  vi.clearAllMocks();
  mocks.snapshot = {
    currentData: { section: 'family', snapshot: 'family-version', data: family },
    refetch: vi.fn(),
  };
  mocks.save.mockReturnValue({ unwrap: async () => ({ id: 'change-1', status: 'Applied' }) });
  mocks.enable.mockReturnValue({ unwrap: async () => ({ id: 'case-1' }) });
});

describe('Case-scoped guardian email corrections', () => {
  it('explains the activation prerequisite instead of offering an ineffective retry', () => {
    mocks.snapshot = {
      isError: true,
      error: { status: 400, data: { code: 'Students:Records:OnboardingIncomplete' } },
      refetch: vi.fn(),
    };
    render(
      <GuardianProfileEmailDialog
        studentId="student-1"
        relationship="father"
        caseLabel="APP-1"
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Activate the student before correcting family details in Student Records.'
    );
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it('changes only Father email through the audited Records command', async () => {
    const onSaved = vi.fn();
    render(
      <GuardianProfileEmailDialog
        studentId="student-1"
        relationship="father"
        caseLabel="Test Student · APP-1"
        onClose={vi.fn()}
        onSaved={onSaved}
      />
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'Profile email' }), {
      target: { value: 'father@example.test' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Correction reason' }), {
      target: { value: 'Father confirmed the mailbox' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save correction' }));
    await waitFor(() => expect(mocks.save).toHaveBeenCalledOnce());
    expect(mocks.save).toHaveBeenCalledWith({
      studentId: 'student-1',
      section: 'family',
      clientKey: expect.any(String),
      expectedSnapshot: 'family-version',
      reason: 'Father confirmed the mailbox',
      payload: {
        ...family,
        fatherDetails: { ...family.fatherDetails, email: 'father@example.test' },
      },
    });
    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
    expect(family.fatherDetails.email).toBeNull();
    expect(mocks.enable).not.toHaveBeenCalled();
  });

  it('respects approval-required responses and retains data after a failed correction', async () => {
    mocks.save.mockReturnValueOnce({
      unwrap: async () => {
        throw Object.assign(new Error('Profile changed'), {
          data: {
            status: 400,
            errorCode: 'Students:Records:StaleSnapshot',
            data: { Reason: 'Reload the saved profile.' },
          },
        });
      },
    });
    const close = vi.fn();
    render(
      <GuardianProfileEmailDialog
        studentId="student-1"
        relationship="father"
        caseLabel="Test Student"
        onClose={close}
        onSaved={vi.fn()}
      />
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'Profile email' }), {
      target: { value: 'father@example.test' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Correction reason' }), {
      target: { value: 'Verified mailbox correction' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save correction' }));
    expect(await screen.findByText('Reload the saved profile.')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Profile email' })).toHaveValue(
      'father@example.test'
    );
    expect(close).not.toHaveBeenCalled();
    mocks.save.mockReturnValue({ unwrap: async () => ({ id: 'change-1', status: 'Pending' }) });
    fireEvent.click(screen.getByRole('button', { name: 'Save correction' }));
    await waitFor(() =>
      expect(mocks.success).toHaveBeenCalledWith({
        message: expect.stringContaining('after approval'),
      })
    );
  });

  it('requires a reason and enables only the selected case without invoking profile updates', async () => {
    render(
      <GuardianCredentialEmailDialog
        caseId="case-1"
        concurrencyStamp="case-version"
        caseLabel="APP-1"
        onClose={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Enable for this case' }));
    expect(await screen.findByText('Enter a correction reason.')).toBeInTheDocument();
    expect(mocks.enable).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole('textbox', { name: 'Correction reason' }), {
      target: { value: '  Approved case-only parent delivery  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enable for this case' }));
    await waitFor(() =>
      expect(mocks.enable).toHaveBeenCalledWith({
        id: 'case-1',
        concurrencyStamp: 'case-version',
        reason: 'Approved case-only parent delivery',
      })
    );
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it('blocks missing owner profiles and supports failed-read retry', () => {
    mocks.snapshot.currentData.data = { ...family, fatherDetails: null };
    const { unmount } = render(
      <GuardianProfileEmailDialog
        studentId="student-1"
        relationship="father"
        caseLabel="APP-1"
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: 'Save correction' })).toBeDisabled();
    unmount();
    mocks.snapshot = { isError: true, refetch: vi.fn() };
    render(
      <GuardianProfileEmailDialog
        studentId="student-1"
        relationship="father"
        caseLabel="APP-1"
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(mocks.snapshot.refetch).toHaveBeenCalledOnce();
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it('reports a Records apply conflict without claiming the email was saved', async () => {
    mocks.save.mockReturnValue({ unwrap: async () => ({ id: 'change-1', status: 'Conflict' }) });
    const close = vi.fn();
    render(
      <GuardianProfileEmailDialog
        studentId="student-1"
        relationship="father"
        caseLabel="APP-1"
        onClose={close}
        onSaved={vi.fn()}
      />
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'Profile email' }), {
      target: { value: 'father@example.test' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Correction reason' }), {
      target: { value: 'Verified mailbox correction' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save correction' }));
    expect(await screen.findByText(/recorded but could not be applied/)).toBeInTheDocument();
    expect(mocks.success).not.toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
  });
});
