import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import { vi, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor, fireEvent } from '@testing-library/react';

import { renderDocumentUi } from './document-verification/document-ui-test-fixture';
import { AdmissionCycleConfigurationDialog } from './admission-cycle-configuration-dialog';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
const academicYears = [
  {
    id: 'year',
    name: '2026�27',
    startDate: '2026-04-01',
    endDate: '2027-03-31',
    creationTime: '2026-01-01',
    creatorId: 'staff',
    lastModificationTime: '2026-01-01',
    lastModifierId: 'staff',
  },
];
const cycle: AdmissionCycle = {
  id: 'cycle',
  name: 'Annual intake',
  code: 'INTAKE',
  academicYearId: 'year',
  academicYearName: '2026�27',
  startDate: '2026-04-01',
  endDate: '2027-03-31',
  status: 0,
  windowStatus: 1,
  isAcceptingApplications: false,
  linkedOfferingCount: 0,
  activeOfferingCount: 0,
  applicationCount: 0,
  concurrencyStamp: 'saved-stamp',
  scheduledPublishAt: '2028-01-01T09:00',
  scheduledCloseAt: '2028-02-01T17:00',
};
it('uses sentence-case clone fields and submits the existing generated-code clone contract', async () => {
  const user = userEvent.setup();
  const onConfirm = vi.fn().mockResolvedValue(undefined);
  renderDocumentUi(
    <AdmissionCycleConfigurationDialog
      mode="clone"
      cycle={cycle}
      academicYears={academicYears}
      busy={false}
      onClose={vi.fn()}
      onConfirm={onConfirm}
    />
  );
  expect(screen.getByRole('textbox', { name: 'Cycle name' })).toBeVisible();
  expect(screen.getByRole('textbox', { name: 'Description (optional)' })).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Cycle Configuration' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() =>
    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceCycleId: 'cycle',
        code: '',
        academicYearId: 'year',
        startDate: '2026-04-01',
        endDate: '2027-03-31',
      })
    )
  );
});
it('retains the required window reason and native form submission contract', async () => {
  const user = userEvent.setup();
  const onConfirm = vi.fn().mockResolvedValue(undefined);
  renderDocumentUi(
    <AdmissionCycleConfigurationDialog
      mode="window"
      cycle={cycle}
      academicYears={academicYears}
      busy={false}
      onClose={vi.fn()}
      onConfirm={onConfirm}
    />
  );
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  const reason = screen.getByRole('textbox', { name: 'Reason for revising the window' });
  await user.type(reason, 'Extend the intake window');
  fireEvent.submit(reason.closest('form')!);
  await waitFor(() =>
    expect(onConfirm).toHaveBeenCalledWith({
      concurrencyStamp: 'saved-stamp',
      startDate: '2026-04-01',
      endDate: '2027-03-31',
      reason: 'Extend the intake window',
    })
  );
});
it('keeps scheduled instant payloads and sentence-case scheduling labels', async () => {
  const user = userEvent.setup();
  const onConfirm = vi.fn().mockResolvedValue(undefined);
  renderDocumentUi(
    <AdmissionCycleConfigurationDialog
      mode="schedule"
      cycle={cycle}
      academicYears={academicYears}
      busy={false}
      onClose={vi.fn()}
      onConfirm={onConfirm}
    />
  );
  expect(screen.getByText('Publish at', { selector: 'label' })).toBeVisible();
  expect(screen.getByText('Close at', { selector: 'label' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() =>
    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        concurrencyStamp: 'saved-stamp',
        publishAt: expect.stringMatching(/^2028-01-01T/),
        closeAt: expect.stringMatching(/^2028-02-01T/),
      })
    )
  );
});
