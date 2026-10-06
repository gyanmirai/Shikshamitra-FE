import type { ReactNode } from 'react';
import type { AdmissionFinalizationPreview } from 'src/redux/student/admissions/admission-applications-api';

import { vi, it, expect, describe } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { ApplicationFinalizationDialog } from './application-finalization-dialog';

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
  default: ({ open, title, children }: { open: boolean; title: string; children: ReactNode }) =>
    open ? (
      <div>
        <h2>{title}</h2>
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
  onSubmit = vi.fn().mockResolvedValue(false)
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
    />
  );
  return onSubmit;
};

describe('ApplicationFinalizationDialog', () => {
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
    expect(
      screen.getByText(
        /does not assign a class division, seat, GR number, roll number, fees, or login account/i
      )
    ).toBeInTheDocument();
  });

  it('links incomplete identity readiness to the applicant repair screen', () => {
    renderDialog({
      ...readyPreview,
      isReady: false,
      items: readyPreview.items.map((item) =>
        item.key === 'identity' ? { ...item, passed: false, detail: 'Gender is missing.' } : item
      ),
    });

    expect(screen.getByRole('link', { name: 'Repair applicant identity' })).toHaveAttribute(
      'href',
      '/student/admissions/applicants/applicant-1'
    );
  });
});
