import { vi, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders as render } from 'src/test/test-utils';

import { ApplicationResumeJourneyDialog } from './application-resume-journey-dialog';

// Keep these form-behavior tests independent of external icon requests.
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const preview = {
  canResume: true,
  closureHistoryId: 'closure',
  concurrencyStamp: 'stamp',
  targetStageId: 'documents',
  targetStageName: 'Document verification',
  targetWorkspace: 'Pipeline' as const,
  blockers: [],
  warnings: [],
};
const props = {
  applicationNumber: 'APP-35',
  applicantName: 'Adarsh',
  preview,
  loading: false,
  saving: false,
  error: '',
  onRetry: vi.fn(),
  onClose: vi.fn(),
  onSubmit: vi.fn(),
};

it('shows the unchanged reference and actual target stage and requires an audit reason', async () => {
  const submit = vi.fn();
  const user = userEvent.setup();
  render(<ApplicationResumeJourneyDialog {...props} onSubmit={submit} />);
  expect(screen.getByText('APP-35')).toBeVisible();
  expect(screen.getByText('Document verification')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Resume admission' }));
  expect(await screen.findByText('A reason is required')).toBeVisible();
  expect(submit).not.toHaveBeenCalled();
});

it('retains entered reason and actual server error after failure, then closes on successful retry', async () => {
  const user = userEvent.setup();
  const onSubmit = vi
    .fn()
    .mockResolvedValueOnce('The admission period is now closed.')
    .mockResolvedValueOnce(null);
  const onClose = vi.fn();
  render(<ApplicationResumeJourneyDialog {...props} onSubmit={onSubmit} onClose={onClose} />);
  await user.type(screen.getByRole('textbox', { name: 'Reason' }), 'Parent wants to continue');
  await user.click(screen.getByRole('button', { name: 'Resume admission' }));
  expect(await screen.findByText('The admission period is now closed.')).toBeVisible();
  expect(screen.getByRole('textbox', { name: 'Reason' })).toHaveValue('Parent wants to continue');
  expect(onClose).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Resume admission' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
}, 15000);

it('shows the actual blocker and prevents resume while loading or blocked', () => {
  render(
    <ApplicationResumeJourneyDialog
      {...props}
      preview={{
        ...preview,
        canResume: false,
        blockers: ['The original stage could not be recovered.'],
      }}
    />
  );
  expect(screen.getByText('The original stage could not be recovered.')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Resume admission' })).toBeDisabled();
});

it('locks reason and dismissal while saving', () => {
  render(<ApplicationResumeJourneyDialog {...props} saving />);
  expect(screen.getByRole('textbox', { name: 'Reason' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'close' })).toBeDisabled();
});
