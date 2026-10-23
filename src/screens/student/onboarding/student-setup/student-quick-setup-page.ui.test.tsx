import type { StudentOnboardingCase } from 'src/redux/student/onboarding/student-onboarding-types';

import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, render, screen, within, waitFor, fireEvent } from '@testing-library/react';

import StudentQuickSetupPage from './student-quick-setup-page';
import { mapOnboardingCaseToItem } from './student-onboarding-model';

const mocks = vi.hoisted(() => ({
  current: undefined as StudentOnboardingCase | undefined,
  academicLoading: false,
  academicBusy: false,
  academicDirty: true,
  readError: false,
  permissionDenied: false,
  saveAcademic: vi.fn(),
  saveFees: vi.fn(),
  getCase: vi.fn(),
  previewActivation: vi.fn(),
  activate: vi.fn(),
  sendCredentials: vi.fn(),
  success: vi.fn(),
  events: [] as string[],
}));

vi.mock('src/components/iconify', () => ({
  Iconify: () => <span />,
}));
vi.mock('src/components/scrollbar', async () => {
  const { forwardRef } = await import('react');
  return {
    Scrollbar: forwardRef<HTMLDivElement, { children: React.ReactNode }>(({ children }, ref) => (
      <div ref={ref}>{children}</div>
    )),
  };
});
vi.mock('src/components/form-section-card', () => ({
  FormSectionCard: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section aria-label={title}>
      <h3>{title}</h3>
      {children}
    </section>
  ),
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
    success: mocks.success,
  },
}));
vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useLazyGetStudentOnboardingCaseQuery: () => [mocks.getCase],
  useLazyPreviewStudentOnboardingActivationQuery: () => [mocks.previewActivation],
  useActivateStudentOnboardingMutation: () => [mocks.activate],
}));
vi.mock('./use-student-quick-setup-academic', () => ({
  useStudentQuickSetupAcademic: () => ({
    caseData: mocks.current,
    busy: mocks.academicBusy,
    loading: mocks.academicLoading,
    dirty: mocks.academicDirty,
    readError: mocks.readError,
    permissionDenied: mocks.permissionDenied,
    retry: vi.fn(),
    save: mocks.saveAcademic,
  }),
}));
vi.mock('./student-quick-setup-academic', () => ({
  default: () => (
    <section aria-label="Class & Numbers">
      <h3>Class & Numbers</h3>
    </section>
  ),
}));
vi.mock('./student-onboarding-fees', async () => {
  const { useEffect, useImperativeHandle } = await import('react');
  return {
    default: function MockFeeEditor({
      editorRef,
      onStateChange,
    }: {
      editorRef: React.Ref<{ save: typeof mocks.saveFees }>;
      onStateChange: (state: {
        dirty: boolean;
        busy: boolean;
        loading: boolean;
        canSave: boolean;
      }) => void;
    }) {
      useImperativeHandle(editorRef, () => ({ save: mocks.saveFees }));
      useEffect(() => {
        onStateChange({ dirty: false, busy: false, loading: false, canSave: true });
      }, [onStateChange]);
      return <p>Published fee structure</p>;
    },
  };
});
vi.mock('./student-onboarding-portal-accounts', () => ({
  default: ({
    onBusyChange,
    canManage,
  }: {
    onBusyChange: (busy: boolean) => void;
    canManage: boolean;
  }) => (
    <>
      <button type="button" disabled={!canManage} onClick={mocks.sendCredentials}>
        Send Credentials
      </button>
      <button type="button" onClick={() => onBusyChange(true)}>
        Start credential request
      </button>
      <button type="button" onClick={() => onBusyChange(false)}>
        Finish credential request
      </button>
    </>
  ),
}));
vi.mock('./student-onboarding-workflow-documents', () => ({
  default: () => <p>Admission document verification</p>,
}));

const makeCase = (overrides: Partial<StudentOnboardingCase> = {}): StudentOnboardingCase => ({
  id: 'case-1',
  documentUploadsEnabled: true,
  concurrencyStamp: 'initial-stamp',
  applicationId: 'application-1',
  applicationNumber: 'APP-2026-000005',
  applicantId: 'applicant-1',
  studentId: 'student-1',
  studentName: 'Aarav UXTest',
  offeringId: 'offering-1',
  offeringCode: 'OFFER-1',
  academicYearId: 'year-1',
  academicYearName: '2026-2027',
  intendedBoardId: 'board-1',
  intendedBoardName: 'CBSE',
  intendedMediumId: 'medium-1',
  intendedMediumName: 'English',
  intendedStageId: 'stage-1',
  intendedStandardId: 'class-1',
  intendedStandardName: 'Class 1',
  status: 1,
  dueAt: '2026-10-19T00:00:00Z',
  isHistoricalBackfill: false,
  divisionId: 'division-a',
  divisionName: 'A',
  grNumber: 'GR-0001',
  rollNumber: 8,
  progressPercent: 80,
  isOverdue: false,
  steps: [],
  events: [],
  ...overrides,
});

const renderPage = (overrides = {}) => {
  const props = {
    student: mapOnboardingCaseToItem(makeCase()),
    canManage: true,
    academicYearId: 'year-1',
    onClose: vi.fn(),
    onShowDetails: vi.fn(),
    onStateChange: vi.fn(),
    ...overrides,
  };
  return { ...render(<StudentQuickSetupPage {...props} />), props };
};

describe('single-student setup page', () => {
  beforeEach(() => {
    mocks.readError = false;
    mocks.permissionDenied = false;
    vi.clearAllMocks();
    mocks.current = makeCase();
    mocks.academicLoading = false;
    mocks.academicBusy = false;
    mocks.academicDirty = true;
    mocks.events = [];
    mocks.saveAcademic.mockImplementation(async () => {
      mocks.events.push('academic');
      return makeCase({ concurrencyStamp: 'academic-stamp' });
    });
    mocks.saveFees.mockImplementation(async () => {
      mocks.events.push('fees');
    });
    mocks.getCase.mockImplementation(() => ({
      unwrap: async () => {
        mocks.events.push('reload');
        return mocks.current;
      },
    }));
    mocks.previewActivation.mockImplementation(() => ({
      unwrap: async () => {
        mocks.events.push('preview');
        return makeCase({ status: 2, concurrencyStamp: 'preview-stamp' });
      },
    }));
    mocks.activate.mockImplementation(() => ({
      unwrap: async () => {
        mocks.events.push('activate');
        mocks.current = makeCase({ studentEnrollmentId: 'enrollment-1', status: 4 });
        return mocks.current;
      },
    }));
  });

  it('keeps academic fields, fees and App Login in one page with the lifecycle actions', () => {
    const { container } = renderPage();
    expect(screen.getByRole('heading', { name: 'Aarav UXTest' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Class & Numbers' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Fees' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'App Login' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save for Later' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Save & Activate' })).toBeEnabled();
    expect(screen.getByRole('heading', { name: 'Admission & Documents' })).toBeInTheDocument();
    expect(screen.queryByText(/Route:/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back to Students' })).toBeEnabled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(container.querySelector('[aria-modal]')).toBeNull();
    expect(mocks.sendCredentials).not.toHaveBeenCalled();
  });

  it('returns keyboard focus to the initiating action after the page unmounts', async () => {
    const opener = document.createElement('button');
    opener.textContent = 'Open setup';
    document.body.append(opener);
    opener.focus();
    const { unmount } = renderPage();
    unmount();
    await waitFor(() => expect(opener).toHaveFocus());
    opener.remove();
  });

  it('places Details & History in the student name plate and opens it without submitting', () => {
    const { props } = renderPage();
    const namePlate = screen.getByRole('heading', { name: 'Aarav UXTest' }).closest('header')!;
    const openDetails = within(namePlate).getByRole('button', { name: 'Details & History' });
    expect(within(namePlate).getByText('Setup pending')).toBeInTheDocument();
    expect(
      within(screen.getByRole('region', { name: 'Admission & Documents' })).queryByRole('button', {
        name: 'Details & History',
      })
    ).not.toBeInTheDocument();
    fireEvent.click(openDetails);
    expect(props.onShowDetails).toHaveBeenCalledOnce();
    expect(mocks.saveAcademic).not.toHaveBeenCalled();
    expect(mocks.activate).not.toHaveBeenCalled();
    expect(mocks.sendCredentials).not.toHaveBeenCalled();
  });

  it('locks Details & History while a request is pending or admission details fail to load', () => {
    const { rerender, props } = renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Start credential request' }));
    expect(screen.getByRole('button', { name: 'Details & History' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Finish credential request' }));
    mocks.readError = true;
    rerender(<StudentQuickSetupPage {...props} />);
    expect(screen.getByRole('button', { name: 'Details & History' })).toBeDisabled();
  });

  it('groups only Class & Numbers and App Login on top, followed by full-width Fees and Documents', () => {
    const { container } = renderPage();
    const academic = container.querySelector('#quick-setup-academic')!;
    const login = container.querySelector('#quick-setup-login')!;
    const fees = container.querySelector('#quick-setup-fees')!;
    const documents = screen.getByRole('region', { name: 'Admission & Documents' });

    expect(academic.parentElement).toBe(login.parentElement);
    expect(academic.parentElement?.children).toHaveLength(2);
    expect(fees.parentElement).not.toBe(academic.parentElement);
    expect(fees.parentElement).toBe(academic.parentElement?.parentElement);
    expect(academic.compareDocumentPosition(login)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(login.compareDocumentPosition(fees)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(fees.compareDocumentPosition(documents)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('withholds saved student details and forms when case access is denied', () => {
    mocks.permissionDenied = true;
    mocks.readError = true;
    renderPage();
    expect(screen.queryByText('Aarav UXTest')).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'App Login' })).not.toBeInTheDocument();
    expect(screen.getByText('no longer available', { exact: false })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Back to Students' })).toBeEnabled();
    expect(mocks.activate).not.toHaveBeenCalled();
  });

  it('disables saving when a cached case refresh fails', () => {
    mocks.readError = true;
    renderPage();
    expect(screen.getByRole('button', { name: 'Save & Activate' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save for Later' })).toBeDisabled();
  });

  it('saves and activates in order using the fresh preview stamp, keeps the page open and never sends credentials automatically', async () => {
    const { props } = renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Save & Activate' }));
    await waitFor(() => expect(screen.getByText('Student active')).toBeInTheDocument());

    expect(mocks.events).toEqual(['academic', 'fees', 'preview', 'activate']);
    expect(mocks.saveFees).toHaveBeenCalledWith({ allowIncomplete: false });
    expect(mocks.previewActivation).toHaveBeenCalledWith('case-1', false);
    expect(mocks.activate).toHaveBeenCalledWith({
      id: 'case-1',
      concurrencyStamp: 'preview-stamp',
      idempotencyKey: expect.any(String),
    });
    expect(props.onClose).not.toHaveBeenCalled();
    expect(mocks.sendCredentials).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Send Credentials' }));
    expect(mocks.sendCredentials).toHaveBeenCalledOnce();
  });

  it('Save for Later persists work and reloads without activation or credential delivery', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Save for Later' }));
    await waitFor(() =>
      expect(mocks.success).toHaveBeenCalledWith({ message: 'Student setup saved.' })
    );

    expect(mocks.saveFees).toHaveBeenCalledWith({ allowIncomplete: true });
    expect(mocks.getCase).toHaveBeenCalledWith('case-1', false);
    expect(mocks.previewActivation).not.toHaveBeenCalled();
    expect(mocks.activate).not.toHaveBeenCalled();
    expect(mocks.sendCredentials).not.toHaveBeenCalled();
  });

  it('shows save errors, leaves the page open and permits an explicit retry', async () => {
    const { props } = renderPage();
    mocks.saveAcademic.mockRejectedValueOnce(
      new Error('Choose a division with available capacity.')
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save & Activate' }));
    await waitFor(() =>
      expect(
        screen.getByText('Choose a division with available capacity.', { exact: false })
      ).toBeVisible()
    );
    expect(mocks.saveFees).not.toHaveBeenCalled();
    expect(mocks.activate).not.toHaveBeenCalled();
    expect(props.onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Save & Activate' }));
    await waitFor(() => expect(screen.getByText('Student active')).toBeInTheDocument());
    expect(mocks.activate).toHaveBeenCalledOnce();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows authoritative activation blockers without activating the student', async () => {
    renderPage();
    mocks.previewActivation.mockImplementation(() => ({
      unwrap: async () =>
        makeCase({
          status: 1,
          lastError: 'Verify the required transfer certificate.',
        }),
    }));
    fireEvent.click(screen.getByRole('button', { name: 'Save & Activate' }));
    await waitFor(() =>
      expect(
        screen.getByText('Verify the required transfer certificate.', { exact: false })
      ).toBeVisible()
    );
    expect(mocks.activate).not.toHaveBeenCalled();
  });

  it('does not expose activation actions without management permission', () => {
    renderPage({ canManage: false });
    expect(screen.queryByRole('button', { name: 'Save & Activate' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save for Later' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back to Students' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Send Credentials' })).toBeDisabled();
    expect(mocks.activate).not.toHaveBeenCalled();
  });

  it('locks dismissal and footer actions during a credential request and restores them afterwards', () => {
    const { props } = renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Start credential request' }));
    expect(screen.getByRole('button', { name: 'Back to Students' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save & Activate' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save for Later' })).toBeDisabled();
    expect(props.onStateChange).toHaveBeenLastCalledWith({ dirty: true, busy: true });
    expect(props.onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Finish credential request' }));
    expect(screen.getByRole('button', { name: 'Back to Students' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Save & Activate' })).toBeEnabled();
  });

  it('locks close and duplicate submissions while Save & Activate is pending', async () => {
    const { props } = renderPage();
    let resolveAcademic!: (value: StudentOnboardingCase) => void;
    mocks.saveAcademic.mockReturnValue(
      new Promise<StudentOnboardingCase>((resolve) => {
        resolveAcademic = resolve;
      })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save & Activate' }));
    expect(screen.getByRole('button', { name: 'Back to Students' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save for Later' })).toBeDisabled();
    expect(
      screen.getByRole('progressbar', { name: 'Saving and activating student' })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save & Activate' }));
    expect(mocks.saveAcademic).toHaveBeenCalledOnce();
    expect(props.onClose).not.toHaveBeenCalled();
    await act(async () => resolveAcademic(makeCase()));
    await waitFor(() => expect(screen.getByText('Student active')).toBeInTheDocument());
  });

  it('disables saves and credentials when the selected academic year no longer matches', () => {
    renderPage({ academicYearId: 'different-year' });
    expect(
      screen.getByText(
        'The academic year changed. Close this student and reopen it in the correct year.'
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save & Activate' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save for Later' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Send Credentials' })).toBeDisabled();
    expect(mocks.activate).not.toHaveBeenCalled();
  });

  it('retains active enrollment with access pending and offers Next Student without repeating activation', async () => {
    const onNext = vi.fn();
    mocks.current = makeCase({ studentEnrollmentId: 'enrollment-1', status: 3 });
    renderPage({ onNext });
    expect(screen.getByText('Student active')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save & Activate' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next Student' }));
    expect(onNext).toHaveBeenCalledOnce();
    expect(mocks.activate).not.toHaveBeenCalled();
    expect(mocks.sendCredentials).not.toHaveBeenCalled();
  });
});
