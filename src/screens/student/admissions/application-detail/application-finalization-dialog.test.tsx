import type { ReactNode } from 'react';
import type { AdmissionFinalizationPreview } from 'src/redux/student/admissions/admission-applications-api';

import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

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
  LoadingButton: ({ children, loading: _loading, startIcon: _startIcon, ...props }: any) => (
    <button type="button" {...props}>
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
    expect(screen.getByText(/hand this admission over to Student Onboarding/)).toBeVisible();
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
    expect(screen.getByText('Offering GSEB-2')).toBeVisible();
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
});
