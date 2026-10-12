import { vi, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import RecordDocumentFilters from './record-document-filters';

vi.mock('../records-student-picker', () => ({
  default: () => <div>Student picker</div>,
}));

it('shows selected student names and the Generate action on a certificate tab', async () => {
  const user = userEvent.setup();
  const focusStudent = vi.fn();
  const removeStudent = vi.fn();
  const preview = vi.fn();
  const issue = vi.fn();

  render(
    <RecordDocumentFilters
      kind="certificates"
      busy={false}
      canIssue
      showCertificateTypeSelect={false}
      showCertificateBatch
      legacyEntryHref="/student/records/directory"
      selectedStudentId="student-1"
      selectedStudentName="Asha Patel"
      certificateType={1}
      reason="Scholarship"
      transitionId=""
      exitsLoading={false}
      exitOptions={[]}
      batch={[
        { id: 'student-1', studentId: 'student-1', firstName: 'Asha', lastName: 'Patel',
          status: 'Active', entrySource: 'ActivatedOnboarding', hasPhoto: false, maskedFields: [] },
        { id: 'student-2', studentId: 'student-2', firstName: 'Ravi', lastName: 'Shah',
          status: 'Active', entrySource: 'ActivatedOnboarding', hasPhoto: false, maskedFields: [] },
      ]}
      previewDisabled={false}
      issueDisabled={false}
      onSelect={vi.fn()}
      onCertificateTypeChange={vi.fn()}
      onReasonChange={vi.fn()}
      onTransitionChange={vi.fn()}
      onRemoveStudent={removeStudent}
      onFocusStudent={focusStudent}
      onPreview={preview}
      onIssue={issue}
    />
  );

  expect(screen.queryByRole('combobox', { name: 'Certificate type' })).not.toBeInTheDocument();
  expect(screen.getByText('Asha Patel')).toBeInTheDocument();
  expect(screen.getByText('Ravi Shah')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Former student missing? Review historical entries' }))
    .toHaveAttribute('href', '/student/records/directory');
  await user.click(screen.getByText('Ravi Shah'));
  expect(focusStudent).toHaveBeenCalledWith('student-2');
  await user.click(screen.getByRole('button', { name: 'Preview' }));
  await user.click(screen.getByRole('button', { name: 'Generate certificate' }));
  expect(preview).toHaveBeenCalledOnce();
  expect(issue).toHaveBeenCalledOnce();
});

it('labels the Leaving exit case for the focused student', () => {
  render(
    <RecordDocumentFilters
      kind="certificates"
      busy={false}
      canIssue
      showCertificateBatch
      showCertificateTypeSelect={false}
      selectedStudentId="student-1"
      selectedStudentName="Asha Patel"
      certificateType={3}
      reason="Transfer"
      transitionId=""
      exitsLoading={false}
      exitOptions={[]}
      batch={[
        { id: 'student-1', studentId: 'student-1', firstName: 'Asha', lastName: 'Patel',
          status: 'Active', entrySource: 'ActivatedOnboarding', hasPhoto: false, maskedFields: [] },
      ]}
      previewDisabled
      issueDisabled
      onSelect={vi.fn()}
      onCertificateTypeChange={vi.fn()}
      onReasonChange={vi.fn()}
      onTransitionChange={vi.fn()}
      onRemoveStudent={vi.fn()}
      onFocusStudent={vi.fn()}
      onPreview={vi.fn()}
      onIssue={vi.fn()}
    />
  );

  expect(screen.getByRole('combobox', { name: 'Exit case for Asha Patel' })).toBeInTheDocument();
  expect(screen.getByText(/Select each name to choose its exit case/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Preview' })).toBeDisabled();
});
