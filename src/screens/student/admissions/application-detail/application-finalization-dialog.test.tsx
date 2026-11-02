import type { ReactNode } from 'react';
import type { AdmissionFinalizationPreview } from 'src/redux/student/admissions/admission-applications-api';

import { vi, it, expect, describe, beforeEach } from 'vitest';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import { ApplicationFinalizationDialog } from './application-finalization-dialog';

const permissions = vi.hoisted(() => ({
  values: [
    { name: 'Students.Admissions.Applicants.View', isGranted: true },
    { name: 'Students.Admissions.Applicants.Add', isGranted: true },
  ],
}));
vi.mock('react-redux', () => ({
  useSelector: (select: any) => select({ auth: { permissions: permissions.values } }),
}));
vi.mock('src/components/label', () => ({
  Label: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));
vi.mock('./application-form-correction-drawer', () => ({
  ApplicationFormCorrectionDrawer: ({ open, applicationId, onSaved, onRefresh, onClose }: any) =>
    open ? (
      <div role="dialog" aria-label="Edit Application Form" data-application-id={applicationId}>
        <button type="button" onClick={onClose}>
          Cancel correction
        </button>
        <button
          type="button"
          onClick={() => {
            onSaved();
            onClose();
          }}
        >
          Save correction
        </button>
        <button
          type="button"
          onClick={() => {
            onRefresh();
            onClose();
          }}
        >
          Refresh unconfirmed correction
        </button>
      </div>
    ) : null,
}));
vi.mock('./application-applicant-identity-dialog', () => ({
  ApplicationApplicantIdentityDialog: ({
    open,
    onClose,
    onUpdated,
  }: {
    open: boolean;
    onClose: () => void;
    onUpdated: () => void;
  }) =>
    open ? (
      <div role="dialog" aria-label="Edit Applicant Identity">
        <button type="button" onClick={onClose}>
          Cancel repair
        </button>
        <button
          type="button"
          onClick={() => {
            onUpdated();
            onClose();
          }}
        >
          Save identity
        </button>
      </div>
    ) : null,
}));

vi.mock('src/components/iconify', () => ({
  Iconify: () => null,
}));

vi.mock('src/components/loading-button', () => ({
  LoadingButton: ({
    children,
    loading,
    loadingPosition: _loadingPosition,
    startIcon: _startIcon,
    ...props
  }: any) => (
    <button type="button" data-loading={String(loading)} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('src/components/customDialog', () => ({
  default: ({
    open,
    title,
    titleInfo,
    children,
  }: {
    open: boolean;
    title: string;
    titleInfo?: string;
    children: ReactNode;
  }) =>
    open ? (
      <div>
        <h2>{title}</h2>
        {titleInfo && (
          <button type="button" aria-label={`${title} information`} title={titleInfo}>
            Info
          </button>
        )}
        {children}
      </div>
    ) : null,
  DialogScrollContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

const readyPreview: AdmissionFinalizationPreview = {
  applicationId: 'application-1',
  isReady: true,
  linkedStudentId: null,
  possibleMatches: [],
  items: [
    { key: 'offer', label: 'Accepted, unexpired offer', passed: true, detail: 'Ready' },
    { key: 'workflow', label: 'Admission workflow completed', passed: true, detail: 'Ready' },
    { key: 'identity', label: 'Core identity complete', passed: true, detail: 'Ready' },
    { key: 'guardian', label: 'Primary guardian contact available', passed: true, detail: 'Ready' },
    {
      key: 'duplicate_resolution',
      label: 'Student identity resolved',
      passed: true,
      detail: 'Ready',
    },
  ],
};

const renderDialog = (
  preview: AdmissionFinalizationPreview | undefined,
  onSubmit = vi.fn().mockResolvedValue(false),
  overrides: Partial<Parameters<typeof ApplicationFinalizationDialog>[0]> = {}
) => {
  render(
    <ApplicationFinalizationDialog
      open
      applicantId="applicant-1"
      busy={false}
      preview={preview}
      loading={false}
      hasError={false}
      onRetry={vi.fn()}
      onClose={vi.fn()}
      onSubmit={onSubmit}
      {...overrides}
    />
  );
  return onSubmit;
};

describe('ApplicationFinalizationDialog', () => {
  beforeEach(() => {
    permissions.values = [
      { name: 'Students.Admissions.Applicants.View', isGranted: true },
      { name: 'Students.Admissions.Applicants.Add', isGranted: true },
    ];
  });
  const correctionContext = {
    applicationId: 'application-1',
    application: {
      applicantName: 'Approved applicant',
      applicationNumber: 'APP-46',
      offeringCode: 'CLASS-8',
      status: 6 as const,
    },
  };
  const grantCorrection = () => {
    permissions.values.push(
      { name: 'Students.Admissions.Applications.View', isGranted: true },
      { name: 'Students.Admissions.Applications.Add', isGranted: true }
    );
  };

  it('opens the correct approved application form and retains confirmations when correction is cancelled', () => {
    grantCorrection();
    const onRetry = vi.fn();
    const onFormCorrected = vi.fn();
    renderDialog(readyPreview, undefined, { ...correctionContext, onRetry, onFormCorrected });
    fireEvent.click(screen.getByLabelText(/I verified the primary guardian/));
    fireEvent.click(screen.getByRole('button', { name: 'Edit application form' }));
    expect(screen.getByRole('dialog', { name: 'Edit Application Form' })).toHaveAttribute(
      'data-application-id',
      'application-1'
    );
    expect(screen.queryByRole('heading', { name: 'Finalize Admission' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel correction' }));
    expect(screen.getByLabelText(/I verified the primary guardian/)).toBeChecked();
    expect(onRetry).not.toHaveBeenCalled();
    expect(onFormCorrected).not.toHaveBeenCalled();
  });

  it('resets identity, guardian and profile review after correction and requests fresh finalization checks', () => {
    grantCorrection();
    const onRetry = vi.fn();
    const onFormCorrected = vi.fn();
    renderDialog(
      {
        ...readyPreview,
        possibleMatches: [
          {
            studentId: 'student-1',
            studentName: 'Existing Student',
            dateOfBirth: '2016-04-12',
            status: 8,
            grNumber: 'GR-42',
            academicYearId: 'year',
          },
        ],
        capturedStudentFields: [{ key: 'Medical.Allergies', label: 'Allergies', value: 'Peanuts' }],
      },
      undefined,
      { ...correctionContext, onRetry, onFormCorrected }
    );
    fireEvent.click(screen.getByLabelText(/Existing Student/));
    fireEvent.click(screen.getByLabelText(/I verified the primary guardian/));
    fireEvent.click(
      screen.getByLabelText(/Submit these admission details for Student profile review/)
    );
    expect(screen.getByRole('button', { name: 'Finalize admission' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Edit application form' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save correction' }));
    expect(onFormCorrected).toHaveBeenCalledOnce();
    expect(onRetry).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Existing Student/)).not.toBeChecked();
    expect(screen.getByLabelText(/I verified the primary guardian/)).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Finalize admission' })).toBeDisabled();
    fireEvent.click(screen.getByLabelText(/Existing Student/));
    expect(
      screen.getByLabelText(/Submit these admission details for Student profile review/)
    ).not.toBeChecked();
  });

  it('refreshes unconfirmed correction without resetting the finalization request as a successful save', () => {
    grantCorrection();
    const onRetry = vi.fn();
    const onFormCorrected = vi.fn();
    renderDialog(readyPreview, undefined, { ...correctionContext, onRetry, onFormCorrected });
    fireEvent.click(screen.getByLabelText(/I verified the primary guardian/));
    fireEvent.click(screen.getByRole('button', { name: 'Edit application form' }));
    fireEvent.click(screen.getByRole('button', { name: 'Refresh unconfirmed correction' }));
    expect(onRetry).toHaveBeenCalledOnce();
    expect(onFormCorrected).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/I verified the primary guardian/)).not.toBeChecked();
  });

  it.each([0, 2, 3, 9, 10, 11] as const)(
    'does not offer form correction in closed or Draft status %s',
    (status) => {
      grantCorrection();
      renderDialog(readyPreview, undefined, {
        ...correctionContext,
        application: { ...correctionContext.application, status },
      });
      expect(
        screen.queryByRole('button', { name: 'Edit application form' })
      ).not.toBeInTheDocument();
    }
  );

  it.each(['Students.Admissions.Applications.View', 'Students.Admissions.Applications.Add'])(
    'requires the exact %s grant for correction',
    (grant) => {
      grantCorrection();
      permissions.values = permissions.values.filter((permission) => permission.name !== grant);
      renderDialog(readyPreview, undefined, correctionContext);
      expect(
        screen.queryByRole('button', { name: 'Edit application form' })
      ).not.toBeInTheDocument();
    }
  );

  it('does not offer form correction without application identity', () => {
    grantCorrection();
    renderDialog(readyPreview, undefined, { application: correctionContext.application });
    expect(screen.queryByRole('button', { name: 'Edit application form' })).not.toBeInTheDocument();
  });

  it.each([{ busy: true }, { loading: true }, { hasError: true }])(
    'locks form correction while finalization is unavailable: %s',
    (state) => {
      grantCorrection();
      renderDialog(readyPreview, undefined, { ...correctionContext, ...state });
      expect(screen.getByRole('button', { name: 'Edit application form' })).toBeDisabled();
    }
  );
  it('retains optional finalization when profile-review access is unavailable', async () => {
    const onSubmit = renderDialog({
      ...readyPreview,
      linkedStudentId: 'student-1',
      canReviewProfileFields: false,
      profileReviewDescription: 'Identity details require separate Identity Compliance review.',
      capturedStudentFields: [{ key: 'Medical.Allergies', label: 'Allergies', value: 'Peanuts' }],
    });
    expect(
      screen.getByLabelText(/Submit these admission details for Student profile review/)
    ).toBeDisabled();
    expect(
      screen.getByText(/Identity details require separate Identity Compliance review/)
    ).toBeVisible();
    fireEvent.click(screen.getByLabelText(/I verified the primary guardian/));
    fireEvent.click(screen.getByRole('button', { name: 'Finalize admission' }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          existingStudentId: 'student-1',
          applyStudentProfileFields: false,
        })
      )
    );
  });
  it('requires explicit opt-in to submit captured details for an existing Student profile review', async () => {
    const onSubmit = renderDialog({
      ...readyPreview,
      linkedStudentId: 'student-1',
      canApplyProfileFieldsDirectly: false,
      capturedStudentFields: [
        { key: 'Identity.AadhaarNumber', label: 'Aadhaar number', value: '123456789012' },
        { key: 'Applicant.ProfilePhoto', label: 'Student profile photo', value: 'Photo provided' },
      ],
    });
    const review = screen.getByLabelText(
      /Submit these admission details for Student profile review/
    );
    expect(review).not.toBeChecked();
    expect(screen.getByText(/remain until the Student Records review is approved/)).toBeVisible();
    expect(screen.getByText('Photo provided')).toBeVisible();
    fireEvent.click(review);
    fireEvent.click(screen.getByLabelText(/I verified the primary guardian/));
    fireEvent.click(screen.getByRole('button', { name: 'Finalize admission' }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ existingStudentId: 'student-1', applyStudentProfileFields: true })
      )
    );
  });

  it('offers direct reviewed application only when the selected existing Student supports it', () => {
    renderDialog({
      ...readyPreview,
      linkedStudentId: 'student-1',
      canApplyProfileFieldsDirectly: true,
      capturedStudentFields: [
        { key: 'Family.IsSingleChild', label: 'Single child', value: 'true' },
      ],
    });
    expect(
      screen.getByLabelText(/Apply these reviewed details to the Student profile/)
    ).not.toBeChecked();
  });
  it('keeps finalization disabled when a non-duplicate readiness gate fails', () => {
    renderDialog({
      ...readyPreview,
      isReady: false,
      items: readyPreview.items.map((item) =>
        item.key === 'workflow'
          ? { ...item, passed: false, detail: 'Complete the workflow.' }
          : item
      ),
    });

    expect(screen.getByRole('button', { name: 'Finalize admission' })).toBeDisabled();
    expect(screen.getByText('Complete the workflow.')).toBeInTheDocument();
  });

  it('requires an explicit duplicate match and guardian verification before reusing a student', async () => {
    const onSubmit = renderDialog({
      ...readyPreview,
      isReady: false,
      items: readyPreview.items.map((item) =>
        item.key === 'duplicate_resolution' ? { ...item, passed: false } : item
      ),
      possibleMatches: [
        {
          studentId: 'student-1',
          studentName: 'Aarav Patel',
          dateOfBirth: '2016-04-12',
          status: 8,
          grNumber: 'GR-1042',
          academicYearId: 'academic-year-1',
        },
      ],
    });
    const submit = screen.getByRole('button', { name: 'Finalize admission' });
    expect(submit).toBeDisabled();

    fireEvent.click(screen.getByLabelText(/Aarav Patel/));
    fireEvent.click(screen.getByLabelText(/I verified the primary guardian/));
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        existingStudentId: 'student-1',
        confirmCreateNew: false,
        confirmGuardianContactVerified: true,
      })
    );
  });

  it('defaults to creating a new identity only when no possible match exists', async () => {
    const onSubmit = renderDialog(readyPreview);
    fireEvent.click(screen.getByLabelText(/I verified the primary guardian/));
    fireEvent.click(screen.getByRole('button', { name: 'Finalize admission' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        existingStudentId: undefined,
        confirmCreateNew: true,
        confirmGuardianContactVerified: true,
      })
    );
  });

  it('clearly communicates that operational enrollment data is not created', () => {
    renderDialog(readyPreview);
    expect(screen.getByRole('heading', { name: 'Finalize Admission' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Finalize Admission information' })).toHaveAttribute(
      'title',
      expect.stringContaining(
        'does not assign a class division, seat, GR number, roll number, fees, or login account'
      )
    );
    expect(screen.getByText('Onboarding handover')).toBeVisible();
    expect(
      screen.getByText(/Finalizing creates or links a Student identity and an Onboarding case/)
    ).toBeVisible();
    expect(
      screen.getByText(
        /Placement, GR and roll numbers, fees and accounts are completed in Student Onboarding/
      )
    ).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('repairs incomplete identity inside the workspace and returns without losing confirmations on cancel', () => {
    renderDialog({
      ...readyPreview,
      isReady: false,
      items: readyPreview.items.map((item) =>
        item.key === 'identity' ? { ...item, passed: false, detail: 'Gender is missing.' } : item
      ),
    });

    fireEvent.click(screen.getByLabelText(/I verified the primary guardian/));
    fireEvent.click(screen.getByRole('button', { name: 'Repair applicant identity' }));
    expect(screen.getByRole('dialog', { name: 'Edit Applicant Identity' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Finalize Admission' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel repair' }));
    expect(screen.getByLabelText(/I verified the primary guardian/)).toBeChecked();
  });

  it('uses actual applicant and application context without inventing an offer or success', () => {
    renderDialog(readyPreview, undefined, {
      application: {
        applicantName: 'Real Applicant',
        applicationNumber: 'APP-42',
        offeringCode: 'GSEB-2',
        status: 4,
      },
    });
    expect(screen.getByText('Real Applicant')).toBeVisible();
    expect(screen.getByText('Application APP-42')).toBeVisible();
    expect(screen.queryByText('Offering GSEB-2')).not.toBeInTheDocument();
    expect(screen.getByText('In review')).toBeVisible();
    expect(screen.queryByText('Approved')).not.toBeInTheDocument();
    expect(screen.getAllByText('Ready')).toHaveLength(readyPreview.items.length);
  });

  it('keeps empty readiness blocked and retryable', () => {
    const onRetry = vi.fn();
    renderDialog({ ...readyPreview, items: [] }, undefined, { onRetry });
    fireEvent.click(screen.getByLabelText(/I verified the primary guardian/));
    expect(screen.getByRole('button', { name: 'Finalize admission' })).toBeDisabled();
    expect(screen.getByText(/Finalization readiness is unavailable/)).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('requires the exact applicant view and edit grants before offering repair', () => {
    permissions.values = [{ name: 'Students.Admissions.Applicants.View', isGranted: true }];
    renderDialog({
      ...readyPreview,
      items: [
        {
          key: 'identity',
          label: 'Core identity complete',
          passed: false,
          detail: 'Gender is missing.',
        },
      ],
    });
    expect(screen.getByText('Gender is missing.')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Repair applicant identity' })
    ).not.toBeInTheDocument();
  });

  it('reloads readiness and resets confirmations only after a successful identity repair', () => {
    const onRetry = vi.fn();
    renderDialog(
      {
        ...readyPreview,
        linkedStudentId: 'student-1',
        capturedStudentFields: [{ key: 'Medical.Allergies', label: 'Allergies', value: 'Peanuts' }],
        items: [
          {
            key: 'identity',
            label: 'Core identity complete',
            passed: false,
            detail: 'Gender is missing.',
          },
        ],
      },
      undefined,
      { onRetry }
    );
    fireEvent.click(screen.getByLabelText(/I verified the primary guardian/));
    fireEvent.click(
      screen.getByLabelText(/Submit these admission details for Student profile review/)
    );
    fireEvent.click(screen.getByRole('button', { name: 'Repair applicant identity' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save identity' }));
    expect(onRetry).toHaveBeenCalledOnce();
    expect(screen.getByLabelText(/I verified the primary guardian/)).not.toBeChecked();
    expect(
      screen.getByLabelText(/Submit these admission details for Student profile review/)
    ).not.toBeChecked();
  });

  it('keeps loading, error and busy operations locked while preserving safe retry', () => {
    const onRetry = vi.fn();
    const rendered = render(
      <ApplicationFinalizationDialog
        open
        applicantId="applicant-1"
        busy={false}
        loading
        hasError={false}
        preview={readyPreview}
        onRetry={onRetry}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByRole('status', { name: 'Loading finalization readiness' })).toBeVisible();
    expect(screen.queryByText('Finalization checks')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/I verified the primary guardian/)).toBeDisabled();
    rendered.rerender(
      <ApplicationFinalizationDialog
        open
        applicantId="applicant-1"
        busy={false}
        loading={false}
        hasError
        preview={readyPreview}
        onRetry={onRetry}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByText('Finalization readiness could not be loaded.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Finalize admission' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();
    rendered.rerender(
      <ApplicationFinalizationDialog
        open
        applicantId="applicant-1"
        busy
        loading={false}
        hasError
        preview={readyPreview}
        onRetry={onRetry}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: 'Retry' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });

  it('does not label readiness preparation as a finalization write', () => {
    renderDialog(readyPreview, undefined, { busy: true, loading: true });
    expect(screen.getByRole('status', { name: 'Loading finalization readiness' })).toBeVisible();
    const finalize = screen.getByRole('button', { name: 'Finalize admission' });
    expect(finalize).toBeDisabled();
    expect(finalize).toHaveAttribute('data-loading', 'false');
    expect(screen.queryByText('Finalizing admission…')).not.toBeInTheDocument();
    expect(
      screen.queryByText('No additional Student profile details were captured.')
    ).not.toBeInTheDocument();
  });

  it('retains confirmation on failure and closes only after successful finalization', async () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    renderDialog(readyPreview, onSubmit, { onClose });
    fireEvent.click(screen.getByLabelText(/I verified the primary guardian/));
    fireEvent.click(screen.getByRole('button', { name: 'Finalize admission' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/I verified the primary guardian/)).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Finalize admission' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });

  it('shows immediate Finalizing feedback, prevents double submission and restores the form after failure', async () => {
    let finish!: (value: boolean) => void;
    const pending = new Promise<boolean>((resolve) => {
      finish = resolve;
    });
    const onSubmit = vi.fn(() => pending);
    const onClose = vi.fn();
    renderDialog(readyPreview, onSubmit, { presentation: 'inline', onClose });
    fireEvent.click(screen.getByLabelText(/I verified the primary guardian/));
    fireEvent.click(screen.getByRole('button', { name: 'Finalize admission' }));
    const button = screen.getByRole('button', { name: 'Finalizing admission…' });
    expect(button).toBeVisible();
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('data-loading', 'true');
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    fireEvent.click(button);
    expect(onSubmit).toHaveBeenCalledOnce();
    await act(async () => {
      finish(false);
      await pending;
    });
    expect(screen.getByRole('button', { name: 'Finalize admission' })).toBeEnabled();
    expect(screen.getByLabelText(/I verified the primary guardian/)).toBeChecked();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders inline readiness and Student details while preserving guardian and blocker gates', async () => {
    const onSubmit = vi.fn().mockResolvedValue(false);
    const onClose = vi.fn();
    renderDialog(
      {
        ...readyPreview,
        capturedStudentFields: [
          { key: 'School.PreviousSchool', label: 'Previous school', value: 'Sunrise School' },
        ],
      },
      onSubmit,
      { presentation: 'inline', onClose }
    );
    expect(screen.getByRole('heading', { name: 'Finalize admission' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Finalize admission' })).toHaveFocus();
    expect(screen.getByRole('heading', { name: 'Student record details' })).toBeVisible();
    expect(screen.getByText('Sunrise School')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Finalize admission' })).toBeDisabled();
    fireEvent.click(screen.getByLabelText(/I verified the primary guardian/));
    expect(screen.getByRole('button', { name: 'Finalize admission' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Finalize admission' }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        existingStudentId: undefined,
        confirmCreateNew: true,
        confirmGuardianContactVerified: true,
      })
    );
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
