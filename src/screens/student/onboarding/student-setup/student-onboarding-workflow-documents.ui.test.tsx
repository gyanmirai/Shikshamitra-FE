import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import StudentOnboardingWorkflowDocuments from './student-onboarding-workflow-documents';

const mocks = vi.hoisted(() => ({
  empty: false,
  original: vi.fn(() => ({ unwrap: () => Promise.resolve() })),
  upload: vi.fn(() => ({ unwrap: () => Promise.resolve() })),
  checklist: vi.fn(),
  summary: {
    applicationId: 'app-1',
    stageInstanceId: 'stage-1',
    concurrencyStamp: 'app-stamp',
    policy: null,
    requirements: [{ code: 'birth', name: 'Birth certificate', evidence: [] }],
  },
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
    success: vi.fn(),
  },
}));
vi.mock('./student-onboarding-documents', () => ({
  default: () => <div>Legacy requirements</div>,
}));
vi.mock('src/screens/student/admissions/document-verification/use-document-permissions', () => ({
  useDocumentPermissions: () => ({
    view: true,
    upload: true,
    original: true,
    review: true,
    waive: true,
    download: true,
  }),
}));
vi.mock('src/screens/student/admissions/document-verification/document-checklist-content', () => ({
  DocumentChecklistContent: ({
    permissions,
    readOnly,
    onAction,
  }: {
    permissions: { waive: boolean };
    readOnly: boolean;
    onAction: (action: string, requirement: unknown) => void;
  }) => {
    mocks.checklist({ permissions, readOnly, onAction });
    return (
      <div>
        Birth certificate
        {!readOnly && (
          <>
            <button
              type="button"
              onClick={() => onAction('original', mocks.summary.requirements[0])}
            >
              Record physical original
            </button>
            <button type="button" onClick={() => onAction('upload', mocks.summary.requirements[0])}>
              Upload document
            </button>
          </>
        )}
      </div>
    );
  },
}));
vi.mock('src/components/customDialog', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div role="dialog">{children}</div>,
  DialogScrollContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useGetStudentOnboardingWorkflowDocumentsQuery: () => ({
    data: mocks.empty ? [] : [mocks.summary],
  }),
  useRecordStudentOnboardingWorkflowOriginalMutation: () => [mocks.original],
  useUploadStudentOnboardingWorkflowDocumentMutation: () => [mocks.upload],
  useReviewStudentOnboardingWorkflowDocumentMutation: () => [vi.fn()],
}));
beforeEach(() => {
  mocks.empty = false;
  mocks.checklist.mockClear();
  mocks.original.mockClear();
  mocks.upload.mockClear();
});
it('reuses Offering requirements and disables the waiver capability', () => {
  render(<StudentOnboardingWorkflowDocuments caseId="case-1" canManage />);
  expect(screen.getByText('Birth certificate')).toBeInTheDocument();
  expect(mocks.checklist).toHaveBeenCalledWith(
    expect.objectContaining({ permissions: expect.objectContaining({ waive: false }) })
  );
});
it('records originals using the captured application evidence stamp', async () => {
  render(<StudentOnboardingWorkflowDocuments caseId="case-1" canManage />);
  fireEvent.click(screen.getByRole('button', { name: 'Record physical original' }));
  fireEvent.change(screen.getByLabelText(/Original verification notes/), {
    target: { value: 'Physical birth certificate checked' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() =>
    expect(mocks.original).toHaveBeenCalledWith({
      id: 'case-1',
      stageId: 'stage-1',
      code: 'birth',
      concurrencyStamp: 'app-stamp',
      notes: 'Physical birth certificate checked',
    })
  );
});

it('shows the selected file before submitting through the shared Admission upload fields', async () => {
  render(<StudentOnboardingWorkflowDocuments caseId="case-1" canManage />);
  fireEvent.click(screen.getByRole('button', { name: 'Upload document' }));
  const file = new File(['birth certificate'], 'birth-certificate.pdf', {
    type: 'application/pdf',
  });
  fireEvent.change(screen.getByLabelText(/Document/), { target: { files: [file] } });
  expect(screen.getByRole('status')).toHaveTextContent('Selected file: birth-certificate.pdf');
  expect(mocks.upload).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() =>
    expect(mocks.upload).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'case-1',
        stageId: 'stage-1',
        code: 'birth',
        concurrencyStamp: 'app-stamp',
        file,
      })
    )
  );
});
it('shows a read-only checklist to Onboarding viewers', () => {
  render(<StudentOnboardingWorkflowDocuments caseId="case-1" canManage={false} />);
  expect(
    screen.queryByRole('button', { name: 'Record physical original' })
  ).not.toBeInTheDocument();
});
it('keeps a frozen empty Offering checklist separate from legacy school requirements', () => {
  mocks.empty = true;
  render(
    <StudentOnboardingWorkflowDocuments caseId="case-1" canManage hasDocumentRequirementsSnapshot />
  );
  expect(
    screen.getByText('This Offering has no required documents.', { exact: false })
  ).toBeVisible();
  expect(screen.queryByText('Legacy requirements')).not.toBeInTheDocument();
  expect(mocks.checklist).not.toHaveBeenCalled();
});
it('uses the legacy checklist only for a case without a frozen document snapshot', () => {
  mocks.empty = true;
  render(
    <StudentOnboardingWorkflowDocuments
      caseId="case-1"
      canManage
      hasDocumentRequirementsSnapshot={false}
    />
  );
  expect(screen.getByText('Legacy requirements')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
