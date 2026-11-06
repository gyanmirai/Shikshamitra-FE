import type { AdmissionApplication } from 'src/redux/student/admissions/admission-applications-api';

import { it, vi, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, within, waitFor } from '@testing-library/react';

import { renderReviewUi } from '../review/review-ui-test-fixture';
import { ApplicationDecisionDialog } from './application-decision-dialog';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));
const application: AdmissionApplication = {
  id: 'application-1',
  applicationNumber: 'APP/2026/42',
  applicantId: 'applicant-1',
  applicantName: 'Mehul Shah',
  admissionCycleId: 'cycle-1',
  admissionOfferingId: 'offering-1',
  status: 5,
  concurrencyStamp: 'current-stamp',
};
function show(action: 'approve' | 'reject', busy = false) {
  const onSubmit = vi.fn().mockResolvedValue(true);
  const onClose = vi.fn();
  renderReviewUi(
    <ApplicationDecisionDialog
      open
      action={action}
      application={application}
      busy={busy}
      onClose={onClose}
      onSubmit={onSubmit}
      onReload={vi.fn().mockResolvedValue(application)}
    />
  );
  return { onSubmit, onClose };
}
it('shows the applicant and formatted application reference beside the optional approval reason', async () => {
  const { onSubmit } = show('approve');
  const section = within(screen.getByRole('region', { name: 'Decision details' }));
  expect(section.getByRole('heading', { name: 'Decision Details' })).toBeVisible();
  expect(section.getByText('Mehul Shah')).toBeVisible();
  expect(section.getByText('Application APP-2026-000042')).toBeVisible();
  expect(section.getByRole('textbox', { name: 'Reason (optional)' })).not.toBeRequired();
  await userEvent.hover(section.getByRole('button', { name: 'Decision Details information' }));
  expect(await screen.findByRole('tooltip')).toHaveTextContent(
    'Confirm the applicant and application reference'
  );
  expect(onSubmit).not.toHaveBeenCalled();
});
it('exposes the rejection reason as required and associates validation feedback without recording a decision', async () => {
  const { onSubmit, onClose } = show('reject');
  const reason = screen.getByRole('textbox', { name: /^Reason/ });
  expect(reason).toBeRequired();
  await userEvent.click(screen.getByRole('button', { name: 'Reject Application' }));
  await waitFor(() => expect(reason).toHaveAttribute('aria-invalid', 'true'));
  expect(reason).toHaveAccessibleDescription('Reason is required for this decision');
  expect(onSubmit).not.toHaveBeenCalled();
  expect(onClose).not.toHaveBeenCalled();
});
it('keeps an entered reason when cancelling the canonical discard confirmation', async () => {
  const { onClose, onSubmit } = show('reject');
  const reason = screen.getByRole('textbox', { name: /^Reason/ });
  await userEvent.type(reason, 'Review the verified evidence first.');
  await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  const discard = within(screen.getByRole('dialog', { name: 'Discard Unsaved Changes?' }));
  await userEvent.click(discard.getByRole('button', { name: 'Keep editing' }));
  expect(reason).toHaveValue('Review the verified evidence first.');
  expect(onClose).not.toHaveBeenCalled();
  expect(onSubmit).not.toHaveBeenCalled();
});
it('retains the existing write lock for the reason and decision actions', () => {
  show('reject', true);
  expect(screen.getByRole('textbox', { name: /^Reason/ })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Reject Application' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
});
